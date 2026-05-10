# Architecture

## General architecture

Grepo Hub is a client-side Angular app with a local-first data model.

The current MVP does not require a backend, login, sync service, or database. Static game data is loaded from local JSON files and user-created configurations are stored in the browser.

## Current source structure

```txt
src/
  app/
    data/
      city-planner-presets.ts
      plan-config-presets.ts
      reference-resources.ts
      troops-planner-presets.ts
    layout/
      app-shell/
    models/
    pages/
      home/
      city-planner/
      troops-planner/
      references/
      toolbox/
        components/
        models/
        styles/
    pipes/
    services/
    testing/
public/
  assets/
    data/
    i18n/
    images/
```

The current structure intentionally stays flatter than the original planning docs. New folders should be added only when there is a clear shared responsibility.

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

The service should stay focused on loading and normalizing static game data. Planner-specific calculations should remain in planner components or move to dedicated planner services once they become complex.

## Planner configuration service

`PlanConfigService` owns the shared plan configuration behavior.

Responsibilities:

- Provide preset and local plans.
- Save user-created plan data locally.
- Export plan bundles as JSON.
- Import plan bundles from JSON.
- Normalize and validate the supported plan format.

City Planner and Troops Planner should continue to share this model so a single user plan can contain both city and troop data.

## Translation architecture

`TranslationService` loads small local JSON files from `public/assets/i18n/`.

Responsibilities:

- Track the active language.
- Load selected language dictionaries.
- Translate UI keys.
- Provide fallback text for migration/data-driven labels.
- Keep UI text separate from canonical game data identifiers.

`TranslatePipe` is used in templates and supports optional fallback text.

## References architecture

References are currently defined in `src/app/data/reference-resources.ts` and rendered by the References page.

The data file keeps stable IDs and metadata. User-facing titles, descriptions, tags, statuses, and link labels should be provided through translation keys whenever the text appears in the UI.

## Toolbox architecture

The Toolbox page currently owns several utility components:

- Hero/current-time panel.
- Quick calculator.
- Time calculator.
- Reminder widget.
- Active timer queue.
- Battle simulator placeholder.

Timer state is local to the Toolbox feature. If timers must keep running globally or appear in the app shell, extract the timer queue and ticking logic into a shared service.

## App shell architecture

The app shell owns global layout and navigation.

Responsibilities:

- Brand/home link.
- Main navigation.
- Routed page container.
- Responsive shell styling.

The shell should not own planner, reference, or toolbox business logic.

## Import/export architecture

Import/export should be integrated into feature pages, not implemented as a separate page.

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
- Timer state transitions if timer logic is extracted into a service.
