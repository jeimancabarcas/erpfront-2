# Exploration: Mat Dialog Standardization

## Summary

The codebase has **24+ dialog/modals** across two incompatible architectural patterns: (1) proper `MatDialog` (overlay-based with `MatDialogRef`/`MAT_DIALOG_DATA`) and (2) signal/`input`-based components toggled inline or opened via `MatDialog` but internally using `input()`/`output()`. There is no shared dialog base class, no dialog service/wrapper, and no consistent data passing convention. The transport domain alone has 8 dialog organisms all using the non-standard `input/output` pattern despite being opened via `MatDialog.open()`. Several pages have commented-out dialog functionality waiting for "dialog organisms to be migrated".

## Current Dialog Inventory

### Pattern A: Full MatDialog (Traditional)
Uses `MatDialogRef`, `MAT_DIALOG_DATA`, `MatDialogModule`.

| File | Component | Domain | Atomic Level | Data Pattern | Closes With | Width | Issues |
|------|-----------|--------|--------------|-------------|-------------|-------|--------|
| `src/app/components/organisms/invoice-form-dialog/invoice-form-dialog.component.ts` | `InvoiceFormDialogOrganism` | Billing | Organism | `inject(MatDialogRef)` — no `MAT_DIALOG_DATA` | `dialogRef.close(newInvoice)` | N/A (caller sets) | No typed data; uses private `dialogRef` |
| `src/app/components/organisms/appointment-form/appointment-form.component.ts` | `AppointmentFormOrganism` | Pediatrics | Organism | `inject(MatDialogRef)` — no `MAT_DIALOG_DATA` | `dialogRef.close(true)` | N/A (caller sets) | No typed data |
| `src/app/components/organisms/patient-registration-wizard/patient-registration-wizard.component.ts` | `PatientRegistrationWizardOrganism` | Pediatrics | Organism | `inject(MatDialogRef)` + `@Inject(MAT_DIALOG_DATA)` typed as `Patient \| null` | `dialogRef.close(true)` | N/A (caller sets) | Only dialog using `MAT_DIALOG_DATA` with a typed interface |
| `src/app/components/organisms/sales-note-form-dialog/sales-note-form-dialog.component.ts` | `SalesNoteFormDialogOrganism` | Sales | Organism | `inject(MatDialogRef)` + `inject(MAT_DIALOG_DATA)` typed via `SalesNoteDialogData` interface | `dialogRef.close({success, type, note})` | max-w-[850px] **inline** | Most mature MatDialog implementation; has typed dialog data interface; loading/error states; imports `MatDialogModule` |

### Pattern B: MatDialog-Opened but Using `input()`/`output()` Internally
These are opened via `this.dialog.open(Component, { data: {...} })` but internally use `data = input<any>({})` / `closed = output<any>()` instead of `MatDialogRef`/`MAT_DIALOG_DATA`.

| File | Component | Domain | Atomic Level | Data Pattern | Closes With | Width | Issues |
|------|-----------|--------|--------------|-------------|-------------|-------|--------|
| `src/app/components/organisms/anamnesis-dialog/anamnesis-dialog.component.ts` | `AnamnesisDialogComponent` | Consultation | Organism | `data = input<any>({})` — mutable by reference | `closed.emit(result)` | 600px, `premium-modal` | `any` typed data; mutates data object directly; no FormBuilder |
| `src/app/components/organisms/physical-exam-dialog/physical-exam-dialog.component.ts` | `PhysicalExamDialogComponent` | Consultation | Organism | `data = input<any>({})` — mutable by reference | `closed.emit(result)` | 700px, `premium-modal` | Same pattern as Anamnesis |
| `src/app/components/organisms/diagnostics-dialog/diagnostics-dialog.component.ts` | `DiagnosticsDialogComponent` | Consultation | Organism | `data = input<any>({})` — mutable by reference | `closed.emit(result)` | 850px, `premium-modal` | Complex data with nested arrays |
| `src/app/components/organisms/incapacity-dialog/incapacity-dialog.component.ts` | `IncapacityDialogComponent` | Consultation | Organism | `data = input<any>({})` — mutable by reference | `closed.emit(result)` | 600px, `premium-modal` | Same pattern |
| `src/app/components/organisms/orders-dialog/orders-dialog.component.ts` | `OrdersDialogComponent` | Consultation | Organism | `data = input<any>({ prescriptions, procedures })` — mutable by reference | `closed.emit(result)` | 950px, `premium-modal` | Mutates signal array reference directly |

### Pattern B (continued): Transport Dialogs

