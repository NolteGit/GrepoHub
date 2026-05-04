# Data and Import / Export

## Data approach

Grepo Hub should start as a client-side app without a backend.

The app should use:

- Static JSON files for core game data
- Local browser storage for saved user configurations
- TXT import/export for city and unit planner configurations

## Static JSON game data

The app should include a tiny local JSON database for core game resources.

Initial files may include:

```txt
src/assets/data/units.json
src/assets/data/buildings.json
```

Possible later files:

```txt
src/assets/data/research.json
src/assets/data/world-settings.json
```

## Initial data scope

The first data scope should be small and maintainable.

### Units

Possible fields:

```txt
id
name
category
population
wood
stone
silver
attack
defense_blunt
defense_sharp
defense_ranged
speed
carry
```

### Buildings

Possible fields:

```txt
id
name
max_level
category
wood
stone
silver
population
build_time
requirements
```

Exact values can be added gradually. The first implementation can use partial data while the UI and data services are being built.

## Translation data

Translations should be stored in a small TXT or JSON structure.

Preferred file format:

```txt
src/assets/i18n/en.json
src/assets/i18n/de.json
```

Possible later language:

```txt
src/assets/i18n/<language>.json
```

Translation files should cover UI text, not game data.

Examples:

- Navigation labels
- Page titles
- Buttons
- Dashboard cards
- About popup text
- Basic helper texts

## Local user data

User-created configurations should be saved locally in the browser.

Initial storage option:

- LocalStorage

Possible later storage option:

- IndexedDB

User-created data may include:

- City planner configurations
- Unit planner configurations
- Time tool configurations created during runtime

## Planner configuration sidebar

City Planner and Troops Planner should each have a left sidebar with configurations.

The sidebar should allow users to:

- View existing configurations
- Load a configuration into the planner
- Add/import a new TXT configuration
- Possibly duplicate, rename, or delete configurations later

## TXT import/export role

TXT import/export should be useful but not intrusive.

It should not have its own page.

TXT should mainly support:

- City Planner configurations
- Troops Planner configurations
- Optional academy data inside City Planner configurations

## TXT format principles

TXT files should be:

- Human-readable
- Easy to copy and paste
- Easy to edit manually
- Versioned from the beginning
- Forgiving where possible

## Example city plan TXT

```txt
# Grepo Hub City Plan
type=city-plan
version=1
name=Example Attack City

[Buildings]
Senate=25
Farm=40
Warehouse=35
Barracks=30
Harbor=30
Academy=30

[Academy]
Research1=true
Research2=false

[Notes]
Optional notes here.
```

## Example unit plan TXT

```txt
# Grepo Hub Unit Plan
type=unit-plan
version=1
name=Example Naval Attack

[Units]
Light Ship=120
Bireme=0
Fire Ship=20
Transport Boat=15

[Notes]
Optional notes here.
```

## Export buttons

Export buttons should be located inside planner pages.

Possible export actions:

- Export as TXT
- Export as PNG later
- Export as CSV later where useful
- Export as BB-code / Grepolis note format later

## Time tool data

Time tools do not need TXT import/export in the MVP.

Time configurations created during runtime should appear in the Time Tools configuration list and active timers should be accessible from the top navigation bar.

## Future data concerns

Later versions may need:

- Format migration for old TXT files
- More complete static game data
- Per-world settings
- User-defined custom defaults
- IndexedDB for larger storage
