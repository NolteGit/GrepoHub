# Grepo Hub TODO

Requirement engineering part 2.

This TODO reflects the current uploaded project state. The first clickable skeleton is now in place, so the next work should be about stabilizing the foundation, deciding the first real planner workflow, and then building one feature slice at a time.

---

## Current repo state

The repository currently contains:

- [x] Clean Angular project setup.
- [x] Basic project documentation in `docs/`.
- [x] Routed page structure.
- [x] Global `AppShellComponent` with top navigation.
- [x] Home dashboard with feature cards.
- [x] Placeholder pages for the planned main sections.
- [x] Static JSON asset folders under `public/assets/data/` and `public/assets/i18n/`.
- [x] Initial `units.json` and `buildings.json` data files.
- [x] Initial `en.json` and `de.json` translation files.
- [x] Initial `GameDataService` for loading unit and building data.
- [x] Early Troops Planner data preview with editable amount inputs.
- [x] Early City Planner data loading preview.

Current important caveats:

- [ ] Build/test status should be rechecked locally because dependencies were not available during this review.
- [ ] Some generated/default tests are probably outdated after routing/app-shell changes.
- [ ] `README.md` still describes the older state and should be updated later.
- [ ] The docs and implementation now differ in a few places, especially around top-bar behavior, mobile navigation, asset paths, and current implementation status.
- [ ] Static data exists, but the schema should be reviewed before more features depend on it.
- [ ] Translation files exist, but the UI still uses hardcoded labels.

---

## Review notes from current implementation

### What looks good

- [x] The app now has the right high-level page skeleton.
- [x] Navigation is centralized in the app shell.
- [x] Home works as a simple dashboard entry point.
- [x] The planned page split still makes sense:
  - Home
  - City Planner
  - Troops Planner
  - References
  - Guides
  - Time Tools
  - Battle Simulator
- [x] Static game data loading has started in a sensible way.
- [x] Troops Planner is a good first feature candidate because it already has real data and user input.
- [x] Battle Simulator is correctly still delayed.

### What should be cleaned up before deeper feature work

- [ ] Update stale tests.
- [ ] Update stale README status.
- [ ] Decide whether asset paths should stay under `public/assets/...` or move to `src/assets/...`.
- [ ] Align `Building` model with `buildings.json`.
- [ ] Decide whether translation is needed now or after the first feature slice.
- [ ] Avoid adding too many layout components before the first real planner flow is clear.

### Recommended direction

The best next step is not another big layout phase. The app shell is good enough for now. The next useful step should be one vertical feature slice, preferably Troops Planner, because it already has:

- loaded game data,
- editable amounts,
- clear calculations,
- later save/load,
- later TXT import/export.

---

## Phase 1 — First page structure only

Goal: create real page components and routes, but keep them visually simple.

### 1.1 Create the Home page

- [x] Generate or create a `home` page component.
- [x] Move the `Grepo Hub` title from `app.html` into the Home page.
- [x] Add a short subtitle.
- [x] Keep styling minimal.

### 1.2 Add the first route

- [x] Add a route for `/` that shows the Home page.
- [x] Keep `app.html` simple.
- [x] Render the routed content through the app shell.
- [x] Re-run `npm run build` locally.

### 1.3 Create placeholder pages

- [x] City Planner
- [x] Troops Planner
- [x] References
- [x] Guides
- [x] Time Tools
- [x] Battle Simulator

### 1.4 Add placeholder routes

- [x] Add routes for all placeholder pages.
- [x] Confirm route names are consistent with docs.
- [x] Manually click through all routes after the latest changes.
- [x] Re-run `npm run build` locally.

---

## Phase 2 — Minimal navigation

Goal: navigate between pages without building the final app shell yet.

### 2.1 Add simple navigation links

- [x] Add navigation links.
- [x] Use Angular `routerLink`.
- [x] Include Home through the brand/logo link.
- [x] Include City Planner, Troops Planner, References, Guides, Time Tools, and Battle Simulator.

### 2.2 Check navigation manually

