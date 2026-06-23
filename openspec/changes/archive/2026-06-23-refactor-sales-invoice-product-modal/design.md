# Design: Refactor Sales Invoice Product Modal

## Technical Approach

Create `ProductSelectionDialogComponent` (standalone organism) following the dialog-pattern spec — `MAT_DIALOG_DATA` for typed input, `MatDialogRef.close()` for typed output, signals for internal state, Reactive Forms for product/qty/price controls. The dialog serves **Add** (empty form) and **Edit** (pre-filled with existing line item) via `mode` data flag. `SaleFormMolecule` opens it on "Add Product" and on each row's "Edit" button. The existing inline product selector and inline price editing are removed; the `MatTable` displays items read-only with Edit/Delete action columns. Price reference logic moves to a shared utility `shared/utils/price.utils.ts`. Duplicate product merge logic is removed — each add creates an independent line.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| **Dialog vs inline panel** | Inline clutters form, makes edit mode ambiguous. Dialog gives focused two-mode UX, follows existing pattern | ✅ **Dialog organism** |
| **Reuse `ProductPriceInfoMolecule`** | Molecule is 3 hardcoded badges with `* 1.3` markup. Centralized utility is cleaner, dialog absorbs the pattern inline | ✅ **Retire molecule, use price.utils** |
| **`<mat-icon>` vs `<span class="material-icons">`** | Dialog spec prohibits `<mat-icon>`. Existing code uses it. New dialog follows the spec | ✅ **`<span class="material-icons">`** |
| **Index vs productId edit lookup** | Duplicates allowed so productId is non-unique. FormArray index is deterministic | ✅ **Index-based edit** |
| **FormBuilder group vs typed model push** | FormBuilder keeps consistency with existing `FormArray` pattern in the component | ✅ **FormBuilder group** |

## Data Flow

```
SaleFormMolecule
  ├─ "Add Product" clicked
  │   └─ MatDialog.open(ProductSelectionDialog, { data: { mode: 'add' } })
  │       └─ afterClosed() → result: ProductSelectionDialogResult | undefined
  │           └─ FormArray.push(fb.group(result))
  ├─ "Edit" on row i
  │   └─ MatDialog.open(ProductSelectionDialog, {
  │         data: { mode: 'edit', lineItem: items.at(i).value, index: i }
  │       })
  │       └─ afterClosed() → result → items.at(i).patchValue(result)
  └─ "Delete" on row i → items.removeAt(i)

Dialog internal:
  ProductSelectionDialogComponent
    ├─ OnInit: if edit, pre-fill form from lineItem
    ├─ Product select → ProductService.products signal
    ├─ Computed referencePrices (averageCost, recommended, configured)
    ├─ Price override input (user-editable, validated > 0)
    └─ Save → dialogRef.close(ProductSelectionDialogResult)
```

## Component Tree

```
SaleFormMolecule (dialog host)
  ├── Items Table (MatTable — read-only display: product, price, qty, subtotal, actions)
  │     └── Action buttons: Edit (pencil icon), Delete (trash icon)
  ├── "Add Product" Button → opens ProductSelectionDialogComponent
  └── ProductSelectionDialogComponent (new organism)
        ├── Header: mode-dynamic title + close button
        ├── Product Selector (MatSelect with search, via ui-select)
        ├── Price Reference Panel (3 cards: PMP, Recommended, Configured)
        ├── Quantity Input (numeric, min=1, max=stock)
        ├── Price Input (numeric, editable, > 0)
        └── Footer: Cancel + Save buttons
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/organisms/product-selection-dialog/product-selection-dialog.component.ts` | Create | Dialog organism: product selector, price panel, qty/price inputs, add/edit modes |
| `src/app/components/organisms/product-selection-dialog/product-selection-dialog.component.spec.ts` | Create | Unit tests: both modes, validation, price refs, save/cancel |
| `src/app/shared/utils/price.utils.ts` | Create | `PRICE_MARKUP_FACTOR = 1.3`, `computeRecommendedPrice()` |
| `src/app/shared/utils/price.utils.spec.ts` | Create | Pure function tests for price utility |
| `src/app/components/molecules/sale-form/sale-form.component.ts` | Modify | Remove inline selector, replace add/edit with dialog openers, remove dedup logic |
| `src/app/components/molecules/sale-form/sale-form.component.spec.ts` | Modify | Update tests to assert dialog interaction instead of inline editing |
| `src/app/components/molecules/product-price-info/product-price-info.component.ts` | Delete | Retired — price info pattern absorbed into dialog and price.utils |

## Interfaces / Contracts

```typescript
// src/app/components/organisms/product-selection-dialog/product-selection-dialog.component.ts

export interface ProductSelectionDialogData {
  mode: 'add' | 'edit';
  lineItem?: InvoiceLineItemFormValue;
  index?: number;
}

export interface ProductSelectionDialogResult {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  referenceSellingPrice: number;
  referenceAveragePrice: number;
}

// src/app/shared/utils/price.utils.ts
export const PRICE_MARKUP_FACTOR = 1.3;
export const computeRecommendedPrice = (avgPurchasePrice: number): number =>
  avgPurchasePrice * PRICE_MARKUP_FACTOR;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `computeRecommendedPrice` — valid, zero, negative | Pure function, no TestBed |
| Unit | `ProductSelectionDialog` — add mode renders empty, edit mode pre-fills, product select updates refs, validation errors (empty product, qty <= 0, qty > stock, price <= 0), save closes with result, cancel closes with undefined | `TestBed` with mock `MatDialogRef` + `MAT_DIALOG_DATA`, mock `ProductService` |
| Integration | `SaleFormMolecule` — "Add Product" opens dialog with correct mode data, "Edit" opens dialog with line item pre-fill, dialog result inserts/updates FormArray, delete removes row, duplicate products create independent rows | `TestBed` with mock `MatDialog`, assert `FormArray` state after dialog close |

## Migration / Rollout

No migration required — frontend-only change. `CreateInvoiceDto` shape is unchanged. The only behavioral delta (duplicate product IDs allowed) is a frontend relaxation; verify backend accepts duplicate `productId` entries in `items[]`.

## Open Questions

- [ ] Does the backend `POST /sales/invoices` accept duplicate `productId` entries in `items[]`?
- [ ] Should `SaleFormMolecule` also migrate from `<mat-icon>` to `<span class="material-icons">` for consistency with the dialog-pattern spec, or only the new dialog?
