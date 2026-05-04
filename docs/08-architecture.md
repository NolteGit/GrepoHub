# Architecture

## General architecture

Grepo Hub should be a client-side Angular app with a modular structure.

The MVP should not require a backend. Static game data should be loaded from local JSON files and user-created configurations should be stored in the browser.

## Suggested source structure

```txt
src/
  app/
    core/
      models/
      services/
    layout/
      app-shell/
      top-bar/
      navigation-drawer/
    pages/
      home/
      city-planner/
      troops-planner/
      references/
      guides/
      time-tools/
      battle-simulator/
    shared/
      components/
      utils/
  assets/
    data/
    i18n/
```

## Core models

Possible models:

```txt
CityPlan
TroopPlan
AcademyPlan
Unit
Building
Research
TimerConfig
ActiveTimer
ImportResult
ExportResult
TranslationKey
```

## Static data services

Static game data should be loaded by services.

Possible services:

```txt
UnitDataService
BuildingDataService
ResearchDataService
```

Initial MVP services:

```txt
UnitDataService
BuildingDataService
```

## Planner services

Planner-related logic should not be buried inside UI components.

Possible services:

```txt
PlanStorageService
TxtImportExportService
CityPlanService
TroopPlanService
```

Responsibilities:

- Save/load configurations locally
- Parse TXT imports
- Generate TXT exports
- Validate planner data
- Convert planner state into export formats

## Timer architecture

Timers should be managed by a shared service so they can keep running while the user changes pages.

Possible service:

```txt
TimerService
```

Responsibilities:

- Store timer configurations
- Start countdowns
- Start alarms
- Start stopwatches
- Pause/resume/stop timers
- Expose active timers to top bar
- Expose timer state to Time Tools page

## Translation architecture

Translation should use small local files.

Possible service:

```txt
TranslationService
```

Responsibilities:

- Load selected language file
- Provide translated UI labels
- Fall back to English if a key is missing
- Keep game data separate from UI text

## Top bar architecture

The top bar should consume shared app state.

It may use:

```txt
TimerService
CurrentTimeService
NavigationService
TranslationService
```

The top bar should not own timer logic itself. It should only display and trigger timer actions through services.

## Import/export architecture

Import/export should be integrated into feature pages, not implemented as a separate page.

TXT import/export should be implemented as shared logic that can be reused by:

- City Planner
- Troops Planner

Academy data can be part of City Planner TXT imports/exports.

## Local storage architecture

For the MVP, LocalStorage is enough.

Possible storage keys:

```txt
grepoHub.cityPlans
grepoHub.troopPlans
grepoHub.timerConfigs
grepoHub.settings
```

Later, IndexedDB may be used if data becomes larger or more complex.

## Page responsibilities

### Home

- Show feature cards
- Link to main pages
- Show About popup

### City Planner

- Edit city plan
- Include academy extension/popup
- Load/save configurations
- Import/export TXT

### Troops Planner

- Edit unit plan
- Calculate unit totals
- Load/save configurations
- Import/export TXT

### References

- Show structured factual information and external links

### Guides

- Show longer guide material and guide links

### Time Tools

- Time calculator
- Configure alarms/countdowns/stopwatches
- Show active/running timers

### Battle Simulator

- Placeholder for now

## Testing targets

Logic that should be testable:

- TXT parsing
- TXT exporting
- Local storage read/write helpers
- Unit cost calculations
- Building level validation
- Time calculator logic
- Timer state transitions
- Translation fallback behavior
