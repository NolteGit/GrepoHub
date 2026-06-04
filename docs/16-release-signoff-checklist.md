# GrepoPlan Release Sign-off Checklist

Use this checklist shortly before sharing a production build with testers or before marking a release as stable.

## 1. Repository state

- `main` is the intended release branch.
- `git status` is clean.
- Recent commits have clear messages.
- No temporary debug commits, local-only notes, or abandoned patch files are present.
- GitHub Actions is green for the current `main` commit.

## 2. Local release gate

Run the full release check locally:

```powershell
npm run release:check
```

The release gate should pass without skipped manual fixes.

If the build was changed recently, also verify that the generated production HTML does not contain the CSP-incompatible stylesheet loader:

```powershell
Select-String -Path .\dist\grepo-hub\browser\index.html -Pattern "this.media='all'"
```

Expected result: no output.

## 3. Cloudflare Pages deployment

- The project is deployed as a Cloudflare Pages site, not as a Worker app.
- Build command is `npm run build`.
- Build output directory is `dist/grepo-hub/browser`.
- Latest production deployment uses the expected commit.
- Production URL loads without a stale/cached broken layout.
- Direct reload works for `/` and `/planner`.
- `/planner-v2` redirects or falls back as intended.

## 4. Browser smoke test

Test at least one Chromium-based browser and one non-Chromium browser if possible.

- App loads without a blank screen.
- Main planner shell renders correctly.
- No serious console errors appear.
- Favicon and browser title are correct.
- Language switching works.
- Local persistence survives a refresh.
- Import/export actions still work.

## 5. Planner smoke test

- Create or duplicate a custom plan.
- Rename the plan.
- Change city buildings and special buildings.
- Change god selection.
- Verify Aphrodite/Pygmalion behavior is consistent.
- Change troop amounts.
- Verify unit amount clamping still works.
- Verify transport capacity display reacts to unit changes.
- Verify bunks toggle changes transport capacity.

## 6. Import/export smoke test

- Export a custom plan as JSON.
- Import the exported plan again.
- Confirm duplicate imported names are handled safely.
- Confirm imported plans appear in the plan list.
- Confirm malformed or wrong file input gives a readable error.
- Confirm local data remains usable after import.

## 7. Accessibility smoke test

- Navigate the main app with keyboard only.
- Open and close dialogs with keyboard.
- Escape closes dismissible dialogs.
- Focus returns to the triggering control after dialog close.
- Icon-only actions have accessible names.
- Focus rings are visible.
- The layout remains usable at 125% and 150% browser zoom.

## 8. Responsive smoke test

- Desktop layout shows toolbox, planner content, and summary sidebar.
