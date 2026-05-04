# Feature List

This document describes the planned features for Grepo Hub and separates MVP-relevant ideas from delayed or future ideas.

## Planned pages

Grepo Hub should have the following main pages:

- Home / Dashboard
- City Planner
- Troops Planner
- References
- Guides
- Time Tools
- Battle Simulator

There should not be a dedicated import/export page. Import and export actions should be integrated into the planner pages where they are needed.

## Home / Dashboard

The home page should be the central entry point of the app.

### Layout idea

The page should contain:

- A central top title: **Grepo Hub**
- Two prominent core feature cards:
  - City Planning
  - Unit Planning
- Smaller secondary feature cards:
  - External Tools & Scripts
  - Guides
  - Time Tools
  - Simulator
- An About link or button near the bottom-left or bottom-right corner

### About popup

The About popup may contain:

- App name
- Version
- Author notes
- Short disclaimer
- Project status
- Link to repository, if available

## City Planner

The City Planner is one of the two core features.

It should include:

- Building level planning
- City role/template planning
- Local list of existing city configurations in a sidebar
- Loading existing configurations into planner fields
- Add/import button for new configurations
- Export button inside the planner page
- TXT-based configuration format
- Optional PNG export later
- Optional BB-code / note export later

## Academy planning

Academy planning should not be a major standalone page in the first version.

It should be part of the City Planner, either as:

- An extension section
- A collapsible panel
- A modal / popup
- A tab inside the City Planner

Academy data can be included in City Planner import/export as an optional section.

## Troops Planner

The Troops Planner is the second core feature.

It should include:

- Unit composition planning
- Land and naval units
- Population usage
- Resource costs
- Local list of existing unit configurations in a sidebar
- Loading existing configurations into planner fields
- Add/import button for new configurations
- Export button inside the planner page
- TXT-based configuration format
- Optional PNG export later
- Optional CSV export later
- Optional BB-code / note export later

## References

The References page should collect structured game-related reference information.

Possible content:

- Unit information
- Building information
- Academy research information
- Wiki links
- Useful external tools
- Scripts
- Returning-player notes
- Common abbreviations

This page should be simple at first and can later become data-driven using the static JSON game database.

## Guides

The Guides page should contain or link to useful guides.

Possible content:

- Strategy guides
- City setup guides
- Unit setup guides
- PDF, Word, or TXT guide references
- Notes for returning players
- Links to external resources

Guides should be separate from References so factual data and longer learning material are not mixed too much.

## Time Tools

Time Tools should be a single page containing all timing-related features.

It should include:

- Simple time calculator
- Alarm configuration
- Countdown configuration
- Stopwatch configuration
- Overview of existing time configurations
- Default time presets
- Active timers running simultaneously in the app

Running timers should be visible or accessible from the top navigation bar.

See [`05-time-tools.md`](./05-time-tools.md) for more details.

## Battle Simulator

The Battle Simulator can remain empty or placeholder-only for now.

It should be one of the last major features because accurate simulation may require many game mechanics, modifiers, and world settings.

For the MVP, the page can contain:

- Placeholder text
- Future feature notes
- Disabled or mock input area

## Translation support

Grepo Hub should support a small translation setup.

Initial idea:

- English as base language
- German support
- Possibly one additional language later
- Translation data stored in small TXT or JSON files
- No external translation API required

The translation system should cover:

- Navigation labels
- Page titles
- Button labels
- Feature card labels
- Simple help texts
- About popup text

## Static JSON game database

Grepo Hub should include a tiny JSON database for core game resources.

Initial data:

- Units
- Buildings

Possible later data:

- Academy research
- Resource costs
- Population costs
- Build times
- Requirements
- Basic combat values
- World setting defaults

This data should be stored as readable JSON files and loaded by Angular services.

## Delayed features

These are useful but should not distract from the MVP:

- Full Battle Simulator
- Advanced Academy Planner
- PNG export
- CSV export
- BB-code export
- Browser notifications and sounds
- Cloud sync
- Login/accounts
- Live Grepolis integration
- Browser extension features
- Alliance multiplayer planning