| File | Component | Domain | Atomic Level | Data Pattern | Closes With | Width | Issues |
|------|-----------|--------|--------------|-------------|-------------|-------|--------|
| `src/app/components/organisms/transport-dispatch-dialog/transport-dispatch-dialog.component.ts` | `TransportDispatchDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | N/A | Uses `FormBuilder`; injects `FinanceService` |
| `src/app/components/organisms/transport-operation-dialog/transport-operation-dialog.component.ts` | `TransportOperationDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | 600px, `custom-dialog-container` | Uses `FormBuilder`; file attachment UI |
| `src/app/components/organisms/transport-operation-closure-dialog/transport-operation-closure-dialog.component.ts` | `TransportOperationClosureDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | 500px, `custom-dialog-container` | Dynamic validators based on status |
| `src/app/components/organisms/transport-expense-dialog/transport-expense-dialog.component.ts` | `TransportExpenseDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | 600px, `custom-dialog-container` | File attachment UI |
| `src/app/components/organisms/transport-settle-dialog/transport-settle-dialog.component.ts` | `TransportSettleDialogOrganism` | Transport | Organism | `data = input<{ route: TransportRoute }>({} as ...)` | `closed.emit(result)` | 600px, `custom-dialog-container` | Only one with typed input data |
| `src/app/components/organisms/transport-cancel-dialog/transport-cancel-dialog.component.ts` | `TransportCancelDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | 600px, `custom-dialog-container` | Used in 3 different pages |
| `src/app/components/organisms/transport-standby-dialog/transport-standby-dialog.component.ts` | `TransportStandbyDialogOrganism` | Transport | Organism | `data = input<{ route: TransportRoute }>({} as ...)` | `closed.emit(result)` | 600px, `custom-dialog-container` | Typed data |
| `src/app/components/organisms/transport-change-vehicle-dialog/transport-change-vehicle-dialog.component.ts` | `TransportChangeVehicleDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | 600px, `custom-dialog-container` | Rich validation |
| `src/app/components/organisms/transport-incident-dialog/transport-incident-dialog.component.ts` | `TransportIncidentDialogOrganism` | Transport | Organism | `data = input<any>({})` | `closed.emit(result)` | 600px, `custom-dialog-container` | FormBuilder + time fields |

### Pattern C: Template-Toggled (No MatDialog)

| File | Component | Domain | Atomic Level | Data Pattern | Closes With | Issues |
|------|-----------|--------|--------------|-------------|-------------|--------|
| `src/app/components/molecules/confirm-dialog/confirm-dialog.component.ts` | `ConfirmDialogMolecule` | Shared | Molecule | `input/output` signals: `open`, `title`, `message`, `confirm`, `cancel` | `confirm.emit()` / `cancel.emit()` | Custom SCSS backdrop + animations; has escape/enter keyboard handling; `role="alertdialog"`; used in 7 files |
| `src/app/components/molecules/sale-form/sale-form.component.ts` | `SaleFormMolecule` | Sales | Molecule | `closed = output<boolean>()`; toggled via parent `showSaleForm` signal | `closed.emit(result)` | 507-line monster molecule; uses `CustomerDialogOrganism` inline via signal toggle |
| `src/app/components/molecules/product-form/product-form.component.ts` | `ProductFormMolecule` | Inventory | Molecule | `data = input<{ product?: Product }>({})`, `closed = output<boolean>()` | `closed.emit(result)` | Opened via `MatDialog.open()` from `StockTableMolecule`; actually uses MatDialog! |
| `src/app/components/molecules/invoice-detail/invoice-detail.component.ts` | `InvoiceDetailMolecule` | Sales | Molecule | `data = input.required<{ invoice: Invoice }>()`, `closed = output<void>()` | `closed.emit()` | Opened via `MatDialog.open()` from `InvoicesTableMolecule`; uses atom buttons |
| `src/app/components/organisms/customer-dialog/customer-dialog.component.ts` | `CustomerDialogOrganism` | Sales | Organism | `data = input<{ customer?: Customer }>({})`, `closed = output<boolean>()` | `closed.emit(result)` | Template-driven form (`#supplierForm="ngForm"`); both inline toggled AND opened via MatDialog |
| `src/app/components/organisms/supplier-dialog/supplier-dialog.component.ts` | `SupplierDialogOrganism` | Inventory | Organism | `data = input<{ supplier?: Supplier }>({})`, `closed = output<boolean>()` | `closed.emit(result)` | Template-driven form; toggled inline from supplier page |

### Pages Opening Dialogs (Caller Side)

