# MVP Roadmap

This roadmap reflects the current Planner V2 reset. The app should now grow in small vertical layers instead of returning to the older multi-page V1 structure.

## Current foundation

Completed foundation work:

- Clean-slate Planner V2 route and shell.
- Old V1 page/layout UI removed.
- Reusable services, models, data, translations, assets, and helpers retained.
- Tailwind styling foundation added.
- Nx workspace tooling added around the single Angular app.

## Next milestone: reusable UI primitives

Add shared Angular/Tailwind primitives before building many real tiles and summary panels.

Target components:

```txt
src/app/shared/ui/
  gh-panel
  gh-button
  gh-icon-button
  gh-select
  gh-stat-row
  gh-tile-shell
  gh-number-stepper
```

## Milestone: split Planner V2 sections

Split the current placeholder-heavy shell into real Planner V2 feature components:

```txt
planner-city-setup
planner-troop-setup
planner-bottom-summary
```

The parent Planner V2 page should keep ownership of high-level state.

## Milestone: City Setup

Implement City Setup first because it is the simpler workflow and provides context for troop requirements.

Target behavior:

- Real building data list.
- Building tile component.
- Level number stepper.
- Special building selectors.
- Modifier toggles.
- Signal-first local planner state.
- Computed city summaries.

## Milestone: Troop Setup

After City Setup works, implement Troop Setup.

Target behavior:

- Land / Sea / Mythical category tabs.
- God dropdown.
- Barracks / Harbour / Temple context values.
- Unit tile component.
- Amount number stepper.
- Filtered visible units.
- Computed troop summaries.

## Milestone: persistence and import/export

Wire Planner V2 state into the existing `PlanConfigService` and import/export services.

Target behavior:

- Select active plan.
- Create/duplicate/delete plans.
- Persist building levels and unit amounts.
- Import/export JSON plan bundles.

## Milestone: toolbox wiring

Wire the reusable timer/calculator utilities into the left toolbox after the planner core is usable.

Target behavior:

- Live clock.
- Calculator.
- Time calculator.
- Reminder/timer queue.
- Useful quick links.

## Later polish

Later work can include:

- Responsive/mobile tuning.
- Reference/guide overlay or route.
- Generated TXT/BBCode/CSV exports.
- Academy/research planning.
- Browser notifications for timers.
- Optional battle simulator research.
