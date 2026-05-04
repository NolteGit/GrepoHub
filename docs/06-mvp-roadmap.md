# MVP Roadmap

This roadmap keeps the first version realistic and avoids spending too much time on advanced features too early.

## MVP 1 target

Grepo Hub MVP 1 should include:

- Angular project setup
- App shell with top bar
- Navigation burger
- Home / Dashboard
- City Planner basic version
- Academy planning as part of City Planner
- Troops Planner basic version
- Local configuration sidebars for planners
- TXT import/export inside planner pages
- Static JSON data for units and buildings
- Basic translation file structure
- Time Tools page
- Active timers accessible from top bar
- References page
- Guides page
- Empty Battle Simulator placeholder

## Recommended implementation order

### 1. Angular setup

Create the Angular project and initial repository structure.

### 2. App shell and routing

Implement:

- Top bar
- Navigation burger
- Routed page layout
- Page title display
- Current time display

### 3. Home / Dashboard

Implement:

- Central **Grepo Hub** title
- Two large feature cards for City Planning and Unit Planning
- Smaller cards for External Tools & Scripts, Guides, Time Tools, and Simulator
- About popup link

### 4. Static JSON data layer

Add minimal files:

```txt
src/assets/data/units.json
src/assets/data/buildings.json
```

Create services to load this data.

### 5. Translation structure

Add minimal translation files:

```txt
src/assets/i18n/en.json
src/assets/i18n/de.json
```

Use translation keys for navigation labels, page titles, buttons, and dashboard cards.

### 6. City Planner MVP

Implement:

- Building level form
- Left configuration sidebar
- Load configuration into form
- Add/import TXT configuration
- Export TXT button
- Optional academy panel/popup

### 7. Troops Planner MVP

Implement:

- Unit amount form
- Cost/population calculations using unit JSON data
- Left configuration sidebar
- Load configuration into form
- Add/import TXT configuration
- Export TXT button

### 8. Time Tools MVP

Implement:

- Time calculator
- Countdown
- Alarm
- Stopwatch
- Time configuration list
- Shared timer service
- Top bar active timer dropdown

### 9. References and Guides

Implement simple static pages first.

Later, make them data-driven.

### 10. Battle Simulator placeholder

Create the route and page, but leave the feature mostly empty.

## Delayed features

Delay these until the MVP is usable:

- Full battle simulation
- PNG export
- CSV export
- BB-code export
- Browser notifications
- Sound alarms
- IndexedDB
- Cloud sync
- Login/accounts
- Advanced world settings
- Advanced guide library
- Browser extension features
- Live game scraping

## Features to avoid for now

Avoid:

- Game automation
- Sending commands to Grepolis
- Scraping private game data
- Backend database
- External translation API
- Alliance multiplayer coordination
