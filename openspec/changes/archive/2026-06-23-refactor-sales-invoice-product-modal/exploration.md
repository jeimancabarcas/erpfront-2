# Exploration: Refactor Sales Invoice Product Modal

## Current State

The sales invoice creation flow lives in `SaleFormMolecule` (`src/app/components/molecules/sale-form/sale-form.component.ts`), opened via `MatDialog` from `SalesPageComponent` (`src/app/components/pages/sales-page/sales-page.component.ts`). Products are added through an **inline selector** (ui-select) directly in the form body — there is no separate modal for product selection. Once selected, products appear in an editable `MatTable` where price is inline-editable and quantity is adjusted with +/- buttons.

**Current behavior constraints:**
- **Same-product deduplication**: adding the same product twice merges quantities (`addProduct()` checks `existingIndex` and increments qty).
- **No edit modal**: editing is done inline in the table cells (price input, qty buttons).
- **Price references displayed via tooltip** on an info icon: `referenceSellingPrice`, `referenceAveragePrice * 1.3`, `referenceAveragePrice`, `referenceStock`.
- **Delete** is available per row via an icon button.
- **On submit**: builds a `CreateInvoiceDto` and calls `InvoiceService.createInvoice()`.
- **Total**: computed via `totalAmount()` signal iterating over `FormArray` values.

### Key Files

| File | Role |
|------|------|
| `src/app/components/molecules/sale-form/sale-form.component.ts` | **Primary**: Sale form dialog — product selection, pricing, line items |
| `src/app/components/pages/sales-page/sales-page.component.ts` | **Page**: Invoice history list, opens sale form dialog |
| `src/app/models/invoice.model.ts` | **Model**: `Invoice`, `InvoiceItem`, `CreateInvoiceDto` |
| `src/app/models/product.model.ts` | **Model**: `Product` with `sellingPrice`, `averagePurchasePrice` |
| `src/app/services/invoice.service.ts` | **Service**: API calls for invoices (CRUD, PDF generation) |
| `src/app/services/product.service.ts` | **Service**: API calls for products (CRUD, signals-based state) |
| `src/app/services/customer.service.ts` | **Service**: API calls for customers |
| `src/app/models/customer.model.ts` | **Model**: `Customer` interface |
| `src/app/models/pagination.model.ts` | **Model**: `QueryParams`, `PaginatedMeta` |
| `src/app/shared/constants/dialog.config.ts` | **Config**: Shared dialog widths (`DIALOG_WIDTHS`), panel class, defaults |
| `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts` | **Reference**: Reads invoice with items table (detail view only) |
| `src/app/components/organisms/general-invoice-form-dialog/general-invoice-form-dialog.component.ts` | **Reference**: Another invoice form that uses `FormArray` for items |
| `openspec/specs/dialog-pattern/spec.md` | **Spec**: Canonical MatDialog pattern for all dialog organisms |
| `openspec/project.md` | **Project context**: Stack, architecture, conventions |

### Data Flow

```
SalesPageComponent
  └─ [Nueva Venta] → MatDialog.open(SaleFormMolecule)
       ├─ Customer selector → CustomerService.loadCustomers()
       ├─ Product selector → ProductService.products (signals)
       │    └─ onProductSelected() → addProduct() → FormArray.push()
       ├─ Inline MatTable (items FormArray)
       │    ├─ Price input (inline editable)
       │    ├─ Qty +/- buttons
       │    ├─ Delete button
       │    └─ Computed subtotal
       ├─ Total summary
       └─ onSubmit() → InvoiceService.createInvoice(CreateInvoiceDto)
            └─ dialogRef.close(true) → SalesPageComponent reloads
```

### Architecture Assessment

| Concern | Current Approach |
|---------|-----------------|
| **Components** | Standalone (no NgModules) |
| **State Management** | Signals (`signal()`, `computed()`, `toSignal()`) |
| **Dialog Pattern** | `MatDialog` with `MatDialogRef`, `MAT_DIALOG_DATA` |
| **Forms** | Reactive Forms (`FormBuilder`, `FormArray`) |
| **Tables** | `MatTable` from Angular Material |
| **Styling** | Tailwind CSS v4 with indigo palette |
| **Testing** | Vitest with `TestBed`, strict TDD enabled |
| **Dialog Spec** | Canonical pattern: header-body-footer, typed data, loading/error states |

