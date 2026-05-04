# Time Tools

The Time Tools page should contain all timing-related tools in a single place.

There should not be separate pages for alarms, countdowns, stopwatches, and calculators.

## Goals

The Time Tools page should help with quick timing tasks during gameplay.

It should support:

- Simple time calculations
- Alarms
- Countdowns
- Stopwatches
- Multiple active timers running simultaneously
- Timer access from the top navigation bar

## Page structure

Recommended layout:

- Left sidebar: saved/default time configurations
- Main area: time calculator and active timer configuration area
- Active timers overview

## Time calculator section

The time calculator should allow users to add or subtract time from a base time.

Default behavior:

- Base time is current local time
- User can edit the base time manually
- User can add hours, minutes, and seconds
- User can subtract hours, minutes, and seconds
- Result time is shown immediately

Example use cases:

- What time is it in 10 minutes?
- What time was 3 hours ago?
- What time do I need if I subtract 45 minutes from an arrival time?

## Time configuration section

The core time configuration section should allow users to create one of:

- Alarm
- Countdown
- Stopwatch

These can run in the application background while the user navigates between pages.

## Alarm

An alarm should trigger at a specific time.

Example default config:

```txt
23:00:00 alarm
```

Possible fields:

- Name
- Target time
- Enabled/disabled
- Optional note

## Countdown

A countdown should run for a defined duration.

Example default config:

```txt
10 minute countdown
```

Possible fields:

- Name
- Hours
- Minutes
- Seconds
- Enabled/disabled
- Optional note

## Stopwatch

A stopwatch should count upward from zero or from a manually set starting value.

Possible fields:

- Name
- Start/pause/resume/stop
- Optional note

## Time configuration list

The Time Tools page should include a left-side list of time configurations.

The list may include:

- Default countdowns
- Default alarms
- User-created runtime configurations
- Currently running timers
- Paused timers
- Stopped timers

For the MVP, these configurations do not need TXT import/export.

## Top bar integration

Running timers should be accessible globally from the top navigation bar.

The top bar should include:

- Quick add button
- Active timer indicator
- Dropdown or panel for active timers
- Link to the Time Tools page

The dropdown should allow common actions later:

- View timer
- Pause
- Resume
- Stop
- Remove

## Background behavior

Timers should continue running while navigating between app pages.

This implies that timer state should live in a shared Angular service, not only inside the Time Tools component.

## Browser notification support

Browser notifications and sounds are useful but can be delayed.

MVP behavior can be simpler:

- In-app visual indication
- Timer dropdown update
- Optional sound later
- Optional browser notification later

## MVP time tools scope

For the first implementation:

- Current-time based calculator
- Add/subtract hours/minutes/seconds
- Create countdown
- Create alarm
- Create stopwatch
- Active timers in shared service
- Top bar active timer dropdown
- Basic default configs in the left list