- [x] Navigation markup exists.
- [x] Click every navigation link locally.
- [x] Confirm the URL changes.
- [x] Confirm the correct page appears.
- [x] Re-run `npm run build` locally.

### 2.3 Add very light styling

- [x] Add spacing around the app.
- [x] Make navigation readable.
- [x] Add active navigation styling.
- [x] Avoid heavy design work for now.

---

## Phase 3 — Responsive app shell, but still simple

Goal: introduce the future layout structure without making it complex.

The app shell provides the global structure of the app:

- global desktop header navigation,
- routed page content,
- placeholder time quick-action.

It does not include a permanent global sidebar. Page-specific panels should live inside individual pages later.

### 3.1 Create app shell component

- [x] Create `AppShellComponent`.
- [x] Render `<app-shell />` from `AppComponent`.
- [x] Move navigation markup into `AppShellComponent`.
- [x] Move `<router-outlet />` into `AppShellComponent`.
- [x] Keep the layout simple.
- [x] Do not create separate `TopBarComponent`, `NavigationComponent`, or `NavigationDrawerComponent` yet.
- [x] Confirm all routes still render inside the shell.

### 3.2 Define global navigation items

- [x] Create a central nav item list inside the app shell.
- [x] Include City Planner.
- [x] Include Troops Planner.
- [x] Include References.
- [x] Include Guides.
- [x] Include Time Tools.
- [x] Include Battle Simulator.
- [x] Keep Home separate as app brand/logo.
- [x] Store `label` and `path`.
- [ ] Add optional icon metadata later only if useful.

### 3.3 Build the desktop header navigation

- [x] Home logo / app name on the left.
- [x] Main navigation links across the top.
- [x] Time quick-action button on the right.
- [ ] Decide later whether the quick-action should open a timer menu, navigate to Time Tools, or stay disabled until timers exist.

### 3.4 Add active navigation styling

- [x] Highlight currently active desktop navigation link.
- [x] Use `routerLinkActive`.
- [ ] Later apply equivalent active styling to mobile navigation.

### 3.5 Add mobile header behavior later

Do not implement this until the desktop skeleton and first feature slice feel stable.

- [ ] Hide desktop navigation links on small screens.
- [ ] Show a burger menu button.
- [ ] Keep the Home logo / app name visible.
- [ ] Keep the time quick-action button visible or decide to simplify it on mobile.
- [ ] Show navigation links in a dropdown or drawer.
- [ ] Confirm keyboard accessibility and closing behavior.

### 3.6 Keep routed page content stable inside the shell

- [x] Keep `<router-outlet />` inside the shell.
- [x] Keep shell responsible only for global layout.
- [x] Do not add page-specific logic to the shell.
- [x] Confirm all routes still work after shell changes.

### 3.7 Prepare page-specific side-panel pattern later

Do not implement this fully yet.

- [ ] City Planner configuration panel.
- [ ] Troops Planner configuration panel.
- [ ] References category/filter panel.
- [ ] Guides category/filter panel.
- [ ] Time Tools configuration panel.
- [ ] Battle Simulator configuration panel.

### 3.8 Add current page title later

Do not do this immediately unless the header needs more orientation.

- [ ] Decide whether the active navigation link is enough.
- [ ] Decide how page titles should be stored.
- [ ] Add route `data.title` values if needed.
- [ ] Show the current route title in the header only if it adds value.

### 3.9 Phase 3 cleanup checklist

- [x] Navigation item names match existing routes.
- [x] Settings link removed until a Settings page is needed.
- [x] References route is used instead of Tools.
- [x] App shell contains only global layout.
- [x] Page-specific side panels are deferred.
- [ ] Run `npm run build` locally.
- [ ] Run `npm run start` and click through all desktop navigation links.
- [ ] Run `npm run test` after test cleanup.

---

## Phase 4 — Dashboard cards

Goal: make the Home page feel like a real dashboard and entry point to the main app sections.

### 4.1 Add simple dashboard cards

- [x] City Planning
- [x] Unit Planning
- [x] References
- [x] Guides
- [x] Time Tools
- [x] Battle Simulator

