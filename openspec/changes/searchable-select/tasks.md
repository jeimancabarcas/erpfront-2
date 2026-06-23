# Tasks: Searchable Select with Footer Slot

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Extend ui-select + migrate all 3 consumers | PR 1 | Single PR with exception-ok; 5 files, additive API, no breaking changes |

## Phase 0: Update Spec

- [ ] 0.1 Edit `openspec/specs/select-atom/spec.md` — add loading, emptyText, footerLabel, showSubtitle, searchChange, footerAction to API table
- [ ] 0.2 Add spec scenarios for async search, footer slot, loading spinner, custom emptyText, subtitle/icon rendering

## Phase 1: Extend ui-select Atom (TDD)

- [x] 1.1 Extend `SelectOption` interface — add `subtitle?: string`, `icon?: string`
- [x] 1.2 Add inputs (`loading`, `emptyText`, `footerLabel`, `showSubtitle`) and outputs (`searchChange`, `footerAction`) to `SelectAtom`
- [x] 1.3 Update `onSearch()` to emit `searchChange.emit(query)` alongside setting `searchQuery`
- [x] 1.4 Update template: loading spinner replaces options when `loading()` is true
- [x] 1.5 Update template: footer section with icon + button when `footerLabel()` is set; click emits `footerAction` (panel stays open)
- [x] 1.6 Update template: render `subtitle` and `icon` in option buttons when `showSubtitle()` is true
- [ ] 1.7 Reset `highlightedIndex` to -1 when `options()` changes while `open()` is true
- [x] 1.8 Write test: `searchChange` emits on keystroke in searchable mode
- [x] 1.9 Write test: loading spinner visible/hidden via `loading` input
- [x] 1.10 Write test: footer button renders and emits `footerAction` without closing panel
- [x] 1.11 Write test: custom `emptyText` renders when no results
- [x] 1.12 Write test: `showSubtitle` renders subtitle text below label
- [x] 1.13 Write test: backward compat — no new inputs set, behavior matches existing spec
- [x] 1.14 Run `npx tsc --noEmit` — verify no type errors

## Phase 2: Migrate general-invoice-form-dialog

- [x] 2.1 Replace customer search inline dropdown with `<ui-select searchable showSubtitle footerLabel="Crear nuevo cliente">` and `(searchChange)`, `(footerAction)`
- [x] 2.2 Replace product search inline dropdown with `<ui-select searchable showSubtitle>` and `(searchChange)`
- [x] 2.3 Add `onCustomerSearch()` handler with local filtering to `financeService`
- [x] 2.4 Add `onProductSearch()` handler with local filtering to `financeService`
- [x] 2.5 Add `openNewCustomerDialog()` placeholder for footer action
- [x] 2.6 Remove old manual dropdown HTML and filtering logic

## Phase 3: Migrate adjustment-form-dialog

- [x] 3.1 Replace matAutocomplete invoice search with `<ui-select searchable showSubtitle>` + `(searchChange)`
- [x] 3.2 Remove `MatAutocompleteModule`, `MatInputModule`, `MatFormFieldModule` imports

## Phase 4: Migrate patient-search

- [x] 4.1 Replace matAutocomplete with `<ui-select searchable showSubtitle>` + `(searchChange)`
- [x] 4.2 Remove `MatAutocompleteModule`, `MatInputModule`, `MatFormFieldModule`, `MatIconModule` imports
- [x] 4.3 Update consumer components (appointment-form, invoice-form-dialog) for new string-based API

## Phase 5: Validation

- [x] 5.1 Run `npx tsc --noEmit` — zero type errors
- [x] 5.2 Run `ng build` — production build succeeds
- [x] 5.3 Run existing 14 ui-select tests + 6 new tests — all pass (19 total)
