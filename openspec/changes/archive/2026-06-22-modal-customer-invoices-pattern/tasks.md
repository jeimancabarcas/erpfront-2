# Tasks: Migrate All Modals to MatDialog Pattern

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

## Phase 1: Sales Page + InvoiceDetailDialog Cleanup

### 1.1 Refactor InvoiceDetailDialogOrganism to MatDialog-only
- [x] **Done** — Removed `input()`, `output()`; made `MatDialogRef` and `MAT_DIALOG_DATA` non-optional; simplified `ngOnInit`; close via `dialogRef.close()` only
- **Files**: `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts`
- **Actions**: Remove `input()`, `output()`; make `MatDialogRef` and `MAT_DIALOG_DATA` non-optional; remove merged-data fallback in `ngOnInit`; remove `closed.emit()` from `close()`; simplify to `dialogRef.close()` only
- **Est. lines**: ~30
- **Acceptance**: Zero `input()`/`output()`; data reads only from `MAT_DIALOG_DATA`; `dialogRef.close()` is the only close path

### 1.2 Refactor SaleFormMolecule — add MatDialog support, migrate nested CustomerDialogOrganism
- [x] **Done** — Added `MatDialogRef`, `MAT_DIALOG_DATA`, `MatDialog` injects; replaced `closed.emit()` with `dialogRef.close()`; migrated inline CustomerDialog to `dialog.open()`; removed `showCreateCustomerDialog` signal
- **Files**: `src/app/components/molecules/sale-form/sale-form.component.ts`
- **Actions**: Add `inject(MatDialogRef<SaleFormMolecule, boolean>)` + `inject(MAT_DIALOG_DATA)`; replace `closed.emit(true/false)` with `dialogRef.close(true/false)`; migrate nested inline CustomerDialogOrganism to `this.dialog.open(CustomerDialogOrganism, { ... })`; remove `showCreateCustomerDialog` signal + inline backdrop
- **Est. lines**: ~40
- **Acceptance**: All form close paths use `dialogRef.close()`; `CustomerDialogOrganism` opens via `dialog.open()`; no inline backdrop in template

### 1.3 Migrate SalesPageComponent to MatDialog.open()
- [x] **Done** — Removed inline HTML backdrops and signal toggles; added `inject(MatDialog)`; `dialog.open(SaleFormMolecule, {...})` + `dialog.open(InvoiceDetailDialogOrganism, {...})`; removed both from `imports`; wired `afterClosed()`
- **Files**: `src/app/components/pages/sales-page/sales-page.component.ts`
- **Actions**: Remove inline HTML backdrops for SaleForm + InvoiceDetailDialog; remove `showSaleForm`, `showDetailDialog`, `detailInvoiceId` signals; add `inject(MatDialog)`; replace with `dialog.open(SaleFormMolecule, {...})` + `dialog.open(InvoiceDetailDialogOrganism, {...})`; remove both components from `imports` array; wire `afterClosed()` to reload data
- **Est. lines**: ~25
- **Acceptance**: Zero inline backdrop in template; zero `showXxx` signals; both dialogs open via MatDialog with `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS`

## Phase 2: Sales Customers Page + ConfirmDeleteDialog + CustomerDialog

### 2.1 Refactor ConfirmDeleteDialogOrganism to MatDialog-only
- [x] **Done** — Replaced `input<ConfirmDeleteData>` + `output<boolean>` with `inject(MAT_DIALOG_DATA)` + `inject(MatDialogRef)`; close via `dialogRef.close(result)`
- **Files**: `src/app/components/organisms/confirm-delete-dialog/confirm-delete-dialog.component.ts`
- **Actions**: Replace `input<ConfirmDeleteData>` + `output<boolean>` with `inject(MAT_DIALOG_DATA)` + `inject(MatDialogRef<ConfirmDeleteDialogOrganism, boolean>)`; replace `closed.emit(result)` with `dialogRef.close(result)`
- **Est. lines**: ~15
- **Acceptance**: Zero `input()`/`output()`; data via `MAT_DIALOG_DATA`; close via `dialogRef.close()`

