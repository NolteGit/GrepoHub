# Planner V2 Refactor Inventory

This refactor keeps the reusable application core and removes the old V1 presentation shell so Planner V2 can start from a clean UI surface.

## Kept as reusable app core

- `src/app/data`: presets, asset paths, document metadata, and default plan data.
- `src/app/models`: building, unit, city, troop, plan, and toolbox data contracts.
- `src/app/services`: game-data loading, plan persistence, import/export, normalization, readable export, translation, population/research calculations, and toolbox timers.
- `src/app/utils`: toolbox calculator and time helpers.
- `src/app/pipes`: translation pipe for future UI components.
- `public/assets`: Grepolis data, i18n files, images, SVG icons, and static documents.
- `scripts`: asset and i18n audit scripts.

## Removed as obsolete V1 presentation

- Old navigation/app shell layout.
- Old Home, References, City Planner, Troops Planner, and Toolbox page components.
- Old page/component HTML and SCSS files.
- Old planner shell/dialog SCSS partials.
- Old toolbox visual components while retaining timer/calculator backend utilities.

## New clean entry point

- `src/app/pages/planner-v2` is a minimal compile-safe workspace that proves the retained plan core is connected.
- Routes now point `/` and `/planner-v2` to the fresh V2 workspace.
- The root app now only hosts Angular routing.
- Global styles now contain only tokens and base reset rules.

## Suggested next step

Build Planner V2 component-by-component on top of this trimmed core. Start with the shell, then add toolbox, header, mode switch, city setup, troop setup, summaries, and reusable tile primitives.
