# Development Notes

## Current phase

The project is in the requirements specification and planning phase.

The goal is to clarify the page structure, MVP scope, data structure, and Angular architecture before building the first implementation.

## Confirmed app name

```txt
Grepo-Hub
```

## Confirmed project directory

```txt
grepo-hub
```

## Confirmed pages

```txt
home
city-planner
troops-planner
references
guides
time-tools
battle-simulator
```

## Important design decisions

### No dedicated import/export page

Import and export should be present where needed, especially inside City Planner and Troops Planner.

TXT import/export is important, but it should not dominate the app UI.

### Academy Planner belongs inside City Planner

Academy planning should be part of City Planner, not a major standalone page for the MVP.

### Time Tools are unified

All timing features should live on one Time Tools page.

This includes:

- Time calculator
- Alarms
- Countdowns
- Stopwatches
- Runtime configurations
- Active timers

### Battle Simulator is delayed

The Battle Simulator route should exist, but the actual feature can stay empty until later.

## UI direction

The app should feel like a practical companion dashboard.

Important UI pieces:

- Top bar
- Navigation burger
- Current page title
- Current time
- Quick timer add button
- Active timer dropdown
- Planner configuration sidebar
- Feature cards on dashboard
- About popup

## Storage direction

The MVP should use:

- Static JSON files for game data
- LocalStorage for user-created configurations
- TXT import/export for city and troop plans

## Translation direction

Translation should be simple and local.

Use small JSON or TXT files for two or three languages.

Recommended first files:

```txt
src/assets/i18n/en.json
src/assets/i18n/de.json
```

## Game data direction

Use tiny JSON files for core data.

Recommended first files:

```txt
src/assets/data/units.json
src/assets/data/buildings.json
```


## Suggested first coding tasks

1. Create Angular project.
2. Add routing.
3. Add app shell with top bar.
4. Add dashboard cards.
5. Add placeholder pages.
6. Add static JSON data files.
7. Add basic translation files.
8. Add City Planner skeleton.
9. Add Troops Planner skeleton.
10. Add Time Tools skeleton.

## Open questions

These can be decided later:

- CSS or SCSS?
- Exact visual style/theme?
- Whether to add a Settings page early or keep settings inside services/local storage for now?
- Exact TXT format syntax?
- Exact unit/building JSON schema?
- Whether guide content is stored locally or mostly linked externally?
- Whether browser notifications should be included after the first timer MVP?
