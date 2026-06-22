# Exploration: Dialog View Invoice Pattern Standardization

## Summary

The user wants ALL dialogs in the ERP frontend to follow the same pattern as the dialog opened by the "ver factura" (visibility icon) button in the customer detail page's "Historial de Facturación" table. That reference is `InvoiceDetailDialogOrganism`, opened from `CustomerInvoicesTableOrganism.viewInvoiceDetail()`. The reference has a distinct pattern that **partially conflicts** with the just-completed `mat-dialog-standardization` change: it uses `<span class="material-icons">` (not `<mat-icon>`), dual-mode data passing (MAT_DIALOG_DATA optional + input/output), signal-based state management with loading/error/content states, Tailwind-only styling, and a `premium-dialog` panel class (not `erp-dialog-panel` from dialog.config.ts). Twenty-eight dialogs were inventoried — many already migrated to a different canonical pattern by the previous change. Standardizing to the user's reference will require **reverting some mat-dialog-standardization decisions** and filling gaps in the remaining non-migrated dialogs.

## Reference Dialog Found

- **Component**: `InvoiceDetailDialogOrganism`
- **File**: `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts`
- **Trigger**: `<ui-button variant="icon" tooltip="Ver detalle completo" (clicked)="viewInvoiceDetail(inv)">` in `CustomerInvoicesTableOrganism`
- **Page context**: `sales-customer-detail-page` → `CustomerInvoicesTableOrganism` (Historial de Facturación table)
- **Caller**: `CustomerInvoicesTableOrganism.viewInvoiceDetail(invoice)` at line 169-176

### Trace Chain

```
sales-customer-detail-page.component.ts
  └── <app-customer-invoices-table-organism> (CustomerInvoicesTableOrganism)
        └── viewInvoiceDetail(invoice: Invoice)  [line 169]
              └── this.dialog.open(InvoiceDetailDialogOrganism, {
                    data: { invoiceId: invoice.id },
                    width: '100%',
                    maxWidth: '950px',
                    panelClass: 'premium-dialog'
                  })
```

### Reference Pattern Analysis

The reference dialog is a **read-only detail display dialog** (no form submission) that fetches invoice data by ID. It supports **dual-mode**: both MatDialog opening AND potential inline usage via `data` input binding. Key architectural decisions:

1. **Dual data contract**: `inject(MAT_DIALOG_DATA, { optional: true })` merges with `data = input<any>({})` — makes the component work both ways
2. **Dual closing**: `dialogRef.close()` (if in dialog) + `closed.emit()` (if inline) — always calls both
3. **Signal-based state**: `loading()`, `error()`, `invoice()`, `notes()`, `pdfLoading()`, `dianPdfLoading()` — granular reactive states
4. **Async data fetching**: `ngOnInit()` calls `invoiceService.getInvoiceById()` + `salesNoteService.getNotesByInvoiceId()`
5. **Full state handling**: loading spinner, error state with auto-close timeout (3s), empty/loaded content states
6. **Icon approach**: `<span class="material-icons">` throughout (NOT `<mat-icon>`)
7. **Styling**: Pure Tailwind CSS, inline in template, `rounded-[32px]`, `shadow-2xl`, CSS custom scrollbar
8. **No Material form components** — read-only display, no FormBuilder or inputs
9. **No ARIA labels** on close button or interactive elements

## Reference Pattern Spec

| Concern | Implementation |
|---------|---------------|
| Data passing | `inject(MAT_DIALOG_DATA, { optional: true })` merged with `data = input<any>({})` in `ngOnInit()` |
| Closing | Both `dialogRef.close()` AND `closed.emit()` — idempotent dual close |
| Form strategy | **No form** — read-only display dialog |
| States | `loading` (spinner), `error` (message + auto-close 3s), content (full detail) |
| Icons | `<span class="material-icons">icon_name</span>` — Google Material Icons font ligatures |
| Accessibility | ❌ No ARIA labels on close button, no heading hierarchy, no `role` attributes |
| Styling | Tailwind CSS inline, `rounded-[32px]`, `shadow-2xl`, `max-h-[95vh]`, CSS `webkit-scrollbar` |
| Caller config | `width: '100%'`, `maxWidth: '950px'`, `panelClass: 'premium-dialog'` — **inline, not from dialog.config.ts** |
| Uses dialog.config.ts? | ❌ No — uses inline config with `panelClass: 'premium-dialog'` instead of `DIALOG_PANEL_CLASS` |
| Imports | `CommonModule`, `CurrencyPipe`, `DatePipe` — no Material imports (no `MatIconModule`) |
| Template structure | Header with status badge + close button, grid layout for info, table for items, footer with CTA buttons |
| Loading states on buttons | `pdfLoading()` / `dianPdfLoading()` with spinner inside button text |

