# Planner V2 Tailwind Styling Setup

Planner V2 now uses Tailwind as the default styling layer for new UI work.

## Styling model

Use Tailwind utilities directly for local layout, spacing, grid/flex behavior, typography, responsive behavior, and simple interaction states.

Keep the GrepoPlan visual identity in `src/styles.css`:

- theme tokens in `:root`
- minimal base reset in `@layer base`
- a small set of stable reusable primitives in `@layer components`

The goal is not to move the old SCSS problem into long custom CSS files. The goal is to keep global CSS small and use Angular components plus Tailwind utilities for most UI work.

## Current global primitives

Use these before creating new one-off card/button styles:

```text
.gh-app-bg
.gh-panel
.gh-panel-primary
.gh-surface
.gh-button
.gh-button-primary
.gh-gold-fill
.gh-control
.gh-icon-box
.gh-tab-active
.gh-divider-right
.gh-scroll-area
```

## Rules for new Planner V2 styling

1. Use Tailwind utilities for one-off layout.
2. Use CSS variables from `src/styles.css` for colors and theme values.
3. Create or reuse an Angular component when a visual pattern repeats.
4. Add a global `.gh-*` primitive only when it is stable and reused across multiple components.
5. Avoid adding component SCSS unless the component needs CSS that is awkward or unsafe in the template.
6. Do not reintroduce large page-level SCSS files.

## Preferred examples

Good for one-off layout:

```html
<section class="grid grid-cols-4 gap-3 max-[88rem]:grid-cols-3 max-[58rem]:grid-cols-1"></section>
```

Good for reusable visual styling:

```html
<article class="gh-panel rounded-md p-3"></article>
```

Good for theme colors:

```html
<span class="text-[var(--gh-gold)]"></span>
```

Avoid repeated raw colors:

```html
<span class="text-[#f6c343]"></span>
```

Avoid creating new SCSS files for simple layout-only rules.
