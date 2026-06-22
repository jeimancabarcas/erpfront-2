# Apply Progress: mat-dialog-standardization

## Status: COMPLETE ✅

All 17 tasks across 3 phases have been implemented and verified via `ng build`.

## Files Changed

### Created
- `src/app/shared/constants/dialog.config.ts` — Shared dialog config constants (DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS)

### Phase 1 — Transport Dialogs (10 organisms + 4 callers)
- `src/app/components/organisms/transport-dispatch-dialog/transport-dispatch-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-operation-dialog/transport-operation-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-incident-dialog/transport-incident-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-expense-dialog/transport-expense-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-standby-dialog/transport-standby-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-settle-dialog/transport-settle-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-cancel-dialog/transport-cancel-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-change-vehicle-dialog/transport-change-vehicle-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-maintenance-dialog/transport-maintenance-dialog.component.ts` — ✅ Migrated
- `src/app/components/organisms/transport-operation-closure-dialog/transport-operation-closure-dialog.component.ts` — ✅ Migrated
- `src/app/components/pages/transport-page/service-detail-page/service-detail-page.component.ts` — ✅ Caller updated
- `src/app/components/pages/transport-page/transport-dashboard-view/transport-dashboard-view.component.ts` — ✅ Caller updated
- `src/app/components/pages/transport-page/transport-tracking-view/transport-tracking-view.component.ts` — ✅ Caller updated
- `src/app/components/pages/transport-page/vehicle-detail-page/vehicle-detail-page.component.ts` — ✅ Caller updated

### Phase 2 — Consultation Dialogs (5 organisms + 1 caller)
- `src/app/components/organisms/anamnesis-dialog/anamnesis-dialog.component.ts` — ✅ Migrated (template-driven → Reactive Forms)
- `src/app/components/organisms/physical-exam-dialog/physical-exam-dialog.component.ts` — ✅ Migrated (template-driven → Reactive Forms)
- `src/app/components/organisms/diagnostics-dialog/diagnostics-dialog.component.ts` — ✅ Migrated (FormArray, Reactive Forms)
- `src/app/components/organisms/incapacity-dialog/incapacity-dialog.component.ts` — ✅ Migrated (template-driven → Reactive Forms)
- `src/app/components/organisms/orders-dialog/orders-dialog.component.ts` — ✅ Migrated (FormArray, Reactive Forms)
- `src/app/components/pages/consultation-page/consultation-page.component.ts` — ✅ Caller updated

### Phase 3 — Re-enable + Special Cases (6 organisms + 2 pages)
- `src/app/components/pages/billing-page/billing-page.component.ts` — ✅ Re-enabled InvoiceFormDialogOrganism
- `src/app/components/pages/agenda-page/agenda-page.component.ts` — ✅ Re-enabled AppointmentFormOrganism + wired confirmation/cancellation dialogs
- `src/app/components/organisms/customer-dialog/customer-dialog.component.ts` — ✅ Dual contract (inject(MAT_DIALOG_DATA) + keep input/output)
- `src/app/components/organisms/supplier-dialog/supplier-dialog.component.ts` — ✅ Dual contract (inject(MAT_DIALOG_DATA) + keep input/output)
- `src/app/components/molecules/product-form/product-form.component.ts` — ✅ Full migration (typed data, dialogRef.close, mat-icon, ARIA)
- `src/app/components/molecules/invoice-detail/invoice-detail.component.ts` — ✅ Full migration (inject(MAT_DIALOG_DATA) + keep input fallback, mat-icon, ARIA)
- `src/app/components/organisms/appointment-confirmation-dialog/appointment-confirmation-dialog.component.ts` — ✅ Pattern B → A
- `src/app/components/organisms/appointment-cancellation-dialog/appointment-cancellation-dialog.component.ts` — ✅ Pattern B → A

## Migration Pattern Applied
For every migrated dialog:
- ✅ Typed `interface XxxDialogData` exported alongside component
- ✅ `inject(MAT_DIALOG_DATA)` instead of `input<any>()`
- ✅ `dialogRef.close(result)` instead of `closed.emit(result)`
- ✅ Reactive Forms with FormBuilder (consultation dialogs)
- ✅ `<mat-icon>` replacing `<span class="material-icons">`
- ✅ `aria-label` on all close buttons
- ✅ `DIALOG_WIDTHS` / `DIALOG_PANEL_CLASS` / `DIALOG_DEFAULTS` in callers
- ✅ DIALOG_DEFAULTS spread pattern used consistently

## Build Verification
- `ng build` — ✅ Success (all 3 phases verified)
- Only pre-existing warnings remain (unrelated to this change)

## Next Step
- Proceed to `sdd-verify` for test execution and verification
