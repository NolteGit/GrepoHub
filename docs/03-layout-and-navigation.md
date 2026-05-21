# Layout and Navigation

## Overall direction

Grepo Hub is moving toward a single Planner V2 workspace instead of several separate planning/tool pages.

The layout should feel like an active Grepolis planning desk: compact, dark, readable, and stable while the user switches between City Setup and Troop Setup.

## Main shell

Planner V2 uses three main areas:

```txt
left toolbox | center planner workspace | right summary sidebar
```

The header spans the center and right columns so plan controls stay aligned with the whole planner area. The right summary sidebar begins below that header.

## Left toolbox

The left column is a functional toolbox, not a normal navigation sidebar.

It should contain:

- Clock/logo area.
- Compact action button grid.
- Reminder / timer queue.
- Calculator / time calculator area.
- Quick links at the bottom.

The toolbox should stay visually stable when switching between City Setup and Troop Setup.

## Center planner workspace

The center area contains:

- Planner mode switch.
- City Setup or Troop Setup setup strip.
- Main tile grid.
- Bottom summary.

The mode switch is a clear City Setup / Troop Setup switch. It is not a balance/focus slider; a city can have both building and troop planning data.

## Right summary sidebar

The right column contains:

- Shared population/BHP summary.
- Context-specific summary content.

The shared summary should stay visually consistent between City Setup and Troop Setup.

## City Setup layout

City Setup should contain only building planning UI.

Recommended structure:

```txt
setup context strip
building tile grid
special building selectors
bottom city summary
```

The city setup context strip contains city modifiers such as Aphrodite, Land Expansion, and Plow. Keeping this strip parallel to the troop setup strip makes mode switching feel calmer.

## Troop Setup layout

Troop Setup should contain only unit planning UI.

Recommended structure:

```txt
setup context strip
unit tile grid
bottom troop summary
```

The troop setup context strip contains:

- Barracks level.
- Harbour level.
- Land / Sea / Mythical tabs.
- Temple level.
- God dropdown.

There is intentionally no Favorites tab in the current V2 direction.

## Styling approach

Planner V2 uses Tailwind utilities, CSS design tokens, and reusable Angular UI primitives.

Rules:

- Use Tailwind for layout, spacing, grid/flex, typography, and state styling.
- Use CSS variables in `src/styles.css` for Grepo Hub theme tokens.
- Extract repeated panel/button/tile patterns into `src/app/shared/ui` components.
- Keep component-specific SCSS rare.
- Avoid large page-level style files and deep selectors.
