# 🧠 低干扰提醒系统（PWA）开发文档（MVP版）

> 目标：构建一个“默认隐藏任务，仅在合适时间浮现”的个人提醒系统  
> 核心理念：**减少认知负担，而不是管理更多任务**

---

# 1. 📌 产品定位（非常关键）

## 1.1 一句话定义
> 一个只在“应该行动时”才展示任务的提醒系统

---

## 1.2 核心差异（vs 传统 Todo）

| 传统 Todo | 本系统 |
|----------|--------|
| 所有任务始终可见 | 默认隐藏 |
| 用户主动筛选 | 时间触发显示 |
| 列表驱动 | 时间驱动 |
| 高认知负担 | 低干扰 |

---

## 1.3 设计原则

- 默认隐藏未来任务（Inbox）
- 到达触发时间才进入主视图（Reminder）
- 用户只需要关注“现在该做的事”
- 提供低频 Review 防止漏项

---

# 2. 🧩 功能范围（MVP）

## 2.1 必做功能（第一版）

- 新建任务
- 编辑任务
- 删除任务
- 完成任务
- Inbox（隐藏任务）
- Reminder（已触发任务）
- Review（未来15天）
- Calendar（简化版）
- 本地通知（基础）
- 本地存储（localStorage / IndexedDB）

---

## 2.2 暂不做（避免膨胀）

- ❌ 云同步
- ❌ 登录系统
- ❌ 多设备同步
- ❌ 标签 / 项目
- ❌ 协作功能
- ❌ AI分析

---

# 3. 🗂️ 页面结构

## 3.1 页面列表

```
/ (Home)
├── Inbox（隐藏）
├── Reminder（默认页）
├── Review（未来15天）
├── Calendar（日历视图）
└── Task Editor（新增/编辑）
```

---

## 3.2 页面说明

### 🟦 Reminder（核心页面）
- 默认进入页面
- 显示所有已触发任务
- 按优先级排序：
  - 过期任务（最上）
  - 今日任务
  - 未来任务（已触发但未到期）

---

### 🟨 Inbox（隐藏层）
- 所有未到 triggerAt 的任务
- 默认用户不需要进入
- 用于检查或修改任务

---

### 🟩 Review（安全层）
- 展示未来 15 天内的任务
- 用于：
  - 检查冲突
  - 防止漏提醒

---

### 🟪 Calendar（日历层）
- 按天展示任务
- 用于时间分布观察

---

### 🟧 Task Editor
- 创建 / 编辑任务
- 输入字段：
  - 标题
  - 截止时间
  - 提前提醒时间

---

# 4. 📊 数据结构设计

## 4.1 Task 数据模型

```json
{
  "id": "uuid",
  "title": "事项内容",
  "notes": "",
  "dueAt": "2026-04-20T18:00:00",
  "remindBeforeMinutes": 1440,
  "triggerAt": "2026-04-19T18:00:00",
  "completed": false,
  "archived": false,
  "createdAt": "2026-04-02T10:00:00",
  "updatedAt": "2026-04-02T10:00:00"
}
```

---

## 4.2 字段解释

| 字段 | 说明 |
|------|------|
| dueAt | 截止时间 |
| remindBeforeMinutes | 提前提醒 |
| triggerAt | = dueAt - remindBefore |
| completed | 是否完成 |
| archived | 是否归档 |

---

# 5. ⚙️ 核心逻辑

## 5.1 状态判断

```js
function isInReminder(task, now) {
  return now >= task.triggerAt && !task.completed && !task.archived;
}

function isInInbox(task, now) {
  return now < task.triggerAt && !task.completed && !task.archived;
}
```

---

## 5.2 Reminder 排序逻辑

```js
sort by:
1. overdue (dueAt < now)
2. dueAt ascending
```

---

## 5.3 Review 逻辑

```js
function isInReview(task, now) {
  return task.dueAt >= now && task.dueAt <= now + 15 days;
}
```

---

# 6. 🔔 通知系统（PWA）

## 6.1 使用方案

- Service Worker
- Notification API

---

## 6.2 触发逻辑

```js
if (now >= task.triggerAt && !notified) {
  sendNotification(task);
}
```

---

## 6.3 注意事项

- iOS 支持有限（需用户添加到主屏）
- Android 支持较好
- 不保证完全可靠（需 Review 兜底）

---

# 7. 💾 存储方案

## 推荐：IndexedDB

理由：
- 数据结构灵活
- 容量更大
- 可扩展

---

## 简化方案（MVP可用）

```js
localStorage.setItem("tasks", JSON.stringify(tasks));
```

---

# 8. 🧠 交互流程

## 8.1 创建任务

```
用户输入：
- 截止时间 D
- 提前 X

系统计算：
triggerAt = D - X
```

---

## 8.2 日常使用

```
打开 App → 进入 Reminder
只处理当前任务
```

---

## 8.3 每周 Review

```
打开 Review / Calendar
检查未来 7~15 天
```

---

# 9. 🎯 MVP 验收标准

## 必须满足：

- [ ] Inbox 默认隐藏
- [ ] Reminder 只显示已触发任务
- [ ] triggerAt 逻辑正确
- [ ] 过期任务明显标识
- [ ] Review 能覆盖未来任务
- [ ] 数据刷新后不丢失
- [ ] 通知至少在 Android 可用

---

# 10. 🚀 技术选型建议

## 前端

- HTML + CSS + JS（原生即可）
- 或：
  - Vue / React（任选）

---

## PWA

- manifest.json
- service worker

---

## 时间处理

推荐：
- dayjs / date-fns

---

# 11. 📈 后续扩展（非MVP）

- 重复任务（RRULE）
- 延后提醒（snooze）
- 标签 / 分类
- 云同步（Supabase / Firebase）
- 数据备份导出
- 多端同步

---

# 12. 🧩 项目结构建议

```
/src
  /components
  /pages
  /store
  /utils
  /services
/public
  manifest.json
  service-worker.js
```

---

# 13. 🧠 关键设计总结

## 核心公式

```
triggerAt = dueAt - remindBefore
```

---

## 核心理念

> 不让用户管理任务  
> 而是让时间决定任务何时出现

---

# 14. 📌 最终一句话

> 这是一个“时间触发系统”，而不是传统 To-do App