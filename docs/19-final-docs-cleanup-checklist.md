# Final Documentation Cleanup Checklist

Use this checklist shortly before handing GrepoPlan to testers. The goal is to
remove confusing historical wording and make the project documentation match the
current deployed app.

## Scope

This pass should cover documentation and release-facing metadata only. Avoid
mixing it with UI, dependency, or logic changes.

Review:

- README
- docs directory
- package metadata when relevant
- Cloudflare deployment notes
- tester handoff documents
- known limitation notes

## 1. Public name consistency

The public app name should be consistently shown as GrepoPlan.

- Browser title uses GrepoPlan.
- README introduction uses GrepoPlan.
- Tester documents use GrepoPlan.
- Release check/signoff documents use GrepoPlan.
- Any remaining GrepoHub references are intentional repository/history notes.

## 2. Legacy planner naming

The source page has been renamed from planner-v2 to planner. Legacy references
should only remain where they are intentional.

Acceptable references:

- legacy route notes for `/planner-v2`
- archived migration/refactor notes
- historical checklist items that explicitly describe the rename

Clean up or clarify:

- user-facing docs that still describe the current page as planner-v2
- generic architecture docs that reference pages/planner-v2 as current source
- tester docs that mention planner-v2 without explaining it as legacy

## 3. Cloudflare deployment notes

Deployment notes should capture the actual working setup.

- Build command: `npm run build`
- Build output directory: `dist/grepo-hub/browser`
- Production branch: `main`
- Pages project identity: GrepoPlan / grepoplan
- The Angular stylesheet/CSP issue is documented.
- `inlineCritical: false` is documented as intentional.

## 4. Release and verification commands

Keep the command list short and accurate.

- `npm run verify:fix` for local formatting plus verification.
- `npm run release:check` for the final pre-release gate.
- `npm run data:audit` for static game data assumptions.
- `npm run pages:audit` for Pages/deployment assumptions.
- Avoid documenting obsolete one-off debugging commands as normal workflow.

## 5. Tester handoff docs

Tester-facing docs should be practical and not overly technical.

- Smoke checklist is easy to follow.
- Feedback template asks for browser/device/deployment URL.
- Known mobile limitation is stated clearly.
- Import/export/localStorage flows are included.
- Accessibility/keyboard checks are included at a basic level.

## 6. Known limitations

Known limitations should be visible but not alarming.

- Mobile is not fully optimized yet.
- App is local-first with no backend/account/sync.
- Manual JSON import/export is the sharing mechanism for now.
- Cloudflare Pages is the current deployment target.
