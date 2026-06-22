# Proposal: Mat Dialog Standardization

## Problem Statement

The project has **24+ dialog components** across **3 incompatible architectural patterns**, causing caller confusion, missing type safety (`input<any>({})` in 12+ organisms), abandoned dialog functionality (billing-page, agenda-page), and duplicated configuration. No shared dialog infrastructure exists — each dialog reinvents width constants, panel classes, closing mechanics, and form strategy independently.

## Proposed Solution

Adopt `SalesNoteFormDialogOrganism` as the **canonical MatDialog pattern** and migrate all Pattern B dialogs (input/output + MatDialog.open) to use `MatDialogRef` + typed `MAT_DIALOG_DATA`. Build a thin shared config layer. Execute in 3 phases: transport first (8 dialogs, no caller behavior change needed), then consultation (5 dialogs, requires signal bridge), then re-enable commented-out functionality.

## Scope

### In Scope
- Define canonical dialog pattern (typed data interfaces, `MatDialogRef`, `MAT_DIALOG_DATA`, Reactive Forms, loading/error states)
- Shared dialog config constants (widths, panel class, `maxWidth`, `disableClose`)
- Migrate 13 Pattern B dialogs (transport + consultation) to canonical pattern
- Re-enable commented-out dialog calls in billing-page and agenda-page
- Standardize icon approach: `mat-icon` component everywhere
- Add ARIA labels on dialog close buttons
- Replace `::ng-deep` with Tailwind-based form field styling where possible

### Out of Scope
- Migrating `SaleFormMolecule` (507-line monster — inline toggle, not MatDialog)
- Rewriting `CustomerDialogOrganism` / `SupplierDialogOrganism` template-driven forms to Reactive Forms (scope creep)
- Creating a `DialogService` facade wrapper (deferred)

### Deferred
- `DialogService` facade with project-default config (animation, panel class)
- Base dialog class with reusable loading/error/signal-form bridge logic
- `ConfirmDialogMolecule` migration decision (see Edge Cases)
- Shared dialog SCSS/CSS module

## Capabilities

> Contract for `sdd-spec` phase. Research `openspec/specs/` done — no existing dialog specs.

### New Capabilities
- `dialog-pattern`: Canonical MatDialog pattern — typed `MAT_DIALOG_DATA` interfaces, `MatDialogRef` closing, Reactive Forms strategy, loading/error/empty states, Material module imports, accessibility minimums
- `dialog-config`: Shared dialog configuration — standardized widths (`sm/md/lg/xl`), unified panel class, `maxWidth`/`disableClose` defaults, configuration location and import contract

### Modified Capabilities
- None — existing specs (`button-atom`, `navigation-layout`) are unrelated to dialog behavior

## Canonical Dialog Pattern

> Reference: `src/app/components/organisms/sales-note-form-dialog/sales-note-form-dialog.component.ts`

| Concern | Rule |
|---------|------|
| **Data input** | Export typed `interface XDialogData` alongside component; inject via `inject(MAT_DIALOG_DATA)` |
| **Closing** | `dialogRef.close(result: T)` with typed generic `MatDialogRef<Component, T>` |
| **Forms** | Reactive Forms via `FormBuilder`; no `[(ngModel)]` / template-driven forms |
| **States** | `loading` signal (boolean), `errorMsg` signal (string \| null), dismissible error banner |
| **Imports** | `MatDialogModule`, form field modules, `MatButtonModule`, `MatIconModule`, `ReactiveFormsModule` |
| **Styling** | Tailwind classes; `max-w-[Npx]` inline in template wrapper div; no `::ng-deep` unless unavoidable |
| **Icons** | `<mat-icon>` component (not `<span class="material-icons">`) |
| **Accessibility** | Close button with `aria-label`; form labels with `for`/`id` association |
| **Width** | Configured by **caller** via `dialog.open()` config; dialog wrapper uses max-width for constraint |

## Shared Config Constants

```ts
// Proposed location: src/app/shared/constants/dialog.config.ts
export const DIALOG_WIDTHS = { sm: '500px', md: '600px', lg: '850px', xl: '950px' } as const;
export const DIALOG_PANEL_CLASS = 'erp-dialog-panel';
export const DIALOG_DEFAULTS = { maxWidth: '95vw', disableClose: false } as const;
```

