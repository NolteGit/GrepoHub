# Grepo Hub TODO

This TODO is intentionally slow and step-by-step. The goal is to avoid building too many things at once.

## Current repo state

The repository currently contains:

- A clean Angular project setup.
- Basic project documentation in `docs/`.
- A simple root app placeholder in `src/app/app.html`.
- Empty Angular routes in `src/app/app.routes.ts`.
- No real pages yet.
- No layout components yet.
- No static game data files yet.
- No services yet.

The next goal is not to build the full MVP. The next goal is to make the app clickable with one tiny step at a time.


---

## Phase 1 — First page structure only

Goal: create real page components and routes, but keep them visually simple.

### 1.1 Create the Home page

- [x] Generate or create a `home` page component.
- [x] Move the current `Grepo Hub` title from `app.html` into the Home page.
- [x] Add a short subtitle: `Grepolis companion app`.
- [x] Do not add cards yet.
- [x] Do not add styling yet, except minimal spacing if needed.

### 1.2 Add the first route

- [x] Add a route for `/` that shows the Home page.
- [x] Keep `app.html` simple and only render `<router-outlet />`.
- [x] Start the app and confirm the Home page still appears.
- [x] Run `npm run build`.

### 1.3 Create placeholder pages

Create empty/simple placeholder pages for:

- [x] City Planner
- [x] Troops Planner
- [x] References
- [x] Guides
- [x] Time Tools
- [x] Battle Simulator

Each placeholder page should only contain:

- [x] A page title.
- [x] One short sentence saying the feature is planned.

### 1.4 Add placeholder routes

- [x] Add routes for all placeholder pages.
- [x] Visit each route manually in the browser.
- [x] Confirm each page loads without errors.
- [x] Run `npm run build`.

---

## Phase 2 — Minimal navigation

Goal: navigate between pages without building the final app shell yet.

### 2.1 Add simple navigation links

- [x] Add a small navigation area in `app.html` above `<router-outlet />`.
- [x] Add links to Home, City Planner, Troops Planner, References, Guides, Time Tools, and Battle Simulator.
- [x] Use Angular `routerLink`.
- [x] Keep the navigation plain and unstyled at first.

### 2.2 Check navigation manually

- [x] Click every navigation link.
- [x] Confirm the URL changes.
- [x] Confirm the correct placeholder page appears.
- [x] Run `npm run build`.

### 2.3 Add very light styling

- [x] Add spacing around the app.
- [x] Make the navigation readable.
- [x] Highlight nothing yet unless it is easy.
- [x] Avoid spending too much time on design.

---

## Phase 3 — Responsive app shell, but still simple

Goal: introduce the future layout structure without making it complex.

The app shell provides the global structure of the app:

- global desktop header navigation
- routed page content

It does not include a permanent global sidebar. Page-specific side panels, configuration areas, guide/reference links, filters, and simulator settings will be handled later inside the individual pages.

### 3.1 Create app shell component

Create:

- [x] `AppShellComponent`

For now:

- [x] Render `<app-shell />` from `AppComponent`.
- [x] Move the existing navigation markup into `AppShellComponent`.
- [x] Move `<router-outlet />` into `AppShellComponent`.
- [x] Keep the layout simple.
- [x] Do not create separate `TopBarComponent`, `NavigationComponent`, or `NavigationDrawerComponent` yet.
- [x] Do not add mobile behavior yet.
- [x] Confirm all existing routes still render inside the shell.

### 3.2 Define global navigation items

Create a central list of main navigation items inside the app shell.

Include:

- [x] City Planner
- [x] Troops Planner
- [x] References
- [x] Guides
- [x] Time Tools
- [x] Battle Simulator

Not included for now:

- [x] Settings removed for now.
- [x] Tools renamed back to References.

Keep `Home` separate because it is represented by the app logo/name on the left side of the header.

Each navigation item should eventually contain:

- [x] label
- [x] route/path
- [ ] optional icon later

### 3.3 Build the desktop header navigation

Create a simple desktop header layout inside `AppShellComponent`.

Include:

- [x] Home logo / app name on the left
- [x] Main navigation links across the top
- [x] Time quick-action button on the right

The time quick-action button is only a placeholder for now.

### 3.4 Add active navigation styling

- [x] Highlight the currently active page in the desktop navigation.

Use Angular route styling with `routerLinkActive`.

Later, also apply the same active state to the mobile menu once the mobile menu exists.

### 3.5 Add mobile header behavior later

Do not implement this in the current desktop-focused phase.

For mobile later:

- [ ] Hide desktop navigation links on small screens.
- [ ] Show a burger menu button.
- [ ] Keep the Home logo / app name visible.
- [ ] Keep the time quick-action button visible.
- [ ] Show navigation links in a dropdown/drawer when the burger button is opened.

