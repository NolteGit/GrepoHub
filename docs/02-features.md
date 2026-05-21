# Feature List

This document describes the current Grepo Hub feature direction after the Planner V2 reset.

## Current routed surface

Grepo Hub currently exposes the Planner V2 shell at:

```txt
/
/planner-v2
```

The old Home, City Planner, Troops Planner, References, and Toolbox pages were intentionally removed as UI surfaces. Their reusable data, services, helpers, translations, and assets remain available for the V2 implementation.

## Planner V2

Planner V2 is the central app surface.

The intended layout has three persistent areas:

- Left functional toolbox with clock, quick actions, reminders, calculator/time tools, and links.
- Center planner workspace with plan controls, City Setup / Troop Setup switch, setup context strip, tile grid, and bottom summary.
- Right summary sidebar with shared population/BHP information and context-specific summary content.

## City Setup

City Setup will contain the building-planning workflow.

Planned V2 behavior:

- Building tiles for all normal buildings.
- Wider selectors for special buildings.
- Compact setup context strip for city modifiers such as Aphrodite, Land Expansion, and Plow.
- Building level edits through reusable number controls.
- City summaries derived from the selected plan state.
- JSON import/export and local persistence through the existing plan configuration services.

## Troop Setup

Troop Setup will contain the unit-planning workflow.

Planned V2 behavior:

- Land / Sea / Mythical category tabs.
- God dropdown for mythical units.
- Compact context values for Barracks, Harbour, and Temple levels.
- Unit amount edits through reusable number controls.
- Troop summaries for population, attack, defense, carry capacity, and march-time context.
- JSON import/export and local persistence through the existing plan configuration services.

## Toolbox

The toolbox is no longer a separate route. It is part of the Planner V2 shell.

Planned toolbox behavior:

- Clock and current date.
- Common planner actions.
- Reminder/timer queue.
- Calculator and time calculator.
- Quick links.

Timer and calculator backend utilities already exist under `src/app/services` and `src/app/utils`; the V2 UI will wire them in later.

## References and guides

Reference content is not currently exposed as a separate page in V2. Existing reference documents and quick-link assets are retained so they can later be surfaced through the toolbox, a compact overlay, or a future dedicated route if needed.

## Translation support

Grepo Hub uses local JSON translation files under `public/assets/i18n/`.

Supported languages are currently:

- English (`en`)
- German (`de`)
- Spanish (`es`)
- French (`fr`)
- Italian (`it`)
- Dutch (`nl`)

All visible UI labels should have translation keys. Fallback strings are acceptable during V2 migration for data-driven labels, but should not become the normal way to add stable UI text.
