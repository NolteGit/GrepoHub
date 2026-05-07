# Grepo Hub

Grepo Hub is a browser-based Grepolis companion app for city planning, unit planning, references, guides, timing tools, and future battle simulation support.

## Current status

The Angular skeleton is in place and running with:

- app shell and main navigation
- routed placeholder pages
- dashboard cards on the home page
- static game data for units and buildings
- early troops planner table with editable unit amounts
- compact translation layer for UI text

The next focus is to turn the existing skeleton into useful vertical slices, starting with the Troops Planner and then improving City Planner data usage.

## Documentation

Project documentation lives in [`docs`](./docs). The active development checklist is [`todo.md`](./todo.md).

## Development

```bash
npm install
npm run start
npm run build
npm run test

## Main pages
- Home / Dashboard
- City Planner
- Troops Planner
- References
- Guides
- Time Tools
- Battle Simulator