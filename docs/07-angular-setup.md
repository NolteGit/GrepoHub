# Angular Setup

This document describes the basic setup steps for the Grepo Hub Angular app.

## Prerequisites

Install:

- Node.js
- npm
- Angular CLI

Install Angular CLI globally:

```bash
npm install -g @angular/cli
```

## Create the project

From the parent directory where the project should be created:

```bash
ng new grepo-hub
cd grepo-hub
```

Recommended choices:

- Enable routing
- Use CSS or SCSS depending on preference
- Do not add server-side rendering for the first MVP unless specifically needed

## Run the app

```bash
ng serve --open
```

The development app should open at:

```txt
http://localhost:4200/
```

## Suggested page routes

The app should use Angular routing for the main pages:

```txt
/
/city-planner
/troops-planner
/references
/guides
/time-tools
/battle-simulator
```

Optional later route:

```txt
/settings
```

## Suggested initial components

Create page components:

```bash
ng generate component pages/home
ng generate component pages/city-planner
ng generate component pages/troops-planner
ng generate component pages/references
ng generate component pages/guides
ng generate component pages/time-tools
ng generate component pages/battle-simulator
```

Create layout components:

```bash
ng generate component layout/app-shell
ng generate component layout/top-bar
ng generate component layout/navigation-drawer
```

Create shared components later as needed:

```bash
ng generate component shared/feature-card
ng generate component shared/config-sidebar
ng generate component shared/about-dialog
```

## Suggested initial services

```bash
ng generate service core/services/unit-data
ng generate service core/services/building-data
ng generate service core/services/translation
ng generate service core/services/timer
ng generate service core/services/plan-storage
ng generate service core/services/txt-import-export
```

## Suggested asset folders

```txt
src/assets/data/
src/assets/i18n/
```

Initial files:

```txt
src/assets/data/units.json
src/assets/data/buildings.json
src/assets/i18n/en.json
src/assets/i18n/de.json
```

## Development approach

Recommended learning-friendly approach:

1. Build routing and empty pages first.
2. Build the app shell and top bar.
3. Add static dashboard cards.
4. Add JSON data loading services.
5. Add planner forms.
6. Add TXT import/export logic.
7. Add timer service and Time Tools page.
8. Add tests for logic-heavy services.

## Testing

Run tests with:

```bash
ng test
```

Important logic should be placed in services or utility functions so it can be tested separately from UI components.
