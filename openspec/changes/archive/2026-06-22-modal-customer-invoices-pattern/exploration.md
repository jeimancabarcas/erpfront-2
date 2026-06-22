# Exploration: Modal Customer Invoices Pattern

## Summary

The codebase has **two fundamentally different modal strategies** in production:
- **Canonical MatDialog**: `inject(MatDialog).open(Component, config)` with `dialog.config.ts` constants — used in transport, billing, agenda, and consultation modules (10+ pages, 25+ dialog opens). All compliant.
- **Anti-Pattern C1 (Inline signal toggle)**: `showDialog.set(true)` + `<div class="fixed inset-0 z-50...">` custom backdrop — used in 7 pages across sales and inventory modules (13 inline modal instances). Each one wraps a dialog component via `[data]` input binding + `(closed)` output binding instead of `MatDialog.open()`.

Additionally, there are **2 hybrid components** (`InvoiceDetailDialogOrganism`, `GeneralInvoiceFormDialogOrganism`) that support both `MatDialogRef` injection AND `input()/output()` — the root cause enabling the anti-pattern. The `GeneralInvoiceFormDialogOrganism` is **orphan code** (no caller).

## Canonical Pattern (Reference)

### File: `src/app/components/organisms/customer-invoices-table/customer-invoices-table.component.ts`

```typescript
// Lines 155-175
private dialog = inject(MatDialog);

viewInvoiceDetail(invoice: Invoice) {
  this.dialog.open(InvoiceDetailDialogOrganism, {
    data: { invoiceId: invoice.id },
    panelClass: DIALOG_PANEL_CLASS,
    width: DIALOG_WIDTHS.xl
  });
}
```

### Key characteristics:
- Uses `inject(MatDialog).open(Component, MatDialogConfig)`
- Config uses `DIALOG_PANEL_CLASS` and `DIALOG_WIDTHS` from `dialog.config.ts`
- Passes data via `data: { ... }` in the config object (not `[data]` input binding)
- Proper Material CDK overlay with built-in animation, focus trap, and ARIA
- Result retrieval via `afterClosed().subscribe()` (not `(closed)` output)
- Page component NEVER renders the dialog component in its template — no inline HTML

### `dialog.config.ts` reference:
```typescript
export const DIALOG_WIDTHS = {
  sm: '500px', md: '600px', lg: '850px', xl: '950px'
} as const;
export const DIALOG_PANEL_CLASS = 'erp-dialog-panel';
export const DIALOG_DEFAULTS = {
  maxWidth: '95vw', disableClose: false
} as const;
```

---

## Non-Conforming Modals Inventory

### Anti-Pattern C1: Signal Toggle + Custom Backdrop + `[data]` Input Binding

Each page creates its own backdrop div with `fixed inset-0 z-50`, manages a boolean `signal`, and passes data via `[data]` input bindings instead of `MatDialog.open()`.

