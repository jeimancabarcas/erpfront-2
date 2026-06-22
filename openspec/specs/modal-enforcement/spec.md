# Spec: Modal Opening Enforcement

## Overview

Enforces that ALL modals in the application are opened via `MatDialog.open()`, never via inline template rendering. This is a **cross-cutting enforcement** over the existing `dialog-pattern` (REQ-1–REQ-12) and `dialog-config` (REQ-1–REQ-6) specs — those specs define *how* dialog organisms behave once opened; this spec defines *how* they are opened in the first place.

## References

| Spec | Requirements | Role |
|------|--------------|------|
| `openspec/specs/dialog-pattern/spec.md` | REQ-1–REQ-12 | Defines dialog component internals (data, close, forms, states, layout, styling, a11y) |
| `openspec/specs/dialog-config/spec.md` | REQ-1–REQ-6 | Defines shared constants (`DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS`) |

## New Requirement

### REQ-13: Modal Opening Pattern [P0]

**Description**: Every dialog or modal component MUST be opened via `MatDialog.open()`. Inline rendering of dialog components in page templates via signals, `@if` blocks, or custom backdrop divs is PROHIBITED.

#### Scenario: MatDialog.open() is the only valid opening mechanism

- GIVEN a page that needs to display a dialog
- WHEN the user triggers the dialog action
- THEN the dialog MUST be opened via `inject(MatDialog).open(Component, config)`
- AND the dialog component MUST NOT appear in the page template (not in HTML, not in `imports`)
- AND the call MUST reference `DIALOG_PANEL_CLASS`, `DIALOG_WIDTHS`, and `...DIALOG_DEFAULTS` from `@shared/constants/dialog.config`
- AND the caller MUST subscribe to `ref.afterClosed()` to handle the result

#### Scenario: Inline rendering is prohibited

- GIVEN any page component in `sales/` or `inventory/`
- WHEN reviewing the component template
- THEN there MUST NOT be any dialog component rendered inline (no `<app-xxx-dialog>` tags in HTML)
- AND there MUST NOT be any `showXxxDialog` signal or boolean controlling dialog visibility
- AND there MUST NOT be any custom backdrop `<div>` with z-index, fixed positioning, or overlay classes
- AND there MUST NOT be any `@if(showXxxDialog)` block containing a dialog component

#### Scenario: ConfirmDeleteDialogOrganism must use MatDialogRef

- GIVEN a component that uses `ConfirmDeleteDialogOrganism`
- WHEN opening it
- THEN it MUST use `dialog.open(ConfirmDeleteDialogOrganism, { ...DIALOG_DEFAULTS, width: DIALOG_WIDTHS.sm, panelClass: DIALOG_PANEL_CLASS })`
- AND the organism MUST receive data via `MAT_DIALOG_DATA` (not `input()`)
- AND the caller MUST close via `dialogRef.close(result)` (not `output()`/`closed.emit()`)

#### Scenario: InvoiceDetailDialogOrganism must be MatDialog-only

- GIVEN `InvoiceDetailDialogOrganism`
- WHEN it is opened
- THEN it MUST use `inject(MAT_DIALOG_DATA)` for data input
- AND it MUST use `inject(MatDialogRef)` with `dialogRef.close()` for closing
- AND it MUST NOT expose `input()` or `output()` properties — all callers go through `MatDialog.open()`

## Anti-Pattern (PROHIBITED)

This section documents the pattern being eliminated. Any occurrence in the codebase SHALL be treated as a violation.

### Inline Signal-Controlled Dialog

```html
<!-- ❌ PROHIBITED — do not use this pattern -->
@if (showCustomerDialog()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-[32px] shadow-2xl max-h-[95vh] ...">
      <app-customer-dialog
        [data]="selectedCustomer"
        (closed)="onCustomerDialogClosed($event)" />
    </div>
  </div>
}
```

**Violations**:
- Dialog component rendered **inline** in the page template
- Custom backdrop `<div>` with manual `z-50`, `fixed`, `inset-0` classes (duplicates Angular Material CDK overlay)
- `showCustomerDialog` signal used to toggle visibility (no focus trap, no `aria-modal`, no escape-to-close)
- `input()`/`output()` binding instead of `MAT_DIALOG_DATA` / `MatDialogRef`
- No access to Angular Material overlay features (backdrop click to close, ESC handling, focus management)

### Correct Pattern

```html
<!-- ✅ Compliant — template has NO dialog component -->
<button (click)="openCustomerDialog()">Edit Customer</button>
```

```typescript
// ✅ Compliant — dialog opened via MatDialog.open()
private readonly dialog = inject(MatDialog);

openCustomerDialog(): void {
  const ref = this.dialog.open(CustomerDialogOrganism, {
    ...DIALOG_DEFAULTS,
    width: DIALOG_WIDTHS.md,
    panelClass: DIALOG_PANEL_CLASS,
    data: { customerId: this.customer().id },
  });

  ref.afterClosed().subscribe((result) => {
    if (result) this.loadCustomers();
  });
}
```