## Migration Strategy

### Phase 1: Transport Dialogs (8 organisms)
- **Impact**: `service-detail-page`, `transport-dashboard-view`, `transport-tracking-view`
- **Change**: Replace `data = input<any>({})` → `inject(MAT_DIALOG_DATA)`, `closed.emit()` → `dialogRef.close()`
- **Caller**: Add typed data objects; transport callers already use `dialog.open()` — minimal caller changes
- **Risk**: Low — transport callers don't subscribe to `afterClosed()`

### Phase 2: Consultation Dialogs (5 organisms)
- **Impact**: `consultation-page`
- **Change**: Same migration + replace mutable-by-reference `data()*.property` with return-value pattern via `afterClosed()`
- **Caller**: `afterClosed().subscribe(result => { if (result) this.signal.set(result) })` already in place — data flow changes isolated to dialog internals
- **Risk**: Medium — signal mutation pattern must be replaced with explicit return

### Phase 3: Re-enable Commented-Out Dialogs
- **Impact**: `billing-page` → `InvoiceFormDialogOrganism`, `agenda-page` → `AppointmentFormOrganism`
- **Change**: Uncomment and wire with canonical pattern; both organisms already use Pattern A (MatDialogRef)
- **Risk**: Low — organisms exist; only wiring needed

## Edge Cases & Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| `ConfirmDialogMolecule` (Pattern C) | **Keep as-is** | Purpose-specific: lightweight inline confirmations with ARIA; not a data-entry dialog |
| `CustomerDialogOrganism` / `SupplierDialogOrganism` | **Migrate data passing only** to `MAT_DIALOG_DATA` | Keep template-driven forms to avoid scope creep; data passing is the inconsistency target |
| `ProductFormMolecule` | **Full migration** to canonical pattern | Already opened via `MatDialog.open()` from `StockTableMolecule` |
| `InvoiceDetailMolecule` | **Full migration** | Already typed (`input.required<{ invoice }>()`); closest to canonical already |
| `SaleFormMolecule` | **Out of scope** | Inline toggled, 507 lines, different architectural problem |
| Commented-out billing/agenda | **Re-enable in Phase 3** | Organisms exist; only caller wiring needed |

## Non-Goals

- We will NOT create a `DialogService` wrapper (deferred to future change)
- We will NOT rewrite template-driven forms to Reactive Forms (separate concern)
- We will NOT change the atomic design level of any component
- We will NOT add unit tests to migrated dialogs (test coverage is a separate initiative; dialogs have zero `.spec.ts` files today)
- We will NOT change `ConfirmDialogMolecule` behavior
- We will NOT change dialog open/close animations

## Success Criteria

- [ ] All 13 Pattern B dialog organisms use `MatDialogRef` + typed `MAT_DIALOG_DATA`
- [ ] 0 occurrences of `data = input<any>({})` in dialog components
- [ ] 0 occurrences of `closed.emit()` in dialog components
- [ ] Shared config constants replace all inline width/panelClass strings
- [ ] `billing-page.openNewInvoiceDialog()` and `agenda-page.openAppointmentForm()` are functional
- [ ] All dialog close buttons have `aria-label`
- [ ] All icons use `<mat-icon>` (0 `<span class="material-icons">` in dialogs)
- [ ] Existing integration flows unbroken (consultation, transport, sales)

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Signal mutation pattern breaks with `MAT_DIALOG_DATA` immutability | Medium | Consultation dialogs already have `afterClosed()` subscribers; migrate to return-value pattern per migration guide |
| Transport callers not subscribing to `afterClosed()` — silent data loss | Low | Transport dialogs are fire-and-forget (side-effect operations); verify each caller after migration |
| `CustomerDialogOrganism` used both inline and via MatDialog — dual contract conflict | Medium | Migrate only MatDialog path; inline path retains `input()/output()` for now |
| No test safety net (only `ConfirmDialogMolecule` has `.spec.ts`) | High | Manual verification per phase; capture test scenarios in spec phase; no automated regression guard |
| 24+ dialogs exceeds 400-line review budget | High | Phase into 3 PRs: transport (Phase 1), consultation (Phase 2), remaining (Phase 3) |
