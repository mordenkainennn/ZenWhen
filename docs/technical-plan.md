# 低干扰提醒系统（PWA）技术方案

> 基于 [docs/dev.md](/f:/new-dev/ZenWhen/docs/dev.md) 的 MVP 落地设计  
> 目标：把产品定义转成一套可以直接开始开发的实现方案

---

## 1. 方案目标

本方案聚焦 MVP，可交付目标只有三件事：

1. 正确管理任务时间状态
2. 在合适页面展示合适任务
3. 在浏览器本地可靠保存并尽量触发通知

这意味着我们优先保证：

- `triggerAt` 计算准确
- Reminder / Inbox / Review 分类稳定
- 刷新页面后数据不丢失
- PWA 可安装，通知链路具备基础能力

非目标：

- 云同步
- 多设备一致性
- 复杂权限体系
- 高级筛选、标签、项目体系

---

## 2. 推荐技术栈

MVP 推荐采用以下默认组合：

- 前端框架：Vue 3
- 语言：TypeScript
- 构建工具：Vite
- 路由：Vue Router
- 时间处理：dayjs
- 本地存储：IndexedDB
- IndexedDB 封装：Dexie
- 状态管理：Pinia
- PWA：`vite-plugin-pwa` 或手写 `manifest.json` + `service-worker`
- UI：原生 CSS 或轻量 scoped CSS

选择理由：

- Vue 3 对表单、列表、条件渲染更直观，适合快速实现这个 MVP
- Vite 启动快，和 Vue 3 组合成熟，部署到 Cloudflare Pages 也简单
- `dayjs` 足够处理当前时间计算，体积小，学习成本低
- Dexie 能显著简化 IndexedDB 的使用，避免把时间浪费在底层 API 细节上
- Pinia 比手写全局状态更清晰，也比复杂状态库更轻量

如果希望进一步压缩复杂度，也可以退化为：

- Vue 3 + TypeScript + `localStorage`

但存储层仍建议保留统一接口，方便后续切换到 IndexedDB / Dexie。

---

## 3. 总体架构

建议采用前端单体架构，所有逻辑运行在浏览器本地：

```text
UI Pages / Components
        |
Pinia Store
        |
Task Service
        |
Task Repository
        |
Dexie / IndexedDB / localStorage
```

同时并行存在一条通知链路：

```text
Task Repository
        |
Notification Scheduler
        |
Service Worker / Notification API
```

模块职责：

- `pages`：承载 Reminder、Inbox、Review、Calendar、TaskEditor 页面
- `components`：任务卡片、时间标签、筛选栏、空状态、表单字段
- `store`：保存当前任务列表、加载状态、通知权限等全局状态
- `services`：封装任务计算、通知调度、日期处理
- `repository`：读写本地存储
- `utils`：纯函数，如时间格式化、状态判断、排序

---

## 4. 数据模型设计

MVP 阶段建议统一使用一个核心实体 `Task`：

```ts
export interface Task {
  id: string;
  title: string;
  notes: string;
  dueAt: string;
  remindBeforeMinutes: number;
  triggerAt: string;
  completed: boolean;
  archived: boolean;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

相比产品文档，建议补充：

- `notifiedAt`
  用于避免重复通知
- 所有时间字段统一使用 ISO 字符串
  便于序列化、本地存储和比较

约束规则：

- `title` 必填，最长 120 字符
- `dueAt` 必填
- `remindBeforeMinutes` 必须大于等于 0
- `triggerAt` 由系统计算，不允许用户直接编辑
- `updatedAt` 每次编辑都更新

---

## 5. 派生状态与业务规则

任务的“显示在哪一层”不应持久化，而应由当前时间实时推导。

### 5.1 基础状态判断

```ts
function isCompleted(task: Task) {
  return task.completed;
}

function isArchived(task: Task) {
  return task.archived;
}

function isInReminder(task: Task, now: string) {
  return now >= task.triggerAt && !task.completed && !task.archived;
}

function isInInbox(task: Task, now: string) {
  return now < task.triggerAt && !task.completed && !task.archived;
}