---

## Target State Analysis

Based on the user's requirements:

### New Modal Component: `ProductSelectionDialog` (or similar)

A dedicated dialog opened when clicking "Añadir Producto" from the sale form. It serves **two modes**:

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Add** | "Añadir Producto" button | Empty form, selects new product for the sale |
| **Edit** | "Edit" button on an existing line item row | Pre-filled with existing product, quantity, and price |

### Modal Contents

1. **Product Selector**
   - Searchable product picker (ui-select with backend search or local filter)
   - Display: product name, SKU, current stock

2. **Price Information Panel**
   - Costo Promedio (Average Purchase Cost) → `product.averagePurchasePrice`
   - Precio de Venta Recomendado (Recommended Sale Price) → could be `averagePurchasePrice * markup%` or a separate field
   - Precio de Venta Configurado (Configured Sale Price) → `product.sellingPrice`
   - User-configurable price override input

3. **Quantity Input**
   - Numeric input with min validation
   - Stock limit validation

4. **Actions**
   - Save → adds/updates the line item
   - Cancel → closes modal without changes

### Updated Table: Invoice Line Items

| Column | Content | Editable? |
|--------|---------|-----------|
| Producto | Product name + SKU | No |
| Precio Unit. | Current unit price | Via Edit modal |
| Cantidad | Current quantity | Via Edit modal |
| Subtotal | Computed `price * qty` | No (auto) |
| Acciones | Edit / Delete buttons | Action triggers |

### Key Behavioral Changes from Current State

1. **Allow duplicate products**: Remove the `existingIndex` merge logic. Each add creates a new line item regardless of product uniqueness.
2. **Add/Edit modes**: Modal opens empty for "Add", pre-filled for "Edit". Needs to distinguish which mode is active (via `MAT_DIALOG_DATA`).
3. **Row-level Edit**: Clicking Edit opens the same modal with item data, changes update the existing `FormGroup` in the `FormArray`.
4. **Row-level Delete**: Remove the `FormGroup` from the `FormArray`.
5. **Price override**: Clear visual distinction between reference prices and the user-set override price.

---

## Affected Areas

| Path | Impact |
|------|--------|
| `src/app/components/molecules/sale-form/sale-form.component.ts` | **Major refactor**: Remove inline product selector, add "Añadir Producto" button, replace inline table edit with modal-driven edit, remove product dedup logic |
| `src/app/components/organisms/product-selection-dialog/` *(new)* | **Create**: New organism dialog for product selection with price info panel |
| `src/app/models/invoice.model.ts` | **Potential update**: Add/edit mode types or dialog data interfaces |
| `src/app/models/product.model.ts` | **Potential update**: Add `recommendedSellingPrice` or `markupPercentage` if needed |
| `src/app/shared/constants/dialog.config.ts` | No change expected (reuse existing dialog widths/panel) |
| `openspec/specs/dialog-pattern/spec.md` | No change (the new dialog follows existing pattern) |

---

## Approaches

### 1. Dedicated Product Selection Organism (Recommended)

Create a standalone `ProductSelectionDialogOrganism` at `organisms/product-selection-dialog/`.

- **Structure**: Full standalone component following the dialog-pattern spec (typed data, MAT_DIALOG_DATA, MatDialogRef, header-body-footer, loading/error states).
- **Mode**: `Add` or `Edit` driven by `MAT_DIALOG_DATA` (e.g. `{ mode: 'add' }` or `{ mode: 'edit', item: FormGroupValue }`).
- **Returns**: Updated item data `{ productId, name, quantity, unitPrice, referenceSellingPrice, referenceAveragePrice }`.
- **Integration**: `SaleFormMolecule` opens the dialog via `MatDialog.open()` on "Añadir Producto" and on each row's "Edit" button.
- **Price info**: Shows `averagePurchasePrice`, a computed `recommendedPrice`, and `sellingPrice` as reference cards; user enters override in a text-input.

