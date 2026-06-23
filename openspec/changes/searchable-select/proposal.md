# Proposal: Async Searchable Select + Footer Slot

## Intent

Every dialog needing entity search (customer, product, invoice, patient) builds searchable dropdowns from scratch — combining `ui-text-input`, manual dropdown panels, and inline filtering. `general-invoice-form-dialog` alone duplicates this pattern twice. No reusable async search-select exists. Extend `ui-select` so a single atom serves static, local-searchable, and async-searchable dropdowns with a footer action slot.

## Scope

### In Scope
- Extend `ui-select` with `searchChange` output, `loading` input, `emptyText` input, `showSubtitle` input, `footerLabel` input, `footerAction` output
- Extend `SelectOption` with optional `subtitle` and `icon` fields
- Add async search: emit query via `searchChange`, render via standard `options` input
- Add footer slot (always-visible action button inside dropdown)
- Update unit tests for new inputs/outputs/states
- Migrate `general-invoice-form-dialog` customer + product search to `ui-select`
- Migrate `adjustment-form-dialog` invoice search, removing `matAutocomplete`
- Migrate `patient-search` molecule, removing `matAutocomplete`

### Out of Scope
- Debounce logic (parent responsibility — documented, not built-in)
- Multi-select support
- Virtual scroll for large option sets

## Capabilities

### Modified Capabilities
- `select-atom`: Add async search (`searchChange`, `loading`), footer slot (`footerLabel`, `footerAction`), customization inputs (`emptyText`, `showSubtitle`), and `SelectOption` extensions (`subtitle`, `icon`). Existing searchable (local filter) and CVA behavior unchanged.

## Approach

Extend `ui-select` (Approach A). All new inputs/outputs optional — 15 consumers unaffected. Parent manages async: receives `searchChange`, debounces, fetches, sets `options()` + `loading`. Race conditions handled by parent via `switchMap`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/components/atoms/select/select.component.ts` | Modified | New inputs, outputs, template, internal state |
| `src/app/components/atoms/select/select.component.spec.ts` | Modified | Tests for async, footer, loading, emptyText |
| `src/app/components/organisms/general-invoice-form-dialog/` | Modified | Replace 2 custom dropdowns with ui-select |
| `src/app/components/organisms/adjustment-form-dialog/` | Modified | Replace matAutocomplete with ui-select |
| `src/app/components/molecules/patient-search/` | Modified | Replace matAutocomplete with ui-select |
| `openspec/specs/select-atom/spec.md` | Modified | New scenarios for async + footer |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backward compat break with 15 consumers | Low | All new inputs/outputs optional; existing tests unchanged |
| Async race conditions | Medium | Document `switchMap` pattern; parent owns subscription |
| `redesign-selects` merge conflicts | Low | Already merged to main |
| `highlightedIndex` stale after async update | Medium | Reset to -1 on `options()` change while open |

## Rollback Plan

Revert commit. New inputs/outputs are additive — removing them restores prior behavior. Migrated dialogs revert to prior implementations from git history.

## Dependencies

- `redesign-selects` already merged to main (no blocking dep)

## Success Criteria

- [ ] `ui-select` unit tests pass (existing + new async/footer scenarios)
- [ ] `general-invoice-form-dialog` customer + product search functional via `ui-select`
- [ ] `adjustment-form-dialog` invoice search functional, no `matAutocomplete` import
- [ ] `patient-search` functional via `ui-select`, no `matAutocomplete` import
- [ ] All 15 existing `ui-select` consumers unchanged (no visual regression)
- [ ] `searchChange` emits on keystroke; parent debounces and feeds `options`
