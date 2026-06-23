# Proposal: Replace Filter Text Inputs with ui-text-input

## Intent

11 filter/search inputs across 8 components still use raw HTML or `mat-form-field` — inconsistent with the `ui-text-input` standard from `redesign-text-inputs`. Unify filter text inputs under one atom.

## Scope

### In Scope
- **8 page-level inputs** (5 pages): replace `<div>` + `<input>` with `<ui-text-input>`
- **3 molecule/organism inputs**: replace `<mat-form-field>` + `<input matInput>` with `<ui-text-input>`
- Add `variant` input to `ui-text-input`: `"form"` (bg-white) vs `"filter"` (bg-gray-50)
- Adapt `movements-table` clear button as sibling `<button>` outside `<ui-text-input>`
- Remove unused `MatFormFieldModule`/`MatInputModule` imports where safe

### Out of Scope
- `patient-search` — requires `matAutocomplete`; blocked, deferred
- `search-bar` / `search-filters` — keep `ui-input`; compact UX is intentional
- Form/dialog inputs — already migrated in `redesign-text-inputs`

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `text-input`: add `variant` input (`"form"` = bg-white default / `"filter"` = bg-gray-50). CVA contract unchanged.

## Approach

1. **Prerequisite**: Merge `feature/text-input-redesign` into `main`, rebase this branch.
2. **Page-level**: Bind signal setters directly via `(valueChange)="filter.set($event)"`. Delete `onXFilterChange` handlers.
3. **Molecule**: `[(ngModel)]` → `[(value)]`. `[formControl]` works via CVA. `matPrefix` icons → `[icon]`.
4. **Clear button**: Conditional sibling `<button>` outside `<ui-text-input>` on `movements-table`.

## Affected Areas

| Area | Inputs |
|------|--------|
| `atoms/text-input/` | Add `variant` input |
| `pages/inventory-page/inventory-products-page/` | 2 (nombre, SKU) |
| `pages/inventory-page/inventory-suppliers-page/` | 2 (nombre, NIT) |
| `pages/inventory-page/inventory-categories-page/` | 1 (nombre), h-12 → h-14 |
| `pages/sales-page/` | 1 (no. factura) |
| `pages/sales-page/sales-customers-page/` | 2 (nombre, documento) |
| `molecules/appointment-filters/` | 1 (buscar paciente) |
| `molecules/movements-table/` | 1 + external clear button |
| `organisms/customer-invoices-table/` | 1 (no. factura) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `text-input-redesign` unmerged — `ui-text-input` missing | Medium | Merge prerequisite; blocked until resolved |
| Clear button layout breaks in `movements-table` | Low | External sibling; test visually |
| `inventory-categories` h-12 → h-14 shifts layout | Low | Accept h-14 consistency |
| Import removal breaks other mat-form-fields | Low | Verify per component before removing |

## Rollback Plan

Revert merge commit. All changes are template-only — no API, service, or data model impact. Each component independently revertible.

## Dependencies

- **`feature/text-input-redesign` merged to `main`** — provides `ui-text-input` and `text-input` spec.

## Success Criteria

- [ ] All 11 filter inputs use `<ui-text-input>` — zero raw `<input>` or `<mat-form-field>` in filter contexts
- [ ] Filter behavior unchanged: debounce, signals, backend queries identical
- [ ] `variant="filter"` applies `bg-gray-50`; default uses `bg-white`
- [ ] `ui-text-input` tests pass (12 existing + variant coverage)
- [ ] No visual regressions: filter bars align, clear button works
- [ ] Unused Material imports removed where no other mat-form-fields remain