### CRITICAL: Conflict with mat-dialog-standardization

The just-completed `mat-dialog-standardization` change (archived 2026-06-22) established a DIFFERENT canonical pattern:
- **`<mat-icon>`** instead of `<span class="material-icons">`
- **`aria-label="Cerrar diálogo"`** on close buttons
- **`ReactiveFormsModule` + `FormBuilder`** for forms
- **`DIALOG_PANEL_CLASS = 'erp-dialog-panel'`** from `dialog.config.ts`
- **`typed MAT_DIALOG_DATA`** interfaces (no `input/output` dual contract)

The reference dialog (`InvoiceDetailDialogOrganism`) violates ALL of these. Standardizing to the reference pattern would **revert** some of the mat-dialog-standardization work. This must be surfaced as a critical risk.

## Full Dialog Inventory vs Reference

### Already Migrated (mat-dialog-standardization) — 15 dialogs

| # | Dialog | File | Pattern After Migration | Matches Reference? | Deviations |
|---|--------|------|------------------------|--------------------|------------|
| 1 | TransportDispatchDialogOrganism | `organisms/transport-dispatch-dialog/` | Pattern A: MAT_DIALOG_DATA + MatDialogRef + FB | ❌ | Uses `<mat-icon>`, `aria-label`, `erp-dialog-panel`, typed data |
| 2 | TransportOperationDialogOrganism | `organisms/transport-operation-dialog/` | Pattern A | ❌ | Same as above |
| 3 | TransportOperationClosureDialogOrganism | `organisms/transport-operation-closure-dialog/` | Pattern A | ❌ | Same as above |
| 4 | TransportExpenseDialogOrganism | `organisms/transport-expense-dialog/` | Pattern A | ❌ | Same as above |
| 5 | TransportSettleDialogOrganism | `organisms/transport-settle-dialog/` | Pattern A | ❌ | Same as above |
| 6 | TransportCancelDialogOrganism | `organisms/transport-cancel-dialog/` | Pattern A | ❌ | Same as above |
| 7 | TransportStandbyDialogOrganism | `organisms/transport-standby-dialog/` | Pattern A | ❌ | Same as above |
| 8 | TransportChangeVehicleDialogOrganism | `organisms/transport-change-vehicle-dialog/` | Pattern A | ❌ | Same as above |
| 9 | TransportIncidentDialogOrganism | `organisms/transport-incident-dialog/` | Pattern A | ❌ | Same as above |
| 10 | TransportClosureDialogOrganism | `organisms/transport-closure-dialog/` | Pattern A | ❌ | Same as above |
| 11 | AnamnesisDialogComponent | `organisms/anamnesis-dialog/` | Pattern A: MAT_DIALOG_DATA + MatDialogRef + FB | ❌ | Uses `<mat-icon>`, `aria-label`, `erp-dialog-panel` |
| 12 | PhysicalExamDialogComponent | `organisms/physical-exam-dialog/` | Pattern A | ❌ | Same as above |
| 13 | DiagnosticsDialogComponent | `organisms/diagnostics-dialog/` | Pattern A | ❌ | Same as above |
| 14 | IncapacityDialogComponent | `organisms/incapacity-dialog/` | Pattern A | ❌ | Same as above |
| 15 | OrdersDialogComponent | `organisms/orders-dialog/` | Pattern A | ❌ | Same as above |

### Dual-Contract Dialogs (Partial Migration) — 4 dialogs

