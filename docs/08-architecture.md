# Architecture

## General architecture

Grepo Hub is a client-side Angular app with a local-first data model.

The current MVP does not require a backend, login, sync service, or database. Static game data is loaded from local JSON files and user-created configurations are stored in the browser.

The current UI direction is a fresh Planner V2 shell that reuses the existing app brain.

## Current source structure

```txt
src/
  app/
    data/
      academy-research-presets.ts
      city-planner-presets.ts
      plan-config-presets.ts
      reference-documents.ts
      troops-planner-presets.ts
    models/
    pages/
      planner-v2/
        components/
    pipes/
    services/
    testing/
    utils/
  styles.css
public/
  assets/
    data/
    i18n/
    images/
  library/
    documents/
```

The old V1 pages and app shell were removed. Core data, models, services, helpers, assets, and translations remain available for Planner V2.

## Planner V2 component boundary

The parent Planner V2 page should own high-level UI state:

- Active mode: City Setup or Troop Setup.
- Selected plan.
- Selected troop category.
- Selected god.
- Modifier toggles.
- Later: selected building levels and unit amounts.

Child components should stay mostly presentational:

- Receive data through inputs.
- Emit user changes.
- Avoid heavy calculation logic.

## Signal-first UI state

New Planner V2 UI state should prefer Angular signals.

Use signals for:

- Active mode.
- Selected plan ID.
- Selected troop category.
- Selected god.
- Local open/closed UI state.
- Editable building and unit values.

Use `computed()` for derived UI values such as filtered units and summary totals.

Keep pure calculations as plain functions or service methods. Keep RxJS where the problem is naturally asynchronous or stream-based, such as HTTP loading or timer/event streams.

## Core models

Important current model areas:

- `PlanConfig` for shared planner import/export.
- City planner configuration models.
- Troop planner configuration models.
- Unit and building models.
- Toolbox timer/calculator models.

Possible future models:

- Academy plan.
- Research data.
- Timer service state.
- Import/export validation result types.

## Static data services

`GameDataService` loads static game data from `public/assets/data/`.

Current files:

```txt
public/assets/data/units.json
public/assets/data/buildings.json
```

The service should stay focused on loading and normalizing static game data. Planner-specific calculations should remain in dedicated calculation helpers or planner services once they become complex.

## Planner configuration service

`PlanConfigService` owns the shared plan configuration behavior.

Responsibilities:

- Provide preset and local plans.
- Save user-created plan data locally.
- Export plan bundles as JSON.
- Import plan bundles from JSON.
- Normalize and validate the supported plan format.

City Setup and Troop Setup should continue to share this model so a single user plan can contain both building and troop data.

## Translation architecture

`TranslationService` loads local JSON files from `public/assets/i18n/`.

Responsibilities:

- Track the active language.
- Load selected language dictionaries.
- Translate UI keys.
- Provide fallback text for migration/data-driven labels.
- Keep UI text separate from canonical game data identifiers.

`TranslatePipe` is used in templates and supports optional fallback text.

## Styling architecture

Planner V2 uses Tailwind utilities with Grepo Hub design tokens in `src/styles.css`.

Rules:

- Tailwind utilities handle layout and common visual styling.
- CSS variables define colors, borders, radii, shadows, and spacing tokens.
- Repeated panel/button/tile patterns should move into shared Angular UI components.
- Component SCSS should be rare and only used for special cases.
- Avoid returning to large page-specific SCSS files.

## Toolbox architecture

The toolbox is part of the Planner V2 shell, not a separate route.

Reusable backend utilities already exist:

- `ToolboxTimerService`.
- Toolbox timer/calculator models.
- Calculator helpers.
- Time formatting helpers.

These should be wired into the V2 toolbox after the core planner workflow is usable.

## Import/export architecture

Import/export should be integrated into the Planner V2 plan controls and toolbox actions.

The canonical planner sharing format is the shared JSON `PlanConfig` bundle. TXT, CSV, BBCode, or PNG output can later be generated from planner state as convenience export formats.

## Local storage architecture

For the MVP, LocalStorage is enough.

Storage should be versioned and validated because browser data may survive across releases. If plan data grows significantly or needs indexing, IndexedDB can replace or complement LocalStorage later.

## Testing targets

Logic that should remain covered by tests:

- Route/page smoke tests.
- Translation loading and fallback behavior.
- Planner calculations.
- Plan import/export validation.
- Local storage read/write helpers.
- Timer state transitions.
