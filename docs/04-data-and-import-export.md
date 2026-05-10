# Data and Import / Export

## Data approach

Grepo Hub is a client-side app without a backend.

The app uses:

- Static JSON files for core game data.
- Local browser storage for saved user plans.
- One shared JSON-based `PlanConfig` per planning project.
- CSV, BBCode, TXT, or image formats only as future generated export formats, not as the internal source format.

## Static JSON game data

The app currently loads local JSON data from `public/assets/data/`.

Current files:

```txt
public/assets/data/units.json
public/assets/data/buildings.json
```

Possible later files:

```txt
public/assets/data/research.json
public/assets/data/world-settings.json
```

The data is served as static assets by Angular. Keep these files small, readable, and stable because planner logic depends on their identifiers.

## Initial data scope

The first data scope should stay small and maintainable.

### Units

Useful fields include:

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

Useful fields include:

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

Exact values can be improved gradually. Model changes should be made before additional planner features depend on a field.

## Translation data

Translations are stored in local JSON files.

Current files:

```txt
public/assets/i18n/en.json
public/assets/i18n/de.json
```

Possible later language files:

```txt
public/assets/i18n/<language>.json
```

Translation files should cover UI text, not the canonical game data identifiers.

Examples:

- Navigation labels.
- Page titles.
- Buttons.
- Dashboard cards.
- Planner labels and descriptions.
- Reference resource labels.
- Toolbox labels and timer states.
- Status and error messages.

The translation service supports fallback text for migration and data-driven content. Treat fallback as a safety net, not as a replacement for adding explicit keys.

## Local user data

User-created plans are saved locally in the browser.

Current storage option:

- LocalStorage

Possible later storage option:

- IndexedDB

User-created data may include:

- Plan configurations containing city and troop planner data.
- Per-world settings such as world speed, unit speed, locale, and timezone.
- Time tool configurations created during runtime.

## Shared planner configuration model

City Planner and Troops Planner work on the same underlying `PlanConfig` shape.

A plan represents one planning project, not one isolated planner tab. This allows the user to create a city plan first and then fill the corresponding troop plan, or start from troop needs and adjust the city plan later.

The canonical shape is JSON:

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

The JSON bundle is the source of truth for import/export. It remains human-readable because it is formatted with indentation, but the app should validate and normalize imported data before using it.

## Planner configuration sidebar

City Planner and Troops Planner can keep their own page UI, but the configuration selector should list shared plans.

The selector should allow users to:

- View existing plans.
- Load a shared plan into the current planner view.
- Duplicate the active plan.
- Save/update the current plan.
- Import/export a shared plan bundle.
- Rename or delete plans later.

## Import/export role

Import and export should be useful but not intrusive.

They should not have their own main page. They should be integrated into planner pages through compact buttons, panels, or dialogs.

## Validation expectations

Imported data should be checked for:

- Expected `format`.
- Supported `version`.
- Required plan fields.
- Known city and troop plan sections.
- Reasonable numeric values.
- Matching unit/building identifiers.

Invalid imports should fail safely with a translated user-facing message instead of silently corrupting local state.
