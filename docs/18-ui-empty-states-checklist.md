# UI Empty States and Import/Export Checklist

Use this checklist after UI polish changes that affect plan management, import/export, or states
where the planner has no direct data to show.

## 1. Empty and default planner states

- Open the app with a clean browser profile or cleared local storage.
- Confirm the default plan appears without broken, blank, or misleading sections.
- Confirm city setup, troop setup, toolbox, and summary areas remain usable before any
  manual edits.
- Confirm empty values use clear helper text instead of looking like loading failures.
- Confirm disabled controls explain why they cannot be used when context is missing.

## 2. Plan list and selection states

- Confirm the active plan is visually clear.
- Create a new plan and confirm it becomes selectable without a refresh.
- Rename or duplicate a plan and confirm names remain readable in compact layouts.
- Delete or reset plan data where supported and confirm the next available state is
  understandable.
- Confirm icon-only plan actions have accessible names.

## 3. Import feedback

- Import a valid exported JSON file.
- Import malformed JSON and confirm the error message is readable.
- Import a structurally incomplete file and confirm it is rejected or normalized safely.
- Cancel the file picker and confirm no stale success or error message remains.
- Import the same file twice and confirm duplicate handling is understandable.

## 4. Export feedback

- Export the current plan as JSON.
- Open the exported file and confirm it contains the expected plan data.
- Confirm export buttons do not look enabled while an export action is impossible.
- Confirm readable text or CSV export, if available, produces a file with useful labels.
- Confirm export feedback does not cover or shift core planner controls unnecessarily.

## 5. Local persistence feedback

- Make a city change, refresh, and confirm the change is restored.
- Make a troop change, refresh, and confirm the change is restored.
- Confirm local-save warnings are understandable if browser storage is unavailable or blocked.
- Confirm clearing browser storage returns the app to a safe default state.
- Confirm language selection and planner state do not overwrite each other.

## 6. Compact and localized UI states

- Switch each supported language and inspect dense controls.
- Confirm short labels are used where full translated labels would crowd the layout.
- Confirm full labels remain available through accessible names, titles, or nearby context.
- Confirm empty-state and error messages do not overflow on tablet widths.
- Confirm action rows wrap cleanly without hiding primary controls.

## 7. Keyboard and screen-reader basics

- Navigate import/export actions with the keyboard.
- Confirm focus is not lost after closing dialogs or cancelling file selection.
- Confirm error messages are associated with the relevant action or input.
- Confirm dismissible feedback can be dismissed with keyboard controls when applicable.
- Confirm destructive actions ask for confirmation where expected.

## 8. Useful commands

```powershell
npm run format:check
npm run pages:audit
npm run i18n:audit
npm run data:audit
npm run assets:audit
```
