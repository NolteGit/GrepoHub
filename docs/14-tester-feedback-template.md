# GrepoPlan Tester Feedback Template

Use this template when collecting feedback from testers. The goal is to separate real defects from design preferences and to make every report reproducible.

## Tester context

- Tester name or initials:
- Date:
- Browser:
- Device:
- Screen size or rough category:
  - Desktop
  - Laptop
  - Tablet
  - Phone
- Input method:
  - Mouse
  - Touchpad
  - Touch
  - Keyboard only

## Tested version

- URL:
- Commit/deployment identifier, if visible:
- Language used:
- Fresh browser session or existing local data?
  - Fresh
  - Existing saved plans
  - Imported plan file

## Quick smoke result

Mark each item as pass, fail, or not tested.

- App loads without a blank screen:
- No serious console errors:
- Language switch works:
- Plan creation/rename/delete works:
- City setup changes persist after reload:
- Troop setup changes persist after reload:
- Import/export works:
- Transport capacity display makes sense:
- Toolbox tools are usable:
- Direct reload works on `/`:
- Direct reload works on `/planner`:
- Legacy `/planner-v2` route redirects or loads safely:

## Issue report

Copy this block once per issue.

### Issue title

Short, specific title.

### Severity

- Blocker: app cannot be used or data is lost.
- High: core planner behavior is wrong.
- Medium: confusing behavior or important visual issue.
- Low: polish, wording, spacing, or preference.

### Area

- App shell / routing
- Plans / persistence
- Import / export
- City setup
- Troop setup
- Transport capacity
- Toolbox
- Language / translations
- Layout / responsive behavior
- Accessibility / keyboard
- Other

### Steps to reproduce

1.
2.
3.

### Expected result

What should happen?

### Actual result

What happened instead?
