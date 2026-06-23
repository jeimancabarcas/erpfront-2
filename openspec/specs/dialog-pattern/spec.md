# Spec: dialog-pattern

## Overview

Canonical MatDialog pattern for all dialog organisms. Every component opened via `MatDialog.open()` MUST follow these requirements for typed data, closing, forms, states, imports, styling, and accessibility.

## Requirements

| ID | Priority | Rule |
|----|----------|------|
| REQ-1 | P0 | Export typed `interface XxxDialogData` alongside component; inject via `inject(MAT_DIALOG_DATA)<XxxDialogData>` — NOT `input()`/`@Input()` |
| REQ-2 | P0 | Inject `MatDialogRef<Component, T>`; close via `dialogRef.close(result)` — `closed.emit()` PROHIBITED |
| REQ-3 | P0 | Use `FormBuilder`/`FormGroup`/`FormControl`; `[(ngModel)]` PROHIBITED |
| REQ-4 | P0 | `loading` signal (boolean); show loading indicator (spinner/skeleton) while `true` |
| REQ-5 | P0 | `errorMsg` signal (`string \| null`); dismissible error banner when non-null |
| REQ-6 | P1 | Handle `undefined`/partial `MAT_DIALOG_DATA` with sensible defaults — component MUST handle three cases: (1) no data at all — use empty defaults; (2) partial data — merge with defaults without crashing; (3) mode-driven data (`{ mode: 'add' \| 'edit', ... }`) — initialize form state accordingly. Every injected data field SHOULD have a safe fallback. |
| REQ-7 | P1 | Import only Material modules used; always include `ReactiveFormsModule`, never `FormsModule` |
| REQ-8 | P1 | Icons via `<span class="material-icons">` only — `<mat-icon>` PROHIBITED |
| REQ-9 | P1 | Close buttons MUST have `aria-label`; form controls MUST use `for`/`id` or `aria-label` |
| REQ-10 | P1 | Tailwind classes for styling; `::ng-deep` PROHIBITED unless documented inline |
| REQ-11 | P0 | Dialog MUST use header-body-footer layout: header with title + optional status badge + close button, scrollable content body, footer with action/CTA buttons |
| REQ-12 | P0 | Dialog MUST apply `rounded-[32px]`, `shadow-2xl`, `max-h-[95vh]`, and CSS scrollbar styling on the content body |

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
- **THEN** `loading()` is `true` and a loading indicator is shown
- **WHEN** the fetch fails
- **THEN** `loading()` is `false`, `errorMsg` is set, and the dismissible banner appears

#### Scenario: REQ-6 — Create mode (no data)
- **GIVEN** a dialog opened without `MAT_DIALOG_DATA`
- **WHEN** the form initializes
- **THEN** all controls have empty/null defaults and the form is pristine

#### Scenario: Mode-driven data — Add mode
- **GIVEN** a dialog opened with `{ mode: 'add' }`
- **WHEN** the component initializes
- **THEN** form is initialized in create/empty state
- **AND** no pre-existing item data is loaded
- **AND** any item-specific fields are disabled or hidden

#### Scenario: Mode-driven data — Edit mode
- **GIVEN** a dialog opened with `{ mode: 'edit', item: { ...existingData } }`
- **WHEN** the component initializes
- **THEN** form controls are pre-filled with `item` values
- **AND** identity fields (e.g., product selector) are locked/disabled to prevent identity changes
- **AND** mutable fields (quantity, price) remain editable

#### Scenario: Partial data — missing optional fields
- **GIVEN** a dialog opened with `{ mode: 'add', product: { ... } }` but no `item`
- **WHEN** the form initializes
- **THEN** product data is available for reference display
- **AND** form fields that depend on `item` use safe defaults without error

#### Scenario: FormArray consumer pattern
- **GIVEN** a dialog that returns data via `dialogRef.close(payload)`
- **WHEN** the parent component subscribes to `afterClosed()`
- **THEN** the parent pushes the payload into its own `FormArray` or updates an existing `FormGroup`
- **AND** the dialog itself does NOT own or mutate the parent's `FormArray` directly

#### Scenario: REQ-9 — Accessibility audit pass
- **GIVEN** a rendered dialog
- **WHEN** inspected with aXe or manual review
- **THEN** every close button has `aria-label="Close dialog"` and all form fields have associated labels

#### Scenario: REQ-10 — Style isolation
- **GIVEN** a dialog component
- **WHEN** its styles are reviewed
- **THEN** width constraints use `class="max-w-[Npx]"`, not `::ng-deep`
- **AND** any `::ng-deep` usage has a preceding comment explaining why Tailwind cannot achieve the same result

#### Scenario: REQ-11 — Header-body-footer renders correctly
- **GIVEN** a dialog component
- **WHEN** it renders
- **THEN** header contains title, optional status badge, and close button with `aria-label`
- **AND** content body is scrollable below header
- **AND** footer contains CTAs aligned to end
- **AND** header/footer remain fixed when body scrolls

#### Scenario: REQ-11 — Overflow content
- **GIVEN** a dialog with content exceeding viewport
- **WHEN** the dialog renders
- **THEN** only the content body scrolls
- **AND** header and footer stay visible (fixed, non-scrolling)

#### Scenario: REQ-12 — Styling applied on render
- **GIVEN** a dialog component
- **WHEN** inspected
- **THEN** container has `rounded-[32px]`, `shadow-2xl`, `max-h-[95vh]`
- **AND** content body uses custom scrollbar (thin, styled track/thumb)
