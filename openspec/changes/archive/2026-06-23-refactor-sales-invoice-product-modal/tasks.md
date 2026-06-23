# Tasks: Refactor Sales Invoice Product Modal

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~650-750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (price.utils + dialog) → PR 2 (sale-form refactor + cleanup) |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | `price.utils` + `ProductSelectionDialog` + tests | PR 1 | Base: main. New files, no consumers changed. Tests verify in isolation. |
| 2 | SaleForm refactor + `ProductPriceInfo` cleanup + verify | PR 2 | Depends on PR 1. Updates consumer, removes old component. |

## Phase 1: Foundation — price.utils (TDD)

- [x] 1.1 RED: Write `price.utils.spec.ts` — `computeRecommendedPrice` for valid, zero, negative inputs
- [x] 1.2 GREEN: Create `price.utils.ts` — export `PRICE_MARKUP_FACTOR`, `computeRecommendedPrice()`

## Phase 2: Core — ProductSelectionDialog (TDD)

- [x] 2.1 RED: Write `product-selection-dialog.component.spec.ts` — add mode (empty form), edit mode (pre-fill), save returns result, cancel returns undefined, validation (empty product, qty ≤ 0, qty > stock, price ≤ 0), stock limit error, price panel references
- [x] 2.2 GREEN: Create dialog component — typed `ProductSelectionDialogData`/`ProductSelectionDialogResult`, form controls, add/edit modes, product selector, qty/price inputs
- [x] 2.3 GREEN: Implement price reference panel using `computeRecommendedPrice()` — no `* 1.3` literal outside `price.utils`; user override visually distinct

## Phase 3: Integration — SaleForm refactor

- [x] 3.1 MODIFY: Replace inline product `<ui-select>` + `onProductSelected()` with "Añadir Producto" button → `MatDialog.open()` in add mode
- [x] 3.2 MODIFY: Replace inline price input + qty +/- buttons with Edit/Delete action columns; Edit opens dialog in edit mode pre-filled from `FormGroup`
- [x] 3.3 MODIFY: Remove `existingIndex` dedup logic — each `afterClosed` result creates independent `FormGroup` via `FormArray.push()` or `patchValue()`
- [x] 3.4 MODIFY: Keep `onSubmit()` + `CreateInvoiceDto` shape unchanged; remove `isManual`, `MatSlideToggleModule` import
- [x] 3.5 TEST: Update `sale-form.component.spec.ts` — mock `MatDialog`/`MatDialogRef`, assert dialog opens with correct mode data, verify FormArray state after close, assert delete removes row

## Phase 4: Cleanup

- [x] 4.1 DELETE: Remove `product-price-info.component.ts` and any remaining `ProductPriceInfoMolecule` imports
- [x] 4.2 CLEAN: Remove unused `MatTooltipModule`, `MatIconModule`, `MatSlideToggleModule` from sale-form imports

## Phase 5: Verification

- [x] 5.1 RUN: `npx tsc --noEmit` — zero type errors
- [x] 5.2 RUN: `ng build` — production build succeeds
- [x] 5.3 RUN: `npm run test -- --watch=false` — all existing + new tests pass (including integration)
