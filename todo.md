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

The app shell should provide the global structure of the app:

- global header navigation
- routed page content

It should not include a permanent global sidebar. Page-specific side panels, configuration areas, guide/reference links, filters, and simulator settings will be handled later inside the individual pages.

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
- [x] Tools
- [x] Guides
- [x] Time Tools
- [x] Battle Simulator
- [x] Settings

Keep `Home` separate because it should be represented by the app logo/name on the left side of the header.

Each navigation item should eventually contain:

- [x] label
- [x] route/path
- [x] optional icon later

### 3.3 Build the desktop header navigation

Create a simple desktop header layout inside `AppShellComponent`.

Include:

- [ ] Home logo / app name on the left
- [ ] Main navigation links across the top
- [ ] Time quick-action button on the right

The time quick-action button is only a placeholder for now.

### 3.4 Add active navigation styling

- [ ] Highlight the currently active page in the desktop navigation.

Use Angular route styling with `routerLinkActive`.

Later, also apply the same active state to the mobile menu once the mobile menu exists.

### 3.5 Add mobile header behavior later

Do not overbuild this immediately unless the desktop shell is stable.

For mobile:

- [ ] Hide desktop navigation links on small screens.
- [ ] Show a burger menu button.
- [ ] Keep the Home logo / app name visible.
- [ ] Keep the time quick-action button visible.
- [ ] Show navigation links in a dropdown/drawer when the burger button is opened.

This mobile behavior can still live inside `AppShellComponent` at first.

### 3.6 Keep routed page content stable inside the shell

The routed page content now belongs inside `AppShellComponent`.

- [ ] Keep `<router-outlet></router-outlet>` inside the shell.
- [ ] Keep the shell responsible only for global layout.
- [ ] Do not add page-specific logic to the shell.
- [ ] Confirm all routes still work after each shell change.

### 3.7 Prepare page-specific side-panel pattern later

Do not implement this fully in Phase 3 unless needed.

Later, pages can use their own page-specific side panels, for example:

- [ ] City Planner configuration panel
- [ ] Troops Planner configuration panel
- [ ] Tools links/references panel
- [ ] Guides categories/references panel
- [ ] Time Tools configuration panel
- [ ] Battle Simulator configuration panel

These panels belong inside individual pages, not in the global app shell.

### 3.8 Add current page title later

Do not do this immediately unless the shell is stable.

- [ ] Decide how page titles should be stored.
- [ ] Add route `data.title` values.
- [ ] Show the current route title in the header, if still useful.
---

## Phase 4 — Dashboard cards

Goal: make the Home page feel like a real dashboard.

### 4.1 Add simple cards

On the Home page, add cards for:

- [ ] City Planning
- [ ] Unit Planning
- [ ] References
- [ ] Guides
- [ ] Time Tools
- [ ] Battle Simulator

### 4.2 Link cards to routes

- [ ] Make each card link to its page.
- [ ] Keep card content short.
- [ ] Do not add feature logic yet.

### 4.3 Add About placeholder

- [ ] Add a small About button or link.
- [ ] For now, it may show simple text on the page.
- [ ] A modal can come later.

---

## Phase 5 — First tiny data files

Goal: add the first local game data without building full planners yet.

### 5.1 Create asset folders

- [ ] Create `src/assets/data/`.
- [ ] Create `src/assets/i18n/`.

### 5.2 Add tiny unit data

- [ ] Create `src/assets/data/units.json`.
- [ ] Add only 2 or 3 units first.
- [ ] Use simple fields like `id`, `name`, `population`, `wood`, `stone`, `silver`.

### 5.3 Add tiny building data

- [ ] Create `src/assets/data/buildings.json`.
- [ ] Add only 2 or 3 buildings first.
- [ ] Use simple fields like `id`, `name`, `maxLevel`.

### 5.4 Add tiny translation files

- [ ] Create `src/assets/i18n/en.json`.
- [ ] Create `src/assets/i18n/de.json`.
- [ ] Add only page titles and navigation labels first.

---

## Phase 6 — First service only

Goal: learn how Angular services load static JSON data.

### 6.1 Create UnitDataService

- [ ] Create a service for unit data.
- [ ] Load `units.json`.
- [ ] Return the list of units.
- [ ] Keep error handling simple.

### 6.2 Display units on References page

- [ ] Use `UnitDataService` in the References page.
- [ ] Display unit names only.
- [ ] Then display population and costs.
- [ ] Do not build sorting/filtering yet.

### 6.3 Build check

- [ ] Run `npm run build`.
- [ ] Fix only errors that appear.

---

## Phase 7 — First useful mini-feature

Goal: build one very small useful thing before starting the full planners.

Recommended first mini-feature: a simple Troops cost preview.

### 7.1 Add one input per unit

- [ ] On the Troops Planner page, show units from `units.json`.
- [ ] Add a number input for each unit.
- [ ] Default all amounts to `0`.

### 7.2 Calculate totals

- [ ] Calculate total population.
- [ ] Calculate total wood.
- [ ] Calculate total stone.
- [ ] Calculate total silver.

### 7.3 Keep it local only

- [ ] Do not save anything yet.
- [ ] Do not import/export yet.
- [ ] Do not add complicated validation yet.

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

---

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