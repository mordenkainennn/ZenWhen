# Contributing

Thanks for contributing to ZenWhen.

This project is currently in early-stage development, so the main goal is to keep the codebase small, clear, and aligned with the MVP defined in the docs.

## Before You Start

- Read [docs/dev.md](docs/dev.md) for product intent
- Read [docs/technical-plan.md](docs/technical-plan.md) for implementation direction
- Prefer small, focused changes
- Keep MVP scope tight

## Development Principles

- Default to simple solutions over clever ones
- Preserve the core product idea: hide future tasks until action time
- Keep time logic centralized and testable
- Avoid introducing large dependencies without a clear reason
- Do not add non-MVP features unless explicitly planned

## Branch and PR Guidance

- Use short, descriptive branch names
- Keep pull requests focused on one change area
- Include a brief summary of what changed and why
- Mention any tradeoffs, assumptions, or follow-up work

## Code Style

- Use TypeScript
- Prefer clear naming over abbreviations
- Keep components small and easy to reason about
- Centralize date and task-state logic in shared utilities or services
- Add comments only when the code would otherwise be hard to understand

## Testing Expectations

When applicable, verify:

- `triggerAt` is computed correctly
- tasks appear in the correct view
- editing a task recomputes derived fields
- local persistence still works after refresh

## Commit Messages

Prefer concise commit messages with a clear action, for example:

- `add task repository interface`
- `build reminder page skeleton`
- `wire dexie task storage`

## Scope Reminder

Out of scope for MVP includes:

- authentication
- cloud sync
- collaboration
- tags and project systems
- AI features

If a change pushes beyond MVP, document the reason before merging it.