| Page | Dialogs Opened | Pattern Used | Panel Class |
|------|---------------|-------------|-------------|
| `src/app/components/pages/consultation-page/consultation-page.component.ts` | All 5 consultation dialogs | `this.dialog.open(Comp, { data, width, panelClass })` + `dialogRef.afterClosed().subscribe()` | `premium-modal` |
| `src/app/components/pages/transport-page/service-detail-page/service-detail-page.component.ts` | All 9 transport dialogs | `this.dialog.open(Comp, { data, width, panelClass })` | `custom-dialog-container` |
| `src/app/components/pages/transport-page/transport-dashboard-view/transport-dashboard-view.component.ts` | `TransportDispatchDialogOrganism`, `TransportCancelDialogOrganism` | `this.dialog.open(...)` | Various |
| `src/app/components/pages/transport-page/transport-tracking-view/transport-tracking-view.component.ts` | `TransportCancelDialogOrganism` | `this.dialog.open(...)` | Various |
| `src/app/components/pages/sales-page/sales-page.component.ts` | `SaleFormMolecule` (inline toggle via `showSaleForm` signal) | Signal toggling — **NO MatDialog** | N/A |
| `src/app/components/molecules/invoices-table/invoices-table.component.ts` | `InvoiceDetailMolecule` | `this.dialog.open(Comp, { width: '800px', maxWidth: '95vw', data })` | Default |
| `src/app/components/molecules/stock-table/stock-table.component.ts` | `ProductFormMolecule` | `this.dialog.open(Comp, { width: '600px', maxWidth: '95vw', disableClose: true, data })` | Default |
| `src/app/components/pages/billing-page/billing-page.component.ts` | Invoice form | **COMMENTED OUT**: `// Dialog functionality will be restored when dialog organisms are migrated` | N/A |
| `src/app/components/pages/agenda-page/agenda-page.component.ts` | Appointment form | **COMMENTED OUT**: `// Dialog functionality will be restored when dialog organisms are migrated` | N/A |

## CodeGraph Search Results Summary

| Search | Results | Key Finding |
|--------|---------|-------------|
| `MatDialog` | 59 symbols across 9 files | Only 5 files use `MatDialog` service to open dialogs |
| `dialog open` | 89 symbols across 28 files | 28 files participate in dialog opening or definition |
| `MatDialogRef MAT_DIALOG_DATA MatDialogConfig` | 78 symbols across 12 files | Only 3 organisms use `MatDialogRef`; only 2 use `MAT_DIALOG_DATA`; `MatDialogConfig` not used at all |
| `MatDialogModule` | Imported in 4 dialog organisms + wherever `MatDialogRef`/`MAT_DIALOG_DATA` are used | Not imported in `input/output` pattern dialogs |
| `ui-confirm-dialog` / `ConfirmDialogMolecule` | Used in 7 pages | Custom non-MatDialog component with CSS backdrop, escape/enter handling |
| `panelClass` strings | `'premium-modal'` (consultation) vs `'custom-dialog-container'` (transport) | Two different panel class names with likely no corresponding global styles |

## Reference Implementation Candidates

### Most Complete MatDialog Pattern: `SalesNoteFormDialogOrganism`
- **File**: `src/app/components/organisms/sales-note-form-dialog/sales-note-form-dialog.component.ts`
- **Strengths**:
  - Typed `SalesNoteDialogData` interface exported alongside component
  - Uses `inject(MatDialogRef)` + `inject(MAT_DIALOG_DATA)` with generics
  - Full Reactive Forms with FormBuilder + FormArray
  - Signal-to-form bridge (manual trigger for computed re-evaluation)
  - Loading state with spinner
  - Error state with dismissible banner
  - Proper `MatDialogModule`, Material form components
  - Tailwind CSS styling consistent with project
  - Structured template with header, body, footer
  - Inline `max-w-[850px]` in template
- **Weakness**: Does not import `MatDialogModule` in imports array (but it works because MatDialog provides the overlay container)

### Best Typed Data Pattern: `PatientRegistrationWizardOrganism`
- **File**: `src/app/components/organisms/patient-registration-wizard/patient-registration-wizard.component.ts`
- **Strengths**: Only dialog using `@Inject(MAT_DIALOG_DATA) public data: Patient | null` with a proper domain type

### Most Used Non-MatDialog Pattern: `ConfirmDialogMolecule`
- **File**: `src/app/components/molecules/confirm-dialog/confirm-dialog.component.ts`
- **Strengths**: Proper accessibility (ARIA roles), keyboard handling, CSS animations, reduce-motion support

