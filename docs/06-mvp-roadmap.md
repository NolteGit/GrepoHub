# MVP Roadmap

This roadmap tracks the current planner release path. GrepoPlan is currently a local-first, single-page Angular app centered on the planner workflow.

## Completed foundation

The current app already includes the main MVP foundation:

- Planner route and single-page shell.
- City setup with building levels, effects, population calculations, and special-building behavior.
- Troop setup with land, sea, mythical units, god-dependent behavior, and amount controls.
- Summary/sidebar values for population, battle stats, transport capacity, and most-used units.
- Toolbox with calculator, time calculator, reminders, links, and small utility actions.
- Local plan persistence, JSON import/export, and readable TXT/CSV/BBCode exports.
- Static data and translation audits.
- Static-hosting readiness checks for metadata, favicon, SPA fallback assumptions, and security headers.
- Release hardening for CSP, safe local storage access, safer CSV exports, duplicate import IDs, and small-screen layout messaging.

## Current release-prep focus

Before the first public/hosted release, prioritize confidence and maintainability over new features.

Target checks:

```text
npm run release:check
```

Manual browser checks should follow `docs/10-manual-regression-checklist.md`. CI now runs the same release gate for pull requests and pushes to the main branches.

## Next milestone: release candidate

The next milestone is a small release-candidate pass with no broad feature work.

Target work:

- Review the production build locally.
- Keep the GitHub Actions release check green.
- Run the full manual regression checklist on desktop and a narrow viewport.
- Confirm Cloudflare Pages preview behavior for `/`, `/planner`, and `/planner-v2` refreshes.
- Confirm the CSP does not block production assets or runtime behavior.
- Patch Angular/Nx dev dependencies in a separate dependency-only change.
- Update screenshots or public-facing docs after the final UI state is confirmed.

## Next milestone: component boundaries

After release, reduce the size of the largest planner files by extracting behavior in small, testable slices.

Preferred extraction order:

```txt
src/app/pages/planner/
  planner.ts
  components/
  utils/
    planner-dialog-focus.ts
    planner-selection-rules.ts
    planner-summary-view-model.ts
```

Keep extraction behavior-preserving. Move pure calculations and UI mapping first; split templates only when the boundaries are obvious.

## Next milestone: reusable UI primitives

The app already uses repeated panel, tile, button, and stepper patterns. After release, convert only stable patterns into shared primitives.

Candidate components:

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

Avoid creating abstractions for unstable UI while the planner layout is still changing.

## Later polish

Later work can include:

- More complete responsive/mobile planner interactions.
- Reference/guide overlay or route.
- Academy/research planning expansion.
- Browser notifications for timers.
- Optional battle simulator research.
- Optional import/export previews before applying imported bundles.
- Optional IndexedDB storage if plans become too large for LocalStorage.
