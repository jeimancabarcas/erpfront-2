# Proposal: Dialog View Invoice Pattern

## Intent

28 dialogs lack visual/behavioral consistency. Reference `InvoiceDetailDialogOrganism` uses signal-based loading/error/content states, header-body-footer layout, `<span class="material-icons">`, and Tailwind `rounded-[32px]` — absent elsewhere. `mat-dialog-standardization` unified architecture (typed data, `dialogRef.close()`, Reactive Forms, ARIA, `dialog.config.ts`) but chose `<mat-icon>` and missed states. **User decision: `<span class="material-icons">` everywhere, keep architectural gains.**

## Scope

### In Scope
- Revert `<mat-icon>` → `<span class="material-icons">` in 15 migrated dialogs + remaining dialogs
- Add `loading()`/`error()` signals + spinner/banner to 15 migrated dialogs (P0)
- Migrate 3 Pattern B dialogs: `MAT_DIALOG_DATA` + `MatDialogRef` (AdjustmentDetail, GeneralInvoiceForm, AdjustmentForm)
- Consolidate panel class: `'premium-dialog'` → `'erp-dialog-panel'`
- Expand `dialog.config.ts` to 3 non-adopting callers
- Add `aria-label` to reference dialog close button
- Standardize layout: header(title+status+close), body, footer(CTAs)

### Out of Scope
- `SaleFormMolecule` (inline toggle, not MatDialog)
- `ConfirmDialogMolecule` (custom non-MatDialog)

### Deferred
- Reactive Forms migration for `ProductFormMolecule`, `CustomerDialog`, `SupplierDialog`

## Capabilities

> Contract for `sdd-spec`. Existing: `dialog-pattern`, `dialog-config`.

### Modified Capabilities
- `dialog-pattern`: REQ-8 reverses — `<span class="material-icons">` only, `<mat-icon>` PROHIBITED. REQ-4/REQ-5 promote P1→P0. New REQ: header-body-footer layout. New REQ: Tailwind consistency. REQ-9 (ARIA) preserved.
- `dialog-config`: Constant definitions unchanged. Adoption requirement expands to all non-adopting callers.

## Approach

| Phase | Deliverable | ~Lines |
|-------|------------|--------|
| 1 — Icons + panel | `<mat-icon>` → `<span class="material-icons">` in 15 dialogs; remove `MatIconModule` imports; reference caller → `DIALOG_PANEL_CLASS` + `DIALOG_WIDTHS.xl`; `aria-label` on reference close button | 200 |
| 2 — States | `loading()`/`error()` signals + spinner/banner in 15 dialogs; `@if` tri-state template | 300 |
| 3 — Pattern B + config | Migrate 3 Pattern B to MatDialog contract + icons + states + layout; wire `dialog.config.ts` in 3 remaining callers | 300 |

Each phase is an independent, revertable PR.

## Affected Areas

| Area | Files | Change |
|------|-------|--------|
| Migrated transport+consultation dialogs | 15 | Icons, states, layout |
| Reference dialog + caller | 1+1 | ARIA, `DIALOG_PANEL_CLASS` |
| Pattern B dialogs | 3 | Full MatDialog migration |
| Non-adopting callers | 3 | `dialog.config.ts` imports |
| Dual-contract dialogs | 4 | Icons only |

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Reverts standardization work | High | Preserve typed data, RB, ARIA, dialog.config.ts |
| No test safety net | High | Manual verification per phase |
| Pattern B lacks MatDialogRef | Medium | Verify `afterClosed()` subscribers |
| 800-line budget | Medium | Three independent PRs |

## Rollback Plan

Revert phase PR. Each phase additive — `MatIconModule` removal restorable, signals additive, Pattern B full revert.

## Dependencies

- Material Icons font in `index.html` (confirmed)
- `dialog.config.ts` at `src/app/shared/constants/dialog.config.ts` (exists)

## Success Criteria

- [ ] 0 `<mat-icon>` in dialog components
- [ ] All dialogs: loading spinner + error banner + content states
- [ ] All dialogs: header-body-footer layout
- [ ] 0 `panelClass: 'premium-dialog'`
- [ ] All callers use `dialog.config.ts` constants
- [ ] 0 `closed.emit()` in Pattern B dialogs
- [ ] Reference close button has `aria-label`
- [ ] `MatIconModule` removed where unused
