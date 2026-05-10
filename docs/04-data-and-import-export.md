# Data and Import / Export

## Data approach

Grepo Hub should start as a client-side app without a backend.

The app should use:

- Static JSON files for core game data
- Local browser storage for saved user plans
- One shared JSON-based `PlanConfig` per planning project
- CSV and BBCode as generated export formats, not as the internal source format

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

Translations should be stored in JSON files.

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

User-created plans should be saved locally in the browser.

Initial storage option:

- LocalStorage

Possible later storage option:

- IndexedDB

User-created data may include:

- Plan configurations containing city and troop planner data
- Per-world settings such as world speed, unit speed, locale, and timezone
- Time tool configurations created during runtime

## Shared planner configuration model

City Planner and Troops Planner should work on the same underlying `PlanConfig`.

A plan represents one planning project, not one isolated planner tab. This allows the user to create a city plan first and then fill the corresponding troop plan, or start from troop needs and adjust the city plan later.

The canonical shape should be JSON:

```json
{
  "format": "grepo-hub-plan-config",
  "version": 1,
  "exportedAt": "2026-05-09T12:00:00.000Z",
  "plans": [
    {
      "id": "custom-plan-1",
      "name": "Example Nuke Plan",
      "isPreset": false,
      "createdAt": "2026-05-09T12:00:00.000Z",
      "updatedAt": "2026-05-09T12:00:00.000Z",
      "settings": {
        "worldSpeed": 2,
        "unitSpeed": 1,
        "timezone": "Europe/Vienna",
        "locale": "en"
      },
      "cityPlan": {
        "id": "custom-city-1",
        "name": "Example Nuke Plan",
        "buildingLevels": {},
        "modifiers": {},
        "specialBuildings": {}
      },
      "troopPlan": {
        "id": "custom-troops-1",
        "name": "Example Nuke Plan",
        "unitAmounts": {},
        "modifiers": {}
      }
    }
  ]
}
```

The JSON bundle should be the source of truth for import/export. It can still be human-readable because it is formatted with indentation, but the app should validate and normalize imported data before using it.

## Planner configuration sidebar

City Planner and Troops Planner can keep their own page UI, but the configuration selector should list shared plans.

The selector should allow users to:

- View existing plans
- Load a shared plan into the current planner view
- Duplicate the active plan
- Save/update the current plan
- Import/export the shared plan bundle later
- Possibly rename or delete plans later

## Import/export role

Import and export should be useful but not intrusive.

They should not have their own page for the MVP.

The intended flow is:

```txt
PlanConfig JSON source of truth
  -> CSV export for spreadsheet review
  -> BBCode export for Grepolis notes/messages
  -> optional PNG export later
```

## Format principles

Plan config files should be:

- Human-readable
- Easy to import and export in the app
- Versioned from the beginning
- Forgiving where possible
- Normalized after import
- Structured enough to support migrations later

## CSV export

CSV should be an export/converter format, not the canonical format.

The first CSV export can be a high-level plan overview:

```csv
planId,planName,cityPlanName,troopPlanName,worldSpeed,unitSpeed,updatedAt
custom-plan-1,Example Nuke Plan,Example Nuke Plan,Example Nuke Plan,2,1,2026-05-09T12:00:00.000Z
```

Later, the app can add specialized CSV exports such as:

- One row per planned city
- One row per unit amount
- One row per resource/troop requirement

## BBCode export

BBCode should be a generated display format, not stored app state.

Example:

```bbcode
[b]Example Nuke Plan[/b]

[u]City plan[/u]: Example Nuke Plan
[u]Troop plan[/u]: Example Nuke Plan

[table]
[**]Unit[||]Amount[/**]
[*]light_ship[|]120
[*]transport_boat[|]20
[/table]
```

Later, BBCode templates can be planner-specific.

## Time tool data

Time tools do not need JSON import/export in the MVP.

Time configurations created during runtime should appear in the Time Tools configuration list and active timers should be accessible from the top navigation bar.

## Future data concerns

Later versions may need:

- Format migration for older plan bundles
- Legacy migration from separate city/troop configuration storage
- More complete static game data
- Per-world defaults
- User-defined custom presets
- IndexedDB for larger storage
