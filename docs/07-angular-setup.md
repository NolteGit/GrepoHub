# Angular Setup

This document describes the current Grepo Hub Angular/Nx setup and the commands most useful during development.

## Prerequisites

Install:

- Node.js
- npm

The project uses local dependencies for Angular and Nx, so global CLI installation is optional.

## Install dependencies

From the project directory:

```bash
npm install
```

For a clean reinstall from the lockfile:

```bash
npm run fresh
```

## Run the app

```bash
npm run start
```

The development app opens at:

```txt
http://localhost:4200/
```

## Current routes

```txt
/           -> Planner V2
/planner-v2 -> Planner V2
```

## Nx workspace

Nx was added as workspace tooling around the existing Angular application. The workspace stays a single-app setup for now; it has not been converted into an integrated `apps/` and `libs/` monorepo layout.

Project configuration lives in:

```txt
project.json
nx.json
```

`angular.json` is no longer used after the Nx migration.

## Current source layout

Important folders:

```txt
src/app/pages/planner-v2/
src/app/services/
src/app/models/
src/app/data/
src/app/utils/
src/app/pipes/
src/app/testing/
public/assets/data/
public/assets/i18n/
public/assets/images/
public/library/documents/
```

## Useful scripts

```bash
npm run start
npm run typecheck
npm run test:once
npm run build
npm run verify
npm run format:check
npm run format
npm run deadcode
npm run clean
npm run check
```

`npm run verify` runs the core functional checks. `npm run check` additionally checks formatting and unused code/dependencies.

## Static assets

Angular serves static assets from `public/`.

Current data files:

```txt
public/assets/data/units.json
public/assets/data/buildings.json
```

Current translation files:

```txt
public/assets/i18n/en.json
public/assets/i18n/de.json
public/assets/i18n/es.json
public/assets/i18n/fr.json
public/assets/i18n/it.json
public/assets/i18n/nl.json
```

## Styling setup

Planner V2 uses Tailwind v4 through `@tailwindcss/postcss`.

Important files:

```txt
src/styles.css
.postcssrc.json
```

The global stylesheet should contain only Tailwind import, Grepo Hub design tokens, base styles, and stable reusable primitives. Repeated UI patterns should become Angular components instead of long copied class strings.

## Development approach

Recommended next steps:

1. Add shared UI primitives under `src/app/shared/ui`.
2. Split Planner V2 placeholders into City Setup, Troop Setup, and bottom summary components.
3. Implement City Setup first and wire building levels through signal-first state.
4. Add computed city summaries.
5. Implement Troop Setup and troop summaries.
6. Wire persistence/import/export once the V2 state shape is stable.
