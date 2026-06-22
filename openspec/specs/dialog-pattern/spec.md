# Spec: dialog-pattern

## Overview

Canonical MatDialog pattern for all dialog organisms. Every component opened via `MatDialog.open()` MUST follow these requirements for typed data, closing, forms, states, imports, styling, and accessibility.

## Requirements

| ID | Priority | Rule |
|----|----------|------|
| REQ-1 | P0 | Export typed `interface XxxDialogData` alongside component; inject via `inject(MAT_DIALOG_DATA)<XxxDialogData>` — NOT `input()`/`@Input()` |
| REQ-2 | P0 | Inject `MatDialogRef<Component, T>`; close via `dialogRef.close(result)` — `closed.emit()` PROHIBITED |
| REQ-3 | P0 | Use `FormBuilder`/`FormGroup`/`FormControl`; `[(ngModel)]` PROHIBITED |
| REQ-4 | P1 | `loading` signal (boolean); show `<mat-spinner>` while `true` |
| REQ-5 | P1 | `errorMsg` signal (`string \| null`); dismissible error banner when non-null |
| REQ-6 | P1 | Handle `undefined`/partial `MAT_DIALOG_DATA` with sensible defaults |
| REQ-7 | P1 | Import only Material modules used; always include `ReactiveFormsModule`, never `FormsModule` |
| REQ-8 | P1 | Icons via `<mat-icon>` only — `<span class="material-icons">` PROHIBITED |
| REQ-9 | P1 | Close buttons MUST have `aria-label`; form controls MUST use `for`/`id` or `aria-label` |
| REQ-10 | P1 | Tailwind classes for styling; `::ng-deep` PROHIBITED unless documented inline |

### Key Scenarios

#### Scenario: REQ-1 / REQ-2 — Typed data and closing
- **GIVEN** a dialog opened via `MatDialog.open(XxxComponent, { data })`
- **WHEN** it initializes
- **THEN** data is available via `readonly data = inject(MAT_DIALOG_DATA)<XxxDialogData>`
- **AND** `dialogRef.close(result)` is used to return typed results

#### Scenario: REQ-3 — Reactive Form lifecycle
- **GIVEN** a dialog with form controls
- **WHEN** the user submits valid data
- **THEN** `dialogRef.close(form.getRawValue())` is called

#### Scenario: REQ-4 / REQ-5 — Loading and error flow
- **GIVEN** a dialog that fetches data on init
- **WHEN** the fetch is in progress
- **THEN** `loading()` is `true` and spinner is visible
- **WHEN** the fetch fails
- **THEN** `loading()` is `false`, `errorMsg` is set, and the dismissible banner appears

#### Scenario: REQ-6 — Create mode (no data)
- **GIVEN** a dialog opened without `MAT_DIALOG_DATA`
- **WHEN** the form initializes
- **THEN** all controls have empty/null defaults and the form is pristine

#### Scenario: REQ-9 — Accessibility audit pass
- **GIVEN** a rendered dialog
- **WHEN** inspected with aXe or manual review
- **THEN** every close button has `aria-label="Close dialog"` and all form fields have associated labels

#### Scenario: REQ-10 — Style isolation
- **GIVEN** a dialog component
- **WHEN** its styles are reviewed
- **THEN** width constraints use `class="max-w-[Npx]"`, not `::ng-deep`
- **AND** any `::ng-deep` usage has a preceding comment explaining why Tailwind cannot achieve the same result
