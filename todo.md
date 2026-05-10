# Grepo Hub TODO

This TODO reflects the current local-first Angular implementation after the final stabilization review.

---

## Current repo state

- [x] Angular project setup.
- [x] Routed app shell with responsive navigation.
- [x] Home dashboard.
- [x] City Planner route with building data, presets, shared plan configuration support, local persistence, and JSON import/export.
- [x] Troops Planner route with unit data, editable amounts, OFF/DEF totals, presets, shared plan configuration support, local persistence, and JSON import/export.
- [x] References route with filters, external resource cards, script cards, and translated labels.
- [x] Toolbox route with quick calculator, time calculator, reminder creation, active timer queue, and feature-gated battle simulator placeholder.
- [x] Static data files under `public/assets/data/`.
- [x] Translation files under `public/assets/i18n/`.
- [x] Local-first data flow with no backend/login/sync requirement.
- [x] Production build works without remote font dependencies.
- [x] `typecheck`, `test:once`, `build`, `format:check`, and `deadcode` pass.

---

## Current important caveats

- [ ] Add deeper unit tests for `PlanConfigService` import/export validation.
- [ ] Add tests for translation fallback and language switching.
- [ ] Review unit/building schemas before adding more calculations that depend on them.
- [ ] Decide whether Toolbox timer state should be extracted into a shared timer service for global top-bar access.
- [ ] Add stronger user-facing validation messages for invalid imports.
- [ ] Decide exact generated export formats: TXT, CSV, BBCode, PNG, or a smaller subset.
- [ ] Keep battle simulator gated until world settings, modifiers, and combat rules are specified.

---

## Phase 1 — Stabilize foundation

- [x] Keep route set small and aligned with implementation.
- [x] Remove stale references to inactive guide/time-tools/battle-simulator routes from top-level docs.
- [x] Ensure all visible References and Toolbox text has translation keys.
- [x] Add Prettier as a real dev dependency so formatting scripts work after a clean install.
- [x] Remove unused dependency/export noise found by `knip`.
- [x] Remove remote Google Fonts dependency from the production build.
- [x] Fix image asset casing for case-sensitive static hosting.
- [x] Simplify CSS that triggered parser warnings during tests.

## Phase 2 — Planner robustness

- [ ] Add tests for creating, duplicating, saving, importing, and exporting shared plans.
- [ ] Add stricter normalization for imported plan names, IDs, and timestamps.
- [ ] Validate unknown unit/building IDs during import.
- [ ] Add translated error messages for import failures.
- [ ] Add delete/rename flows for local plans if needed.
- [ ] Review whether planner presets should stay in TypeScript or move to JSON assets.

## Phase 3 — City Planner improvements

- [ ] Review `buildings.json` schema and make sure it supports the next planned calculations.
- [ ] Add stronger building-level validation.
- [ ] Add better building category summaries.
- [ ] Add academy/research planning as a section inside City Planner.
- [ ] Add generated note/BBCode export only after the planner model is stable.

## Phase 4 — Troops Planner improvements

- [ ] Review `units.json` schema and complete values needed for accurate calculations.
- [ ] Add modifier support where useful.
- [ ] Add stronger composition summaries.
- [ ] Add CSV export if it is still useful after JSON sharing is stable.
- [ ] Add generated note/BBCode export only after the planner model is stable.

## Phase 5 — References and guide content

- [ ] Add more structured reference categories only when there is enough content.
- [ ] Decide whether longer guide material belongs inside References or a new route later.
- [ ] Add research/academy reference data after the schema is decided.
- [ ] Keep external links and script metadata translated.

## Phase 6 — Toolbox and timers

- [ ] Decide whether active timers must continue across route changes.
- [ ] Extract timer state into a shared service if global timer access is required.
- [ ] Add pause/resume support if needed.
- [ ] Add optional sounds or browser notifications later.
- [ ] Keep battle simulator disabled until mechanics are specified.

## Phase 7 — Deployment polish

- [ ] Decide the preferred static hosting target.
- [ ] Add deployment notes for Cloudflare Pages or GitHub Pages.
- [ ] Verify asset paths on a case-sensitive deployment environment.
- [ ] Add a small manual release checklist.
