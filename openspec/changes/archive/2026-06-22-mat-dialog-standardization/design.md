# Design: Mat Dialog Standardization

## Technical Approach

Migrate 13+ Pattern B dialogs (`input()`/`output()` + `MatDialog.open`) to canonical Pattern A (`inject(MAT_DIALOG_DATA)` + `MatDialogRef.close()`). Build shared config for widths/panel classes. Three phases by risk: transport (fire-and-forget, no `afterClosed`), consultation (return-value via `afterClosed`), re-enable commented-out wiring.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Data injection | `input()` vs `inject(MAT_DIALOG_DATA)` | `inject(MAT_DIALOG_DATA)` | Canonical ref already uses it; eliminates `data = input<any>({})` type-unsafety; dialog ref is the standard MatDialog contract |
| Closing mechanism | `output()` vs `dialogRef.close()` | `dialogRef.close(result)` | Eliminates dual-emit pattern (`closed.emit()`; parent must subscribe); inline `dialogRef.close()` is self-contained |
| Form strategy | Template-driven vs Reactive | Reactive (`FormBuilder`) | Already used by transport dialogs; canonical ref uses it; aligns with Angular best practices |
| Icon approach | `<span class="material-icons">` vs `<mat-icon>` | `<mat-icon>` | Canonical ref uses it; accessible by default; no raw class manipulation |
| Config location | Inline vs shared constant file | `shared/constants/dialog.config.ts` | Eliminates 10+ copies of `panelClass: 'custom-dialog-container'` and inline `width: '600px'` |
| Consultation data flow | Mutable-by-reference vs return-value | Return-value via `afterClosed()` | `MAT_DIALOG_DATA` is read-only; consultation callers already have `afterClosed()` subscribers |

## Data Flow

