# Apply Progress: dialog-view-invoice-pattern

**Date**: 2026-06-22
**Mode**: Standard (openspec)
**Delivery**: single-pr-default with maintainer-approved `size:exception`
**Build verification**: `ng build` passes after each phase

---

## Phase 1: Icon Reversion + Panel Consolidation ✅

### Task 1.1 — 15 migrated dialogs: `<mat-icon>` → `<span class="material-icons">`, rm `MatIconModule`

| # | File | Status |
|---|------|--------|
| 1 | `organisms/transport-dispatch-dialog` | ✅ |
| 2 | `organisms/transport-operation-dialog` | ✅ |
| 3 | `organisms/transport-operation-closure-dialog` | ✅ |
| 4 | `organisms/transport-expense-dialog` | ✅ |
| 5 | `organisms/transport-settle-dialog` | ✅ |
| 6 | `organisms/transport-cancel-dialog` | ✅ |
| 7 | `organisms/transport-standby-dialog` | ✅ |
| 8 | `organisms/transport-change-vehicle-dialog` | ✅ |
| 9 | `organisms/transport-incident-dialog` | ✅ |
| 10 | `organisms/transport-maintenance-dialog` | ✅ |
| 11 | `organisms/anamnesis-dialog` | ✅ |
| 12 | `organisms/physical-exam-dialog` | ✅ |
| 13 | `organisms/diagnostics-dialog` | ✅ |
| 14 | `organisms/incapacity-dialog` | ✅ |
| 15 | `organisms/orders-dialog` | ✅ |

### Task 1.2 — 4 dual-contract dialogs: same reversion

| # | File | Status |
|---|------|--------|
| 1 | `molecules/product-form` | ✅ |
| 2 | `organisms/customer-dialog` | ✅ |
| 3 | `organisms/supplier-dialog` | ✅ |
| 4 | `molecules/invoice-detail` | ✅ |

### Task 1.3 — Reference dialog
- `organisms/invoice-detail-dialog`: Added `aria-label="Cerrar diálogo"` to close button ✅

### Task 1.4 — Panel consolidation
- `organisms/customer-invoices-table`: Replaced `panelClass: 'premium-dialog'` with `DIALOG_PANEL_CLASS` + `DIALOG_WIDTHS.xl`, imported from `dialog.config.ts` ✅

---

## Phase 2: States Addition ✅

### Task 2.1 — 15 migrated dialogs: `loading`/`error` signals + tri-state template
- All 15 dialogs from Task 1.1 updated with `loading = signal(false)`, `error = signal<string | null>(null)` and tri-state `@if` template wrapper ✅

### Task 2.2 — 4 dual-contract dialogs: same addition
- All 4 dialogs from Task 1.2 updated with signals + tri-state template ✅

### Task 2.3 — 3 Pattern B dialogs: same addition
- `organisms/adjustment-detail-dialog` ✅
- `organisms/general-invoice-form-dialog` ✅
- `organisms/adjustment-form-dialog` ✅

---

## Phase 3: Pattern B Migration + Config Expansion ✅

### Task 3.1 — AdjustmentDetailDialog
- Added `inject(MAT_DIALOG_DATA)` typed as `AdjustmentDetailData`
- Added `inject(MatDialogRef)`, replaced `output()` with `dialogRef.close()`
- Added `loading`/`error` signals ✅

### Task 3.2 — GeneralInvoiceFormDialog
- Added `inject(MatDialogRef<..., GeneralInvoiceFormResult>)`
- Added `dialogRef.close(result)` alongside `closed.emit()`
- Added `error` signal for submit failures ✅

### Task 3.3 — AdjustmentFormDialog
- Removed `MatIconModule` import, replaced `<mat-icon>` → `<span class="material-icons">`
- Changed `public data` → private `readonly data: AdjustmentFormData` with typed interface
- Added `AdjustmentFormData` interface
- Added `error` signal + auto-dismiss on submit failure ✅

### Task 3.4 — Config expansion
- `molecules/invoices-table`: Imported `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS`; used in `dialog.open()` ✅
- `molecules/stock-table`: Imported same; used in `dialog.open()` ✅

---

## Files Changed

| File | Phase | Change |
|------|-------|--------|
| `organisms/transport-dispatch-dialog/*.ts` | 1,2 | Icon reversion, rm MatIconModule, states, close btn fix |
| `organisms/transport-settle-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-cancel-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-operation-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-operation-closure-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-expense-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-standby-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-change-vehicle-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-incident-dialog/*.ts` | 1,2 | Same |
| `organisms/transport-maintenance-dialog/*.ts` | 1,2 | Same |
| `organisms/anamnesis-dialog/*.ts` | 1,2 | Same |
| `organisms/physical-exam-dialog/*.ts` | 1,2 | Same |
| `organisms/diagnostics-dialog/*.ts` | 1,2 | Same |
| `organisms/incapacity-dialog/*.ts` | 1,2 | Same |
| `organisms/orders-dialog/*.ts` | 1,2 | Same |
| `molecules/product-form/*.ts` | 1,2 | Same |
| `organisms/customer-dialog/*.ts` | 1,2 | Same |
| `organisms/supplier-dialog/*.ts` | 1,2 | Same |
| `molecules/invoice-detail/*.ts` | 1,2 | Same |
| `organisms/invoice-detail-dialog/*.ts` | 1,3 | Added aria-label |
| `organisms/customer-invoices-table/*.ts` | 1 | Panel consolidation |
| `organisms/adjustment-detail-dialog/*.ts` | 2,3 | States, Pattern B migration |
| `organisms/general-invoice-form-dialog/*.ts` | 2,3 | States, MatDialogRef + error |
| `organisms/adjustment-form-dialog/*.ts` | 1,2,3 | Icon reversion, states, data typing |
| `molecules/invoices-table/*.ts` | 3 | Config expansion |
| `molecules/stock-table/*.ts` | 3 | Config expansion |

## Deviations from Design
1. **invoice-detail (molecules)**: Design stated "Already uses spans — just rm MatIconModule import" — actually uses `<mat-icon>`, so full icon reversion was applied.
2. **`mat-icon-button` removal**: Close buttons with `mat-icon-button` were restyled with reference Tailwind classes to maintain visual consistency after removing the Material directive.
3. **Template wrapping strategy**: Tri-state `@if` wrappers use consistent spinner/error patterns, but each dialog's close button behavior matches its existing button handler (some use `close()`, others `onClose()`, `onClosed()` etc.).

## Remaining Tasks
None — all 11 tasks complete.

## Status
11/11 tasks complete. Ready for verify.
