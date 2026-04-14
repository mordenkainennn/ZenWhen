# ZenWhen

[English README](README.md)

ZenWhen 是一个围绕这条核心理念构建的低干扰提醒系统：

> 任务应该在该行动的时候浮现，而不是整天争夺注意力

这是一个以 PWA 为优先形态的个人提醒应用。与传统 Todo 不同，未来任务默认保持隐藏，只有当 `triggerAt` 到来时才会进入主视图。

## 核心概念

- `dueAt`：任务真正需要完成的时间
- `remindBeforeMinutes`：希望提前多久让任务浮现
- `triggerAt = dueAt - remindBeforeMinutes`

这个应用的设计目标是降低认知负担：

- `Reminder`：只显示现在应该处理的任务
- `Inbox`：把未来任务先藏起来，避免打扰
- `Review`：低频检查未来即将到来的任务
- `Calendar`：用简化的时间分布视图发现忙碌日期

## 当前技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- dayjs
- Dexie + IndexedDB
- 支持安装与本地通知的 PWA 能力
- Cloudflare Pages 部署

## 项目状态

ZenWhen 目前已经进入可用的 MVP 阶段。

当前已具备的能力包括：

- 任务的新建、编辑、完成与删除
- Reminder、Inbox、Review、Calendar 四个核心视图
- 基于 Dexie / IndexedDB 的本地持久化
- 尽力而为的本地通知
- PWA 安装与离线访问支持
- 简体中文 / 英文双语界面，默认语言为简体中文
- Cloudflare Pages 部署配置
- 使用 Vitest 的核心任务逻辑测试

相关文档：

- 产品文档：[docs/dev.md](docs/dev.md)
- 技术方案：[docs/technical-plan.md](docs/technical-plan.md)
- 入口页说明：[docs/entry-page.md](docs/entry-page.md)
- 入口页 Action-first 重构方案：[docs/rentry-page-v2.md](docs/rentry-page-v2.md)

## MVP 范围

- 新建、编辑、完成与删除任务
- 默认隐藏未来任务
- 在主提醒视图中显示已触发任务
- 查看未来 15 天内的即将到来任务
- 在浏览器中本地持久化数据
- 提供尽力而为的本地通知

MVP 暂不包含：

- 云同步
- 登录认证
- 多设备同步
- 协作
- 标签与项目系统
- AI 功能

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认会对局域网开放。启动后，你可以在手机或同一 Wi-Fi 下的其他电脑上访问终端里输出的局域网地址，例如：`http://192.168.x.x:5173`。

生产构建：

```bash
npm run build
```

类型检查：

```bash
npm run typecheck
```

运行自动化测试：

```bash
npm run test
```

运行完整本地检查：

```bash
npm run check
```

## 部署到 Cloudflare Pages

ZenWhen 是一个静态 Vite 应用，可以直接部署到 Cloudflare Pages。

推荐构建配置：

- Framework preset：`Vite`
- Build command：`npm run build`
- Build output directory：`dist`

部署说明：

- 项目使用 Vue Router history 模式，因此仓库内提供了 `public/_redirects`，用于 Cloudflare Pages 上的 SPA 路由回退。
- `manifest.json`、`service-worker.js` 与应用图标等 PWA 文件都通过 `public/` 目录发布。
- `public/_headers` 为 service worker 与静态资源配置了基础缓存策略。

将 GitHub 仓库连接到 Cloudflare Pages 后，生产分支上的每次 push 都可以自动触发一次新部署。

## License

本项目基于 MIT License 开源，详见 [LICENSE](LICENSE)。
