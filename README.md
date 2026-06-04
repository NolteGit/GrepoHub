# GrepoPlan

GrepoPlan is a local-first Grepolis companion app built with Angular. The current app surface is the planner workspace, which reuses the existing planning logic, static game data, translations, import/export code, and local storage services.

## Current status

The app is in release-prep for the current planner experience. The primary release target is desktop and decently sized screens; full mobile optimization is planned as a separate Media-Day milestone.

Current foundation:

- Angular app managed through Nx workspace tooling.
- Tailwind-based styling foundation with GrepoPlan design tokens in `src/styles.css`.
- Planner workspace with functional toolbox, center workspace, and right summary sidebar.
- Reusable core logic preserved under `src/app/services`, `src/app/models`, `src/app/data`, and `src/app/utils`.
- Static unit/building data under `public/assets/data/`.
- Local translations under `public/assets/i18n/`.
- Local-first plan model with browser storage and JSON import/export logic retained for V2 wiring.

The app does not require a backend, login, sync service, or database. User-created plans are stored locally in the browser and can be shared manually through JSON import/export.

## Documentation

Project documentation lives in [`docs`](./docs).

Useful entry points:

- [`docs/02-features.md`](./docs/02-features.md) — current and planned features.
- [`docs/03-layout-and-navigation.md`](./docs/03-layout-and-navigation.md) — planner layout direction.
- [`docs/04-data-and-import-export.md`](./docs/04-data-and-import-export.md) — static data, translations, and plan import/export.
- [`docs/05-time-tools.md`](./docs/05-time-tools.md) — toolbox timing features.
- [`docs/07-angular-setup.md`](./docs/07-angular-setup.md) — local setup and Nx scripts.
- [`docs/08-architecture.md`](./docs/08-architecture.md) — current architecture and module boundaries.
- [`docs/09-development-notes.md`](./docs/09-development-notes.md) — current project state and decisions.
- [`docs/10-manual-regression-checklist.md`](./docs/10-manual-regression-checklist.md) —
  browser smoke tests for behavior-sensitive changes.

## Development

Install dependencies and start the app:

```bash
npm install
npm run start
```

Run the main quality checks:

```bash
npm run verify
npm run release:check
```

Useful scripts:

```bash
npm run start         # Nx dev server
npm run typecheck     # TypeScript type checking
npm run test:once     # One-shot Angular/Vitest test run through Nx
npm run build         # Production build through Nx
npm run verify        # Run all quality checks
npm run release:check # Run verify plus production dependency audit
npm run security:audit # Audit production dependencies only
npm run check         # Alias for npm run verify
npm run format:check  # Prettier check
npm run format        # Apply Prettier formatting
npm run deadcode      # knip unused-code/dependency check
npm run clean         # Remove generated build/test/cache artifacts
npm run fresh         # Reinstall dependencies from package-lock.json
```

## Routes

```txt
/           -> Planner
/planner    -> Planner
/planner-v2 -> Planner legacy alias
```

The old separate Home, City Planner, Troops Planner, References, and Toolbox routes were removed during the clean-slate planner reset. Their reusable logic, static assets, translations, and services were retained where useful.

## Local-first behavior

GrepoPlan is designed to work as a static web app. The current data flow is:

1. Static game data is loaded from `public/assets/data/`.
2. UI translations are loaded from `public/assets/i18n/`.
3. User plans are saved in browser storage.
4. Plans can be exported and imported as JSON bundles.

This keeps the app simple to host, easy to test, and suitable for static hosting such as Cloudflare Pages or GitHub Pages.

## Continuous integration

The repository includes a GitHub Actions workflow that runs the release gate on pushes to `main`/`master` and on pull requests:

```bash
npm ci --no-audit --no-fund
npm run release:check
```

The workflow uses the Node.js version declared in `.nvmrc`.