| # | Page File | Dialog Component | Signal | Backdrop | Data Binding | Close Method |
|---|-----------|-----------------|--------|----------|-------------|-------------|
| 1 | `sales-page/sales-page.component.ts` | `SaleFormMolecule` | `showSaleForm` | `fixed inset-0 z-50` | N/A (no data) | `(closed)` → `showSaleForm.set(false)` |
| 2 | `sales-page/sales-page.component.ts` | `InvoiceDetailDialogOrganism` | `showDetailDialog` | `fixed inset-0 z-50` | `[data]="{ invoiceId: detailInvoiceId() }"` | `(closed)` → `showDetailDialog.set(false)` |
| 3 | `sales-page/sales-customers-page/` | `CustomerDialogOrganism` | `showCustomerDialog` | `fixed inset-0 z-50` | `[data]="{ customer: customerDialogData() }"` | `(closed)` → signal set false |
| 4 | `sales-page/sales-customers-page/` | `ConfirmDeleteDialogOrganism` | `showDeleteDialog` | `fixed inset-0 z-50` | `[data]="deleteDialogData()"` | `(closed)` → signal set false |
| 5 | `inventory-page/inventory-products-page/` | `ProductFormMolecule` | `showProductDialog` | `fixed inset-0 z-50` | `[data]="{ product: productDialogData() }"` | `(closed)` → signal set false |
| 6 | `inventory-page/inventory-products-page/` | `InventoryBatchDialogOrganism` | `showBatchDialog` | `fixed inset-0 z-50` | `[product]="batchDialogProduct()"` (named input) | `(closed)` → signal set false |
| 7 | `inventory-page/inventory-products-page/` | `ConfirmDeleteDialogOrganism` | `showDeleteDialog` | `fixed inset-0 z-50` | `[data]="deleteDialogData()"` | `(closed)` → signal set false |
| 8 | `inventory-page/inventory-suppliers-page/` | `SupplierDialogOrganism` | `showSupplierDialog` | `fixed inset-0 z-50` | `[data]="{ supplier: supplierDialogData() }"` | `(closed)` → signal set false |
| 9 | `inventory-page/inventory-suppliers-page/` | `ConfirmDeleteDialogOrganism` | `showDeleteDialog` | `fixed inset-0 z-50` | `[data]="deleteDialogData()"` | `(closed)` → signal set false |
| 10 | `inventory-page/inventory-categories-page/` | `CategoryDialogOrganism`* | `showCategoryDialog` | `fixed inset-0 z-50` | `[data]="{ category: categoryDialogData() }"` | `(closed)` → signal set false |
| 11 | `inventory-page/inventory-categories-page/` | `ConfirmDeleteDialogOrganism` | `showDeleteDialog` | `fixed inset-0 z-50` | `[data]="deleteDialogData()"` | `(closed)` → signal set false |
| 12 | `inventory-page/inventory-purchases-page/` | `PurchaseOrderDialogOrganism` | `showOrderDialog` | `fixed inset-0 z-50` | `[data]="{ order: orderDialogData() }"` | `(closed)` → signal set false |
| 13 | `inventory-page/inventory-purchases-page/` | `PurchaseOrderDetailDialogOrganism` | `showDetailDialog` | `fixed inset-0 z-50` | `[data]="{ order: detailDialogOrder() }"` | `(closed)` → signal set false |

\* CategoryDialogOrganism selector not yet confirmed — name inferred from pattern.

### Nested Anti-Pattern (inside SaleFormMolecule)

| # | Parent | Dialog Component | Signal | How Opens | How Closes |
|---|--------|-----------------|--------|-----------|------------|
| 14 | `sale-form/sale-form.component.ts` (line 457) | `CustomerDialogOrganism` | `showCreateCustomerDialog` | `showCreateCustomerDialog.set(true)` + custom backdrop `z-[60]` | `(closed)` → `showCreateCustomerDialog.set(false)` |

### Pattern Code Sample (Anti-Pattern C1)

```html
<!-- From sales-page.component.ts lines 187-193 -->
@if (showDetailDialog()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
       (click)="showDetailDialog.set(false)">
    <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-[950px] max-h-[95vh] overflow-y-auto"
         (click)="$event.stopPropagation()">
      <app-invoice-detail-dialog [data]="{ invoiceId: detailInvoiceId() }"
                                  (closed)="showDetailDialog.set(false)" />
    </div>
  </div>
}
```

**Problems with this pattern:**
1. **No Material CDK overlay** — no focus trap, no escape-key handling, no `aria-modal`
2. **Background scroll** — body scroll is not locked, unlike `MatDialog`
3. **Animation** — no built-in enter/leave animations through the CDK
4. **Z-index** — hardcoded `z-50`/`z-[60]` instead of CDK-managed stacking
5. **Accessibility** — no `aria-hidden` on background content
6. **Code duplication** — every page copy-pastes the same backdrop div structure
7. **Memory leak risk** — backdrop click calls `signal.set(false)` directly, unlike MatDialog cleanup
8. **No `afterClosed()`** — results handled via `output()` emissions, inconsistent with canonical pattern

---

## Anti-Pattern C2: Hybrid Components (Dual-Mode)

These components inject `MatDialogRef` AND declare `input()`/`output()` — enabling both proper MatDialog usage AND inline misuse.

| Component | File | MatDialogRef | input() | output() | Callers |
|-----------|------|-------------|---------|----------|---------|
| `InvoiceDetailDialogOrganism` | `organisms/invoice-detail-dialog/` | `inject(MatDialogRef, { optional: true })` | `data = input<any>()` | `closed = output<void>()` | `CustomerInvoicesTableOrganism` (proper) + `SalesPageComponent` (inline) |
| `GeneralInvoiceFormDialogOrganism` | `organisms/general-invoice-form-dialog/` | `inject(MatDialogRef)` | none | `closed = output<FinanceInvoice \| null>()` | **NONE** — orphan code |

### `InvoiceDetailDialogOrganism` Dual-Mode Detail (lines 288-331):