```
=== Phase 1 (Transport — fire-and-forget) ===

Caller                          Dialog
  │                               │
  ├─ dialog.open(Dlg, {data}) ───→│  inject(MAT_DIALOG_DATA)
  │                               │  reads data, user fills form
  │                               │  service.sideEffect(payload)
  │  dialogRef.close(true) ──────→│  (no afterClosed needed)
  │

=== Phase 2 (Consultation — return-value) ===

Caller                          Dialog
  │                               │
  ├─ dialog.open(Dlg, {data}) ───→│  inject(MAT_DIALOG_DATA) — read-only
  │                               │  builds FormGroup from data
  │                               │  user edits form
  │  dialogRef.close(updatedData) │
  │←──── afterClosed().subscribe ─│
  │  if (result) signal.set(result)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `shared/constants/dialog.config.ts` | Create | `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS` |
| **Phase 1 — Transport (8+2 dialogs)** | | |
| `organisms/transport-dispatch-dialog/*.ts` | Modify | Pattern B → A: `inject(MAT_DIALOG_DATA)`, `dialogRef.close()`, `<mat-icon>`, ARIA |
| `organisms/transport-operation-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-incident-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-expense-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-standby-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-settle-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-cancel-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-change-vehicle-dialog/*.ts` | Modify | Same migration |
| `organisms/transport-maintenance-dialog/*.ts` | Modify | Same migration (extra) |
| `organisms/transport-operation-closure-dialog/*.ts` | Modify | Same migration (extra) |
| **Phase 2 — Consultation (5 dialogs)** | | |
| `organisms/anamnesis-dialog/*.ts` | Modify | Pattern B → A + signal bridge + reactive form |
| `organisms/diagnostics-dialog/*.ts` | Modify | Same |
| `organisms/physical-exam-dialog/*.ts` | Modify | Same |
| `organisms/incapacity-dialog/*.ts` | Modify | Same |
| `organisms/orders-dialog/*.ts` | Modify | Same |
| **Phase 3 — Re-enable** | | |
| `pages/billing-page/*.ts` | Modify | Wire `InvoiceFormDialogOrganism` call |
| `pages/agenda-page/*.ts` | Modify | Wire `AppointmentFormOrganism` call |
| **Special cases** | | |
| `organisms/customer-dialog/*.ts` | Modify | Migrate data passing only (keep template-driven) |
| `organisms/supplier-dialog/*.ts` | Modify | Migrate data passing only |
| `molecules/product-form/*.ts` | Modify | Full migration to canonical |
| `molecules/invoice-detail/*.ts` | Modify | Full migration |
| **Caller pages** | | |
| `pages/transport-page/service-detail-page/*.ts` | Modify | Use `DIALOG_WIDTHS` + `DIALOG_PANEL_CLASS` |
| `pages/transport-page/transport-dashboard-view/*.ts` | Modify | Same |
| `pages/transport-page/transport-tracking-view/*.ts` | Modify | Same |
| `pages/transport-page/vehicle-detail-page/*.ts` | Modify | Same |

### Shared Config

```ts
// src/app/shared/constants/dialog.config.ts
export const DIALOG_WIDTHS = { sm: '500px', md: '600px', lg: '850px', xl: '950px' } as const;
export const DIALOG_PANEL_CLASS = 'erp-dialog-panel';
export const DIALOG_DEFAULTS = { maxWidth: '95vw', disableClose: false } as const;
```

Usage in callers:
```ts
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../shared/constants/dialog.config';

this.dialog.open(TransportDispatchDialogOrganism, {
  data: { vehicleId },
  width: DIALOG_WIDTHS.lg,         // was: '700px'
  panelClass: DIALOG_PANEL_CLASS    // was: 'custom-premium-dialog'
});
```

### Canonical Dialog Template

TypeScript pattern for migrated dialogs:

```ts
// 1. Export typed data interface
export interface TransportDispatchDialogData {
  vehicleId: string;
}

// 2. Export typed result type
export type TransportDispatchResult = boolean | undefined;

@Component({ ..., imports: [CommonModule, ReactiveFormsModule, MatDialogModule,
  MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule] })
export class TransportDispatchDialogOrganism implements OnInit {
  // 3. Inject MAT_DIALOG_DATA (typed)
  readonly data = inject<TransportDispatchDialogData>(MAT_DIALOG_DATA);
  // 4. Inject MatDialogRef (typed)
  private dialogRef = inject(MatDialogRef<TransportDispatchDialogOrganism, TransportDispatchResult>);

  // 5. Signals for loading/error states
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  // 6. Reactive Form
  private fb = inject(FormBuilder);
  dispatchForm = this.fb.group({ ... });

  // 7. Close with typed result
  close(result?: TransportDispatchResult) {
    this.dialogRef.close(result);
  }

  // 8. Access data directly (not data().property)
  ngOnInit() {
    if (this.data.vehicleId) {
      this.dispatchForm.patchValue({ vehicleId: this.data.vehicleId });
    }
  }
}
```

Template structure for migrated dialogs:
```html
<div class="... max-w-[850px]">
  <header>
    <h2>Title</h2>
    <button mat-icon-button (click)="close()" aria-label="Cerrar diálogo">
      <mat-icon>close</mat-icon>
    </button>
  </header>

  @if (errorMsg()) {
    <div class="..."> ... </div>
  }

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <!-- form fields using <mat-form-field> -->
  </form>

  <footer>
    <button mat-button (click)="close()">Cancelar</button>
    <button mat-flat-button type="submit" [disabled]="form.invalid || loading()">
      @if (loading()) { <mat-icon>...</mat-icon> } Confirmar
    </button>
  </footer>
</div>
```

## Interfaces / Contracts

### Typed Dialog Data Interfaces

Each migrated dialog exports its data interface and result type alongside the component class:

| Dialog | Data Interface | Props | Result |
|--------|---------------|-------|--------|
| TransportDispatchDialogOrganism | `TransportDispatchDialogData` | `{ vehicleId: string }` | `boolean \| undefined` |
| TransportOperationDialogOrganism | `TransportOperationDialogData` | `{ routeId: string; vehicleId: string }` | `boolean \| undefined` |
| TransportIncidentDialogOrganism | `TransportIncidentDialogData` | `{ routeId: string }` | `boolean \| undefined` |
| TransportExpenseDialogOrganism | `TransportExpenseDialogData` | `{ routeId: string }` | `boolean \| undefined` |
| TransportStandbyDialogOrganism | `TransportStandbyDialogData` | `{ route: TransportRoute }` | `boolean \| undefined` |
| TransportSettleDialogOrganism | `TransportSettleDialogData` | `{ route: TransportRoute }` | `boolean \| undefined` |
| TransportCancelDialogOrganism | `TransportCancelDialogData` | `{ route: TransportRoute }` | `boolean \| undefined` |
| TransportChangeVehicleDialogOrganism | `TransportChangeVehicleDialogData` | `{ routeId: string }` | `boolean \| undefined` |
| TransportMaintenanceDialogOrganism | `TransportMaintenanceDialogData` | `{ vehicleId: string }` | `boolean \| undefined` |
| TransportOperationClosureDialogOrganism | `TransportOperationClosureDialogData` | `{ routeId: string; operationId: string; status: 'Completed' \| 'Cancelled' }` | `boolean \| undefined` |
| AnamnesisDialogComponent | `AnamnesisDialogData` | `{ reason: string; currentIllness: string }` | `AnamnesisDialogResult` |
| DiagnosticsDialogComponent | `DiagnosticsDialogData` | `{ main: {...}; secondary: [...] }` | `DiagnosticsDialogResult` |
| PhysicalExamDialogComponent | `PhysicalExamDialogData` | `{ weight, height, temperature, findings }` | `PhysicalExamDialogResult` |
| IncapacityDialogComponent | `IncapacityDialogData` | `{ days, type, specialLicense, recommendations }` | `IncapacityDialogResult` |
| OrdersDialogComponent | `OrdersDialogData` | `{ prescriptions, procedures }` | `OrdersDialogResult` |

### Consultation Dialog Signal Bridge

Phase 2 dialogs replace `data().property = value` (mutable-by-reference) with return-value flow:

```ts
// BEFORE (Pattern B - consultation)
// Dialog: [(ngModel)]="data().reason" — mutates caller's signal through object ref

// AFTER (Pattern A)
export interface AnamnesisDialogData {
  reason: string;
  currentIllness: string;
}
export interface AnamnesisDialogResult {
  reason: string;
  currentIllness: string;
}

@Component(...)
export class AnamnesisDialogComponent implements OnInit {
  readonly data = inject<AnamnesisDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AnamnesisDialogComponent, AnamnesisDialogResult>);

  private fb = inject(FormBuilder);
  form = this.fb.group({
    reason: ['', Validators.required],
    currentIllness: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue(this.data); // data is read-only; copy into form
  }

  onSubmit() {
    this.dialogRef.close(this.form.value as AnamnesisDialogResult);
  }
}
```

Caller (already subscribes):
```ts
const ref = this.dialog.open(AnamnesisDialogComponent, { data: currentValue() });
ref.afterClosed().subscribe(result => {
  if (result) this.consultationData.set(result);
});
```

## Migration Blueprint per Dialog

### Phase 1 — Transport (each dialog)

**Changes per transport dialog:**
1. Add imports: `MatDialogModule`, `MatDialogRef`, `MAT_DIALOG_DATA`, `MatButtonModule`, `MatIconModule`
2. Export typed `XxxDialogData` interface
3. Replace `data = input<any>({})` → `readonly data = inject<XxxDialogData>(MAT_DIALOG_DATA)`
4. Replace `closed = output<boolean | undefined>()` → `private dialogRef = inject(MatDialogRef<XxxDialogOrganism, boolean | undefined>)`
5. Replace `this.closed.emit(result)` → `this.dialogRef.close(result)` throughout
6. Replace `data().property` → `this.data.property` (no function call — direct property access)
7. Replace `<span class="material-icons">` → `<mat-icon>` in templates
8. Add `aria-label="Cerrar diálogo"` to close buttons
9. Replace `panelClass: 'custom-dialog-container'` callers with `DIALOG_PANEL_CLASS`
10. Replace `width: '600px'` callers with `DIALOG_WIDTHS.md`

**Example — TransportDispatchDialogOrganism specific:**
- Data interface: `{ vehicleId: string }` (currently `data().vehicleId`)
- Template: `<span class="material-icons">close</span>` → `<mat-icon>close</mat-icon>`
- Close button: add `aria-label="Cerrar diálogo"`
- Caller: `width: DIALOG_WIDTHS.lg`, `panelClass: DIALOG_PANEL_CLASS` (was `'custom-premium-dialog'`)

### Phase 2 — Consultation (5 dialogs)

**Additional changes beyond Phase 1:**
1. Replace `FormsModule` (`[(ngModel)]`) with `ReactiveFormsModule` (`FormBuilder`, `formControlName`)
2. Constructor: `this.form.patchValue(this.data)` to seed form from read-only data
3. Replace `data().property = value` mutations with form control changes
4. Close with typed result: `dialogRef.close(this.form.value as ResultType)`
5. Caller: add/reuse `afterClosed().subscribe(result => { if (result) signal.set(result) })`

**AnamnesisDialogComponent** — template-driven `[(ngModel)]="data().reason"` → Reactive `formControlName="reason"`
**DiagnosticsDialogComponent** — `data().main.principalCode` → form groups; `data().secondary` mutations → FormArray
**PhysicalExamDialogComponent** — `[(ngModel)]="data().weight"` → `formControlName="weight"`
**IncapacityDialogComponent** — `[(ngModel)]="data().days"` → `formControlName="days"`
**OrdersDialogComponent** — `data().prescriptions.push(...)` → FormArray for prescriptions/procedures

### Phase 3 — Re-enable commented-out

**BillingPageComponent** — `openNewInvoiceDialog()`:
```ts
openNewInvoiceDialog() {
  const ref = this.dialog.open(InvoiceFormDialogOrganism, {
    width: DIALOG_WIDTHS.lg,
    panelClass: DIALOG_PANEL_CLASS
  });
  ref.afterClosed().subscribe(result => {
    if (result) this.billingService.addInvoice(result as Invoice);
  });
}
```

**AgendaPageComponent** — `openAppointmentForm()`:
```ts
openAppointmentForm() {
  const ref = this.dialog.open(AppointmentFormOrganism, {
    width: DIALOG_WIDTHS.md,
    panelClass: DIALOG_PANEL_CLASS
  });
  ref.afterClosed().subscribe(result => {
    if (result) this.showNotification('Cita creada exitosamente');
  });
}
```

### Special Cases

- **CustomerDialogOrganism**: Replace `data = input<{ customer?: Customer }>({})` with `inject(MAT_DIALOG_DATA)`, replace `closed = output<boolean>()` with `dialogRef.close()`. Keep template-driven forms.
- **SupplierDialogOrganism**: Same — data passing only, keep template-driven.
- **ProductFormMolecule**: Full migration — data passing + add Reactive Forms + `<mat-icon>` + ARIA.
- **InvoiceDetailMolecule**: Already has `input.required<{ invoice: Invoice }>()` — add `inject(MAT_DIALOG_DATA)` as the primary path, keep `input()` fallback for inline use.
- **AppointmentConfirmationDialogOrganism**: Pattern B → A (keep Reactive Forms, add `<mat-icon>`)
- **AppointmentCancellationDialogOrganism**: Pattern B → A (add Reactive Forms, `<mat-icon>`, ARIA)

## Icons & Accessibility Checklist

For all migrated dialogs:
- **Icon migration**: `<span class="material-icons">` → `<mat-icon>` (17 dialogs affected)
- **Close button**: Add `aria-label="Cerrar diálogo"` to every dialog close button
- **Form labels**: Ensure `<label for="id">` + `[formControlName]`/`matInput` `id` attribute pairing
- **Error banners**: Dismissible error banner per canonical pattern

## Testing Strategy

No `.spec.ts` files exist for migrated dialogs per proposal's explicit non-goal. Test strategy is manual verification per phase:

| Verification | Method | Criteria |
|-------------|--------|----------|
| Transport dialog opens | Manual click in app | Renders with correct data; no console errors |
| Transport dialog closes | Manual click confirm/cancel | Dialog closes; side effect fires |
| Consultation dialog opens | Manual click | Renders with pre-filled data read from `MAT_DIALOG_DATA` |
| Consultation dialog returns value | Manual submit | `afterClosed()` receives updated object |
| Icons render | Visual check | `<mat-icon>` shows correct icon, no broken spans |
| Accessibility | DevTools | Close button has `aria-label`; focus trap works |
| Billing/agenda re-enable | Manual click | `openNewInvoiceDialog()` and `openAppointmentForm()` open and close correctly |
| TypeScript compilation | `npx tsc --noEmit` | Zero type errors |

## Migration / Rollout

Phase into 3 stacked PRs to respect 400-line review budget:

| PR | Scope | Est. Lines | Risk |
|----|-------|-----------|------|
| #1 Config + Phase 1 Transport | Create `dialog.config.ts` + migrate 10 transport dialogs + update callers | ~350-400 | Low — fire-and-forget, no data flow change |
| #2 Phase 2 Consultation | Migrate 5 consultation dialogs + signal bridge | ~350-400 | Medium — template-driven → Reactive Forms |
| #3 Phase 3 Re-enable | Wire billing/agenda callers + special cases | ~100-150 | Low — organisms already canonical |

If PR #1 exceeds 400 lines, split transport dialogs further by caller page (service-detail-page first, dashboard+tracking second).

## Config

- `artifact_store.mode`: `openspec`
- `delivery_strategy`: `single-pr-default`
- `review_budget_lines`: 800
- `chain_strategy`: `stacked-to-main`
