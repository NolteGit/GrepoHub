# Project Vision

## Purpose

Grepo Hub is a Grepolis companion web app for planning and playing alongside the main game. It should help active and returning players manage common planning tasks without becoming a gameplay automation tool.

The app should focus on:

- City planning (with simple academy planning)
- Unit planning
- Reference & Scrip-Tools information
- Guides
- Time calculations and active timers
- Future battle simulation support

Grepo Hub should be useful while playing, but it should not interact directly with the Grepolis game client.

## Development goal

The app should be developed with Angular. The project should also serve as a practical way to learn Angular step by step.

The first version should be kept small and understandable. Features should be implemented in a modular way so the app can grow later.

## Core principles

- Browser-first
- No backend for the MVP
- No login for the MVP
- Local saves first
- Human-readable configuration files where useful
- Small static JSON data files for core game information
- Simple and quick UI for use while playing

## MVP scope summary

The current MVP direction is Planner V2:

- One main planner workspace instead of several old V1 pages.
- City Setup and Troop Setup as modes inside the same workspace.
- Left functional toolbox for clock, quick actions, timers, calculator, and links.
- Right shared summary sidebar.
- Static JSON game data for units and buildings.
- Local JSON translations.
- LocalStorage-backed plan persistence.
- JSON import/export inside the planner flow, not as a dedicated page.
- References, guides, academy planning, generated export formats, and battle simulation as later extensions.