### 4.2 Improve dashboard card usability later

- [ ] Add card styling.
- [ ] Add hover/focus states.
- [ ] Make cards visually different from plain links.
- [ ] Consider short status labels such as `MVP`, `Planned`, or `Later`.
- [ ] Add About link/dialog later.

### 4.3 Avoid over-polishing now

- [x] Keep the dashboard simple.
- [ ] Do not spend major time on visual design before the first real planner workflow exists.

---

## Phase 5 — Static game data foundation

Goal: make sure the basic data foundation is reliable before planner logic depends on it.

### 5.1 Static data files

- [x] Add `public/assets/data/units.json`.
- [x] Add `public/assets/data/buildings.json`.
- [x] Add `public/assets/i18n/en.json`.
- [x] Add `public/assets/i18n/de.json`.

### 5.2 Data service

- [x] Add `GameDataService`.
- [x] Load units via `getUnitDefinitions()`.
- [x] Load buildings via `getBuildingDefinitions()`.
- [ ] Decide whether to keep one combined `GameDataService` or split later into `UnitDataService` and `BuildingDataService`.
- [ ] Add basic error handling or safe fallback behavior later.

### 5.3 Review data schemas

Important before planner logic grows.

- [ ] Align `Building` model with `buildings.json`.
  - Current model has `isSpecial`.
  - Current JSON uses `category`.
- [ ] Decide whether building category should be typed as `main | special`.
- [ ] Decide whether building `maxLevel` should stay nullable at first.
- [ ] Decide whether missing building costs should stay `null` or be omitted.
- [ ] Review whether all unit fields are needed for the Troops Planner MVP.
- [ ] Add explicit unit category/group if needed later:
  - land,
  - naval,
  - mythical,
  - support/special.

### 5.4 Data validation later

- [ ] Add lightweight validation tests for JSON shape.
- [ ] Check that every unit has an i18n key.
- [ ] Check that every building has an i18n key.
- [ ] Check that numeric values are non-negative.
- [ ] Check that IDs are unique.

---

## Phase 6 — Test and build cleanup

Goal: make the project stable before adding more feature code.

This phase should be done soon because some generated tests no longer match the app shape.

### 6.1 App test cleanup

- [ ] Update `app.spec.ts` so it no longer expects the root app itself to render an `h1` directly.
- [ ] Provide router testing setup where needed.
- [ ] Test that `App` creates successfully.
- [ ] Optionally test that `AppShell` is present.

### 6.2 Page test cleanup

- [ ] Update `CityPlanner` test to provide `HttpClient` or mock `GameDataService`.
- [ ] Update `TroopsPlanner` test to provide `HttpClient` or mock `GameDataService`.
- [ ] Keep placeholder page tests simple.
- [ ] Avoid over-testing visual layout for now.

### 6.3 Build verification

- [ ] Run `npm install` or `npm ci` locally.
- [ ] Run `npm run build`.
- [ ] Run `npm run test`.
- [ ] Fix any failing generated tests before adding larger features.

---

## Phase 7 — Troops Planner vertical slice

Recommended next real feature slice.

Goal: turn the current unit preview into a useful mini-planner without adding import/export or storage yet.

### 7.1 Decide first Troops Planner MVP behavior

Discuss and decide:

- [ ] Should the planner support one city/template at a time first?
- [ ] Should it support named troop presets immediately or later?
- [ ] Should land and naval units be separated from the beginning?
- [ ] Should mythical units be shown by default or filtered?
- [ ] Which totals are most useful first?

Recommended first version:

- one unnamed troop plan,
- list all units,
- editable amount per unit,
- show calculated totals,
- no save/load yet,
- no import/export yet.

### 7.2 Add calculated totals

- [ ] Total population.
- [ ] Total wood.
- [ ] Total stone.
- [ ] Total silver.
- [ ] Total favor.
- [ ] Total transport capacity.
- [ ] Total loot capacity.
- [ ] Optional total attack by attack type later.
- [ ] Optional defensive totals later.

### 7.3 Improve input behavior