### 2.2 Refactor CustomerDialogOrganism to MatDialog-only
- [x] **Done** — Removed `input()`, `output()`; made `MAT_DIALOG_DATA` non-optional; added `inject(MatDialogRef<CustomerDialogOrganism, boolean>)`; close via `dialogRef.close()`
- **Files**: `src/app/components/organisms/customer-dialog/customer-dialog.component.ts`
- **Actions**: Remove `input()`, `output()`; make `MAT_DIALOG_DATA` non-optional (drop fallback to `this.data()`); add `inject(MatDialogRef<CustomerDialogOrganism, boolean>)`; replace `closed.emit()` with `dialogRef.close()`
- **Est. lines**: ~25
- **Acceptance**: Zero `input()`/`output()`; data via `MAT_DIALOG_DATA`; close via `dialogRef.close()`; no dual-mode logic

### 2.3 Migrate SalesCustomersPageComponent to MatDialog.open()
- [x] **Done** — Removed inline backdrops and dialog signals; added `inject(MatDialog)`; `dialog.open(CustomerDialogOrganism, {...})` + `dialog.open(ConfirmDeleteDialogOrganism, {...})`; removed both from `imports`; wired `afterClosed()`
- **Files**: `src/app/components/pages/sales-page/sales-customers-page/sales-customers-page.component.ts`
- **Actions**: Remove inline HTML backdrops for CustomerDialog + ConfirmDeleteDialog; remove `showCustomerDialog`, `customerDialogData`, `showDeleteDialog`, `deleteDialogData`, `pendingDeleteCustomerId` signals; add `inject(MatDialog)`; replace with `dialog.open(CustomerDialogOrganism, {...})` + `dialog.open(ConfirmDeleteDialogOrganism, {...})`; remove both from `imports`; wire `afterClosed()`
- **Est. lines**: ~25
- **Acceptance**: Zero inline backdrop; zero `showXxx` signals; both dialogs via MatDialog with correct width/data

## Phase 3: 4 Inventory Pages (9 Modals)

### 3.1 Migrate InventoryProductsPageComponent (3 modals)
- [x] **Done** — Removed inline backdrops and dialog signals; added `inject(MatDialog)`; `dialog.open(ProductFormMolecule, {...})`, `dialog.open(InventoryBatchDialogOrganism, { data: { product } })`, `dialog.open(ConfirmDeleteDialogOrganism, {...})`; converted `InventoryBatchDialogOrganism` to MAT_DIALOG_DATA; removed all 3 from `imports`; wired `afterClosed()`
- **Files**: `src/app/components/pages/inventory-page/inventory-products-page/inventory-products-page.component.ts`
- **Actions**: Remove inline backdrops for ProductFormMolecule, InventoryBatchDialogOrganism, ConfirmDeleteDialogOrganism; remove 5 signals; add `inject(MatDialog)`; replace with `dialog.open(ProductFormMolecule, {...})`, `dialog.open(InventoryBatchDialogOrganism, { data: { product } })`, `dialog.open(ConfirmDeleteDialogOrganism, {...})`; remove all 3 from `imports`; wire `afterClosed()`
- **Note**: `InventoryBatchDialogOrganism` currently takes `[product]` named input — must convert to `MAT_DIALOG_DATA` with `data: { product }` first; then refactor its `input()`/`output()` to MatDialog-only
- **Est. lines**: ~30
- **Acceptance**: All 3 modals via MatDialog; InventoryBatchDialogOrganism converted from named input to `MAT_DIALOG_DATA`

### 3.2 Migrate InventorySuppliersPageComponent (2 modals)
- [x] **Done** — Removed inline backdrops and dialog signals; added `inject(MatDialog)`; `dialog.open(SupplierDialogOrganism, {...})` + `dialog.open(ConfirmDeleteDialogOrganism, {...})`; removed both from `imports`; wired `afterClosed()`
- **Files**: `src/app/components/pages/inventory-page/inventory-suppliers-page/inventory-suppliers-page.component.ts`
- **Actions**: Remove inline backdrops for SupplierDialogOrganism + ConfirmDeleteDialogOrganism; remove 4 signals; add `inject(MatDialog)`; replace with `dialog.open(SupplierDialogOrganism, {...})` + `dialog.open(ConfirmDeleteDialogOrganism, {...})`; remove both from `imports`; wire `afterClosed()`
- **Est. lines**: ~20
- **Acceptance**: Both modals via MatDialog; no inline backdrop