| # | Dialog | File | Pattern | Matches Reference? | Deviations |
|---|--------|------|---------|--------------------|------------|
| 16 | **InvoiceDetailDialogOrganism** | `organisms/invoice-detail-dialog/` | **REFERENCE** | ✅ | — |
| 17 | InvoiceDetailMolecule | `molecules/invoice-detail/` | Dual: inject(MAT_DIALOG_DATA optional) + input.required() | ⚠️ Close | Uses `<span class="material-icons">` ✓, but simpler template, no loading states |
| 18 | ProductFormMolecule | `molecules/product-form/` | Dual: inject(MAT_DIALOG_DATA optional) + input() | ❌ | Uses `FormsModule` (template-driven), no ReactiveForms; closes via both `dialogRef.close()` and `closed.emit()` |
| 19 | CustomerDialogOrganism | `organisms/customer-dialog/` | Dual: inject(MAT_DIALOG_DATA optional) + input() | ❌ | Uses template-driven form (`#form="ngForm"`); no Material icon imports |
| 20 | SupplierDialogOrganism | `organisms/supplier-dialog/` | Dual: inject(MAT_DIALOG_DATA optional) + input() | ❌ | Uses signal-based form (not FormBuilder), `closed.emit()` only (no dialogRef) |

### Pattern A — Full MatDialog (Pre-existing, Not Migrated) — 4 dialogs

| # | Dialog | File | Pattern | Matches Reference? | Deviations |
|---|--------|------|---------|--------------------|------------|
| 21 | InvoiceFormDialogOrganism | `organisms/invoice-form-dialog/` | MatDialogRef + FB (no MAT_DIALOG_DATA) | ❌ | Uses `dialogRef.close()` only, no `input/output`, no loading states, has `::ng-deep` |
| 22 | PatientRegistrationWizardOrganism | `organisms/patient-registration-wizard/` | `@Inject(MAT_DIALOG_DATA)` + MatDialogRef + FB | ❌ | Multi-step wizard pattern, `dialogRef.close(true)`, uses `@Inject` instead of `inject()` |
| 23 | AppointmentFormOrganism | `organisms/appointment-form/` | MatDialogRef + FB (no MAT_DIALOG_DATA) | ❌ | No data passing, `dialogRef.close(true)`, has `::ng-deep` |
| 24 | SalesNoteFormDialogOrganism | `organisms/sales-note-form-dialog/` | MAT_DIALOG_DATA typed + MatDialogRef + FB + FormArray | ❌ | Most mature Pattern A implementation; loading/error states present; inline `max-w-[850px]` |

### Pattern B — Non-MatDialog (input/output Only) — 3 dialogs

| # | Dialog | File | Pattern | Matches Reference? | Deviations |
|---|--------|------|---------|--------------------|------------|
| 25 | AdjustmentDetailDialogOrganism | `organisms/adjustment-detail-dialog/` | `data = input<any>({})` + `closed = output<void>()` | ❌ | **No MatDialogRef or MAT_DIALOG_DATA at all** — pure inline pattern despite being opened in MatDialog |
| 26 | GeneralInvoiceFormDialogOrganism | `organisms/general-invoice-form-dialog/` | FB + `closed = output<FinanceInvoice \| null>()` | ❌ | No MatDialogRef, no MAT_DIALOG_DATA — uses `closed.emit()` only, has complex autocomplete components |
| 27 | AdjustmentFormDialogOrganism | `organisms/adjustment-form-dialog/` | `public data = inject(MAT_DIALOG_DATA, { optional: true })` + `public dialogRef` | ❌ | Has MAT_DIALOG_DATA and MatDialogRef but data is `any`, `public` visibility |

### Pattern C — Inline Toggle / Custom (No MatDialog Overlay) — 2 components

| # | Component | File | Pattern | Matches Reference? | Deviations |
|---|-----------|------|---------|--------------------|------------|
| 28 | ConfirmDialogMolecule | `molecules/confirm-dialog/` | `input/output` signals + custom SCSS backdrop | ❌ N/A | Custom non-MatDialog with CSS animations, `role="alertdialog"`, escape/enter handling — used in 7 pages |
| 29 | SaleFormMolecule | `molecules/sale-form/` | Signal toggle (`showSaleForm`) in parent template | ❌ N/A | 507-line molecule toggled via signal, not opened as MatDialog |

## Gaps Summary

### 1. Icon Approach Conflict (`<span class="material-icons">` vs `<mat-icon>`)
- **Reference uses**: `<span class="material-icons">close</span>` (line 61), `<span class="material-icons">error_outline</span>` (line 31), etc.
- **15 migrated dialogs use**: `<mat-icon>` exclusively (per mat-dialog-standardization REQ-8)
- **Impact**: Following the reference means reverting 15 dialogs from `<mat-icon>` back to `<span class="material-icons">`, OR keeping `<mat-icon>` and diverging from the reference
- **Risk**: HIGH — this is a direct conflict with the just-completed standardization

