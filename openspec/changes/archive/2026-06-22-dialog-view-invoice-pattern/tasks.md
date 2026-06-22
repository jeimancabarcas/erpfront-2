# Tasks: Dialog View Invoice Pattern

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~800 (200 + 300 + 300) |
| Files affected | 27 |
| 400-line budget risk | High |
| 800-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | Phase 1 → Phase 2 → Phase 3 (3 stacked PRs) |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Icons + panel — visual-only, lowest risk | PR 1 | main |
| 2 | States — additive signals, no structural change | PR 2 | main |
| 3 | Pattern B + config — contract changes, highest risk | PR 3 | main |

## Phase 1: Icon Reversion + Panel Consolidation

- [x] 1.1 — **15 migrated dialogs**: revert `<mat-icon>` → `<span class="material-icons">` + remove `MatIconModule` imports in transport dispatch, operation, operation-closure, expense, settle, cancel, standby, change-vehicle, incident, maintenance, anamnesis, physical-exam, diagnostics, incapacity, orders dialogs
- [x] 1.2 — **4 dual-contract dialogs**: same reversion in `product-form`, `customer-dialog`, `supplier-dialog`, `invoice-detail`
- [x] 1.3 — **Reference dialog**: add `aria-label="Cerrar diálogo"` to close button in `invoice-detail-dialog`
- [x] 1.4 — **Panel consolidation**: replace `panelClass: 'premium-dialog'` → `DIALOG_PANEL_CLASS` + `DIALOG_WIDTHS.xl` in `customer-invoices-table`; import from `dialog.config.ts`

## Phase 2: States Addition

- [x] 2.1 — **15 migrated dialogs**: add `loading = signal(false)`, `error = signal<string | null>(null)` + tri-state `@if` template (spinner / error banner / content) with `setTimeout(() => this.close(), 3000)` on error
- [x] 2.2 — **4 dual-contract dialogs**: same signal+template addition to `product-form`, `customer-dialog`, `supplier-dialog`, `invoice-detail`
- [x] 2.3 — **3 Pattern B dialogs**: same signal+template addition to `adjustment-detail`, `general-invoice-form`, `adjustment-form`

## Phase 3: Pattern B Migration + Config Expansion

- [x] 3.1 — **AdjustmentDetailDialog**: add `inject(MAT_DIALOG_DATA)` typed as `AdjustmentDetailData` + `inject(MatDialogRef)` + `dialogRef.close()` + loading/error signals + header-body-footer layout
- [x] 3.2 — **GeneralInvoiceFormDialog**: add `inject(MatDialogRef)` typed as `GeneralInvoiceFormResult` + `dialogRef.close(result)` alongside `closed.emit()` + error signal for submit failures
- [x] 3.3 — **AdjustmentFormDialog**: change `public data` → private `readonly data: AdjustmentFormData` with typed interface + rm `MatIconModule` import + error signal for submit failures
- [x] 3.4 — **Config expansion**: import `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS` from `dialog.config.ts` in `invoices-table` and `stock-table`; use in all `dialog.open()` calls

## Dependency Graph

- Phase 1 → Phase 2 (states nest inside icon-corrected templates)
- Phase 1 → Phase 3 (Pattern B needs icon reversion first)
- Phase 2 → Phase 3 (Pattern B needs states before contract migration)
- Each phase is independent and revertable as a stacked PR to main
