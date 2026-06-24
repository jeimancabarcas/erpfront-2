# Apply Progress — factura-electronica-impuestos (Frontend)

## Mode
Strict TDD | Hybrid persistence

## Completed Tasks

### Phase 3: Frontend — Invoice Model
- [x] **T-09**: Add `InvoiceItemTax` interface to `src/app/models/invoice.model.ts`
- [x] **T-10**: Add `taxAmount?: number` + `taxes?: InvoiceItemTax[]` to `InvoiceItem`

### Phase 4: Frontend — Invoice Detail Display
- [x] **T-11**: Add "Impuestos" column per item row in `invoice-detail-dialog.component.ts` template
- [x] **T-12**: Add invoice-level tax summary section with per-tax-code breakdown and total
- [x] **T-13**: Vitest tests — renders tax column when `item.taxes` present, hides when absent, grouped summary

### Phase 5: Frontend — Sale Form Tax Summary
- [x] **T-14**: Update `sale-form.component.ts` — compute tax items when adding/editing products, show subtotal + per-tax breakdown + total in totals card
- [x] **T-15**: Vitest tests — tax breakdown renders correctly with mock items

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| T-13 | `invoice-detail-dialog.component.spec.ts` | Unit | ✅ 17 existing | ✅ Written | ✅ Passed | ✅ 5 cases | ➖ None needed |
| T-15 | `sale-form.component.spec.ts` | Unit | ✅ 11 existing | ✅ Written | ✅ Passed | ✅ 6 cases | ➖ None needed |

## Test Summary
- **Total tests written**: 11 new (5 invoice-detail-dialog + 6 sale-form)
- **Total tests passing**: 268 (39 test files)
- **Layers used**: Unit (11)
- **Approval tests**: 0

## Files Changed
| File | Action | Description |
|------|--------|-------------|
| `src/app/models/invoice.model.ts` | Modified | Added `InvoiceItemTax` interface, updated `InvoiceItem` with `taxAmount`, `taxes` |
| `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts` | Modified | Added `taxSummary` + `totalTaxAmount` computed, "Impuestos" column, tax summary section |
| `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.spec.ts` | Modified | Added 5 tests for tax display |
| `src/app/components/molecules/sale-form/sale-form.component.ts` | Modified | Added `computeTaxItems()`, `subtotalAmount`/`taxSummaries` signals, updated product add/edit, totals card template |
| `src/app/components/molecules/sale-form/sale-form.component.spec.ts` | Modified | Added 6 tests for tax breakdown |
