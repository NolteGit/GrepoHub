# Responsive Layout Guidelines

GrepoPlan is currently optimized for desktop and decently sized screens. Full mobile optimization is planned as a dedicated Media-Day milestone. Until then, responsive changes should keep the existing planner stable and avoid adding one-off breakpoints without a clear reason.

## Current layout model

The planner shell uses three conceptual layout modes:

```txt
wide/desktop   toolbox | planner workspace | summary sidebar
compact        collapsed toolbox | compact population summary | planner workspace
mobile         compact population summary | planner workspace, no desktop recommendation banner
```

The current breakpoint intent is:

```txt
< 46rem       mobile shell / one-column fallback / compact population summary
46rem–76rem   compact shell / full summary hidden / compact population summary / toolbox reduced
76rem–104rem  desktop shell / normal planner layout
> 104rem      wide layout / four-card rows where enough workspace is available
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

### 2. Use intentional tile-grid states

For city/building/unit tile collections, avoid accidental 3-column and 5+-column states. The planner should prefer a predictable column ladder:

```txt
4 columns -> 2 columns -> 1 column
```

Use the shared `planner-card-grid` class for normal building and unit collections. It uses the available planner workspace width, not the physical device type, so browser zoom and toolbox width naturally influence when the grid steps down.

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
mobile access to full summary/details beyond the compact population summary
bottom sheet / drawer / tabs decision
touch target sizes
sticky actions
scroll behavior
portrait and landscape behavior
small-screen spacing and control density
```

## First implementation target

The current implementation target is desktop/zoom stability for normal building and unit cards. Keep these collections on the shared `planner-card-grid` helper unless a component-specific reason requires a separate grid.

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