### 2. Panel Class Conflict
- **Reference uses**: `panelClass: 'premium-dialog'` (inline string in caller)
- **15 migrated dialogs use**: `panelClass: DIALOG_PANEL_CLASS` (constant `'erp-dialog-panel'`)
- **Impact**: Either consolidate to one panel class or accept two different panel classes

### 3. dialog.config.ts Not Used by Reference
- **Reference caller**: Inline `width: '100%'`, `maxWidth: '950px'` — does NOT import `DIALOG_WIDTHS` or `DIALOG_DEFAULTS`
- **7 caller pages**: Use `DIALOG_WIDTHS`, `DIALOG_DEFAULTS`, `DIALOG_PANEL_CLASS` from `dialog.config.ts`
- **Impact**: Standardizing to reference would mean all callers use inline config OR reference should adopt dialog.config.ts

### 4. Dual Contract vs Single Contract
- **Reference uses**: BOTH `MAT_DIALOG_DATA` optional AND `input/output` — supports both MatDialog and inline usage
- **15 migrated dialogs use**: ONLY `MAT_DIALOG_DATA` + `MatDialogRef` (no `input/output`)
- **Impact**: Adding dual contract to all dialogs adds complexity most don't need

### 5. `<span class="material-icons">` Requires Material Icons Font
- `<mat-icon>` works via `MatIconModule` (Material Symbols font included by Angular Material)
- `<span class="material-icons">` requires the Google Material Icons font to be loaded separately
- **Verification needed**: Is the Material Icons font loaded in `index.html`? If not, adding `<span>` icons to migrated dialogs would break icon rendering.

### 6. No ARIA Labels on Reference
- **Reference**: Close button has no `aria-label` — just `<button (click)="close()">` with `<span class="material-icons">close</span>`
- **15 migrated dialogs**: All have `aria-label="Cerrar diálogo"` (per mat-dialog-standardization REQ-9)
- **Impact**: Following reference would REMOVE accessibility improvements

### 7. Loading/Error States Gap
- **Reference**: Full `loading` (spinner), `error` (message + auto-close), and content states with `@if`
- **15 migrated dialogs**: No `loading` or `error` signals (P1 requirement marked as ⚠️ WARNING in verify report)
- **3 non-migrated dialogs**: AdjustmentDetailDialogOrganism, GeneralInvoiceFormDialogOrganism — no loading/error states
- **Impact**: Adding loading/error states would increase scope significantly

### 8. Dialog.config.ts Adoption Gap
- **Callers using dialog.config.ts**: agenda-page, billing-page, consultation-page, transport pages (7 callers)
- **Callers NOT using dialog.config.ts**: CustomerInvoicesTableOrganism (reference), InvoicesTableMolecule, StockTableMolecule (3 callers)
- **Impact**: Inconsistent across the codebase

### 9. Material Icons Font vs MatIconModule Gap
- **Dialogs using `<span class="material-icons">`**: InvoiceDetailDialogOrganism (reference), InvoiceDetailMolecule, SaleFormMolecule
- **Dialogs using `<mat-icon>`**: All 15 migrated dialogs + InvoiceFormDialogOrganism + AppointmentFormOrganism + PatientRegistrationWizardOrganism + SalesNoteFormDialogOrganism
- **Mixed within same project**: Yes — need to verify font loading in index.html

### 10. Inline vs Shared Config Gap
- **Reference caller** config: `{ data: { invoiceId: invoice.id }, width: '100%', maxWidth: '950px', panelClass: 'premium-dialog' }`
- **Standard callers**: `{ data, width: DIALOG_WIDTHS.lg, ...DIALOG_DEFAULTS, panelClass: DIALOG_PANEL_CLASS }`
- **Inconsistency**: `width: '100%'` (full width) vs fixed width presets from constants

## Recommendations

### Option A: Full Reference Standardization (Everything → InvoiceDetailDialogOrganism Pattern)

Migrate ALL dialogs to match the reference exactly: dual contract, `<span class="material-icons">`, `premium-dialog` panel class, signal state management, no ARIA labels on close buttons.

- **Pros**: Complete consistency, matches user's explicit request
- **Cons**: 
  - Reverts the just-completed `mat-dialog-standardization` work (15 dialogs)
  - Removes ARIA accessibility improvements
  - Requires verifying Material Icons font is loaded
  - Dual contract adds unnecessary complexity to form-submission dialogs
  - Conflicts with `dialog.config.ts` adoption
