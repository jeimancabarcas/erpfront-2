# Proposal: Unified Select Component (SelectAtom Redesign)

## Intent

45 selects use 3 incompatible patterns: inline-Tailwind native, Material mat-select, and legacy SelectAtom SCSS. The existing SelectAtom is visually incompatible (underline style, no Tailwind focus ring), lacks ControlValueAccessor, and misses required/icon/helperText. Rewrite it to unify all form selects under one Tailwind-native component matching the text-input-atom reference.

## Scope

### In Scope
- Rewrite SelectAtom: custom dropdown, Tailwind (h-14 rounded-2xl, indigo focus-ring), CVA
- New inputs: icon, required, helperText, name. Preserve searchable, label, placeholder, options, error, disabled.
- Migrate 39 selects: 15 native Tailwind (A1–A3) + 24 mat-select (Pattern B)

### Out of Scope
- 6 page-size selects (A4) — stay native (pagination, not form)
- `<mat-select>` complex grouping/multiple (none found in codebase)
- Compact/dialog size variant — single canonical `h-14` design

## Capabilities

### New Capabilities
- `select-atom`: unified `<ui-select>` with custom dropdown panel, Tailwind visual contract (matches `text-input-atom` tokens), ControlValueAccessor, searchable, icon, required, error, helperText

### Modified Capabilities
- None

## Approach

Rewrite SelectAtom in-place: SCSS → Tailwind (drop SCSS file), preserve dropdown panel + keyboard nav + click-outside, add CVA for ngModel/formControl.

**Migration phases**: **P0** — rewrite + TDD; **P1** — `SearchFiltersMolecule` (existing consumer, dogfood); **P2** — native selects in pages/dialogs (low risk); **P3** — mat-selects in forms/filters (medium, remove `MatSelectModule`); **P4** — `PatientRegistrationWizard` (high risk, `mat-stepper`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `atoms/select/` | Rewrite | Template Tailwind, SCSS removed, CVA + new inputs |
| `molecules/search-filters/` | Migrate | Replace binding (P1 dogfood) |
| 14 components (A1–A3) | Migrate | Native → ui-select |
| 9 components (Pattern B) | Migrate | mat-select → ui-select; drop MatSelectModule |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Breaking change for `SearchFiltersMolecule` | Low | Single consumer; verify with existing tests in P0 |
| `PatientRegistrationWizard` stepper compatibility | Med | Keep `MatStepperModule` imported; manual QA before merge |
| Custom dropdown accessibility gaps | Med | ARIA roles + keyboard nav preserved from current impl |
| `searchable` unused → dead code | Low | No migration burden; maintain as opt-in feature |

## Rollback Plan

Revert `SelectAtom` to git prior state (3 files). Each migrated component reverted individually. `SearchFiltersMolecule` restored by reverting single file.

## Dependencies

- `text-input-atom` design tokens (visual contract reference)
- `ControlValueAccessor` (`@angular/forms`)

## Success Criteria

- [ ] Existing 5 `SelectAtom` Vitest tests pass + new CVA/state tests
- [ ] Visual match to reference: `h-14`, `rounded-2xl`, indigo focus ring, Material icon
- [ ] `SearchFiltersMolecule` zero regressions after P1
- [ ] 39 selects migrated; `MatSelectModule` removed from 9 components
- [ ] `npx tsc --noEmit` passes after each phase
