# Development Notes

## Current phase

The project is now in the Planner V2 implementation phase.

The old V1 UI surfaces were removed to avoid carrying over layout hacks and duplicated SCSS. The reusable app brain remains: services, models, static data, translations, assets, import/export logic, local storage logic, and calculation helpers.

## Confirmed app name

```txt
Grepo Hub
```

## Confirmed project directory

```txt
GrepoHub
```

## Confirmed routes

```txt
planner-v2 -> /
planner-v2 -> /planner-v2
```

## Important design decisions

### Fresh Planner V2 UI, reused app brain

The planner UI should be rebuilt fresh while reusing existing core logic and assets.

Reuse:

- Services.
- Data/config models.
- Assets/icons/images.
- Translation files.
- Calculation logic.
- Storage/import/export logic.

Rebuild fresh:

- Planner HTML structure.
- Planner layout.
- Tile components.
- Sidebar/toolbox layout.
- Summary panels.
- City/Troop setup UI.

### Single planner workspace

Planner V2 is the main app surface. City Setup and Troop Setup are modes inside one planner workspace, not separate top-level pages.

### Toolbox belongs to the planner shell

The toolbox is a functional left column with clock, quick actions, timers, calculator/time tools, and links. It is not a traditional navigation sidebar.

### Tailwind with discipline

Tailwind is used for layout and repeated visual styling, but repeated patterns should still become reusable Angular components. The goal is consistency, not long unstructured class strings everywhere.

### Signal-first for new V2 UI state

New Planner V2 state should prefer Angular signals and computed values. Services and pure calculations should stay as plain TypeScript unless they need async or stream behavior.

## Storage direction

The MVP uses:

- Static JSON files for game data.
- LocalStorage for user-created configurations.
- JSON import/export for shared planner configurations.

TXT, CSV, BBCode, and PNG exports can be added later as generated outputs.

## Translation direction

Translation is simple and local.

Current files:

```txt
public/assets/i18n/en.json
public/assets/i18n/de.json
public/assets/i18n/es.json
public/assets/i18n/fr.json
public/assets/i18n/it.json
public/assets/i18n/nl.json
```

All visible UI labels should have translation keys. Fallback strings are allowed while migrating data-driven labels, but should not become the normal way to add stable UI text.

## Recommended next coding tasks

1. Add shared UI primitives under `src/app/shared/ui`.
2. Split Planner V2 placeholders into City Setup, Troop Setup, and bottom summary components.
3. Implement City Setup with real building data and reusable tile/stepper components.
4. Add computed city summaries.
5. Implement Troop Setup with category/god filtering.
6. Add computed troop summaries.
7. Wire plan persistence, import, and export into the V2 controls.
8. Wire toolbox timer/calculator utilities after the core planner workflow is stable.

## Open questions

These can still be decided later:

- Exact special-building selector interaction.
- Exact city summary metrics to show in the bottom bar vs right sidebar.
- Exact troop summary metric order.
- Whether guide/reference content returns as a dedicated route or toolbox overlay.
- Exact TXT/BBCode export syntax.
- Exact research/academy JSON schema.
- Whether browser notifications should be included after timer wiring.
