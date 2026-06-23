# Proposal: Redesign Textareas

## Intent

24 textareas across 17 components use 3 inconsistent patterns — zero match the canonical `rounded-2xl` + indigo focus ring design. Create a `ui-textarea` atom to eliminate inconsistency and provide a single source of truth for all ERP textareas.

## Scope

### In Scope
- Create `ui-textarea` atom: sibling to `ui-text-input`, identical wrapper pattern (label, icon, error, helper), full CVA
- Migrate 15 Pattern A textareas (native + Tailwind) across 14 files
- Migrate 7 Pattern B textareas (`matInput` inside `mat-form-field`) across 5 files
- Remove `MatFormFieldModule`/`MatInputModule` imports where textarea was the sole consumer

### Out of Scope
- InputAtom `type="textarea"` — leave untouched (zero known consumers)
- Refactoring unrelated matInput fields (only textareas)

## Capabilities

### New Capabilities
- `textarea-atom`: `<ui-textarea>` component — textarea atom with label/icon/error/helper wrapper, CVA, signal API, OnPush

### Modified Capabilities
- None — existing `text-input-atom` and `select-atom` specs unchanged

## Approach

Create `<ui-textarea>` as a standalone Angular component mirroring `ui-text-input` (118 lines, signal inputs, ControlValueAccessor, OnPush). Reuse identical label/icon/error/helper wrapper pattern with textarea-specific adaptations:

| Concern | ui-text-input | ui-textarea |
|---------|--------------|-------------|
| Element | `<input>` | `<textarea>` |
| Min height | `h-14` (56px) | `min-h-[3.5rem]` (56px) |
| Padding | `px-4` | `py-3 px-4` |
| Icon position | `top: 50%` | `top: 1rem` |
| Resize | N/A | `resize-y` (default) |

### Component API
`label`, `icon`, `placeholder`, `value` (model), `error`, `helperText`, `required`, `disabled`, `iconLibrary` — inherited from `ui-text-input` pattern. Textarea-specific: `rows` (default 3), `resize` (`'none'|'vertical'|'both'`, default `'vertical'`), `minHeight` (string, e.g. `'120px'`).

### Migration
Single pass across all 24 textareas. Each migration: delete inline `<textarea class="...">` block (or `<mat-form-field>` wrapper), insert `<ui-textarea>`. For Pattern B files, remove `MatFormFieldModule`/`MatInputModule` from imports if no other matInput elements remain.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/components/atoms/textarea/` | New | ui-textarea component + spec + SCSS |
| `src/app/components/organisms/*-dialog/` | Modified | 14 dialog files with Pattern A textareas |
| `src/app/components/organisms/patient-*/` | Modified | 3 files with Pattern B matInput textareas |
| `src/app/components/organisms/*-dialog/` (matInput) | Modified | 2 dialog files with Pattern B matInput textareas |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| matInput removal cascade — removing module imports breaks other fields | Medium | Verify no other `matInput`/`mat-form-field` in component before removing imports |
| patient-neonatal-history uses one-way `[value]` binding, needs two-way `[(value)]` | Medium | Add event binding or `valueChange` handler during migration |
| orders-dialog textarea inside dynamic `FormArray` — CVA edge case | Low | Test with `formControlName` inside `FormArray`; CVA should handle this |
| Browser `resize: both` → `resize-y` default change surprises an editor | Low | Explicitly set `resize="both"` on instances that need it post-migration |

## Rollback Plan

Revert commit. Each migration is a single-line replacement — git diff clearly shows the `<textarea>` → `<ui-textarea>` swap. If CVA binding breaks, revert affected component's migration individually.

## Dependencies

- `ui-text-input` component (reference pattern, already stable at 29 consumers)
- `iconLibrary` pattern from `ui-text-input` (Material Icons / Boxicons)

## Success Criteria

- [ ] `ui-textarea` component passes all TDD scenarios (label, icon, error, helper, CVA, disabled, resize, minHeight)
- [ ] All 24 textareas migrated, `npx tsc --noEmit` passes with zero errors
- [ ] Existing vitest tests for affected components continue to pass
- [ ] Visual: every textarea matches `rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400` design tokens
- [ ] `MatFormFieldModule`/`MatInputModule` removed from components where textarea was the sole consumer
