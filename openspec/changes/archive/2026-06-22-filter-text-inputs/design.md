# Design: Replace Filter Text Inputs with ui-text-input

## Technical Approach

Two patterns, zero atom changes. Pattern A replaces raw `<div>`+`<input>` in 5 page components; Pattern B replaces `<mat-form-field>`+`<input matInput>` in 3 molecule/organism components. No `variant` input added to `ui-text-input` — existing `bg-white` default is uniform across all replacements per user decision.

## Architecture Decisions

### Pattern A: Mechanical Template Replacement (5 pages, 8 inputs)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `(valueChange)="signal.set($event)"` + keep `debouncedFilter()` | Removes event handlers; debounce helper stays | **Selected** |
| Add `effect()` watching filter signals | Cleaner but introduces new pattern, initial double-load guard needed | Rejected — minimal diff |
| Keep old event handlers | Contravenes spec scenario "onXFilterChange handler removed" | Rejected |

Each page replaces `<div class="relative"><span class="material-icons">…</span><input (input)="onXFilterChange($event)" class="…bg-gray-50…"></div>` with `<ui-text-input>` (which defaults to `bg-white`). The signal is set from template; the existing `debouncedFilter()` method triggers debounced loadData + pageIndex reset. The old `onNameFilterChange`/`onSkuFilterChange`/etc. handler methods are removed.

### Pattern B: mat-form-field Migration (3 components)

| Component | Binding | Import Changes | Clear Button |
|-----------|---------|----------------|--------------|
| `appointment-filters` | `[(ngModel)]` → `[(value)]` (model signal) | Keep MatInputModule (datepicker uses `matInput`), keep MatFormFieldModule | Not needed |
| `movements-table` | `[(ngModel)]` → `[(value)]` (WritableSignal) | Remove MatInputModule, keep MatFormFieldModule (mat-select) | External `<button>` sibling |
| `customer-invoices-table` | `[formControl]` stays (CVA) | Remove MatInputModule + MatFormFieldModule (zero remaining) | Not needed |

**Note on appointment-filters**: The user specified removing MatInputModule, but the datepicker field `<input matInput [matDatepicker]="picker">` still requires it. The date field is out of scope for migration. Design recommends **keeping MatInputModule** — only the search mat-form-field is replaced.

### Debounce Strategy

- **Pattern A**: `(valueChange)="signal.set($event); debouncedFilter()"` — keeps existing private `debouncedFilter()` method (which clears timeout, resets pageIndex, calls loadData after 400ms)
- **Pattern B**: Existing debounce subscriptions (`Subject` + `debounceTime` in movements-table, `valueChanges` + `debounceTime` in customer-invoices-table) are preserved

## Data Flow

```
Pattern A (e.g. products-page):

  User types → ui-text-input → (valueChange)="nameFilter.set($event)"
                                                     │
                                                     ▼
                                               signal updated
                                                     │
                                                     ▼
                                          debouncedFilter() — 400ms
                                                     │
                                                     ▼
                                          pageIndex.set(1) → loadData()

Pattern B (e.g. movements-table):

  User types → ui-text-input → [(value)]="filterUser"
                                     │
                      ┌──────────────┤
                      ▼              ▼
                filterUser.set()   (valueChange) → Subject.next()
                                              ↓
                                        debounceTime(400)
                                              ↓
                                        applyFilters()
```

## File Changes

**No new files. No changes to `ui-text-input`.**

| File | Action | Description |
|------|--------|-------------|
| `pages/inventory-page/inventory-products-page/inventory-products-page.component.ts` | Modify | Replace 2 raw inputs with `<ui-text-input>`, remove `onNameFilterChange`/`onSkuFilterChange`, add TextInputComponent import |
| `pages/inventory-page/inventory-suppliers-page/inventory-suppliers-page.component.ts` | Modify | Replace 2 raw inputs, remove `onNameFilterChange`/`onNitFilterChange`, add TextInputComponent import |
| `pages/inventory-page/inventory-categories-page/inventory-categories-page.component.ts` | Modify | Replace 1 raw input (h-12 → h-14 automatically), remove `onNameFilterChange`, add TextInputComponent import |
| `pages/sales-page/sales-page.component.ts` | Modify | Replace 1 raw input (invoiceNumber → search), remove `onInvoiceNumberFilterChange`, add TextInputComponent import |
| `pages/sales-page/sales-customers-page/sales-customers-page.component.ts` | Modify | Replace 2 raw inputs, remove `onNameFilterChange`/`onDocumentFilterChange`, add TextInputComponent import |
| `molecules/appointment-filters/appointment-filters.component.ts` | Modify | Replace search mat-form-field with `<ui-text-input>`, keep MatInputModule (datepicker) |
| `molecules/movements-table/movements-table.component.ts` | Modify | Replace user mat-form-field with `<ui-text-input>`, add external clear button, remove MatInputModule |
| `organisms/customer-invoices-table/customer-invoices-table.component.ts` | Modify | Replace search mat-form-field with `<ui-text-input>`, remove MatInputModule + MatFormFieldModule |

## Interfaces / Contracts

No new interfaces. Binding contract for existing `ui-text-input` API used:

| Input | Type | Used In |
|-------|------|---------|
| `icon` | `string` | All replacements — material-icons name |
| `placeholder` | `string` | All replacements — filter hint text |
| `value` / `[(value)]` | `model<string>` | All — via signal setter or model binding |
| `formControl` | `FormControl` | customer-invoices-table (CVA passthrough) |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Each component template renders `<ui-text-input>` with correct props | `querySelector('ui-text-input')` presence + attribute checks |
| Unit | Signal binding works: `(valueChange)="filter.set($event)"` | Type into input, verify signal value |
| Unit | Clear button (movements-table): click resets filter | Click button, assert `filterUser()` is `""` |
| Unit | Debounce still triggers loadData | Spy on service method, assert called after 400ms |
| Unit | `formControl` binding works (customer-invoices-table) | Set `invoiceFilter.setValue('FAC-001')`, assert input value |
| Compilation | `npx tsc --noEmit` | Zero import/binding errors across all 8 files |

## Migration / Rollout

No migration required. Each component independently revertible. Order: any — no dependency between components.

## Open Questions

- [ ] (Archived) Variant input or bg-white? **Resolved**: bg-white unified, no variant.
- [ ] (Archived) MatInputModule removal from appointment-filters? **Resolved**: keep MatInputModule — datepicker still uses `matInput`.
