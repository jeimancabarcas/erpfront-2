# product-selection-dialog Specification

## Purpose

Reusable organism dialog for selecting products and configuring sale line items. Supports Add (new line) and Edit (modify existing line) modes. Displays price references and allows user price override. Returns configured line data via `MatDialogRef.close()` — the parent manages its own `FormArray`.

## Requirements

| ID | Priority | Rule |
|----|----------|------|
| REQ-1 | P0 | Export typed `ProductSelectionDialogData` with `mode: 'add' \| 'edit'`; inject via `inject(MAT_DIALOG_DATA)` with safe defaults for `undefined` |
| REQ-2 | P0 | Add mode: empty form, product selector populates from `ProductService.products`, no pre-filled values |
| REQ-3 | P0 | Edit mode: pre-fill form from `data.item` (productId, name, quantity, unitPrice, reference fields); product locked |
| REQ-4 | P0 | Price panel displays three references: Costo Promedio PMP (`averagePurchasePrice`), Precio Recomendado (`averagePurchasePrice × 1.3`), Precio Configurado (`sellingPrice`) |
| REQ-5 | P0 | User price override via `unitPrice` input, visually distinct from reference prices; default: `sellingPrice \|\| averagePurchasePrice * 1.3` |
| REQ-6 | P0 | Return contract: `dialogRef.close({ productId, name, quantity, unitPrice, referenceSellingPrice, referenceAveragePrice, referenceStock })` on save |
| REQ-7 | P0 | Duplicate products treated as separate lines — NO merge by `productId` |
| REQ-8 | P0 | Cancel/dismiss calls `dialogRef.close()` with no data or `null` |
| REQ-9 | P0 | Validation: `productId` required, `quantity` ≥ 1, `unitPrice` ≥ 0; save disabled when invalid |
| REQ-10 | P0 | Follows dialog-pattern spec: header-body-footer, `loading`/`errorMsg` signals, `FormGroup`, `aria-label` |
| REQ-11 | P1 | Stock limit: quantity MUST NOT exceed `product.currentStock`; violation shows inline error |
| REQ-12 | P1 | Recommended price formula centralized in `shared/utils/price.utils.ts` as `computeRecommendedPrice(avgPurchasePrice: number): number` |
| REQ-13 | P1 | MAT_DIALOG_DATA defaults: `mode` falls back to `'add'`; `item`/`product` default to `undefined` |

## Scenarios

### REQ-1 / REQ-2 — Add mode initialization
- **GIVEN** the dialog is opened with `{ mode: 'add' }`
- **WHEN** the component initializes
- **THEN** form is empty, product selector is enabled, no fields are pre-filled
- **AND** save button is disabled until valid product is selected

### REQ-3 — Edit mode initialization
- **GIVEN** the dialog is opened with `{ mode: 'edit', item: { productId, name, quantity, unitPrice, referenceSellingPrice, referenceAveragePrice, referenceStock } }`
- **WHEN** the component initializes
- **THEN** form fields are pre-filled with item values
- **AND** product selector is disabled (product is locked)
- **AND** quantity and unitPrice are editable

### REQ-4 — Price reference panel display
- **GIVEN** a product is selected with `averagePurchasePrice: 50000` and `sellingPrice: 80000`
- **WHEN** the price panel renders
- **THEN** Costo Promedio shows `$50,000.00`
- **AND** Precio Recomendado shows `$65,000.00` (50000 × 1.3)
- **AND** Precio Configurado shows `$80,000.00`

### REQ-5 — User price override
- **GIVEN** a product with `sellingPrice: 80000` is selected and default `unitPrice` is `80000`
- **WHEN** the user types `75000` in the unitPrice input
- **THEN** the override value `75000` is visually distinct (e.g., different styling or badge)
- **AND** reference prices remain unchanged in the panel
- **AND** on save, `unitPrice: 75000` is returned

### REQ-6 — Save returns line data
- **GIVEN** a valid form with product, quantity, and price
- **WHEN** the user clicks save
- **THEN** `dialogRef.close({ productId, name, quantity, unitPrice, referenceSellingPrice, referenceAveragePrice, referenceStock })` is called

### REQ-7 — Duplicate product creates separate line
- **GIVEN** the parent `FormArray` already has a line with `productId: 'prod-1'`
- **WHEN** the dialog is opened in Add mode, the user selects `prod-1` again, configures it, and saves
- **THEN** the returned data is added as a NEW `FormGroup` in the `FormArray`
- **AND** no existing line quantity is modified

### REQ-8 — Cancel dismisses without data
- **GIVEN** the dialog is open with form partially filled
- **WHEN** the user clicks cancel or presses Escape
- **THEN** `dialogRef.close()` is called with no data
- **AND** the parent's `FormArray` is unchanged

### REQ-9 — Validation blocks invalid save
- **GIVEN** the dialog in Add mode with no product selected
- **WHEN** the user attempts to save
- **THEN** the save button is disabled
- **AND** validation error is shown on the product selector

### REQ-11 — Stock limit enforcement
- **GIVEN** a product with `currentStock: 5` and quantity input at `3`
- **WHEN** the user increments quantity to `6`
- **THEN** an inline error "Stock insuficiente (disponible: 5)" is shown
- **AND** save is disabled

### REQ-12 — Price formula centralized
- **GIVEN** the price panel needs the recommended price
- **WHEN** `computeRecommendedPrice(50000)` is called from `price.utils.ts`
- **THEN** it returns `65000` (50000 × 1.3)
- **AND** no `* 1.3` literal appears outside `price.utils.ts`

### Edge case — Product with no sellingPrice
- **GIVEN** a product with `sellingPrice: 0` and `averagePurchasePrice: 40000`
- **WHEN** the product is selected
- **THEN** default `unitPrice` falls back to `52000` (40000 × 1.3)
- **AND** Precio Configurado displays `$0.00` or "—" as configured price is unavailable

### Edge case — Empty product list
- **GIVEN** `ProductService.products()` returns an empty array
- **WHEN** the dialog opens in Add mode
- **THEN** the product selector shows "No hay productos disponibles"
- **AND** save remains disabled