Mobile behavior will be handled in a later responsive/mobile refinement phase.

### 3.6 Keep routed page content stable inside the shell

The routed page content belongs inside `AppShellComponent`.

- [x] Keep `<router-outlet></router-outlet>` inside the shell.
- [x] Keep the shell responsible only for global layout.
- [x] Do not add page-specific logic to the shell.
- [x] Confirm all routes still work after shell changes.

### 3.7 Prepare page-specific side-panel pattern later

Do not implement this fully in Phase 3 unless needed.

Later, pages can use their own page-specific side panels, for example:

- [ ] City Planner configuration panel
- [ ] Troops Planner configuration panel
- [ ] References links / document panel
- [ ] Guides categories / references panel
- [ ] Time Tools configuration panel
- [ ] Battle Simulator configuration panel

These panels belong inside individual pages, not in the global app shell.

### 3.8 Add current page title later

Do not do this immediately unless the shell is stable and the header still needs more orientation.

- [ ] Decide whether the active navigation link is enough.
- [ ] Decide how page titles should be stored.
- [ ] Add route `data.title` values if needed.
- [ ] Show the current route title in the header only if it adds value.

### 3.9 Phase 3 cleanup checklist

Before fully closing Phase 3:

- [x] Navigation item names match existing routes.
- [x] Settings link removed until a Settings page is needed.
- [x] References route is used instead of Tools.
- [x] App shell contains only global layout.
- [x] Page-specific side panels are deferred.
- [ ] Run `npm run build`.
- [ ] Run `npm run start` and click through all desktop navigation links.
---

## Phase 4 — Dashboard cards

Goal: make the Home page feel like a real dashboard and entry point to the main app sections.

### 4.1 Add simple dashboard cards

On the Home page, add cards for:

- [x] City Planning
- [x] Unit Planning
- [x] References
- [x] Guides
- [x] Time Tools
- [x] Battle Simulator

Each card should have:

- [x] title
- [x] short description
- [x] route target

Do not add feature logic yet.

### 4.2 Link cards to routes

- [x] Make each card link to its page.
- [x] Keep card content short.
- [x] Make the whole card clickable.
- [x] Confirm all card links route correctly.

### 4.3 Move About information to later

Do not implement About information in Phase 4.

The Home page should stay focused on the dashboard cards for now. About information can be added much later when the app has more stable content, versioning, credits, data sources, or project context.

Preferred future options:

- [ ] Footer-style About link.
- [ ] About modal.

Possible future About content:

- [ ] Short app purpose.
- [ ] Version information.
- [ ] Credits.
- [ ] Data sources / references.
- [ ] Project or GitHub link.
- [ ] Disclaimer if needed.
---

## Phase 5 — First local data files

Goal: add the first local game data without building full planners yet.

This phase introduces static local data files for units, buildings, and translations. The app does not need to load or display this data yet.

### 5.1 Create asset folders

- [x] Create `src/assets/data/`.
- [x] Create `src/assets/i18n/`.
- [x] Add `.gitkeep` files if the folders would otherwise be empty.

### 5.2 Add unit data

- [x] Create `src/assets/data/units.json`.
- [x] Start with local unit data based on the wiki tables.
- [x] Use stable IDs such as `swordsman`, `slinger`, `light_ship`, `fire_ship`.
- [x] Keep English unit names in the unit data for now.
- [x] Add resource fields: `wood`, `stone`, `silver`, `favor`, `population`.
- [x] Add combat fields: `attackType`, `attack`, `defenseNaval`, `defenseBlunt`, `defenseSharp`, `defenseDistance`.
- [x] Add utility fields: `lootCapacity`, `transportCapacity`, `speed`, `recruitmentTimeMinutes`.
- [x] Add mythical metadata: `isMythical`, `god`.

Notes:

- `attackType` should use one of: `naval`, `blunt`, `sharp`, `distance`.
- Use `null` for values that are intentionally not normal numeric values.
- Fire Ship / Brander should use `attack: null` later because it does not use normal attack calculation.
- Fire Ship / Brander needs special battle-simulation behavior later because it trades 1-for-1 against ships.
- Light Ship and Fire Ship are easy to confuse:
  - `light_ship` = English “Light Ship”, German “Feuerschiff”
  - `fire_ship` = English “Fire Ship”, German “Brander”
- Ladon is a special case because wiki versions differ and its attack is a range.
- Ladon should be reviewed separately before battle simulation logic is implemented.

Future unit data tasks:

- [ ] Decide how to model special-case units such as Ladon.
- [ ] Decide whether to add fields such as `unitCategory`, `role`, or `isFlying`.
- [ ] Create a TypeScript unit model later, for example `src/app/models/unit.model.ts`.
- [ ] Validate unit data once it is loaded by the app.