```typescript
// Supports BOTH MatDialog data AND inline [data] input:
data = input<any>({});
closed = output<void>();
private dialogRef = inject(MatDialogRef<InvoiceDetailDialogOrganism>, { optional: true });
private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

ngOnInit() {
  const merged = { ...(this.dialogData || {}), ...this.data() };
  // ...fetches invoice by merged.invoiceId
}

close() {
  if (this.dialogRef) { this.dialogRef.close(); }  // for MatDialog
  this.closed.emit();                               // for inline
}
```

This dual-mode is the **architectural root cause** — it allows components to be rendered both ways, and pages choose the inline path (less code upfront, more debt).

---

## Anti-Pattern C3: `ConfirmDialogMolecule` — Unused Custom Dialog

**File**: `src/app/components/molecules/confirm-dialog/confirm-dialog.component.ts`

This is a **standalone custom dialog** with its own CSS backdrop (`.dialog-backdrop { position: fixed; inset: 0; z-index: 50; }`), managed by `[open]` input + `(confirm)`/`(cancel)` outputs.

**Usage**: **ZERO production usage** — only referenced in its own spec file (`confirm-dialog.component.spec.ts`).

The actual delete confirmation used throughout the codebase is `ConfirmDeleteDialogOrganism` (from `organisms/confirm-delete-dialog/`), which is itself opened via the C1 anti-pattern (inline custom backdrop in 4 pages).

**Verdict**: `ConfirmDialogMolecule` is dead code. The `ConfirmDeleteDialogOrganism` does need migration but as part of the C1 pattern in the pages that use it.

---

## `dialog.open()` Without `dialog.config.ts`

**All 25+ `dialog.open()` callers use `dialog.config.ts` constants.** No violations found.

### Compliant dialog.open() callers (verified):

| Page/Component | Dialog Count | Imports Verified |
|---------------|-------------|-----------------|
| `CustomerInvoicesTableOrganism` | 1 | `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS` |
| `InvoicesTableMolecule` | 1 | `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS` |
| `StockTableMolecule` | 1 | `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS` |
| `BillingPageComponent` | 1 | All 3 constants |
| `ConsultationPageComponent` | 5 | All 3 constants |
| `AgendaPageComponent` | 3 | All 3 constants |
| `ServiceDetailPageComponent` | 10 | All 3 constants |
| `VehicleDetailPageComponent` | 1 | All 3 constants |
| `TransportDashboardViewComponent` | 2 | All 3 constants |
| `TransportTrackingViewComponent` | 1 | All 3 constants |

---

## Complete Inventory by Module

### SALES Module — ALL inline, needs migration

- `sales-page.component.ts` — 2 inline modals (SaleFormMolecule + InvoiceDetailDialogOrganism)
- `sales-customers-page.component.ts` — 2 inline modals (CustomerDialogOrganism + ConfirmDeleteDialogOrganism)
- `sale-form.component.ts` — 1 nested inline modal (CustomerDialogOrganism)
- `sales-customer-detail-page.component.ts` — uses `CustomerInvoicesTableOrganism` (PROPER — uses MatDialog internally)

### INVENTORY Module — ALL inline, needs migration

- `inventory-products-page.component.ts` — 3 inline modals
- `inventory-suppliers-page.component.ts` — 2 inline modals
- `inventory-categories-page.component.ts` — 2 inline modals
- `inventory-purchases-page.component.ts` — 2 inline modals

### TRANSPORT Module — ALL compliant

- All 4 transport pages use `MatDialog.open()` with `dialog.config.ts` ✅

### BILLING Module — compliant

- `billing-page.component.ts` uses `MatDialog.open()` with `dialog.config.ts` ✅

### AGENDA Module — compliant

- `agenda-page.component.ts` uses `MatDialog.open()` with `dialog.config.ts` ✅

### CONSULTATION Module — compliant

- `consultation-page.component.ts` uses `MatDialog.open()` with `dialog.config.ts` ✅

---

## Migration Complexity Assessment

### High-Risk Migrations

1. **`SaleFormMolecule` (799 lines)** — opening this via `MatDialog` requires:
   - Removing `closed = output<boolean>()` and replacing with `dialogRef.close(result)`
   - Removing the nested inline `CustomerDialogOrganism` and opening it as a proper MatDialog
   - Injecting `MatDialogRef` and `MAT_DIALOG_DATA` for data reception
   - The form submission result (`closed.emit(true)`) must become `dialogRef.close(true)`
   - 799 lines of complex form logic with product/customer autocomplete

