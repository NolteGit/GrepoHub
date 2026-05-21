# Toolbox Timing Tools

Timing tools are planned as part of the Planner V2 left toolbox, not as a separate route. The old `/toolbox` page was removed during the V2 reset, but the reusable timer service, timer models, calculator helper, and time helper remain available for wiring.

## Goals

The timing tools should help with quick gameplay timing tasks.

Current and planned support includes:

- Simple time calculations.
- Alarms.
- Countdowns.
- Stopwatches.
- Multiple active timers visible in the toolbox queue.
- Later optional browser notification or sound support.

## Planned toolbox structure

The Planner V2 toolbox should contain:

- Clock and current date.
- Quick action buttons.
- Reminder/timer queue.
- Quick calculator.
- Time calculator.
- Footer links.

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

For the first V2 implementation, timer configurations do not need TXT import/export.

## Future shared service behavior

Timers should keep running while the user switches between City Setup and Troop Setup. `ToolboxTimerService` is already available as the reusable service boundary for this behavior.

A future timer UI should use the service for:

- Timer configuration storage.
- Countdown/alarm/stopwatch ticking.
- Pause/resume/stop transitions.
- Expired timer handling.
- Optional sounds or browser notifications.
- State exposed to the Planner V2 toolbox.

## Browser notification support

Browser notifications and sounds are useful but delayed.

Initial behavior can stay simpler:

- In-app visual indication.
- Timer queue updates.
- Optional sound later.
- Optional browser notification later.
