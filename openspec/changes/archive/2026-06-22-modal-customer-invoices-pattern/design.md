# Design: Migrate All Modals to MatDialog Pattern

## Technical Approach

Replace 13 inline signal-toggle modals (7 pages, 2 hybrid components) with canonical `MatDialog.open()` backed by `dialog.config.ts`. Per-page pattern: remove inline backdrop HTML + dialog signals → add `inject(MatDialog)` + `dialog.open()` calls. Dialog components lose `input()/output()` in favor of `MAT_DIALOG_DATA` + `MatDialogRef`.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Component refactor before page refactor | Dialog components first, pages second | Inline refactor first | Pages depend on components having MatDialog API. Must add `MatDialogRef`/`MAT_DIALOG_DATA` to SaleFormMolecule, ConfirmDeleteDialogOrganism, CustomerDialogOrganism before callers switch to `dialog.open()` |
| SaleFormMolecule data model | Add `MAT_DIALOG_DATA` (even though no data passed today) + `MatDialogRef<SaleFormMolecule, boolean>` | Keep output-only | Consistency with canonical pattern. `closed.emit(true)` → `dialogRef.close(true)`. Close button/discard emit `dialogRef.close(false)`. No template changes needed |
| ConfirmDeleteDialogOrganism | Replace `input/ComfirmDeleteData` + `output<boolean>` with `inject(MAT_DIALOG_DATA)` + `inject(MatDialogRef<..., boolean>)` | Keep dual-mode | 4 identical callers, all migrating. Simpler single-mode component |
| InvoiceDetailDialogOrganism | Remove `input()`, `output()`, make both `MatDialogRef` and `MAT_DIALOG_DATA` non-optional | Keep dual-mode | Already used via MatDialog by CustomerInvoicesTableOrganism. Dual-mode allows inline misuse |
| CustomerDialogOrganism | Same as InvoiceDetailDialogOrganism — drop input/output, keep only MAT_DIALOG_DATA + MatDialogRef | Keep dual-mode | Used inline by SaleFormMolecule AND SalesCustomersPage. Both migrate |
| InventoryBatchDialogOrganism | Convert `[product]` named input to `data: { product }` via MAT_DIALOG_DATA | Keep named input | Named input pattern is non-standard for dialog data. All other dialogs use `data` object |
| Phase order | Sales → Sales-Customers → Inventory (3 phases) | All at once | Safe per-page rollback. SaleFormMolecule (799 lines) is highest risk — isolated in Phase 1 |

## Data Flow

```
BEFORE (inline):
  Page template → @if (showXxx()) → custom backdrop div → [
    component via [data] binding → component.ngOnInit() reads input()
    component emits via (closed) output → page signal.set(false)
  ]

AFTER (MatDialog):
  Page TS → dialog.open(Component, { data, panelClass, width }) → CDK overlay → [
    component reads MAT_DIALOG_DATA in constructor/ngOnInit
    component calls dialogRef.close(result) → page ref.afterClosed() emits result
  ]
  Template: no dialog HTML. MatDialogManager handles backdrop, focus trap, escape.
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts` | Modify | Remove `input()`,`output()`; make `MatDialogRef`,`MAT_DIALOG_DATA` non-optional; drop merged-data logic |
| `organisms/confirm-delete-dialog/confirm-delete-dialog.component.ts` | Modify | Replace `input<ConfirmDeleteData>` + `output<boolean>` with `inject(MAT_DIALOG_DATA)` + `inject(MatDialogRef<..., boolean>)` |
| `organisms/customer-dialog/customer-dialog.component.ts` | Modify | Remove `input()`,`output()`; make `MAT_DIALOG_DATA` non-optional; add `MatDialogRef`; close via `dialogRef.close(boolean)` |
| `molecules/sale-form/sale-form.component.ts` | Modify | Remove `output<boolean>()`; add `MatDialogRef<SaleFormMolecule, boolean>` + `MAT_DIALOG_DATA`; migrate nested CustomerDialogOrganism to `dialog.open()` |
| `pages/sales-page/sales-page.component.ts` | Modify | Remove inline HTML (2 backdrops), signals (`showSaleForm`,`showDetailDialog`); add `inject(MatDialog)`; `dialog.open()` for SaleFormMolecule + InvoiceDetailDialogOrganism; remove components from `imports` |
| `pages/sales-customers-page/sales-customers-page.component.ts` | Modify | Same pattern: remove inline HTML (2), signals; `dialog.open(CustomerDialogOrganism...)` + `dialog.open(ConfirmDeleteDialogOrganism...)` |
| `pages/inventory-products-page/inventory-products-page.component.ts` | Modify | Remove inline HTML (3), signals; `dialog.open()` for ProductFormMolecule, InventoryBatchDialogOrganism, ConfirmDeleteDialogOrganism |
| `pages/inventory-suppliers-page/inventory-suppliers-page.component.ts` | Modify | Remove inline HTML (2), signals; `dialog.open()` for SupplierDialogOrganism, ConfirmDeleteDialogOrganism |
| `pages/inventory-categories-page/inventory-categories-page.component.ts` | Modify | Remove inline HTML (2), signals; `dialog.open()` for InventoryCategoryDialogOrganism, ConfirmDeleteDialogOrganism |
| `pages/inventory-purchases-page/inventory-purchases-page.component.ts` | Modify | Remove inline HTML (2), signals; `dialog.open()` for PurchaseOrderDialogOrganism, PurchaseOrderDetailDialogOrganism |