### 3.3 Migrate InventoryCategoriesPageComponent (2 modals)
- [x] **Done** — Converted `InventoryCategoryDialogOrganism` to MAT_DIALOG_DATA; removed inline backdrops and dialog signals; added `inject(MatDialog)`; `dialog.open(InventoryCategoryDialogOrganism, {...})` + `dialog.open(ConfirmDeleteDialogOrganism, {...})`; removed both from `imports`; wired `afterClosed()`
- **Files**: `src/app/components/pages/inventory-page/inventory-categories-page/inventory-categories-page.component.ts`
- **Actions**: Remove inline backdrops for InventoryCategoryDialogOrganism + ConfirmDeleteDialogOrganism; remove 4 signals; add `inject(MatDialog)`; replace with `dialog.open(InventoryCategoryDialogOrganism, {...})` + `dialog.open(ConfirmDeleteDialogOrganism, {...})`; remove both from `imports`; wire `afterClosed()`
- **Est. lines**: ~20
- **Acceptance**: Both modals via MatDialog; no inline backdrop

### 3.4 Migrate InventoryPurchasesPageComponent (2 modals)
- [x] **Done** — Converted `PurchaseOrderDialogOrganism` and `PurchaseOrderDetailDialogOrganism` to MAT_DIALOG_DATA; removed inline backdrops and dialog signals; added `inject(MatDialog)`; `dialog.open(PurchaseOrderDialogOrganism, {...})` + `dialog.open(PurchaseOrderDetailDialogOrganism, {...})`; removed both from `imports`; wired `afterClosed()`
- **Files**: `src/app/components/pages/inventory-page/inventory-purchases-page/inventory-purchases-page.component.ts`
- **Actions**: Remove inline backdrops for PurchaseOrderDialogOrganism + PurchaseOrderDetailDialogOrganism; remove 4 signals; add `inject(MatDialog)`; replace with `dialog.open(PurchaseOrderDialogOrganism, {...})` + `dialog.open(PurchaseOrderDetailDialogOrganism, {...})`; remove both from `imports`; wire `afterClosed()`
- **Est. lines**: ~20
- **Acceptance**: Both modals via MatDialog; no inline backdrop

## Dependency Graph

```
Phase 1 (Sales Page) ─────────────────────────────┐
  ├─ 1.1 InvoiceDetailDialogOrganism (no deps)    │
  ├─ 1.2 SaleFormMolecule (needs 2.2 done) ────┐  │
  └─ 1.3 SalesPageComponent (needs 1.1, 1.2)   │  │
                                                │  │
Phase 2 (Sales Customers) ◄─────────────────────┘  │
  ├─ 2.1 ConfirmDeleteDialogOrganism (no deps)      │
  ├─ 2.2 CustomerDialogOrganism (no deps) ──────────┘
  └─ 2.3 SalesCustomersPageComponent (needs 2.1, 2.2)

Phase 3 (Inventory) ──── Independent after 2.1 ────┐
  ├─ 3.1 InventoryProductsPage (needs 2.1)          │
  ├─ 3.2 InventorySuppliersPage (needs 2.1)          │
  ├─ 3.3 InventoryCategoriesPage (needs 2.1)          │
  └─ 3.4 InventoryPurchasesPage (needs 2.1)           │
                                                      │
Note: 1.2 (SaleFormMolecule) is blocked on 2.2 ──────┘
      (CustomerDialogOrganism) because SaleFormMolecule
      opens CustomerDialogOrganism via dialog.open()
```

## Implementation Order

1. **Start with Phase 2.1** (ConfirmDeleteDialogOrganism) — no deps, unblocks all pages
2. **Start with Phase 2.2** (CustomerDialogOrganism) — no deps, unblocks SaleFormMolecule
3. **Phase 1.1** (InvoiceDetailDialogOrganism) — no deps, can run in parallel with Phase 2 start
4. **Phase 1.2** (SaleFormMolecule) — blocked on 2.2
5. **Phase 1.3** (SalesPageComponent) — blocked on 1.1, 1.2
6. **Phase 2.3** (SalesCustomersPageComponent) — blocked on 2.1, 2.2
7. **Phase 3.1–3.4** (All inventory pages) — blocked on 2.1 only, can run in parallel with each other