function isOverdue(task: Task, now: string) {
  return !task.completed && !task.archived && task.dueAt < now;
}
```

### 5.2 Review 规则

Review 只显示未来 15 天内、且未完成未归档的任务：

```ts
function isInReview(task: Task, now: string, reviewEnd: string) {
  return (
    task.dueAt >= now &&
    task.dueAt <= reviewEnd &&
    !task.completed &&
    !task.archived
  );
}
```

### 5.3 Reminder 排序规则

建议明确成三层排序键：

1. 是否已过期
2. `dueAt` 升序
3. `createdAt` 升序

这样在到期时间相同的情况下表现更稳定。

### 5.4 完成与删除策略

建议区分“删除”和“归档”：

- 完成：`completed = true`
- 归档：`archived = true`
- 删除：MVP 可直接物理删除

如果想减少误删风险，可以把“删除”延后到后续版本，MVP 仅支持归档。

---

## 6. 页面与路由设计

建议路由如下：

```text
/              -> ReminderPage
/inbox         -> InboxPage
/review        -> ReviewPage
/calendar      -> CalendarPage
/tasks/new      -> TaskEditorPage
/tasks/:id/edit -> TaskEditorPage
```

### 6.1 ReminderPage

职责：

- 默认首页
- 显示所有已触发任务
- 展示过期标记、截止时间、提前提醒信息
- 支持完成、编辑、删除

必要交互：

- 任务卡片顶部显示状态标签：`Overdue` / `Today` / `Upcoming`
- 空状态文案强调“当前没有需要处理的任务”

### 6.2 InboxPage

职责：

- 查看未到 `triggerAt` 的隐藏任务
- 支持检查和调整未来任务

必要交互：

- 默认不在主导航高强调
- 任务列表按 `triggerAt` 升序或 `dueAt` 升序

### 6.3 ReviewPage

职责：

- 展示未来 15 天内任务
- 帮助用户做低频检查

必要交互：

- 顶部展示时间范围，例如“未来 15 天”
- 按日期分组显示

### 6.4 CalendarPage

职责：

- 观察任务在日期维度上的分布

MVP 简化实现：

- 只做月视图
- 点击某一天后展示该日任务列表
- 不追求复杂拖拽和跨天事件渲染

### 6.5 TaskEditorPage

表单字段：

- 标题
- 备注
- 截止时间
- 提前提醒时间

表单行为：

- 创建模式和编辑模式复用同一页面
- 选择截止时间和提前时长后，实时预览 `triggerAt`
- 保存前执行表单校验

---

## 7. 状态管理设计

推荐使用 Pinia，统一管理任务和少量全局 UI 状态。

```ts
type AppState = {
  tasks: Task[];
  loading: boolean;
  notificationPermission: NotificationPermission | "unsupported";
};
```

建议定义一个主 store，例如 `useTaskStore`，包含：

- state：`tasks`、`loading`、`notificationPermission`
- getters：`reminderTasks`、`inboxTasks`、`reviewTasks`
- actions：`loadTasks`、`createTask`、`updateTask`、`deleteTask`、`completeTask`

原则：

- Store 只保存原始任务数据和少量 UI 状态
- Reminder / Inbox / Review 列表通过 getters 或 service 计算
- 排序和分组逻辑放在 getters / service，而不是页面组件里

---

## 8. 存储层设计

### 8.1 Repository 接口

无论底层是 IndexedDB 还是 `localStorage`，都建议先定义统一接口：

```ts
interface TaskRepository {
  list(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 8.2 IndexedDB 推荐实现

建议使用 Dexie 封装 IndexedDB，而不是直接操作原生 API。

建议建立：

- database: `zenwhen`
- object store: `tasks`
- keyPath: `id`

可选索引：

- `dueAt`
- `triggerAt`
- `completed`

MVP 即便不建太多索引也能运行，但预留索引会让后面做筛选更顺。

示意：

```ts
db.version(1).stores({
  tasks: "id,dueAt,triggerAt,completed,archived,updatedAt",
});
```

### 8.3 降级策略

若 IndexedDB 初始化失败：

- 退回 `localStorage`
- 同时在控制台输出 warning

这样可以提高浏览器兼容性，也方便早期开发。

---

## 9. 通知与 PWA 设计

### 9.1 PWA 最小要求

需要提供：

- `manifest.json`
- `service-worker.js`
- 可安装图标
- 离线缓存基础壳资源

### 9.2 通知策略

MVP 不追求浏览器后台绝对可靠调度，而采用“尽力而为 + Review 兜底”方案。

实现建议：

1. 应用启动时检查通知权限
2. 应用恢复可见时重新扫描所有任务
3. 若存在 `now >= triggerAt && notifiedAt == null` 的任务，则触发通知
4. 成功发送后写入 `notifiedAt`

这意味着：

- 用户打开 App 时通知逻辑最可靠
- 浏览器后台限制下，不承诺像原生 App 一样准时
- Review 页面仍是产品级兜底机制

### 9.3 Service Worker 职责

MVP 中 Service Worker 主要负责：

- 缓存静态资源
- 支持 PWA 安装和离线访问

不建议在 MVP 中把复杂业务调度压到 Service Worker 内部，否则兼容性和调试成本会显著上升。

---

## 10. 时间处理策略

时间问题是这个项目最容易出错的部分，需要尽早统一规则。

统一约定：

- 存储格式：ISO 字符串
- 展示格式：按用户本地时区格式化
- 计算基准：浏览器当前本地时间

关键规则：

- `triggerAt` 在保存任务时一次性计算并写入
- 编辑 `dueAt` 或 `remindBeforeMinutes` 时必须重新计算 `triggerAt`
- 所有比较都基于标准化后的时间对象，不直接散落在组件里写字符串比较

建议封装：

- `computeTriggerAt(dueAt, remindBeforeMinutes)`
- `formatDueAt(task.dueAt)`
- `getTaskPhase(task, now)`
- `getReviewWindow(now, days = 15)`

---

## 11. 组件拆分建议

建议先从最少但稳定的组件集开始：

- `TaskList`
- `TaskCard`
- `TaskStatusBadge`
- `TaskForm`
- `DateTimeField`
- `ReminderOffsetField`
- `EmptyState`
- `PageHeader`

组件边界原则：

- `TaskCard` 只负责展示与局部操作按钮
- `TaskForm` 负责字段管理和校验
- 页面组件负责组装数据，不负责具体时间算法

---

## 12. 目录结构建议

```text
/src
  /app
    App.vue
    main.ts
  /router
    index.ts
  /components
    TaskCard.vue
    TaskForm.vue
    TaskList.vue
    EmptyState.vue
  /pages
    ReminderPage.vue
    InboxPage.vue
    ReviewPage.vue
    CalendarPage.vue
    TaskEditorPage.vue
  /stores
    task.ts
  /services
    task-service.ts
    notification-service.ts
    storage-service.ts
  /repository
    task-repository.ts
    dexie-task-repository.ts
    localstorage-task-repository.ts
  /db
    dexie.ts
  /utils
    date.ts
    task.ts
    validation.ts
  /types
    task.ts
/public
  manifest.json
  service-worker.js
```

---

## 13. 核心流程设计

### 13.1 创建任务

```text
用户填写表单
-> 前端校验字段
-> 计算 triggerAt
-> 写入 repository
-> 刷新 store
-> 重新扫描是否需要通知
```

### 13.2 打开首页

```text
应用启动
-> 读取本地任务
-> 写入 store
-> 计算 Reminder 列表
-> 扫描触发通知的任务
-> 渲染首页
```

### 13.3 完成任务

```text
点击完成
-> 更新 completed = true
-> 写入 repository
-> 更新 store
-> 从 Reminder / Inbox / Review 中自然消失
```

---

## 14. MVP 开发顺序

推荐按下面顺序推进，尽量让每一步都可运行、可验证。

### 阶段 1：基础工程

- 初始化 Vite + Vue 3 + TypeScript
- 建立目录结构
- 接入路由
- 建立基础布局和导航

### 阶段 2：任务核心能力

- 定义 `Task` 类型
- 实现时间工具函数
- 实现 repository 接口
- 打通创建、编辑、删除、完成

### 阶段 3：核心页面

- 完成 Reminder 页面
- 完成 Inbox 页面
- 完成 Review 页面
- 完成 Calendar 简版页面

### 阶段 4：PWA 与通知

- 增加 `manifest.json`
- 注册 Service Worker
- 接入通知权限申请
- 实现“打开应用时扫描通知”机制

### 阶段 5：体验与验收

- 加空状态
- 加错误处理
- 校验移动端适配
- 对照 MVP 验收清单逐项检查

---

## 15. 测试建议

MVP 至少要覆盖以下测试：

### 单元测试

- `computeTriggerAt`
- Reminder / Inbox / Review 分类逻辑
- Reminder 排序逻辑
- 表单校验逻辑

### 集成测试

- 创建任务后出现在正确页面
- 编辑任务后 `triggerAt` 重新计算
- 完成任务后从主列表消失
- 刷新页面后数据仍存在

### 手工验证

- Android Chrome 安装为 PWA
- 通知权限申请流程
- 前后台切换时的通知扫描行为
- 离线打开应用的基本可用性

---

## 16. 风险与取舍

### 风险 1：浏览器通知不完全可靠

现实情况：

- 移动端浏览器后台行为受系统限制
- iOS 对 Web Push 和后台能力限制更多

取舍：

- MVP 不承诺强提醒
- 用 Review 页面兜底

### 风险 2：时间与时区问题

现实情况：

- 字符串格式、浏览器解析差异、时区切换都容易引发错乱

取舍：

- 统一 ISO 存储
- 所有计算集中封装

### 风险 3：过早引入复杂状态库

现实情况：

- 任务规模不大，复杂状态库会增加维护成本

取舍：

- 先用 Pinia
- 后续再视规模升级

---

## 17. 建议的首个迭代目标

第一轮开发建议只追求以下闭环：

1. 能创建任务
2. 能根据 `triggerAt` 自动分流到 Reminder / Inbox
3. 能完成任务
4. 能刷新后保留数据

只要这四件事打通，产品核心价值就已经成立。

---

## 18. 一句话结论

这个项目最重要的不是“做一个任务系统”，而是实现一条稳定的时间驱动链路：

```text
创建任务 -> 计算 triggerAt -> 本地持久化 -> 按当前时间分流展示 -> 尽力触发提醒
```

只要这条链路设计清晰，MVP 就会非常稳，后续再加重复任务、延后提醒和同步能力也会容易很多。