- [ ] Prevent negative values.
- [ ] Treat empty input as zero.
- [ ] Decide whether decimals should be rounded or rejected.
- [ ] Add a clear/reset button.
- [ ] Consider quick increment controls later.

### 7.4 Improve table structure

- [ ] Add a simple totals summary above or below the table.
- [ ] Consider separating land/naval/mythical units.
- [ ] Consider hiding less important columns for the first MVP.
- [ ] Consider responsive table behavior.

### 7.5 Extract calculation logic

- [ ] Move unit total calculation out of the template.
- [ ] Consider a small pure utility function or service.
- [ ] Add unit tests for total calculation.

---

## Phase 8 — City Planner vertical slice

Goal: turn the current building data preview into the first usable city planning screen.

Start this after Troops Planner direction is clear, unless City Planner becomes the preferred next focus.

### 8.1 Decide first City Planner MVP behavior

Discuss and decide:

- [ ] Should the first city plan be one unnamed city?
- [ ] Should each building have a target level input?
- [ ] Should current level also be tracked or only target level?
- [ ] Should special buildings be shown together with normal buildings or separately?
- [ ] Should Academy be visible immediately or delayed?

Recommended first version:

- one unnamed city plan,
- building list,
- target level input,
- separate normal/special building grouping,
- no academy planning yet,
- no save/load yet,
- no import/export yet.

### 8.2 Building level inputs

- [ ] Show all buildings from `buildings.json`.
- [ ] Add target level input per building.
- [ ] Clamp values to allowed range once `maxLevel` exists.
- [ ] Separate main and special buildings.
- [ ] Add reset button.

### 8.3 City summary later

- [ ] Total planned population usage.
- [ ] Total planned resources.
- [ ] Total build time if data becomes available.
- [ ] Special building warning/limit if relevant.

### 8.4 Academy extension later

- [ ] Decide academy model.
- [ ] Decide whether academy is a collapsible panel, tab, or modal.
- [ ] Add research JSON only when needed.
- [ ] Include academy data in TXT import/export later.

---

## Phase 9 — Local storage and saved configurations

Goal: save user-created plans locally after basic planner input works.

Do not start this before at least one planner has useful editable state.

### 9.1 Storage model decisions

- [ ] Define `TroopPlan` model.
- [ ] Define `CityPlan` model.
- [ ] Decide required fields:
  - id,
  - name,
  - createdAt,
  - updatedAt,
  - values.
- [ ] Decide whether versioning is needed in saved data.

### 9.2 Storage service

- [ ] Create a local storage helper/service.
- [ ] Use namespaced keys such as `grepoHub.troopPlans` and `grepoHub.cityPlans`.
- [ ] Add safe JSON parsing.
- [ ] Add fallback for corrupted local storage data.
- [ ] Add tests for storage service.

### 9.3 Planner configuration sidebar

- [ ] Add saved plan list inside Troops Planner.
- [ ] Add saved plan list inside City Planner.
- [ ] Load selected plan into inputs.
- [ ] Create new plan.
- [ ] Rename plan.
- [ ] Delete plan.
- [ ] Duplicate plan later.

---

## Phase 10 — TXT import/export

Goal: exchange planner configurations in a simple, human-readable format.

Do not start this until the saved plan shape is clear.

### 10.1 TXT format decisions

- [ ] Define first TXT format for Troop Plans.
- [ ] Define first TXT format for City Plans.
- [ ] Decide whether format should be strict or forgiving.
- [ ] Decide how comments should work.
- [ ] Decide how unknown units/buildings should be handled.

### 10.2 Export

- [ ] Export one troop plan to TXT.
- [ ] Export one city plan to TXT.
- [ ] Add copy-to-clipboard button.
- [ ] Add download TXT button later.

### 10.3 Import

- [ ] Import one troop plan from TXT.
- [ ] Import one city plan from TXT.
- [ ] Show parse errors clearly.
- [ ] Allow preview before applying imported data.
- [ ] Add tests for parser and exporter.

---

## Phase 11 — Translation integration

Goal: use the existing translation files in the UI.

