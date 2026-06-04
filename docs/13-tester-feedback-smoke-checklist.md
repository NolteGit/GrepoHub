# GrepoPlan Tester Smoke Checklist

This checklist is intended for a first tester feedback round. It focuses on the current desktop/tablet-first release state and avoids deep mobile acceptance criteria until the dedicated Media-Day pass.

## 1. Release gate

- Run `npm run release:check` before handing the app to testers.
- Confirm GitHub Actions passes on `main`.
- Confirm Cloudflare Pages production deployment is green.
- Confirm the production app opens without a broken stylesheet/layout.
- Confirm the browser console has no serious app errors.

## 2. Deployment and routing

- Open `/` and confirm the planner loads.
- Open `/planner` and confirm the planner loads.
- Open `/planner-v2` and confirm it redirects or lands on the current planner route.
- Hard refresh the deployed page and confirm it still loads.
- Confirm the favicon and visible app name match GrepoPlan.

## 3. Visual shell

- Confirm the main planner layout looks correct on a normal desktop width.
- Confirm the toolbox, planner area, and summary area are aligned.
- Resize to a compact/tablet width and confirm the layout remains usable.
- Confirm the small-screen/mobile limitation notice is visible where expected.
- Confirm no old GrepoHub/planner-v2 naming appears in visible UI unless intentionally kept as legacy wording.

## 4. Language and localization

- Switch language once and confirm labels update.
- Reload the page and confirm the selected language persists.
- Check one or two planner sections for missing translation fallback text.
- Confirm import/export labels remain understandable after switching language.
- Confirm number/time labels still read naturally.

## 5. Plan persistence

- Create or rename a plan.
- Change at least one city building level.
- Change at least one unit amount.
- Reload the page and confirm the plan is restored.
- Clear/reset something and confirm the change persists after reload.

## 6. Import and export

- Export a JSON backup.
- Import the exported JSON again.
- Confirm duplicate names/IDs do not break the plan list.
- Try importing an invalid/non-JSON file and confirm the error is understandable.
- Export readable text/CSV if available and confirm the downloaded file opens normally.

## 7. City setup

- Change several normal building levels.
- Check special building choices.
- Toggle or change relevant city modifiers.
- Confirm population effects update correctly.
- Confirm invalid-looking combinations cannot be created through normal UI interactions.

## 8. God and effect synchronization

- Select Aphrodite as active god.
- Confirm the Pygmalion/Aphrodite city effect behaves as active.
- Switch to a different god.
- Confirm the Pygmalion/Aphrodite effect behaves as inactive.
- Reload and confirm the selected god/effect state remains consistent.

## 9. Troop setup

- Add land units.
- Add sea units.
- Add mythical units and switch gods.
- Confirm unit amount steppers clamp to reasonable values.
- Confirm non-transport ships do not show transport capacity as if they were transports.

## 10. Transport capacity

- Add land troops that require transport space.
- Add slow and fast transport ships.
- Confirm used/free/max capacity values update.
- Toggle bunks and confirm capacity changes.
- Confirm the capacity icon appears in the intended header area and does not distract from the status bar.

## 11. Toolbox

- Use the calculator with a simple expression.
- Try an invalid expression and confirm it does not produce a misleading result.
- Use the time/duration tools if available.
- Confirm buttons and inputs are reachable with keyboard navigation.
- Confirm toolbox state does not break after reload.

## 12. Empty and error states

- Check the app with an empty/default plan.
- Search/filter to a no-results state if the UI supports it.
- Trigger an import error.
- Confirm local-save failure messaging is understandable if storage is blocked.
- Confirm destructive actions ask for confirmation where expected.

## 13. Accessibility basics

- Navigate main controls with the keyboard.
- Open and close dialogs with keyboard controls.
- Confirm Escape closes modal dialogs.
- Confirm focus returns to a sensible element after closing a dialog.
- Confirm icon-only buttons have accessible labels or visible context.

## 14. Tester feedback focus

Ask testers to focus on:

- confusing wording or labels
- unexpected plan/config changes after reload
