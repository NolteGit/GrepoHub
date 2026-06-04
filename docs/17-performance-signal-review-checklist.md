# GrepoPlan Performance and Signal Review Checklist

Use this checklist for the dedicated performance/dataflow pass. The goal is to find real bottlenecks and fragile signal flows without prematurely optimizing code that is already fast enough.

## 1. First render and loading

- Open the production build locally from `dist/grepo-hub/browser`.
- Check that the initial app shell appears quickly.
- Check that planner data, images, and lazy planner chunk load without visible layout jumps.
- Confirm the browser console has no runtime errors.
- Confirm Cloudflare production behaves the same as the local production build.

## 2. Angular signal/dataflow review

- Review large `computed(...)` values in the planner page and planner services.
- Check whether expensive derived values are recalculated more often than needed.
- Prefer shared computed state over repeated template calls for the same derived result.
- Keep source-of-truth state in services/domain helpers, not duplicated in multiple components.
- Avoid creating new global state layers unless there is a concrete problem.

## 3. Template and rendering checks

- Search for method calls inside large repeated template sections.
- Pay special attention to city/building tiles and troop/unit tiles.
- Keep `track` expressions stable for repeated lists.
- Check that image paths and labels are not recomputed unnecessarily per render.
- Avoid changing templates purely for micro-optimizations without visible benefit.

## 4. Planner interaction responsiveness

- Change building levels quickly and check if summary values stay responsive.
- Change unit amounts quickly and check if transport capacity updates smoothly.
- Switch gods and verify mythical units/city effects update without lag.
- Switch modes and categories repeatedly.
- Resize the browser around compact/tablet widths and check for layout stutter.

## 5. Persistence and localStorage writes

- Confirm local plan edits are persisted reliably.
- Check whether rapid edits trigger excessive localStorage writes.
- Keep localStorage write behavior simple unless profiling shows a problem.
- Confirm localStorage failure warnings still work.
- Confirm reloading restores normalized state.

## 6. Import/export performance

- Import a normal exported plan and confirm it completes quickly.
- Import malformed or partial data and confirm it fails or normalizes without freezing.
- Export JSON, readable text, and CSV without console errors.
- Confirm large-ish plans do not create noticeable UI stalls.
- Keep import/export validation deterministic and test-covered.

## 7. Asset and layout performance

- Check that icon/image loading does not create large layout shifts.
- Confirm frequently shown icons use existing mapped asset helpers where possible.
- Avoid adding uncompressed or unnecessarily large images.
- Keep decorative icons `alt=""` and `aria-hidden="true"`.
- Confirm production CSS is applied without CSP warnings.

## 8. What not to optimize yet

- Do not introduce NgRx or another global state framework.
- Do not rewrite the planner shell before Media-Day.
- Do not split components only because a file feels large; split around clear concepts.
- Do not memoize everything blindly.
- Do not add IndexedDB until localStorage becomes a real limitation.

## 9. Useful commands

```powershell
npm run release:check
npm run build
npx http-server dist/grepo-hub/browser -p 4300 -c-1
```

After a production build, confirm Angular did not reintroduce CSP-incompatible stylesheet loading:

```powershell
Select-String -Path .\dist\grepo-hub\browser\index.html -Pattern "this.media='all'"
```

Expected result: no output.
