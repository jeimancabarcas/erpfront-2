# Apply Progress: modal-customer-invoices-pattern

**Status**: ✅ All 10 tasks completed
**Delivery**: single-pr-default (~250 lines, within 800-line budget)
**Build**: `ng build` passed

## Tasks Completed

### Phase 2 (unblock first)
- [x] **2.1** ConfirmDeleteDialogOrganism — `input()`/`output()` → `MAT_DIALOG_DATA` + `MatDialogRef`
- [x] **2.2** CustomerDialogOrganism — `input()`/`output()` → `MAT_DIALOG_DATA` + `MatDialogRef`

### Phase 1 (Sales Page)
- [x] **1.1** InvoiceDetailDialogOrganism — `input()`/`output()` → `MAT_DIALOG_DATA` + `MatDialogRef` (non-optional)
- [x] **1.2** SaleFormMolecule — added `dialogRef`, `MAT_DIALOG_DATA`, `MatDialog`; migrated inline CustomerDialog to `dialog.open()`
- [x] **1.3** SalesPageComponent — 2 inline backdrops → `dialog.open()`

### Phase 2 (callers)
- [x] **2.3** SalesCustomersPageComponent — 2 inline backdrops → `dialog.open()`

### Phase 3 (Inventory)
- [x] **3.1** InventoryProductsPageComponent — 3 inline backdrops → `dialog.open()`; converted InventoryBatchDialogOrganism
- [x] **3.2** InventorySuppliersPageComponent — 2 inline backdrops → `dialog.open()`
- [x] **3.3** InventoryCategoriesPageComponent — 2 inline backdrops → `dialog.open()`; converted InventoryCategoryDialogOrganism
- [x] **3.4** InventoryPurchasesPageComponent — 2 inline backdrops → `dialog.open()`; converted PurchaseOrderDialogOrganism + PurchaseOrderDetailDialogOrganism

## Files Changed

| File | Action |
|------|--------|
| `organisms/confirm-delete-dialog/confirm-delete-dialog.component.ts` | Modified — MatDialog-only |
| `organisms/customer-dialog/customer-dialog.component.ts` | Modified — MatDialog-only |
| `organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts` | Modified — MatDialog-only |
| `organisms/inventory-batch-dialog/inventory-batch-dialog.component.ts` | Modified — MatDialog-only |
| `organisms/inventory-category-dialog/inventory-category-dialog.component.ts` | Modified — MatDialog-only |
| `organisms/purchase-order-dialog/purchase-order-dialog.component.ts` | Modified — MatDialog-only |
| `organisms/purchase-order-detail-dialog/purchase-order-detail-dialog.component.ts` | Modified — MatDialog-only |
| `molecules/sale-form/sale-form.component.ts` | Modified — MatDialog support + inline CustomerDialog migration |
| `pages/sales-page/sales-page.component.ts` | Modified — MatDialog.open() |
| `pages/sales-customers-page/sales-customers-page.component.ts` | Modified — MatDialog.open() |
| `pages/inventory-products-page/inventory-products-page.component.ts` | Modified — MatDialog.open() |
| `pages/inventory-suppliers-page/inventory-suppliers-page.component.ts` | Modified — MatDialog.open() |
| `pages/inventory-categories-page/inventory-categories-page.component.ts` | Modified — MatDialog.open() |
| `pages/inventory-purchases-page/inventory-purchases-page.component.ts` | Modified — MatDialog.open() |
| `tasks.md` | Updated — checkmarks |
