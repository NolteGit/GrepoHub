# Development Notes

## Current phase

The project is now in MVP stabilization and vertical-slice development.

The first routed Angular implementation exists. The current focus is to keep the local-first architecture stable, remove avoidable complexity, finish translation coverage, and improve one feature area at a time.

## Confirmed app name

```txt
Grepo Hub
```

## Confirmed project directory

```txt
grepo-hub
```

## Confirmed routes

```txt
home -> /
city-planner -> /city-planner
troops-planner -> /troops-planner
references -> /references
toolbox -> /toolbox
```

## Important design decisions

### No dedicated import/export page

Import and export stay inside City Planner and Troops Planner. The shared JSON `PlanConfig` bundle is the canonical exchange format.

### Academy Planner belongs inside City Planner

Academy planning should be part of City Planner, not a major standalone route for the MVP.

### Guides and references are consolidated for now

Long-form guide material can be added later, but the current implementation keeps external resources and practical helper links on the References page.

### Time tools are unified in Toolbox

Timing features currently live inside Toolbox instead of a separate Time Tools route.

This includes:

- Time calculator.
- Alarms.
- Countdowns.
- Stopwatches.
- Runtime timer queue.

### Battle Simulator is delayed

The battle simulator remains intentionally gated as a later Toolbox feature. Accurate simulation will require many game mechanics, modifiers, and world settings, so it should not distract from planner stabilization.

## UI direction

The app should feel like a practical companion dashboard.

Important UI pieces:

- Responsive app shell.
- Clear top navigation.
- Feature cards on the dashboard.
- Planner configuration sidebars.
- Compact import/export controls inside planner pages.
- References filters and cards.
- Toolbox utility panels.

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
```

All visible UI labels should have translation keys. Fallback strings are allowed while migrating data-driven labels, but should not become the normal way to add UI text.

## Game data direction

Use small readable JSON files for core data.

Current files:

```txt
public/assets/data/units.json
public/assets/data/buildings.json
```

Before adding more planner logic, review whether these schemas are stable enough for calculations, validation, and future import/export support.

## Recommended next coding tasks

1. Add more focused tests for `PlanConfigService` import/export validation.
2. Add tests for translation fallback and language switching.
3. Review the unit/building JSON schemas before more features depend on them.
4. Decide whether Toolbox timer state should move into a shared timer service.
5. Improve planner validation and user-facing error messages.
6. Add generated export formats only after the JSON plan format remains stable.

## Open questions

These can still be decided later:

- Exact visual theme polish.
- Whether to add a Settings page early or keep settings inside services/local storage.
- Exact TXT/BBCode export syntax.
- Exact research/academy JSON schema.
- Whether guide content is stored locally or mostly linked externally.
- Whether browser notifications should be included after the first timer MVP.
