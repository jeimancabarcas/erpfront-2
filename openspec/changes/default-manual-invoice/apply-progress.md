# Apply Progress — default-manual-invoice

## Mode
Strict TDD | Hybrid persistence

## Completed Tasks

### Phase 4: Model + Service
- [x] 4.1 Add `factusNumber?: string` to Invoice model/interface
- [x] 4.2 Add `emitInvoice(id: string): Observable<Invoice>` to InvoiceService

### Phase 5: Toggle inversion (sale-form)
- [x] 5.1 Replace `isManual = signal(false)` with `isElectronic = signal(false)`
- [x] 5.2 Toggle label: "Venta manual" (warn) → "Factura electrónica" (primary)
- [x] 5.3 Warning/info messages: amber when manual, green when electronic
- [x] 5.4 `onSubmit`: `isElectronic: this.isElectronic()`
- [x] 5.5 Keep `MatSlideToggleModule` import

### Phase 6: Emit button (invoice-detail-dialog)
- [x] 6.1 Add "Emitir Electrónicamente" button when `!inv.isElectronic && !inv.factusNumber`
- [x] 6.2 Call `invoiceService.emitInvoice(id)`
- [x] 6.3 On success: refresh invoice data in the dialog
- [x] 6.4 On error: show error

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4.1 | `src/app/models/invoice.model.spec.ts` | Unit | N/A (new) | ✅ Written | ✅ Passed | ✅ 2 cases | ➖ None needed |
| 4.2 | `src/app/services/invoice.service.spec.ts` | Unit | N/A (new) | ✅ Written | ✅ Passed | ✅ 2 cases | ➖ None needed |
| 5.1-5.5 | `src/app/components/molecules/sale-form/sale-form.component.spec.ts` | Unit | ✅ 9/9 | ✅ Written | ✅ Passed | ✅ 2 cases (manual + electronic) | ➖ None needed |
| 6.1-6.4 | `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.spec.ts` | Unit | N/A (new) | ✅ Written | ✅ Passed | ✅ 4 cases (visible, hidden electronic, hidden emitted, error) | ➖ None needed |

## Test Summary
- **Total tests written**: 10 new (2 model + 2 service + 2 sale-form + 6 invoice-detail)
- **Total tests passing**: 201 (26 test files)
- **Layers used**: Unit (10)
- **Approval tests**: 0 (no refactoring-only tasks)
- **Pure functions created**: 0

## Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `src/app/models/invoice.model.ts` | Modified | Added `factusNumber?: string` field |
| `src/app/services/invoice.service.ts` | Modified | Added `emitInvoice(id)` method |
| `src/app/components/molecules/sale-form/sale-form.component.ts` | Modified | Replaced `isManual` with `isElectronic`, updated template toggle, warning, and DTO |
| `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts` | Modified | Added emit button, `emitInvoice()` method, `emitLoading`/`emitError` signals, error display |
| `src/app/models/invoice.model.spec.ts` | Created | Tests for `factusNumber` field |
| `src/app/services/invoice.service.spec.ts` | Created | Tests for `emitInvoice` method |
| `src/app/components/molecules/sale-form/sale-form.component.spec.ts` | Modified | Updated existing tests for new signal + DTO behavior |
| `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.spec.ts` | Created | Tests for emit button visibility, click, success, and error |

## Deviations from Design
None — implementation matches spec.

## Issues Found
None.

## Remaining Tasks
No remaining tasks for this change.

## Status
8/8 tasks complete. Ready for verify.