- **Effort**: HIGH — effectively re-do 15 dialogs + migrate 12 more

### Option B: Hybrid Standardization (Keep mat-dialog-standardization base, Add Reference Visuals)

Keep the `mat-dialog-standardization` foundation (`<mat-icon>`, typed `MAT_DIALOG_DATA`, `erp-dialog-panel`, `dialog.config.ts`, ARIA labels) but ADD the visual/structure patterns from the reference: loading/error states, consistent layout (header-body-footer), rounded-[32px] styling, signal-based state management.

- **Pros**: Preserves accessibility and type-safety gains, adds missing loading/error states
- **Cons**: 
  - Does NOT match the reference's `<span class="material-icons">` approach
  - User's visual reference uses `<span class="material-icons">` which looks different from `<mat-icon>` (though visually similar)
- **Effort**: MEDIUM — Add states to 15 dialogs + migrate 3 Pattern B dialogs to Pattern A

### Option C: Reference Pattern for New/Unmigrated Only

Apply the reference pattern ONLY to dialogs not yet migrated by `mat-dialog-standardization`: AdjustmentDetailDialogOrganism, GeneralInvoiceFormDialogOrganism, AdjustmentFormDialogOrganism, ProductFormMolecule (finish migration), CustomerDialogOrganism (finish migration), SupplierDialogOrganism (finish migration). Keep the 15 migrated dialogs as-is.

- **Pros**: No rework of completed work, focuses effort on remaining gaps
- **Cons**: 
  - Results in TWO canonical patterns (violates user's "ALL dialogs follow same pattern" requirement)
  - Doesn't satisfy the user's explicit request
- **Effort**: LOW-MEDIUM — ~6 dialogs to align

### Recommendation: Option B (Hybrid)

Option B best balances the user's intent (visual/behavioral consistency) with preserving the architectural gains from `mat-dialog-standardization`. The user likely cares about the visual quality and user experience of the reference dialog, not the specific `<span>` vs `<mat-icon>` implementation detail. Key deliverables:

1. **Add loading/error states** to all 15 migrated dialogs (signal-based)
2. **Migrate 3 Pattern B dialogs** to use `MAT_DIALOG_DATA` + `MatDialogRef`
3. **Update reference dialog** to use `<mat-icon>` and `dialog.config.ts` (align it TO the standard, not the other way)
4. **Standardize panel class**: consolidate `'premium-dialog'` and `'erp-dialog-panel'` into one
5. **Standardize dialog layout**: header with title + status + close, body, footer with CTAs
6. **Verify Material Icons font loading** and propose either keeping `<mat-icon>` or switching to `<span class="material-icons">`

### CRITICAL: Decision Required Before Proceeding

The orchestrator MUST resolve the `<mat-icon>` vs `<span class="material-icons">` conflict with the user before proposal:
- The reference uses `<span class="material-icons">` 
- The completed `mat-dialog-standardization` migrated 15 dialogs to `<mat-icon>`
- This is NOT just a style preference — it affects imports (`MatIconModule` vs Google Font), accessibility (ARIA implicit on `<mat-icon>`), and tooling compatibility

## Risks

1. **Revert risk**: Standardizing to the reference pattern would undo the just-completed `mat-dialog-standardization` work across 15 dialogs
2. **Icon approach conflict**: User's reference uses `<span class="material-icons">`; 15 dialogs already use `<mat-icon>` — must resolve before any work begins
3. **Font dependency**: `<span class="material-icons">` requires Google Material Icons font in `index.html` — must verify it's loaded
4. **Dual contract complexity**: Adding `input/output` + `MAT_DIALOG_DATA` dual support to all dialogs increases code complexity for dialogs that will never be used inline
5. **No test coverage**: Zero dialog components have `.spec.ts` files (except `ConfirmDialogMolecule`) — any migration has no safety net
6. **Panel class fragmentation**: Two competing panel classes (`'premium-dialog'`, `'erp-dialog-panel'`) need consolidation
7. **Scope creep**: `SaleFormMolecule` (507 lines) and `ConfirmDialogMolecule` (custom non-MatDialog) may not fit this pattern at all
8. **dialog.config.ts adoption**: The reference caller doesn't use shared constants — standardizing callers affects 3+ files

## Ready for Proposal

**Conditionally Yes** — after the orchestrator resolves the `<mat-icon>` vs `<span class="material-icons">` decision with the user. Without this decision, the proposal would have to cover two conflicting approaches.