## Inconsistencies Found

### 1. Two Completely Incompatible Architectural Patterns
- **Pattern A** (4 organisms): `MatDialogRef` + `MAT_DIALOG_DATA` — requires `MatDialogModule`
- **Pattern B** (15+ organisms): `input()` + `output()` — no Material dependency; but opened via `MatDialog.open()` anyway
- **Pattern C** (5+ components): Signal toggling — embedded in parent template, no overlay

### 2. Data Passing Is Inconsistent
- `MAT_DIALOG_DATA` used by 2 organisms (`PatientRegistrationWizardOrganism`, `SalesNoteFormDialogOrganism`)
- `data = input<any>({})` used by 12+ organisms — **untyped, unsafe**
- `data = input<{ route: TransportRoute }>({} as ...)` used by 2 organisms — partially typed
- `data = input.required<{ invoice: Invoice }>()` used by `InvoiceDetailMolecule` — **best typed**
- `InvoiceFormDialogOrganism` and `AppointmentFormOrganism` pass **no data at all** via `MAT_DIALOG_DATA`

### 3. Closing Mechanism Inconsistent
- `dialogRef.close(result)` — Pattern A
- `closed.emit(result)` — Pattern B
- `confirm.emit()` / `cancel.emit()` — Pattern C (`ConfirmDialogMolecule`)
- Some emit `boolean`, some `any`, some `void`, some `{success, type, note}`

### 4. Panel Class Names Inconsistent
- `'premium-modal'` — ConsultationPage dialogs
- `'custom-dialog-container'` — Transport dialogs
- No panel class — Molecules like `InvoicesTableMolecule`, `StockTableMolecule`
- No corresponding global SCSS/CSS files found for either panel class name

### 5. Dialog Configuration Inconsistent
- Widths range: 500px, 600px, 700px, 800px, 850px, 950px — no standard sizes
- `maxWidth: '95vw'` used in some, absent in others
- `disableClose: true` used only in `StockTableMolecule.editProduct()`
- No dialog uses `MatDialogConfig` as a reusable object — all config is inline

### 6. Styling Approaches Differ
- Pattern A organisms use `::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }`
- Pattern B organisms use pure Tailwind + native HTML elements (no Material form fields)
- `InvoiceDetailMolecule` uses `ui-button` atoms
- Transport dialogs use raw `<button>` with Tailwind classes
- `ConfirmDialogMolecule` uses `ui-card` + `ui-button` atoms with separate SCSS file

### 7. Form Strategy Inconsistent
- `FormBuilder` + `ReactiveFormsModule`: `InvoiceFormDialogOrganism`, `AppointmentFormOrganism`, `PatientRegistrationWizardOrganism`, `SalesNoteFormDialogOrganism`, transport dialogs
- `FormsModule` (template-driven): `CustomerDialogOrganism`, `SupplierDialogOrganism`
- Direct `[(ngModel)]` on signal data: `AnamnesisDialogComponent`, `PhysicalExamDialogComponent`, `DiagnosticsDialogComponent`, `IncapacityDialogComponent`, `OrdersDialogComponent`

### 8. Commented-Out Dialog Functionality
- `billing-page.component.ts` line 159: `// Dialog functionality will be restored when dialog organisms are migrated`
- `agenda-page.component.ts` lines 109, 116, 122: `// Dialog functionality will be restored when dialog organisms are migrated`
- These indicate an **already-planned migration** that was never completed

### 9. No Shared Dialog Infrastructure
- No base dialog class
- No dialog service or wrapper
- No shared dialog configuration constants
- No shared dialog styling
- Each dialog is completely standalone with duplicated patterns

### 10. Accessibility Issues
- `ConfirmDialogMolecule` has `role="alertdialog"` and `aria-modal` — **only accessible dialog**
- MatDialog provides `aria-modal` automatically on overlay, but no dialog component sets ARIA labels
- Transport dialogs use `<span class="material-icons">close</span>` — no accessible close button

### 11. Material Icon Approach Inconsistent
- `mat-icon` (Material icon component): Pattern A dialogs, molecules with Material imports
- `<span class="material-icons">` (Google Material Icons font): Pattern B dialogs (consultation + transport)
- Mixed within same component: `InvoiceDetailMolecule` uses `<span class="material-icons">` while `InvoicesTableMolecule` uses `<mat-icon>`

## Dependencies Map

### Imports from `@angular/material/dialog`