This can wait until the first feature slice is stable.

### 11.1 Decide translation approach

- [ ] Decide whether to build a tiny custom translation service.
- [ ] Decide whether to use Angular i18n later instead.
- [ ] Decide where selected language is stored.
- [ ] Decide whether German is needed in the first usable MVP.

### 11.2 Translation service

- [ ] Load `en.json`.
- [ ] Load `de.json`.
- [ ] Add fallback to English.
- [ ] Add simple `translate(key)` function or pipe.
- [ ] Add local storage for selected language later.

### 11.3 Apply translations gradually

- [ ] App shell navigation.
- [ ] Home dashboard cards.
- [ ] Resource labels.
- [ ] Unit names.
- [ ] Building names.
- [ ] Planner buttons and summaries.

---

## Phase 12 — Time Tools foundation

Goal: build timing tools after the first planner workflow is useful.

### 12.1 First Time Tools decision

Discuss before coding:

- [ ] Should first timing tool be countdown, alarm, stopwatch, or travel-time calculator?
- [ ] Should active timers appear in top bar immediately?
- [ ] Should browser notifications be delayed?

Recommended first version:

- simple countdown,
- active countdown list on Time Tools page,
- top-bar indicator later.

### 12.2 Timer service later

- [ ] Create shared timer service.
- [ ] Support countdowns.
- [ ] Support alarms.
- [ ] Support stopwatches.
- [ ] Keep timers alive while switching pages.
- [ ] Decide local storage behavior.
- [ ] Add tests for timer logic.

---

## Phase 13 — References and Guides

Goal: make the informational pages useful without overbuilding them.

### 13.1 References first version

- [ ] Show unit reference data from `units.json`.
- [ ] Show building reference data from `buildings.json`.
- [ ] Add simple category filters later.
- [ ] Add external links later.

### 13.2 Guides first version

- [ ] Decide whether guide content is local markdown/text or external links.
- [ ] Add first few guide entries manually.
- [ ] Add categories later.
- [ ] Keep Guides separate from factual References.

---

## Phase 14 — Battle Simulator placeholder

Goal: keep the route visible but avoid spending major time here too early.

- [x] Route exists.
- [x] Placeholder page exists.
- [ ] Add a short “planned later” explanation.
- [ ] Add disabled/mock inputs only if useful for planning.
- [ ] Do not implement real simulation until units, settings, modifiers, and formulas are clear.

---

## Open discussion points

These are the main things worth discussing before the next coding session.

### Next page / feature choice

- [ ] Continue with Troops Planner first?
- [ ] Switch to City Planner first?
- [ ] Build References as a data display page first?
- [ ] Build Time Tools first because the top bar already hints at timers?

Recommended: Troops Planner first.

### Planner behavior

- [ ] One active plan or multiple saved plans immediately?
- [ ] Should plans have names from the beginning?
- [ ] Should import/export happen before local save/load or after?
- [ ] Should planner pages use sidebars early or keep everything in one column first?

Recommended: one active unnamed plan first, then totals, then save/load, then import/export.

### Data decisions

- [ ] Finalize unit fields needed for the first Troops Planner.
- [ ] Finalize building fields needed for the first City Planner.
- [ ] Decide whether game data should be English-only internally with translations via i18n keys.
- [ ] Decide whether IDs should be the only stable references in saved plans.

Recommended: store IDs in plans, not names.

### Layout decisions

- [ ] Keep desktop header as-is for now?
- [ ] Add mobile burger soon or wait?
- [ ] Add current page title or rely on active nav state?
- [ ] Make time quick-action navigate to Time Tools or leave as placeholder?

Recommended: keep layout as-is until one planner is useful.

---

## Suggested immediate next steps

Best next coding sequence:

1. Fix/refresh tests enough that build/test status is trustworthy.
2. Update `README.md` status later, not urgent for feature work.
3. Align `Building` model with `buildings.json`.
4. Continue Troops Planner as first vertical slice.
5. Add calculated troop totals.
6. Extract troop total calculation into testable logic.
7. Only then discuss save/load and TXT import/export.

