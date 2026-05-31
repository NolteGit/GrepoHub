# Manual regression checklist

Use this checklist after behavior-sensitive changes, before sharing a build for feedback, or before
deploying a production build.

Run the automated release gate first:

```bash
npm run release:check
```

Use `npm run verify` for normal development checks when the production dependency audit is not needed.

Then test the core flows below in the browser.

## 1. Fresh app load and persistence

```text
[ ] Open the app after clearing localStorage
[ ] Create a custom plan
[ ] Rename the custom plan
[ ] Add a short city note
[ ] Reload the page and confirm the selected plan is restored
[ ] Reset/clear the plan and confirm values return to defaults
[ ] Reload again and confirm the reset state remains stable
[ ] If possible, test with localStorage blocked/full and confirm the app shows a local-save warning instead of crashing
```

## 2. Import and export

```text
[ ] Export the active plan as JSON
[ ] Import the exported JSON again
[ ] Confirm duplicate imported names receive a safe copy name
[ ] Try importing invalid JSON and confirm a user-friendly error is shown
[ ] Try importing a structurally invalid plan and confirm a user-friendly error is shown
[ ] Export readable TXT/CSV/BBCode output and confirm selected god/city effects are correct
[ ] Export a plan with a name/note starting with =, +, -, or @ and confirm CSV opens as text, not a spreadsheet formula
```

## 3. God and city-effect synchronization

```text
[ ] Select Aphrodite from the god selector
[ ] Confirm Pygmalion/Aphrodite population effect is active in city calculations
[ ] Switch to another god and confirm the Aphrodite effect is removed
[ ] Select Hera through mythical-unit related controls if available
[ ] Confirm unavailable mythical units/effects are cleaned up correctly
[ ] Reload the page and confirm the selected god belongs to the active plan
[ ] Switch between plans and confirm each plan restores its own selected god
```

## 4. City setup and special buildings

```text
[ ] Change building levels and confirm population changes update immediately
[ ] Toggle Plow and confirm population changes update immediately
[ ] Select Merchant and confirm market/trade capacity uses the special-building value
[ ] Remove Merchant and confirm market/trade capacity returns to the default value
[ ] Select Tower and confirm wall-defense related values update correctly
[ ] Switch special buildings and confirm old effects are removed
[ ] Set cave to max level and confirm the infinite silver display still appears
```

## 5. Research behavior

```text
[ ] Toggle researches from the relevant UI
[ ] Confirm Library-related research capacity/effects remain synchronized
[ ] Close and reopen related popups and confirm research state remains stable
[ ] Reload the page and confirm research state persists with the selected plan
```

## 6. Unit pile behavior

```text
[ ] Add a land unit with the plus control
[ ] Remove a land unit with the minus control
[ ] Confirm plus/minus changes are exactly 1 per click
[ ] Confirm max value is based on roughly 5000 BHP of the unit
[ ] Add transport ships and confirm transport capacity updates
[ ] Add non-transport ships and confirm no transport capacity chip is shown for them
[ ] Confirm Bunks research modifies transport capacity when applicable
```

## 7. Summary sidebar

```text
[ ] Confirm population summary updates after unit changes
[ ] Confirm population summary updates after building/effect changes
[ ] Confirm battle stats update after unit changes
[ ] Confirm transport capacity updates after ship/research changes
[ ] Confirm top/most-used unit display handles an empty plan gracefully
[ ] Confirm no summary shows stale values after reset
```

## 8. Toolbox and time calculator

```text
[ ] Switch between calculator modes without layout jumping
[ ] Enter a time/duration value and confirm result output updates
[ ] Use the reset control and confirm duration state resets correctly
[ ] Confirm the reset control has a useful hover title
[ ] Confirm the Now action still behaves correctly
```

## 9. Layout, responsiveness, and accessibility basics

Test at least a normal desktop width and a narrow browser window.

```text
[ ] Main planner layout does not overflow horizontally
[ ] Narrow viewport shows the small-screen notice
[ ] Sidebar remains usable
[ ] Popups fit within the viewport
[ ] Unit/building tiles wrap cleanly
[ ] Icon-only controls have hover titles or accessible labels
[ ] Focus states are visible enough for keyboard users
[ ] Disabled controls look disabled
[ ] External footer links open correctly
```

## 10. Deployment smoke test

Use this after a production build or hosted preview deployment.

```text
[ ] Production build completes
[ ] Hosted app opens on the root route
[ ] Refreshing the root route still works
[ ] Refreshing /planner-v2 still works if the host exposes that route
[ ] App title and favicon are correct in the browser tab
[ ] Static data, icons, and translations load correctly
[ ] Browser console has no unexpected production errors during normal use
[ ] Browser console has no CSP violations during normal use
```
