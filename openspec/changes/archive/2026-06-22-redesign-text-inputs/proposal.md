# Proposal: Redesign Text Inputs

## Intent

The ERP frontend has **3 divergent text input patterns** across ~35 forms (~120+ inputs): native Tailwind (reference design from customer-dialog), Angular Material `mat-form-field`, and the legacy `InputAtom` SCSS system. No shared component enforces the reference design. This creates visual inconsistency, duplicated boilerplate (~8 lines per input), and developer drift. The change creates a single `ui-text-input` atom that standardizes all text inputs to the customer-dialog design.

## Scope

### In Scope
- New `ui-text-input` atom with icon support (Material Icons + Boxicons fallback)
- API: `label`, `icon`, `type`, `placeholder`, `value`/`valueChange`, `required`, `disabled`, `error`, `helperText`
- Compatibility: `FormsModule` (`[(ngModel)]`) and `ReactiveFormsModule` (`[formControl]`)
- Migration of ~30 forms incrementally (1–2 per PR), starting with customer-dialog (reference form)
- Built-in accessibility: `aria-invalid`, `aria-describedby`, proper `<label for>` association

### Out of Scope
- sale-form autocomplete inputs (keep `matAutocomplete` — deferred decision)
- search-bar / search-filters (keep existing `ui-input` InputAtom — different UX purpose)
- Existing `InputAtom` (`ui-input`) — left untouched for search-style inputs
- Non-text inputs: selects, date pickers, file uploads

## Capabilities

### New Capabilities
- `text-input-atom`: Shared text input component (`ui-text-input`) encapsulating the customer-dialog reference design. Covers label, icon, input styling, focus ring, error state, and FormsModule/ReactiveForms compatibility.

### Modified Capabilities
- None

## Approach

Create `src/app/components/atoms/text-input/text-input.component.ts` using Angular `input()` + `output()` signals with `ChangeDetectionStrategy.OnPush`. Template mirrors the reference design's Tailwind classes exactly (h-14, rounded-2xl, indigo focus ring, material-icons span). Migration: ship component → adopt in customer-dialog first (visual no-op) → then migrate other forms per domain group (auth → appointments → billing → pediatrics → inventory → transport).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/atoms/text-input/` | **New** | The `ui-text-input` atom component + spec + SCSS |
| `components/organisms/customer-dialog/` | Modified | Replace raw input HTML with `ui-text-input` (dogfooding) |
| `components/molecules/product-form/` | Modified | Migrate 9 inputs in phase 1 |
| `components/molecules/login-form/` | Modified | Migrate 2 inputs from Material in phase 2 |
| `components/organisms/appointment-form/` | Modified | Migrate from Material in phase 2 |
| `components/molecules/billing-filters/` | Modified | Migrate search input in phase 2 |
| ~30 additional form components | Modified | Phased migration per domain |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ReactiveForms compatibility gaps (mat-form-field → native input migration) | Medium | Test `[formControl]` + validation error states in first migrated form; add `ControlValueAccessor` if needed |
| Patient Registration Wizard (~20-40 fields) breaks during migration | Medium | Migrate last; extensive manual QA; snapshot tests |
| Icon name collisions (Material Icons vs Boxicons) | Low | Default to Material Icons class; allow `iconLibrary` input to switch to `bx` prefix |
| No existing test coverage on forms | High | Add component spec for `ui-text-input`; write at least smoke tests for first 3 migrated forms |

## Rollback Plan

Per-form: revert the component's HTML template to pre-migration state. The `ui-text-input` component itself can be removed from `imports` arrays via simple git revert of the migration PR. No database or API changes.

## Dependencies

- Material Icons font (already loaded via Google Fonts or `index.html`)
- Boxicons (`@boxicons/core` npm package — already installed)

## Success Criteria

- [ ] `ui-text-input` passes component spec tests (renders label, icon, input; emits valueChange; displays error state)
- [ ] customer-dialog migrated with zero visual diff from current reference design
- [ ] At least 3 forms migrated and passing type-check (`npx tsc --noEmit`)
- [ ] All migrated inputs support both `[(ngModel)]` and `[formControl]` without runtime errors
- [ ] Zero new `mat-form-field` usages for text inputs added post-proposal
