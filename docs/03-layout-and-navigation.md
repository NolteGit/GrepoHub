# Layout and Navigation

## Overall layout

Grepo Hub should use a persistent app shell with a top bar and routed page content.

The layout should feel useful during active gameplay: quick navigation, visible current time, and fast access to running timers should always be available.

## Top bar

The top bar should contain:

- Navigation burger on the top-left
- Current page title
- Current time
- Quick add button for timers/alarms
- Active timer indicator or dropdown
- Link to the Time Tools page

## Navigation burger

The navigation burger should open a side menu or drawer with links to:

- Home
- City Planner
- Troops Planner
- References
- Guides
- Time Tools
- Battle Simulator

The menu can also later include Settings or About, but these do not need to be primary MVP pages.

## Current page title

The top bar should show the current page title, for example:

- Home
- City Planner
- Troops Planner
- References
- Guides
- Time Tools
- Battle Simulator

## Current time

The top bar should show the current local time.

This is especially useful because Grepolis planning often depends on timing and coordination.

## Quick timer add button

The top bar should include a quick add button for timing tools.

Possible behavior:

- Open a small modal
- Add a quick countdown
- Add a quick alarm
- Link to the full Time Tools page for advanced setup

## Active timer dropdown

The top bar should provide access to running or active timers from anywhere in the app.

Possible behavior:

- Show number of active timers
- Open dropdown with active alarms, countdowns, and stopwatches
- Allow pause, resume, stop, or jump to Time Tools page

## Home / Dashboard layout

The home page should use a dashboard-like layout.

### Main title

A central top title:

```txt
Grepo Hub
```

### Main feature cards

Two large prominent cards:

- City Planning
- Unit Planning

These are the main workflows and should visually stand out.

### Secondary feature cards

Smaller, less pronounced cards:

- External Tools & Scripts
- Guides
- Time Tools
- Simulator

### About link

An About link or button should be placed near the bottom-left or bottom-right of the page.

It should open a popup with author notes, version, project status, and disclaimer information.

## Planner page layout

City Planner and Troops Planner should have a similar structure.

Recommended layout:

- Left sidebar: saved/imported configurations
- Main content: planner form/input fields
- Page actions: export button, save/update button, clear/reset button

The left sidebar should contain:

- Existing configurations
- Default examples, if useful
- Add/import button
- Search/filter later if the list becomes long

## No dedicated import/export page

Import and export should not be a central UI feature or separate page.

Instead:

- Import belongs in planner sidebars
- Export belongs inside planner pages
- Time configurations do not need import/export for the MVP
- TXT should remain the main readable planner exchange format
