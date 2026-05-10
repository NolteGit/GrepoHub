# Toolbox Timing Tools

Timing tools currently live inside the `/toolbox` route. The older idea of a separate `/time-tools` route has been consolidated into Toolbox so utility features stay in one place.

## Goals

The timing tools should help with quick gameplay timing tasks.

Current and planned support includes:

- Simple time calculations.
- Alarms.
- Countdowns.
- Stopwatches.
- Multiple active timers visible in the Toolbox queue.
- Future global timer access from the top navigation bar.

## Current Toolbox structure

The current Toolbox page contains:

- Hero section with current time and timezone controls.
- Quick calculator.
- Time calculator.
- Reminder widget for countdowns, alarms, and stopwatches.
- Active timer queue.
- Feature-gated battle simulator placeholder.

## Time calculator section

The time calculator allows users to add or subtract time from a base time.

Default behavior:

- Base time starts from the current local time.
- User can edit the base time manually.
- User can add hours, minutes, and seconds.
- User can subtract hours, minutes, and seconds.
- Result time is shown immediately.

Example use cases:

- What time is it in 10 minutes?
- What time was 3 hours ago?
- What time do I need if I subtract 45 minutes from an arrival time?

## Reminder modes

The reminder widget supports three modes.

### Alarm

An alarm triggers at a specific time.

Useful fields:

- Name.
- Target time.
- Optional note.

### Countdown

A countdown runs for a defined duration.

Useful fields:

- Name.
- Hours.
- Minutes.
- Seconds.
- Optional note.

### Stopwatch

A stopwatch counts upward from the time it is started.

Useful fields:

- Name.
- Start/stop actions.
- Optional note.

## Active timer queue

The active timer queue displays timers created during the current app session.

It should show:

- Timer label.
- Current state.
- Remaining or elapsed time.
- Primary actions such as stop/remove.

For the first MVP, timer configurations do not need TXT import/export.

## Future top-bar integration

Running timers should eventually be accessible globally from the app shell.

The top bar may later include:

- Quick add button.
- Active timer indicator.
- Dropdown or panel for active timers.
- Link to the Toolbox page.

The dropdown should allow common actions later:

- View timer.
- Pause.
- Resume.
- Stop.
- Remove.

## Future shared service extraction

Timers currently belong to the Toolbox feature implementation. If timers need to keep running while navigating between pages, timer state should move into a shared Angular service.

A future service should own:

- Timer configuration storage.
- Countdown/alarm/stopwatch ticking.
- Pause/resume/stop transitions.
- Expired timer handling.
- Optional sounds or browser notifications.
- State exposed to Toolbox and the app shell.

## Browser notification support

Browser notifications and sounds are useful but delayed.

MVP behavior can stay simpler:

- In-app visual indication.
- Timer queue updates.
- Optional sound later.
- Optional browser notification later.
