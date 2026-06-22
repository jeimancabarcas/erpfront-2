# Delta Spec: dialog-config (MODIFIED)

## Overview

Adds REQ-6: Universal Caller Adoption — all `MatDialog.open()` callers MUST use `dialog.config.ts` constants. Existing REQ 1-5 unchanged.

## New Requirements

### REQ-6: Universal Caller Adoption [P0]

**Description**: ALL components using `MatDialog.open()` MUST import dialog config from the canonical path (`@shared/constants/dialog.config`). Every `dialog.open()` call MUST reference `DIALOG_WIDTHS` (for `width`), `DIALOG_PANEL_CLASS` (for `panelClass`), and `...DIALOG_DEFAULTS` (as spread base). Inline string values for width, panelClass, maxWidth, or disableClose are PROHIBITED. Exceptions for non-standard widths not covered by preset keys MUST be justified with an inline comment.

#### Scenario: Happy path — all callers use config constants
- **GIVEN** any component that opens a `MatDialog`
- **WHEN** its `dialog.open()` config is reviewed
- **THEN** `width` references `DIALOG_WIDTHS.{key}`
- **AND** `panelClass` references `DIALOG_PANEL_CLASS`
- **AND** the config spreads `...DIALOG_DEFAULTS`
- **AND** no inline string value exists for width, panelClass, maxWidth, or `disableClose`

#### Scenario: Edge case — non-standard width needed
- **GIVEN** a dialog whose required width is not in `DIALOG_WIDTHS` (`sm/md/lg/xl`)
- **WHEN** `dialog.open()` is called
- **THEN** the caller SHOULD propose a new key be added to `DIALOG_WIDTHS` rather than using an inline string
- **AND** if inline string is unavoidable, a `// TODO` comment MUST document why
