# GrepoPlan Accessibility and Keyboard Checklist

This checklist is a focused manual pass for the desktop and tablet-first release. It is intended to catch the most important accessibility regressions before broader tester feedback and before the later Media-Day mobile redesign.

## Scope

The current release target is a local-first planner optimized for desktop and decently sized screens. This checklist focuses on keyboard operation, dialogs, visible focus states, readable labels, and basic status feedback.

Mobile usability is tracked separately in the responsive layout guidelines and should not block this pass unless a small-screen issue also breaks desktop or tablet use.

## Global keyboard navigation

- Start at the page root and use `Tab` to move through the interface.
- Focus should move in a predictable visual order.
- Interactive controls should have a visible focus style.
- `Shift + Tab` should move focus backward without skipping important controls.
- No keyboard trap should occur outside an intentionally open modal/dialog.

## Planner header and mode switching

- The main planner controls should be reachable by keyboard.
- Plan action buttons should expose understandable labels or visible text.
- Mode switches should clearly indicate which mode is active.
- Language selection should be reachable and understandable without a mouse.
- Direct routes `/`, `/planner`, and the legacy `/planner-v2` redirect should remain usable after keyboard navigation.

## Dialogs and modal interactions

- Opening a plan action dialog should move focus into the dialog.
- `Escape` should close dismissible dialogs.
- Closing a dialog should return focus to the triggering control when possible.
- Focus should not move behind an open modal when tabbing.
- Dialogs should expose a meaningful accessible name via title text or ARIA attributes.

## Import and export flows

- Import controls should be keyboard reachable through the visible trigger, not through the hidden file input.
- The hidden file input should remain hidden visually and from normal keyboard flow.
- Import errors should be shown as readable text.
- Export actions should have clear labels and should not rely on icon-only meaning.
- File-related warnings should not disappear before they can be read.

## City setup

- City setup tabs/modifiers should be keyboard reachable.
- Toggle-like controls should expose their pressed/active state.
- Building level controls should be operable by keyboard.
- Minimum and maximum level behavior should be clear from the UI state.
- Special building options should be reachable and visibly selected when active.

## Troop setup

- Unit amount controls should be keyboard reachable.
- Plus/minus buttons should have accessible names or enough visible context.
- Entering values should respect unit maximums and should not cause focus jumps.
- The god selector should be keyboard reachable and should not trigger the surrounding tab button accidentally.
- The transport-capacity panel should remain readable with or without the decorative capacity icon.

## Toolbox

- Timer, calculator, and helper controls should be keyboard reachable.
- Calculator input should handle invalid values without losing focus unexpectedly.
- Timer actions should communicate enough state through visible labels.
- Icon-only toolbox actions should have accessible labels.
- Copy/download actions should provide visible or understandable feedback.

## Summary sidebar

- Summary content should be readable without relying only on color.
- Important warning or over-capacity states should use text, not only color.
- Summary sections should remain understandable when details are collapsed or hidden.
- Numeric totals should be visible enough at normal desktop zoom.
- Overflowed text should not hide essential status information.

## Visual and color checks

- Important text should have adequate contrast against the dark background.
- Disabled controls should still be identifiable as disabled.
- Active states should not rely only on subtle border color changes.
- Error/warning states should be distinguishable from normal muted text.
- Focus rings should remain visible on dark and gold UI surfaces.

## Browser zoom checks

- Test at 100% zoom.
- Test at 125% zoom.
- Test at 150% zoom for the main planner shell.
- Horizontal scrolling is acceptable for dense planner content only when unavoidable.
- Essential controls should not be clipped or unreachable.

## Known limitations for this pass

- Full mobile interaction is not the target of this checklist.
- Toolbox and summary behavior on narrow screens will be handled during Media-Day.
- This pass does not require screen-reader certification.
