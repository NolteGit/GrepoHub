# Tester Handoff Package

This document collects the minimum information needed before GrepoPlan is handed
to external or semi-external testers. It does not replace the detailed checklists
in this repository; it is the short handoff summary that points testers and the
maintainer to the right places.

## Current tester target

The current tester target is the desktop and tablet experience.

GrepoPlan is usable on smaller screens, but full mobile optimization is still a
separate Media-Day milestone. Tester feedback for mobile is welcome, but it
should be classified as mobile-readiness feedback rather than a release blocker
unless a critical flow is impossible to use.

## Required maintainer checks before sharing

Run these checks before sending the production link to testers:

```powershell
git status --short
npm run release:check
```

After the production deployment finishes, check the live app manually:

- `/` loads the planner.
- `/planner` loads the planner.
- `/planner-v2` redirects or remains safely supported as a legacy route.
- The app renders with full styling after a hard refresh.
- Browser console does not show CSP errors that affect app behavior.
- Import, export, local save, city setup, troop setup, and transport summary work.

## Deployment facts testers should know

GrepoPlan is deployed as a static Cloudflare Pages app.

- Build command: `npm run build`
- Build output directory: `dist/grepo-hub/browser`
- No login, backend, account, sync, or server-side storage is expected.
- Plans are local-first and stored in the browser.
- Manual JSON export/import is the current sharing and backup mechanism.

## Known limitations

Document these before tester feedback starts:

- Mobile layout is not final.
- Data is local to the browser unless exported manually.
- Clearing browser storage can remove locally saved custom plans.
- There is no cross-device sync yet.
- The app currently targets the planner use case first; broader hub-style pages
  remain future work.

## Tester instructions

Ask testers to focus on realistic planner usage instead of trying every value in
isolation.

Recommended tester flow:

1. Open the production app.
2. Create or duplicate a plan.
3. Change several city buildings and effects.
4. Change land, sea, and mythical unit amounts.
5. Change the selected god and verify the related units/effects feel consistent.
6. Review the transport capacity summary.
7. Export the plan.
8. Import the exported plan again.
9. Refresh the browser and verify local persistence.
10. Report confusing UI, broken flows, or unexpected values.

## Useful tester documents

Use these documents during handoff:

- `docs/13-tester-feedback-smoke-checklist.md`
- `docs/14-tester-feedback-template.md`
- `docs/15-accessibility-keyboard-checklist.md`
- `docs/16-release-signoff-checklist.md`
- `docs/18-ui-empty-states-checklist.md`

## Feedback severity guide

Use this rough severity scale when collecting feedback.

### Blocker

The tester cannot use a core flow at all.

Examples:

- app does not load
- import/export always fails
- plan state cannot be edited
- saved plans disappear unexpectedly during normal use

### High

A core flow works, but produces incorrect or misleading results.

Examples:

- wrong transport-capacity calculation
- god/effect synchronization appears wrong
- imported plan values are visibly corrupted
