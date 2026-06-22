# Proposal: Migrate All Modals to MatDialog Pattern

## Intent

The app uses two modal strategies: canonical `MatDialog.open()` (transport, billing, agenda, consultation — 25+ opens) vs. inline signal-toggle with custom backdrops (sales, inventory — 13 instances). The inline pattern causes inconsistent animations, missing accessibility (no focus trap, no `aria-modal`), duplicated backdrop markup, and violates `dialog.config.ts`. Migrate all 13 to the canonical pattern.

## Scope

### In Scope
- 11 inline modals across 7 pages: `sales-page` (2), `sales-customers-page` (2), `inventory-products-page` (3), `inventory-suppliers-page` (2), `inventory-categories-page` (2), `inventory-purchases-page` (2)
- 1 nested inline modal inside `SaleFormMolecule` (CustomerDialogOrganism)
- 4 `ConfirmDeleteDialogOrganism` inline usages → MatDialog close pattern
- Clean `InvoiceDetailDialogOrganism` dual-mode: drop `input()`/`output()`, keep only `MAT_DIALOG_DATA` + `MatDialogRef`
- Remove all custom backdrop `<div class="fixed inset-0 z-50...">`, `showXxxDialog` signals, inline `[data]` bindings

### Out of Scope
- `ConfirmDialogMolecule` (dead code, zero callers) — left as-is
- `GeneralInvoiceFormDialogOrganism` (orphan, no caller) — left as-is
- Full Reactive Forms migration for template-driven components — deferred

## Capabilities

### New Capabilities
None — enforces existing `dialog-pattern` and `dialog-config` specs.

### Modified Capabilities
None — spec requirements unchanged. Implementation moves non-compliant → compliant.

## Approach

Per-page migration in 3 phases, following `CustomerInvoicesTableOrganism` pattern:

1. Remove inline dialog HTML + custom backdrop div from template
2. Remove `showXxxDialog` signal, `[data]`/`(closed)` bindings
3. Add `private dialog = inject(MatDialog)`; call `dialog.open(Component, { ...DIALOG_DEFAULTS, width: DIALOG_WIDTHS.x, data: {...}, panelClass: DIALOG_PANEL_CLASS })`
4. Wire `ref.afterClosed().subscribe(result => { if (result) reload() })`
5. Remove dialog component from page `imports` array (lazy-loaded via `dialog.open()`)

**Phases**: Phase 1 — `sales-page` (2 modals) + `InvoiceDetailDialogOrganism` cleanup. Phase 2 — `sales-customers-page` (2) + `ConfirmDeleteDialogOrganism` cleanup. Phase 3 — 4 inventory pages (9 modals).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `sales/sales-page/` | Modified | 2 inline → MatDialog.open() |
| `sales/sales-customers-page/` | Modified | 2 inline → MatDialog.open() |
| `sales/sale-form/` | Modified | 1 nested inline → MatDialog.open() |
| `inventory/inventory-products-page/` | Modified | 3 inline → MatDialog.open() |
| `inventory/inventory-suppliers-page/` | Modified | 2 inline → MatDialog.open() |
| `inventory/inventory-categories-page/` | Modified | 2 inline → MatDialog.open() |
| `inventory/inventory-purchases-page/` | Modified | 2 inline → MatDialog.open() |
| `organisms/invoice-detail-dialog/` | Modified | Drop dual-mode |
| `organisms/confirm-delete-dialog/` | Modified | Drop input/output |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `SaleFormMolecule` (799 lines) regression | Med | Phase 1 migration; manual smoke test all form flows |
| `InvoiceDetailDialogOrganism` cleanup breaks `CustomerInvoicesTableOrganism` | Low | Dual-mode removal verified against existing MatDialog caller |
| No E2E tests | Med | Per-page manual verification checklist |

## Rollback Plan

Revert the commit. Each phase is a single page — partial rollback possible. Dialog components retain `input()`/`output()` until all callers migrate; dual-mode removed in final commit only.

## Dependencies

- `dialog.config.ts` at `@shared/constants/dialog.config` (in place)
- `dialog-pattern` spec REQ-1–REQ-12 (migration target)

## Success Criteria

- [ ] All 13 inline modal instances replaced with `MatDialog.open()`
- [ ] Zero custom backdrop divs in page templates
- [ ] Zero `showXxxDialog` signals in sales/inventory pages
- [ ] All `dialog.open()` calls use `DIALOG_WIDTHS`, `DIALOG_PANEL_CLASS`, `DIALOG_DEFAULTS`
- [ ] `InvoiceDetailDialogOrganism` has no `input()`/`output()` — MatDialog-only
- [ ] No visual regressions on dialog open/close