```
MatDialog (service)
├── ConsultationPageComponent          — opens 5 consultation dialogs
├── TransportServiceDetailPageComponent— opens 9 transport dialogs
├── TransportDashboardViewComponent    — opens 2 dialogs
├── TransportTrackingViewComponent     — opens 1 dialog
├── InvoicesTableMolecule              — opens InvoiceDetailMolecule
└── StockTableMolecule                 — opens ProductFormMolecule

MatDialogRef (class to inject)
├── PatientRegistrationWizardOrganism  — inject(MatDialogRef<...>)
├── InvoiceFormDialogOrganism          — inject(MatDialogRef<...>)
├── AppointmentFormOrganism            — inject(MatDialogRef<...>)
└── SalesNoteFormDialogOrganism        — inject(MatDialogRef<...>)

MAT_DIALOG_DATA (injection token)
├── PatientRegistrationWizardOrganism  — @Inject(MAT_DIALOG_DATA) data: Patient | null
└── SalesNoteFormDialogOrganism        — inject(MAT_DIALOG_DATA) as SalesNoteDialogData

MatDialogModule (NgModule)
├── PatientRegistrationWizardOrganism  — imports: [MatDialogModule]
├── InvoiceFormDialogOrganism          — imports: [MatDialogModule]
├── AppointmentFormOrganism            — imports: [MatDialogModule]
└── SalesNoteFormDialogOrganism        — imports: [MatDialogModule]
```

### Material Form Components Used in Dialogs
- `MatFormFieldModule`, `MatInputModule`, `MatSelectModule` — Pattern A dialogs
- `MatDatepickerModule`, `MatTimepickerModule` — `AppointmentFormOrganism` only
- `MatButtonModule`, `MatIconModule` — Pattern A dialogs
- `MatCheckboxModule`, `MatDividerModule`, `MatSlideToggleModule` — `SalesNoteFormDialogOrganism` only

## Atomic Design Level Distribution

| Level | Dialog Components | Pattern |
|-------|------------------|---------|
| **Organism** | 19 dialog components | Mix of Pattern A, Pattern B |
| **Molecule** | 5 dialog components (`ConfirmDialogMolecule`, `InvoiceDetailMolecule`, `ProductFormMolecule`, `SaleFormMolecule`, `InvoicesTableMolecule`) | Mix of Pattern B, Pattern C |
| **Atom** | 0 | N/A |
| **Template** | 0 (dashboard-layout used but not dialog) | N/A |
| **Page** | 6 pages open dialogs | Callers only |

## Recommendations (Initial — For Proposal Phase)

1. **Define a canonical MatDialog pattern** based on `SalesNoteFormDialogOrganism` as reference: typed `MAT_DIALOG_DATA`, `MatDialogRef`, proper form handling, loading/error states
2. **Migrate all Pattern B organisms** (input/output) to use `MatDialogRef` + `MAT_DIALOG_DATA` — these are already opened via `MatDialog.open()` so the breaking change is minimal
3. **Standardize dialog configuration**: extract panel class, widths, `maxWidth`, `disableClose` into shared constants
4. **Replace `data = input<any>()`** with typed interfaces alongside each dialog component
5. **Re-enable commented-out dialog calls** in `billing-page` and `agenda-page`
6. **Decide on icon approach**: `mat-icon` component vs `<span class="material-icons">` — standardize
7. **Add basic accessibility**: ARIA labels on close buttons, proper heading hierarchy
8. **Consider a `DialogService` facade** that wraps `MatDialog.open()` with project-specific defaults (panel class, max width, animation)
9. **Evaluate `ConfirmDialogMolecule`**: decide whether to migrate to MatDialog or keep as-is (it serves a different purpose — lightweight confirmations)

## Risks

1. **Breaking existing dialog behavior**: Changing `closed.emit()` to `dialogRef.close()` requires updating ALL callers
2. **Template-driven forms**: `CustomerDialogOrganism` and `SupplierDialogOrganism` use `#form="ngForm"` — migration to Reactive Forms would be ideal but adds scope
3. **Signal mutation pattern**: Consultation dialogs mutate `data()*.property` directly (two-way binding via object reference) — switching to `MAT_DIALOG_DATA` changes data flow
4. **Transport domain scope creep**: 8 dialog organisms to migrate is substantial work
5. **Duplicate interface names**: `Customer` exists in both `sales.service.ts` and `customer.model.ts` with different shapes — dialog typing must choose one
6. **Missing test coverage**: Only `ConfirmDialogMolecule` has a `.spec.ts` file — no test safety net for migration
7. **`disableClose` behavior**: `StockTableMolecule` sets `disableClose: true` for `ProductFormMolecule` — must preserve this behavior
