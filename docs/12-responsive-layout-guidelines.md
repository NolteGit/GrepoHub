# Responsive Layout Guidelines

GrepoPlan is currently optimized for desktop and decently sized screens. Full mobile optimization is planned as a dedicated Media-Day milestone. Until then, responsive changes should keep the existing planner stable and avoid adding one-off breakpoints without a clear reason.

## Current layout model

The planner shell uses three conceptual layout modes:

```txt
wide/desktop   toolbox | planner workspace | summary sidebar
compact        collapsed toolbox | planner workspace
mobile         planner workspace only, no desktop recommendation banner
```

The current breakpoint intent is:

```txt
< 46rem       mobile shell / one-column fallback
46rem–76rem   compact shell / summary hidden / toolbox reduced
76rem–104rem  desktop shell / normal planner layout
> 104rem      wide layout / more tile columns where useful
```

These values are not a design system by themselves. They are the app-level breakpoints that should be reused before adding new arbitrary `max-[...]` values.

## Rules for future responsive work

### 1. Use app-level breakpoints for shell changes

Use the shared app-level breakpoints for structural changes such as hiding the summary sidebar, reducing the toolbox, or switching to a single-column mobile shell.

Good examples:

```txt
max-[76rem]  hide summary / compact shell
max-[46rem]  mobile shell / one-column fallback
```

Avoid adding a new shell breakpoint unless the whole app layout truly needs it.

### 2. Prefer fluid grids for tile collections

For city/building/unit tile collections, prefer fluid grids before adding manual 4 → 3 → 2 → 1 breakpoint chains.

Preferred pattern:

```html
class="grid grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] gap-3"
```

Use manual grid breakpoints only when a specific layout cannot be expressed well with `auto-fit`/`minmax`.

### 3. Keep component breakpoints local and justified

Component-level breakpoints are allowed when a component itself visually breaks. Examples include a dense header, compact stat row, or tooltip/action cluster.

Before adding a new arbitrary breakpoint, check whether one of these already works:

```txt
34rem, 42rem, 46rem, 52rem, 58rem, 76rem, 104rem
```

Prefer fewer named concepts over many nearby values.

### 4. Keep styling in the current system

The current styling direction remains:

```txt
Tailwind utilities in templates
GrepoPlan theme tokens in src/styles.css
shared Angular UI primitives for repeated patterns
minimal component CSS
```

Do not introduce a second styling system for responsive work.

### 5. Keep mobile work as a dedicated milestone

Media-Day should focus on the mobile UX rather than mixing mobile work into unrelated refactors.

Target topics for Media-Day:

```txt
mobile access to toolbox actions
mobile access to summary values
bottom sheet / drawer / tabs decision
touch target sizes
sticky actions
scroll behavior
portrait and landscape behavior
small-screen spacing and control density
```

## First implementation target

After the planner source rename is settled, the first low-risk responsive cleanup should be the city and troop tile grids.

Target files after the rename:

```txt
src/app/pages/planner/components/planner-city-setup/planner-city-setup.html
src/app/pages/planner/components/planner-troop-setup/planner-troop-setup.html
```

Equivalent current paths before the rename:

```txt
src/app/pages/planner-v2/components/planner-city-setup/planner-city-setup.html
src/app/pages/planner-v2/components/planner-troop-setup/planner-troop-setup.html
```

Start by replacing repeated fixed breakpoint grid chains with a fluid grid where it preserves the current desktop feel.

## Definition of done for responsive patches

A responsive patch is ready when:

```txt
npm run release:check passes
normal desktop layout is unchanged or intentionally improved
compact width does not show horizontal page overflow
mobile width shows usable controls without horizontal page overflow
unit/building tiles wrap without clipping important controls
Cloudflare preview/root refresh still works
```
