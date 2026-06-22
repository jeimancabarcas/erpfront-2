# Design: Dialog View Invoice Pattern Standardization

## Technical Approach

Three sequential, revertable phases to unify 28 dialogs under the reference `InvoiceDetailDialogOrganism` pattern. Phase 1 reverts `<mat-icon>` → `<span class="material-icons">` (confirmed font in `index.html` line 9). Phase 2 adds signal-based loading/error states. Phase 3 migrates 3 Pattern B dialogs to MatDialog contract and expands `dialog.config.ts` to all callers. All phases preserve typed `MAT_DIALOG_DATA`, Reactive Forms, ARIA labels, and `DIALOG_PANEL_CLASS` from the prior standardization.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Icon approach | `<span class="material-icons">`, remove `MatIconModule` | Keep `<mat-icon>` | User explicit choice; font already loaded in `index.html`; 3 dual-contract dialogs already use spans |
| Panel class | `DIALOG_PANEL_CLASS = 'erp-dialog-panel'` from `dialog.config.ts` | Keep `'premium-dialog'` | Reference caller was the only holdout; `dialog.config.ts` consolidation is the agreed direction |
| State management | `signal(false)` for `loading`/`error`; tri-state `@if` template | RxJS subjects, ngOnDestroy flags | Reference uses signals; all 15 migrated dialogs are Angular 19+ standalone — native signals are idiomatic |
| Pattern B migration | Add `inject(MAT_DIALOG_DATA)` + `inject(MatDialogRef)`, type data | Keep `input/output` only | Typed data contract from standardization; verify `afterClosed()` subscribers exist |
| Error auto-dismiss | `setTimeout(() => this.close(), 3000)` on error | Persistent error with manual close | Reference pattern; consistent UX for server errors |

## Data Flow

```
Caller (table/page)
  │
  ├─ opens dialog with DIALOG_WIDTHS.xl + DIALOG_PANEL_CLASS
  │
  ▼
Dialog Component
  │
  ├─ inject(MAT_DIALOG_DATA) ← typed interface
  ├─ loading.set(true)
  ├─ service.fetchData().subscribe({
  │    next → invoice/result.set(data), loading.set(false)
  │    error → error.set(message), loading.set(false), setTimeout(close, 3000)
  │  })
  │
  ├─ Template: @if (loading) → spinner
  │            @else if (error) → error banner + close btn
  │            @else → content (header + body + footer)
  │
  └─ dialogRef.close(result) → caller afterClosed()
```

## File Changes

### Phase 1 — Icon Reversion + Panel Consolidation

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/organisms/transport-dispatch-dialog/*.ts` | Modify | `<mat-icon>` → `<span class="material-icons">`, rm `MatIconModule` import |
| `src/app/components/organisms/transport-operation-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-operation-closure-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-expense-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-settle-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-cancel-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-standby-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-change-vehicle-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-incident-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/transport-closure-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/anamnesis-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/physical-exam-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/diagnostics-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/incapacity-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/orders-dialog/*.ts` | Modify | Same |
| `src/app/components/molecules/product-form/*.ts` | Modify | Same — `MatIconModule` rm, `<mat-icon>` → span |
| `src/app/components/organisms/customer-dialog/*.ts` | Modify | Same |
| `src/app/components/organisms/supplier-dialog/*.ts` | Modify | Same |
| `src/app/components/molecules/invoice-detail/*.ts` | Modify | Already uses spans — just rm `MatIconModule` import |
| `src/app/components/organisms/invoice-detail-dialog/*.ts` | Modify | Add `aria-label="Cerrar diálogo"` to close button |
| `src/app/components/organisms/customer-invoices-table/*.ts` | Modify | `panelClass: 'premium-dialog'` → `DIALOG_PANEL_CLASS`, add `DIALOG_WIDTHS.xl`, import from `dialog.config.ts` |

**Before/after example** (transport-dispatch-dialog close btn):
```
BEFORE: <button mat-icon-button (click)="close()" aria-label="Cerrar diálogo"><mat-icon>close</mat-icon></button>
AFTER:  <button (click)="close()" aria-label="Cerrar diálogo" class="..."><span class="material-icons">close</span></button>
```

### Phase 2 — States Addition

| File | Action | Description |
|------|--------|-------------|
| All 15 migrated dialogs + 3 Pattern B + 4 dual-contract | Modify | Add `loading = signal(false)`, `error = signal<string \| null>(null)`, tri-state `@if` template wrapper |

**Template pattern** (applied to every dialog's content wrapper):
```html
@if (loading()) {
  <div class="flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
} @else if (error()) {
  <div class="flex flex-col items-center gap-2 text-red-500 py-12">
    <span class="material-icons text-5xl">error_outline</span>
    <p>{{ error() }}</p>
    <button (click)="close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold ...">Cerrar</button>
  </div>
} @else {
  <!-- existing content -->
}
```

### Phase 3 — Pattern B Migration + Config Expansion

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/organisms/adjustment-detail-dialog/*.ts` | Modify | Add `inject(MAT_DIALOG_DATA)`, `inject(MatDialogRef)`, type data as `AdjustmentDetailData`, add `dialogRef.close()` in `close()`, add loading/error signals |
| `src/app/components/organisms/general-invoice-form-dialog/*.ts` | Modify | Add `inject(MatDialogRef)`, type result, add `dialogRef.close(result)` alongside `closed.emit()`, add error signal for submit failures |
| `src/app/components/organisms/adjustment-form-dialog/*.ts` | Modify | Change `public data` → private `readonly data: AdjustmentFormData`, type properly, rm `MatIconModule` import, add error signal for submit failures |
| `src/app/components/molecules/invoices-table/*.ts` | Modify | Import `DIALOG_WIDTHS`, `DIALOG_DEFAULTS`, `DIALOG_PANEL_CLASS` and use in all `dialog.open()` calls |
| `src/app/components/molecules/stock-table/*.ts` | Modify | Same |

## Interfaces / Contracts

```typescript
// Pattern B new data interfaces (typed, replacing `any`)
export interface AdjustmentDetailData {
  note: AdjustmentNote;
}

export interface GeneralInvoiceFormResult {
  invoice: FinanceInvoice | null;
}

// Updated AdjustmentFormData (already partial, just type it properly)
export interface AdjustmentFormData {
  type?: 'Credit' | 'Debit';
  invoice?: FinanceInvoice;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Visual | Icon rendering after reversion | Open each dialog, confirm `<span class="material-icons">` renders correctly |
| Visual | Loading spinner visible during data fetch | Trigger dialogs with async data, confirm spinner shows |
| Visual | Error banner + auto-close | Simulate API failure, confirm error shows and closes in 3s |
| Integration | Pattern B afterClosed() receives data | Open each Pattern B dialog, submit, confirm caller gets result |
| Integration | Config expansion | Verify all callers import from `dialog.config.ts` consistently |

## Migration / Rollout

Three independent PRs, each revertable. Phase 1 merges first (icons are visual-only, lowest risk). Phase 2 adds signals (additive, no structural change). Phase 3 changes dialog contracts (highest risk — verify `afterClosed()` subscribers per dialog before merging).

## Open Questions

- [ ] `GeneralInvoiceFormDialogOrganism` has no caller monitoring `afterClosed()` — verify before adding MatDialogRef
- [ ] `Pattern A` non-migrated dialogs (`InvoiceFormDialogOrganism`, `AppointmentFormOrganism`, `PatientRegistrationWizardOrganism`) — icons only in Phase 1, states deferred?
- [ ] Do `ConfirmDialogMolecule` and `SaleFormMolecule` get any visual alignment? (Out of scope per proposal, but worth noting)
