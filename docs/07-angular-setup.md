# Angular Setup

This document describes the current Grepo Hub Angular setup and the commands most useful during development.

## Prerequisites

Install:

- Node.js
- npm

The Angular CLI is available through the local project dependencies, so global installation is optional.

## Install dependencies

From the project directory:

```bash
npm install
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
/
/city-planner
/troops-planner
/references
/toolbox
```

The previous separate guide, time-tools, and battle-simulator route ideas are not active routes in the current implementation. Guide/reference content lives on References, timing utilities live on Toolbox, and the battle simulator is a gated Toolbox placeholder.

## Current source layout

Important folders:

```txt
src/app/layout/app-shell/
src/app/pages/home/
src/app/pages/city-planner/
src/app/pages/troops-planner/
src/app/pages/references/
src/app/pages/toolbox/
src/app/services/
src/app/models/
src/app/data/
src/app/pipes/
public/assets/data/
public/assets/i18n/
public/assets/images/
```

## Useful scripts

```bash
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

`npm run verify` runs typecheck, tests, and build. `npm run check` additionally checks formatting and unused code/dependencies.

## Static assets

Angular serves static assets from `public/assets/`.

Current data files:

```txt
public/assets/data/units.json
public/assets/data/buildings.json
```

Current translation files:

```txt
public/assets/i18n/en.json
public/assets/i18n/de.json
```

## Development approach

Recommended next steps:

1. Keep the route set small and stable.
2. Finish one planner workflow at a time.
3. Keep local-first JSON import/export as the canonical sharing mechanism.
4. Add tests around planner calculations, import validation, and translation fallback.
5. Extract shared services only when the same state is truly needed by multiple pages.
