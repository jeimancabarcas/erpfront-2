# Spec: dialog-config

## Overview

Shared dialog configuration constants that all dialog callers MUST use instead of inline magic values. Provides standardized width presets (`sm/md/lg/xl`), a unified panel class, and default `maxWidth`/`disableClose` values.

## Requirements

### REQ-1: Standard Width Constants

**Priority**: P0  
**Description**: A single `DIALOG_WIDTHS` constant MUST be exported with exactly four preset widths:

| Key | Value |
|-----|-------|
| `sm` | `'500px'` |
| `md` | `'600px'` |
| `lg` | `'850px'` |
| `xl` | `'950px'` |

All `MatDialog.open()` calls with explicit width MUST reference `DIALOG_WIDTHS` — inline width strings are PROHIBITED.

#### Scenario: Happy path — caller uses width constant
- **GIVEN** a component that opens a dialog
- **WHEN** calling `dialog.open(XxxComponent, { width: DIALOG_WIDTHS.md })`
- **THEN** the dialog renders at 600px width
- **AND** no inline `'600px'` string exists in the caller

#### Scenario: Edge case — width not specified
- **GIVEN** a dialog opened without a `width` config
- **WHEN** the dialog renders
- **THEN** Angular Material's default width applies (unset)

#### Scenario: Error state — unknown width key
- **GIVEN** a caller referencing a non-existent key like `DIALOG_WIDTHS.xxl`
- **WHEN** TypeScript compiles
- **THEN** the compiler reports a type error (`as const` makes the object read-only with literal keys)

### REQ-2: Unified Panel Class

**Priority**: P0  
**Description**: A `DIALOG_PANEL_CLASS` constant MUST export the string `'erp-dialog-panel'`. All `MatDialog.open()` calls MUST pass `panelClass: DIALOG_PANEL_CLASS`. Inline panel class strings are PROHIBITED.

#### Scenario: Happy path — caller uses panel class constant
- **GIVEN** a component that opens a dialog
- **WHEN** calling `dialog.open(XxxComponent, { panelClass: DIALOG_PANEL_CLASS })`
- **THEN** the dialog overlay has the `erp-dialog-panel` CSS class
- **AND** no inline `'erp-dialog-panel'` string exists in callers

### REQ-3: Default maxWidth and disableClose

**Priority**: P1  
**Description**: A `DIALOG_DEFAULTS` constant MUST be exported:

```ts
export const DIALOG_DEFAULTS = { maxWidth: '95vw', disableClose: false } as const;
```

Callers MAY spread these defaults: `{ ...DIALOG_DEFAULTS, width: DIALOG_WIDTHS.md }`.

#### Scenario: Happy path — defaults applied via spread
- **GIVEN** a call to `dialog.open(XxxComponent, { ...DIALOG_DEFAULTS, width: DIALOG_WIDTHS.md })`
- **WHEN** the dialog opens
- **THEN** `maxWidth` is `95vw` and `disableClose` is `false`
- **AND** the width override (`md`) takes precedence

#### Scenario: Edge case — caller overrides a default
- **GIVEN** a call to `dialog.open(XxxComponent, { ...DIALOG_DEFAULTS, disableClose: true })`
- **WHEN** the dialog opens
- **THEN** `disableClose` is `true` (override wins)
- **AND** `maxWidth` remains `95vw`

### REQ-4: File Location and Import Contract

**Priority**: P0  
**Description**: The config constants MUST live at `src/app/shared/constants/dialog.config.ts`. All dialog callers MUST import from this canonical path via:

```ts
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '@shared/constants/dialog.config';
```

Duplicated or relocated copies are PROHIBITED.

#### Scenario: Happy path — single canonical import
- **GIVEN** any component that opens a dialog
- **WHEN** it references dialog config
- **THEN** the import resolves to `src/app/shared/constants/dialog.config.ts`
- **AND** no other file in the project contains a duplicate definition of these constants

#### Scenario: Error state — import from wrong path
- **GIVEN** a file importing from a different path (e.g., `../constants/dialog.config`)
- **WHEN** reviewed
- **THEN** it is flagged as non-compliant and MUST be changed to the canonical path

### REQ-5: Immutability of Constants

**Priority**: P1  
**Description**: All exported constants MUST use `as const` assertion. No consumer MAY mutate them.

#### Scenario: Happy path — compile-time immutability
- **GIVEN** a consumer trying to reassign `DIALOG_WIDTHS.sm = '400px'`
- **WHEN** TypeScript compiles
- **THEN** the compiler reports a readonly error

### REQ-6: Universal Caller Adoption [P0]

**Priority**: P0  
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