## Interfaces / Contracts

```typescript
// AFTER: Canonical dialog component contract
@Component({ ... })
export class XxxDialogComponent {
  private dialogRef = inject(MatDialogRef<XxxDialogComponent, ResultType>);
  data = inject(MAT_DIALOG_DATA); // strongly typed

  close(result: ResultType) {
    this.dialogRef.close(result);
  }
}

// AFTER: Canonical page open method
private dialog = inject(MatDialog);

openDialog(entity?: Entity) {
  const ref = this.dialog.open(XxxDialogComponent, {
    ...DIALOG_DEFAULTS,
    width: DIALOG_WIDTHS.md,
    panelClass: DIALOG_PANEL_CLASS,
    data: { entity }
  });
  ref.afterClosed().subscribe(result => {
    if (result) this.loadData();
  });
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | ConfirmDeleteDialogOrganism — close emits via dialogRef | Verify `dialogRef.close(result)` is called. Mock `MatDialogRef` |
| Unit | InvoiceDetailDialogOrganism — MAT_DIALOG_DATA only | Verify data sourced from MAT_DIALOG_DATA, not input() |
| Manual | All 7 pages — open/close every modal | Per-page checklist: open form, submit, verify data reload; open detail, verify content; open delete, confirm/cancel |
| Manual | SaleFormMolecule — invoice creation flow | Complete sale flow: select customer, add products, submit, verify invoice appears in table after modal closes |

## Migration / Rollout

**Phase 1** — Sales page + InvoiceDetailDialogOrganism cleanup. Highest risk (SaleFormMolecule 799 lines). Manual smoke test:
1. Refactor `InvoiceDetailDialogOrganism` (remove dual-mode)
2. Refactor `SaleFormMolecule` (add MatDialogRef, migrate nested CustomerDialogOrganism)
3. Refactor `SalesPageComponent` (remove inline, add dialog.open)

**Phase 2** — Sales customers page + ConfirmDeleteDialogOrganism cleanup:
1. Refactor `ConfirmDeleteDialogOrganism` (add MatDialogRef)
2. Refactor `CustomerDialogOrganism` (remove input/output)
3. Refactor `SalesCustomersPageComponent`

**Phase 3** — All 4 inventory pages (9 modals) — low risk, mechanical pattern.

## Open Questions

- [ ] `SaleFormMolecule` uses `@media` queries in styles — should the max-width come from DIALOG_WIDTHS or stay inline? Currently has explicit `max-w-[900px]` which maps to `DIALOG_WIDTHS.lg` (`850px`) — close but not exact.
- [ ] `InventoryBatchDialogOrganism` uses `[product]` named input instead of `[data]` — confirm existing dialog.component.ts structure supports MAT_DIALOG_DATA path.