2. **`InvoiceDetailDialogOrganism`** — already partially migrated (has `MatDialogRef`). Must:
   - Remove `data = input<any>()` and `closed = output<void>()`
   - Keep only `MAT_DIALOG_DATA` injection (not optional)
   - Then migrate `SalesPageComponent` to use `MatDialog.open()` instead of inline rendering

3. **`ConfirmDeleteDialogOrganism`** — used in 4 pages as inline. Must:
   - Remove `input()`/`output()` API
   - Add `MatDialogRef` close pattern
   - Migrate all 4 callers (`SalesCustomersPage`, `InventoryProductsPage`, `InventorySuppliersPage`, `InventoryCategoriesPage`)

### Medium-Risk Migrations

4. **`PurchaseOrderDialogOrganism` + `PurchaseOrderDetailDialogOrganism`** — complex forms, must be adapted to MatDialog data pattern

### Low-Risk Migrations

5. **`ProductFormMolecule`** — already works with MatDialog (used by `StockTableMolecule` via `dialog.open()`). Just needs `SalesPageComponent` and `InventoryProductsPage` to switch from inline to `dialog.open()`
6. **`SupplierDialogOrganism`** — straightforward form dialog
7. **`CustomerDialogOrganism`** — used in 2 places (`SalesCustomersPage` and nested in `SaleFormMolecule`)
8. **`InventoryBatchDialogOrganism`** — simple dialog

---

## Recommendations

### P0 (Critical — enables all other migrations):
1. **Refactor `InvoiceDetailDialogOrganism`** — remove dual-mode, keep only MatDialog. Then fix `SalesPageComponent` caller.
2. **Refactor `ProductFormMolecule`** — already MatDialog-compatible (used by `StockTableMolecule`). Just fix inline callers.

### P1 (High Impact):
3. **`SaleFormMolecule`** — the 799-line beast. Full MatDialog migration.
4. **`ConfirmDeleteDialogOrganism`** — affects 4 pages. Remove inline rendering.
5. **`SalesCustomersPageComponent`** — migrate 2 inline modals.

### P2 (Inventory Pages):
6. **`InventoryProductsPageComponent`** — 3 inline modals
7. **`InventorySuppliersPageComponent`** — 2 inline modals
8. **`InventoryCategoriesPageComponent`** — 2 inline modals
9. **`InventoryPurchasesPageComponent`** — 2 inline modals

### Out of Scope / Dead Code:
- **`ConfirmDialogMolecule`** — unused. Remove or leave; already has CSS backdrop so no risk.
- **`GeneralInvoiceFormDialogOrganism`** — orphan code with no caller. Already has `MatDialogRef`. Can be removed or made the canonical pattern if a future page needs it.

### Suggested Migration Pattern (template for all pages):

```typescript
// BEFORE (Anti-pattern C1):
showDialog = signal(false);

openDialog(data: any) {
  this.showDialog.set(true);
}
onDialogClosed(result: boolean) {
  this.showDialog.set(false);
  if (result) this.loadData();
}

// Template:
// @if (showDialog()) {
//   <div class="fixed inset-0 z-50 ...">
//     <app-dialog [data]="..." (closed)="onDialogClosed($event)" />
//   </div>
// }

// AFTER (Canonical Pattern):
private dialog = inject(MatDialog);

openDialog(data: any) {
  const ref = this.dialog.open(DialogComponent, {
    ...DIALOG_DEFAULTS,
    width: DIALOG_WIDTHS.md,
    data: { ... },
    panelClass: DIALOG_PANEL_CLASS
  });
  ref.afterClosed().subscribe(result => {
    if (result) this.loadData();
  });
}
// Template: NO inline dialog HTML needed
```

---

## Risks

- **`SaleFormMolecule` is 799 lines** — regression risk due to complex form logic (autocomplete, FormArray, signal-based computed totals, notification system). Needs thorough testing.
- **`InvoiceDetailDialogOrganism` dual-mode cleanup** — must ensure `CustomerInvoicesTableOrganism` caller continues working after removing `input()`/`output()`.
- **Tight coupling** — all inline pages import dialog components directly in their `imports` array. Migration will change import requirements.
- **`ConfirmDeleteDialogOrganism`** — used by 4 pages with identical pattern. Batch migration is safe but must verify each page's delete logic.
- **No E2E tests** — the `openspec/config.yaml` shows `e2e: available: false`. Manual verification required.
- **Unit tests exist** for `ConfirmDialogMolecule` (unused) but not for the inline page components — no safety net for regressions.
