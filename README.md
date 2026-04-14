# ZenWhen

ZenWhen is a low-interruption reminder system built around one idea:

> tasks should appear when it is time to act, not compete for attention all day

This project is a PWA-first personal reminder app. Unlike a traditional todo list, future tasks stay hidden by default and only move into the main view when their `triggerAt` time arrives.

## Core Concept

- `dueAt`: when something needs to be done
- `remindBeforeMinutes`: how early to surface it
- `triggerAt = dueAt - remindBeforeMinutes`

The app is designed to reduce cognitive load:

- `Reminder`: only shows tasks that should be actionable now
- `Inbox`: keeps future tasks out of the way
- `Review`: provides a low-frequency safety check for upcoming tasks
- `Calendar`: offers a simple time-distribution view

## Planned Stack

- Vue 3
- TypeScript
- Vite
- Pinia
- dayjs
- Dexie + IndexedDB
- PWA support for installability and local notifications
- Cloudflare Pages for deployment

## Project Status

This repository now includes the initial Vue 3 + TypeScript + Vite application skeleton and is ready for feature development.

Available documentation:

- Product document: [docs/dev.md](docs/dev.md)
- Technical plan: [docs/technical-plan.md](docs/technical-plan.md)

## MVP Scope

- Create, edit, complete, and delete tasks
- Hide future tasks by default
- Show triggered tasks in the main reminder view
- Review upcoming tasks within the next 15 days
- Persist data locally in the browser
- Provide best-effort local notifications

Out of scope for MVP:

- Cloud sync
- Authentication
- Multi-device sync
- Collaboration
- Tags and project systems
- AI features

## Development Direction

The first implementation milestone is:

1. Create a task
2. Compute `triggerAt`
3. Split tasks into `Reminder` and `Inbox`
4. Persist tasks locally after refresh

## Getting Started

```bash
npm install
npm run dev
```

By default, the dev server is exposed to your local network. After startup, open the printed LAN address such as `http://192.168.x.x:5173` from your phone or another computer on the same Wi-Fi.

Build for production:

```bash
npm run build
```

Type-check the app:

```bash
npm run typecheck
```

## Deploying to Cloudflare Pages

ZenWhen is set up as a static Vite app and can be deployed directly to Cloudflare Pages.

Recommended build settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

Deployment notes:

- The app uses Vue Router history mode, so the repository includes `public/_redirects` for SPA route fallback on Cloudflare Pages.
- PWA files such as `manifest.json`, `service-worker.js`, and app icons are shipped from `public/`.
- `public/_headers` adds basic cache behavior for the service worker and static assets.

After connecting the GitHub repository in Cloudflare Pages, each push to your production branch can trigger a new deployment automatically.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