**Pros:**
- Clean separation of concerns (modal is self-contained)
- Reusable if other modules need product selection
- Follows existing dialog pattern spec perfectly
- Easy to test in isolation
- Add and Edit modes share the same component

**Cons:**
- More files to create
- Requires passing state between form and dialog

**Effort**: Medium

### 2. Inline Expansion Panel (Alternative)

Keep the product selector inline but use a Material expansion panel or card that expands with the price info section.

**Pros:**
- Less navigation, everything visible on one screen
- No dialog state to manage

**Cons:**
- Cluttered UI — the user explicitly asked for a modal
- Harder to add Edit mode (inline editing already exists and is what they want to replace)
- Violates user request for a modal

**Effort**: Low-Medium

### 3. Hybrid: Inline Product Selector + Price Info Modal

Keep the inline product selector as-is but add a separate price info dialog that shows when a product is selected or when editing.

**Pros:**
- Minimal changes to existing code
- Quick to implement

**Cons:**
- Inconsistent UX (hybrid inline/modal)
- Still doesn't address the full modal requirement
- Adds complexity for edit mode coordination

**Effort**: Low

---

## Recommendation

**Approach 1: Dedicated Product Selection Organism.** It directly matches the user's vision: a single modal that serves both Add and Edit, with clear price info display and user-configurable override. It aligns with the existing architecture (standalone components, MatDialog, signals, reactive forms) and follows the established dialog-pattern spec. The refactor in `SaleFormMolecule` is moderate but well-scoped — remove inline product selection, replace with open-dialog logic, and route Add/Edit through the same modal.

### Implementation Sketch

1. **Create** `organisms/product-selection-dialog/product-selection-dialog.component.ts`
   - Dialog data interface: `{ mode: 'add' | 'edit'; product?: Product; item?: InvoiceItemFormValue }`
   - Form controls: `productId`, `quantity`, `unitPrice`
   - Display-only computed values: `averageCost`, `recommendedPrice`, `configuredPrice`
   - Return: `{ productId, name, quantity, unitPrice }`
   - Follow dialog-pattern spec (header-body-footer, loading, error, typed data, aria-labels)

2. **Refactor** `molecules/sale-form/sale-form.component.ts`
   - Replace inline product `ui-select` + `onProductSelected()` with an "Añadir Producto" button that opens the new dialog
   - Replace inline price editing with an "Edit" button per row that opens the same dialog in edit mode
   - Remove `existingIndex` merge logic → allow duplicate products
   - Keep `FormArray` for items, but update items via dialog return values
   - Keep total computation and submit logic as-is

3. **Update** the items table columns
   - Keep: Product info, Price Unit., Cantidad, Subtotal
   - Replace inline controls with Edit/Delete action buttons
   - Keep Delete button behavior

---

## Risks

| Risk | Mitigation |
|------|------------|
| **Backend may not expect duplicate productIds** in `CreateInvoiceDto.items[]` | Verify backend accepts multiple items with same `productId`. If not, this change requires a backend update too. |
| **Price reference fields** (`recommendedSellingPrice`): `product.sellingPrice` is the configured price, `averagePurchasePrice` is the cost. The "recommended" price may need a new field or be computed client-side | Define recommended as `averagePurchasePrice * 1.3` (current tooltip logic) or add a `markupPercentage` to the Product model. Clarify with user. |
| **Dialog pattern spec** requires loading/error states; the new dialog doesn't load async data (products are already loaded via service signal) | Add a loading state mock or keep it minimal — spec allows `undefined`/partial data handling |
| **Edit mode** needs to identify which `FormGroup` index to update | Pass the `FormGroup` index or the item data; ref. by index or productId + index combination |
| **Strict TDD** is enabled — tests must be written before implementation | Plan test files alongside component creation |

---

## Ready for Proposal

**Yes.** The target state is well-defined, the architecture is clear, and the changes are scoped. Proceed to `sdd-propose` with the following context for the user:

- **Confirm**: Does "Precio de Venta Recomendado" match the current tooltip formula (`averagePurchasePrice * 1.3`) or should it come from a different source?
- **Confirm**: Does the backend `POST /sales/invoices` accept duplicate `productId` entries in the items array?
- **Confirm**: Should the new dialog live as an Organism under `organisms/product-selection-dialog/`?
