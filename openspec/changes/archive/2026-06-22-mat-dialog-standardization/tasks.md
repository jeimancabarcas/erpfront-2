# Tasks: Mat Dialog Standardization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~850 |
| 800-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | 3 stacked PRs (Phase 1 → Phase 2 → Phase 3) |
| Delivery strategy | single-pr-default |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Config + 10 transport dialogs + callers | PR 1 (main) | ~390 lines, low risk, fire-and-forget |
| 2 | 5 consultation dialogs + caller | PR 2 (main) | ~280 lines, medium risk, signal bridge |
| 3 | Re-enable + special cases | PR 3 (main) | ~180 lines, low risk |

## Phase 1: Shared Config + Transport Dialogs

- [x] 1.1 Create `shared/constants/dialog.config.ts` — `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS` with `as const` (30 lines)
- [x] 1.2 Migrate TransportDispatchDialogOrganism — typed data interface, `inject(MAT_DIALOG_DATA)`, `dialogRef.close()`, `<mat-icon>`, ARIA (40 lines)
- [x] 1.3 Migrate TransportOperationDialogOrganism — same canonical pattern (40 lines)
- [x] 1.4 Migrate TransportIncidentDialogOrganism + TransportExpenseDialogOrganism — group similar simple dialogs (50 lines)
- [x] 1.5 Migrate TransportStandbyDialogOrganism + TransportSettleDialogOrganism — both use TransportRoute data (50 lines)
- [x] 1.6 Migrate TransportCancelDialogOrganism + TransportChangeVehicleDialogOrganism (50 lines)
- [x] 1.7 Migrate TransportMaintenanceDialogOrganism + TransportOperationClosureDialogOrganism (50 lines)
- [x] 1.8 Update callers: service-detail-page, transport-dashboard-view, transport-tracking-view, vehicle-detail-page — import `DIALOG_WIDTHS`/`DIALOG_PANEL_CLASS`, remove inline strings (80 lines)

## Phase 2: Consultation Dialogs

- [x] 2.1 Migrate AnamnesisDialogComponent + PhysicalExamDialogComponent — template-driven → Reactive Forms, signal bridge, result return via `afterClosed()` (80 lines)
- [x] 2.2 Migrate DiagnosticsDialogComponent — FormArray for secondary diagnoses, most complex migration (80 lines)
- [x] 2.3 Migrate IncapacityDialogComponent + OrdersDialogComponent — FormArray for prescriptions/procedures, signal bridge (80 lines)
- [x] 2.4 Update consultation-page caller — wire `afterClosed().subscribe(result => signal.set(result))`, use dialog config imports (40 lines)

## Phase 3: Re-enable + Special Cases

- [x] 3.1 Re-enable billing-page: wire `InvoiceFormDialogOrganism` with config constants (uncomment + type-safe call) (20 lines)
- [x] 3.2 Re-enable agenda-page: wire `AppointmentFormOrganism` with config constants (uncomment + type-safe call) (20 lines)
- [x] 3.3 CustomerDialogOrganism + SupplierDialogOrganism: ADD `inject(MAT_DIALOG_DATA)`, KEEP `input()/output()` for inline usage — dual contract (40 lines)
- [x] 3.4 ProductFormMolecule + InvoiceDetailMolecule: full migration — typed data, `dialogRef.close()`, `<mat-icon>`, ARIA; InvoiceDetail keeps `input()` fallback for inline (50 lines)
- [x] 3.5 AppointmentConfirmationDialogOrganism + AppointmentCancellationDialogOrganism: Pattern B → A, Reactive Forms, `<mat-icon>`, ARIA close buttons (50 lines)

## Dependency Graph

```
1.1 (dialog.config)
  ├── 1.2 1.3 1.4 1.5 1.6 1.7 (transport dialogs — parallel after 1.1)
  ├── 1.8 (caller pages — after 1.1)
  ├── 2.1 2.2 2.3 (consultation dialogs — after 1.1)
  ├── 2.4 (consultation caller — after 2.1-2.3)
  ├── 3.1 3.2 (re-enable — after 1.1)
  ├── 3.3 (dual contract — after 1.1)
  ├── 3.4 (product/invoice — after 1.1)
  └── 3.5 (appointment dialogs — after 1.1)
```
