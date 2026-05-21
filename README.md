# Grepo Hub

Grepo Hub is a local-first Grepolis companion app built with Angular. The current development direction is a fresh Planner V2 interface that reuses the existing planning logic, static game data, translations, import/export code, and local storage services.

## Current status

The app is in a Planner V2 rebuild phase.

Current foundation:

- Angular app managed through Nx workspace tooling.
- Tailwind-based styling foundation with Grepo Hub design tokens in `src/styles.css`.
- Planner V2 route and shell with functional toolbox, center workspace, and right summary sidebar.
- Reusable core logic preserved under `src/app/services`, `src/app/models`, `src/app/data`, and `src/app/utils`.
- Static unit/building data under `public/assets/data/`.
- Local translations under `public/assets/i18n/`.
- Local-first plan model with browser storage and JSON import/export logic retained for V2 wiring.

The app does not require a backend, login, sync service, or database. User-created plans are stored locally in the browser and can be shared manually through JSON import/export.

## Documentation

Project documentation lives in [`docs`](./docs).

Useful entry points:

- [`docs/02-features.md`](./docs/02-features.md) — current and planned features.
- [`docs/03-layout-and-navigation.md`](./docs/03-layout-and-navigation.md) — Planner V2 layout direction.
- [`docs/04-data-and-import-export.md`](./docs/04-data-and-import-export.md) — static data, translations, and plan import/export.
- [`docs/05-time-tools.md`](./docs/05-time-tools.md) — toolbox timing features.
- [`docs/07-angular-setup.md`](./docs/07-angular-setup.md) — local setup and Nx scripts.
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
npm run start         # Nx dev server
npm run typecheck     # TypeScript type checking
npm run test:once     # One-shot Angular/Vitest test run through Nx
npm run build         # Production build through Nx
npm run format:check  # Prettier check
npm run format        # Apply Prettier formatting
npm run deadcode      # knip unused-code/dependency check
npm run clean         # Remove generated build/test/cache artifacts
npm run fresh         # Reinstall dependencies from package-lock.json
```

## Routes

```txt
/           -> Planner V2
/planner-v2 -> Planner V2
```

The old separate Home, City Planner, Troops Planner, References, and Toolbox routes were removed during the clean-slate V2 reset. Their reusable logic, static assets, translations, and services were retained where useful.

## Local-first behavior

Grepo Hub is designed to work as a static web app. The current data flow is:

1. Static game data is loaded from `public/assets/data/`.
2. UI translations are loaded from `public/assets/i18n/`.
3. User plans are saved in browser storage.
4. Plans can be exported and imported as JSON bundles.

This keeps the app simple to host, easy to test, and suitable for static hosting such as Cloudflare Pages or GitHub Pages.