### 5.3 Add tiny building data

- [x] Create `src/assets/data/buildings.json`.
- [x] Add only 2 or 3 buildings first.
- [x] Use simple fields like `id`, `name`, `maxLevel`.

Do not add full building costs, dependencies, effects, or upgrade times yet.

### 5.4 Add translation files

- [x] Create `src/assets/i18n/en.json`.
- [x] Create `src/assets/i18n/de.json`.
- [x] Add app/navigation labels.
- [x] Add Home/dashboard card labels.
- [x] Add resource labels.
- [x] Add unit attribute labels.
- [x] Add attack type labels.
- [x] Add god labels.
- [x] Add unit name labels.

Notes:

- Translation files are prepared assets only.
- The app does not use them yet.
- Do not add a translation library yet.
- Later, decide between Angular built-in i18n, `ngx-translate`, or a small custom translation service.
- Keep `units.json` language-independent where possible by using stable IDs.
- Localized unit names belong in `src/assets/i18n/en.json` and `src/assets/i18n/de.json`.

Future translation tasks:

- [ ] Decide how translations should be loaded.
- [ ] Decide whether the app needs a language switcher.
- [ ] Decide whether game data names should always come from i18n keys.

## Phase 5 — First local data files

Goal: add the first local game data without building full planners yet.

This phase introduces static local data files for units, buildings, and translations. The app does not need to load or display this data yet.

### 5.1 Create asset folders

- [x] Create `src/assets/data/`.
- [x] Create `src/assets/i18n/`.
- [x] Add `.gitkeep` files if the folders would otherwise be empty.

### 5.2 Add unit data

- [x] Create `src/assets/data/units.json`.
- [x] Start with local unit data based on the wiki tables.
- [x] Use stable IDs such as `swordsman`, `slinger`, `light_ship`, `fire_ship`.
- [x] Keep English unit names in the unit data for now.
- [x] Add resource fields: `wood`, `stone`, `silver`, `favor`, `population`.
- [x] Add combat fields: `attackType`, `attack`, `defenseNaval`, `defenseBlunt`, `defenseSharp`, `defenseDistance`.
- [x] Add utility fields: `lootCapacity`, `transportCapacity`, `speed`, `recruitmentTimeMinutes`.
- [x] Add mythical metadata: `isMythical`, `god`.

Notes:

- `attackType` should use one of: `naval`, `blunt`, `sharp`, `distance`.
- Use `null` for values that are intentionally not normal numeric values.
- Fire Ship / Brander should use `attack: null` because it does not use normal attack calculation.
- Fire Ship / Brander needs special battle-simulation behavior later because it trades 1-for-1 against ships.
- Light Ship and Fire Ship are easy to confuse:
  - `light_ship` = English “Light Ship”, German “Feuerschiff”
  - `fire_ship` = English “Fire Ship”, German “Brander”
- Ladon is a special case because wiki versions differ and its attack is a range.
- Ladon should be reviewed separately before battle simulation logic is implemented.

Future unit data tasks:

- [ ] Decide how to model special-case units such as Ladon.
- [ ] Decide whether to add fields such as `unitCategory`, `role`, or `isFlying`.
- [ ] Create a TypeScript unit model later.
- [ ] Validate unit data once it is loaded by the app.

### 5.3 Add building data

- [x] Create `src/assets/data/buildings.json`.
- [x] Extract the available buildings from the wiki overview.
- [x] Use stable IDs such as `senate`, `timber_camp`, `marketplace`, `city_wall`.
- [x] Keep English building names in the building data for now.
- [x] Add simple fields: `id`, `name`, `category`, `maxLevel`, `wood`, `stone`, `silver`, `population`, `constructionTimeMinutes`.
- [x] Use `null` for unknown building values for now.

Notes:

- Building data currently contains the known building list, not full building-level data.
- Building costs, population usage, max levels, effects, dependencies, and construction times need more detailed source data later.
- Special buildings are marked with `category: "special"`.
- Agora is included as `category: "overview"` because it is not a normal buildable building in the same sense.

Future building data tasks:

- [ ] Verify max levels.
- [ ] Add building costs per level.
- [ ] Add construction times per level.
- [ ] Add population requirements per level.
- [ ] Add building dependencies.
- [ ] Decide how to model special building exclusivity.

### 5.4 Add translation files

- [x] Create `src/assets/i18n/en.json`.
- [x] Create `src/assets/i18n/de.json`.
- [x] Add app/navigation labels.
- [x] Add Home/dashboard card labels.
- [x] Add resource labels.
- [x] Add unit attribute labels.
- [x] Add attack type labels.
- [x] Add god labels.
- [x] Add unit name labels.
- [x] Add building name labels.

Notes:

- Translation files are prepared assets only.
- The app does not use them yet.
- Do not add a translation library yet.
- Later, decide between Angular built-in i18n, `ngx-translate`, or a small custom translation service.
- Keep `units.json` and `buildings.json` language-independent where possible by using stable IDs.
- Localized unit and building names belong in `src/assets/i18n/en.json` and `src/assets/i18n/de.json`.

Future translation tasks:

- [ ] Decide how translations should be loaded.
- [ ] Decide whether the app needs a language switcher.
- [ ] Decide whether game data names should always come from i18n keys.

---

## Phase 6 — Load local data into Angular

Goal: teach the app how to read the local JSON files without building planners yet.

This phase connects the static files from Phase 5 to Angular code. The goal is only to load and expose the data in a clean way.

### 6.1 Create TypeScript data models

- [x] Create `src/app/models/unit.model.ts`.
- [x] Create `src/app/models/building.model.ts`.
- [x] Keep the models close to the JSON structure.
- [x] Allow nullable values where the data intentionally uses `null`.

### 6.2 Create a local data service

- [x] Create `src/app/services/game-data.service.ts`.
- [x] Load unit definitions from `/assets/data/units.json`.
- [x] Load building definitions from `/assets/data/buildings.json`.
- [x] Return typed data.
- [x] Do not add filtering, searching, or calculations yet.

### 6.3 Make Angular able to fetch local JSON

- [x] Check whether the app already has HTTP support configured.
- [x] Add Angular HTTP support in the app configuration if needed.
- [x] Confirm local assets can be loaded from `/assets/data/units.json`.
- [x] Confirm local assets can be loaded from `/assets/data/buildings.json`.

Notes:

- Static files are served from `public/assets/...`.
- The app uses browser paths like `/assets/data/units.json`.
- No backend logic was added.

### 6.4 Test data loading in simple matching pages

- [x] Use Troops Planner page for unit data.
- [x] Use City Planner page for building data.
- [x] On Troops Planner, show number of units loaded.
- [x] On Troops Planner, show the first unit name.
- [x] On City Planner, show number of buildings loaded.
- [x] On City Planner, show the first building name.
- [x] Do not build full tables yet.
- [x] Do not add planner logic yet.

### 6.5 Keep translations prepared but unused

- [x] Do not load `en.json` or `de.json` yet.
- [x] Do not add a language switcher yet.
- [x] Do not add a translation library yet.
- [x] Keep translation loading for a later phase.

### 6.6 Phase 6 cleanup checklist

- [x] Run `npm run build`.
- [x] Run `npm run start`.
- [x] Confirm City Planner can display loaded building data.
- [x] Confirm Troops Planner can display loaded unit data.
- [x] Confirm no real planner logic was added yet.
---

## Phase 7 — First useful mini-feature

Goal: build one very small useful thing before starting the full planners.

Current mini-feature: a simple Troops unit amount preview.

### 7.1 Show units on the Troops Planner page

- [x] Load units using the data service from Phase 6.
- [x] Show a simple list of units.
- [x] Keep the display minimal.
- [x] Do not add filters yet.
- [x] Do not add grouping yet.

### 7.2 Add one input per unit

- [x] Add a number input for each unit.
- [x] Default all amounts to `0`.
- [x] Keep the values local to the component.

### 7.3 Calculate totals later

Do not implement this yet.

The planner logic will likely be reworked later with real planning rules, versions, filters, and special cases.

- [ ] Calculate total population later.
- [ ] Calculate total wood later.
- [ ] Calculate total stone later.
- [ ] Calculate total silver later.
- [ ] Optional later: calculate total favor.

### 7.4 Keep it local only

- [x] Do not save anything yet.
- [x] Do not import/export yet.
- [x] Do not add complicated validation yet.

---

## Phase 8 — Local save later

Only start this after the mini-feature works.

- [ ] Create a small storage service.
- [ ] Save one troops plan to LocalStorage.
- [ ] Load it again after page refresh.
- [ ] Add a clear/reset button.

---

## Phase 9 — Import/export later

Only start this after local save works.

- [ ] Define the TXT format for one troops plan.
- [ ] Export the current plan as TXT text.
- [ ] Import the same TXT text again.
- [ ] Validate missing or unknown unit IDs.

## Parking lot — Do not start yet

These ideas are valid, but should wait:

- [ ] Full City Planner.
- [ ] Academy Planner details.
- [ ] Full timer system.
- [ ] Active timer dropdown.
- [ ] Advanced translations.
- [ ] Battle Simulator logic.
- [ ] User accounts.
- [ ] Backend/database.
- [ ] Grepolis client integration.
- [ ] Complex styling/theme work.
- [ ] Mobile polish.

---

## Suggested next single task

Start with **Phase 1.1: Create the Home page**.

Do only that, then run the app and check that nothing broke.