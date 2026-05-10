# Feature List

This document describes the current Grepo Hub feature set and the main ideas that are still planned for later iterations.

## Current pages

Grepo Hub currently exposes these routed pages:

- Home / Dashboard
- City Planner
- Troops Planner
- References
- Toolbox

There is no dedicated import/export page. Import and export actions belong directly inside the planner pages where the user is already working with the data.

## Home / Dashboard

The home page is the central entry point of the app.

It currently provides:

- A prominent **Grepo Hub** introduction.
- Cards for the active feature areas.
- Short explanations of the current local-first approach.
- Navigation into the main planning, reference, and toolbox pages.

Future additions may include a compact About dialog, project version information, and a clearer changelog/status area.

## City Planner

The City Planner is one of the two core planning features.

It currently focuses on:

- Building level planning.
- City role/template presets.
- Shared `PlanConfig` integration.
- Local plan persistence.
- JSON import/export through the planner UI.

Planned extensions include academy planning, better validation, optional note/BBCode export, and visual summaries.

## Academy planning

Academy planning should remain part of the City Planner instead of becoming a separate MVP page.

Good future UI shapes are:

- Collapsible panel.
- Modal / popup.
- Tab inside the City Planner.

Academy data can later become an optional section in the shared plan configuration model.

## Troops Planner

The Troops Planner is the second core planning feature.

It currently focuses on:

- Land and naval unit amounts.
- OFF/DEF categorization.
- Population and resource totals.
- Preset troop configurations.
- Shared `PlanConfig` integration.
- Local plan persistence.
- JSON import/export through the planner UI.

Planned extensions include CSV export, BBCode/note export, stronger modifier support, and better composition summaries.

## References

The References page collects structured game-related links and helper material.

It currently includes:

- Categorized external resources.
- Tool and script cards.
- Installation/status labels for scripts.
- Search and type filters.
- English/German translations for all user-facing labels.
- Localized quick-link URLs where supported.

Future reference data may include building tables, research summaries, common abbreviations, and returning-player notes.

## Toolbox

The Toolbox page consolidates utility tools that were previously described as separate Time Tools and Battle Simulator pages.

It currently includes:

- Quick calculator.
- Time calculator.
- Reminder creation for countdowns, alarms, and stopwatches.
- Active timer queue.
- Battle simulator placeholder behind a feature flag.

Running timers are currently scoped to the Toolbox implementation. A later extraction into a shared timer service would allow global top-bar timer access.

See [`05-time-tools.md`](./05-time-tools.md) for details about timing behavior and future service extraction.

## Translation support

Grepo Hub uses local JSON translation files.

Current languages:

- English (`public/assets/i18n/en.json`)
- German (`public/assets/i18n/de.json`)

The translation system should cover:

- Navigation labels.
- Page titles.
- Button labels.
- Planner labels and helper text.
- References resources, scripts, filters, and link labels.
- Toolbox labels, actions, calculator text, and timer states.
- Status and error messages.

Fallback strings are supported for migration and data-driven labels, but new user-facing text should still receive explicit translation keys.

## Static JSON game database

Grepo Hub includes a small local JSON database for core game resources.

Current files:

```txt
public/assets/data/units.json
public/assets/data/buildings.json
```

Possible later files:

```txt
public/assets/data/research.json
public/assets/data/world-settings.json
```

This data should remain readable and versionable. UI labels around the data should be translated through i18n files, while core game identifiers can stay stable.

## Delayed features

These are useful but should not distract from the current MVP stabilization work:

- Full Battle Simulator.
- Advanced Academy Planner.
- PNG export.
- CSV export.
- BBCode export.
- Browser notifications and sounds.
- Global shared timer service.
- Cloud sync.
- Login/accounts.
- Live Grepolis integration.
- Browser extension features.
- Alliance multiplayer planning.
