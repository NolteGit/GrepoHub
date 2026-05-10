# Grepo Hub

Grepo Hub is a local-first Grepolis companion app built with Angular. It focuses on city planning, troop planning, reference material, and a consolidated toolbox for timing and quick utility tasks.

## Current status

The app currently includes:

- Responsive app shell with routed navigation.
- Home dashboard with feature cards and project status.
- City Planner with building data, presets, local plan handling, and JSON import/export through the shared plan configuration model.
- Troops Planner with unit data, editable unit amounts, OFF/DEF summaries, presets, local plan handling, and JSON import/export through the shared plan configuration model.
- References page with categorized external resources, tool/script cards, translated labels, and localized quick-link URLs where available.
- Toolbox page with quick calculator, time calculator, reminder creation, active timer queue, and a gated battle simulator placeholder.
- Local English and German translation files under `public/assets/i18n/`.
- Static unit and building data under `public/assets/data/`.

The app does not require a backend, login, sync service, or database. User-created plans are stored locally in the browser and can be shared manually through JSON import/export.

## Documentation

Project documentation lives in [`docs`](./docs). The active development checklist is [`todo.md`](./todo.md).

Useful entry points:

- [`docs/02-features.md`](./docs/02-features.md) — current and planned features.
- [`docs/04-data-and-import-export.md`](./docs/04-data-and-import-export.md) — static data, translations, and plan import/export.
- [`docs/05-time-tools.md`](./docs/05-time-tools.md) — toolbox timing features.
- [`docs/08-architecture.md`](./docs/08-architecture.md) — current architecture and module boundaries.
- [`docs/09-development-notes.md`](./docs/09-development-notes.md) — current project state and decisions.

## Development

Install dependencies and start the app:

```bash
npm install
npm run start
```

Run the main quality checks:

```bash
npm run verify
npm run check
```

Useful scripts:

```bash
npm run typecheck      # TypeScript type checking
npm run test:once      # One-shot Angular/Vitest test run
npm run build          # Production build
npm run format:check   # Prettier check
npm run format         # Apply Prettier formatting
npm run deadcode       # knip unused-code/dependency check
npm run clean          # Remove generated build/test/cache artifacts
```

## Routes

```txt
/
/city-planner
/troops-planner
/references
/toolbox
```

The previous separate guide, time-tools, and battle-simulator ideas are currently consolidated into References and Toolbox. The battle simulator remains intentionally gated as a later feature.

## Local-first behavior

Grepo Hub is designed to work as a static web app. The current data flow is:

1. Static game data is loaded from `public/assets/data/`.
2. UI translations are loaded from `public/assets/i18n/`.
3. User plans are saved in browser storage.
4. Plans can be exported and imported as JSON bundles.

This keeps the app simple to host, easy to test, and suitable for static hosting such as Cloudflare Pages or GitHub Pages.
