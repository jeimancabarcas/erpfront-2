# Exploration: filter-text-inputs

## Current State

The `erpfrontend` codebase has two atom-level text input components:

| Component | Selector | Pattern | Visual Style | Form Integration |
|-----------|----------|---------|-------------|------------------|
| `TextInputComponent` | `ui-text-input` | `ControlValueAccessor` + signal inputs | `h-14 rounded-2xl border` with external label, optional icon | `[(ngModel)]` / `formControl` / `[value]` + `(valueChange)` |
| `InputAtom` | `ui-input` | Output-based (`valueChange` output) | Bottom-border only (`border-bottom: 1px`), floating label, optional clear button | `[value]` + `(valueChange)` |

The previous `redesign-text-inputs` change migrated many form/dialog inputs to `ui-text-input`. However, text inputs used for **filtering/searching** were either skipped or not investigated. This change targets the remaining filter/search text inputs.

## Component Inventory

### A. mat-form-field + matInput (needs migration)

#### 1. appointment-filters — `molecules/appointment-filters/`
- **File**: `src/app/components/molecules/appointment-filters/appointment-filters.component.ts:28`
- **Pattern**: `mat-form-field` outline + `input matInput` + search icon `matPrefix`
- **Binding**: `[(ngModel)]="searchQuery"` (model signal)
- **Behavior**: Simple text search for patient names in the appointment agenda page
- **UX fit for `ui-text-input`**: **GOOD** — `ui-text-input` supports `icon`, `label`, `placeholder`, and two-way binding via `model()` or `value` + `valueChange`. The `h-14` height matches the current outline field height.

#### 2. movements-table — `molecules/movements-table/`
- **File**: `src/app/components/molecules/movements-table/movements-table.component.ts:44`
- **Pattern**: `mat-form-field` outline + `input matInput` + conditional clear button (`matSuffix`)
- **Bindings**: `[(ngModel)]="filterUser"` + `(input)="onUserInput($any($event.target).value)"` + `(click)="clearUserFilter()"`
- **Behavior**: Debounced user filter. Uses `Subject` pipe (400ms debounce + `distinctUntilChanged`) → calls `applyFilters()`. Clear button resets filter and sends empty value.
- **UX fit for `ui-text-input`**: **GOOD** but needs **clear button adaptation**. The `InputAtom` has a built-in `clearable` property; `ui-text-input` does NOT. The clear button must be implemented outside the component or added as a feature.

#### 3. customer-invoices-table — `organisms/customer-invoices-table/`
- **File**: `src/app/components/organisms/customer-invoices-table/customer-invoices-table.component.ts:53`
- **Pattern**: `mat-form-field` outline + `input matInput` + search icon `matPrefix`
- **Bindings**: `[formControl]="invoiceFilter"` (Reactive Forms `FormControl`)
- **Behavior**: Debounced filter via `valueChanges.pipe(debounceTime(400), distinctUntilChanged())` → emits via `filterChanged` EventEmitter
- **UX fit for `ui-text-input`**: **GOOD** — `ui-text-input` implements `ControlValueAccessor`, so `[formControl]` works directly. Supports icon and label.

#### 4. patient-search — `molecules/patient-search/`
- **File**: `src/app/components/molecules/patient-search/patient-search.component.ts:27`
- **Pattern**: `mat-form-field` outline + `input matInput` + `matAutocomplete`
- **Behavior**: Autocomplete search with dropdown of patient names from PediatricsService
- **UX fit for `ui-text-input`**: **BLOCKED** — `ui-text-input` does NOT support `matAutocomplete`. The matAutocomplete directive (`[matAutocomplete]="auto"`) requires a `mat-form-field` wrapper with `matInput`. This cannot be migrated without adding autocomplete support to `ui-text-input` or changing the UX pattern.
- **Verdict**: **BLOCKED — skip in this change**

### B. ui-input (InputAtom) — already custom, NOT matInput

#### 5. search-bar — `molecules/search-bar/`
- **File**: `src/app/components/molecules/search-bar/search-bar.component.ts:13`
- **Pattern**: `ui-input` wrapped in a pill-shaped `.search-bar` container with search icon + ⌘K hint
- **Visual**: Compact pill design (`border-radius: var(--radius-pill)`, border) with hidden underline via `::ng-deep .input__field { border-bottom: none !important; }`
- **UX fit for `ui-text-input`**: **POOR** — Switching to `ui-text-input` (h-14, rounded-2xl, external label) would break the compact search bar UX. The pill design is intentional for this specific component.
- **Verdict**: **KEEP AS-IS**

#### 6. search-filters — `molecules/search-filters/`
- **File**: `src/app/components/molecules/search-filters/search-filters.component.ts:27`
- **Pattern**: Dynamic `ui-input` instances inside a `.search-filters__bar` for text-type filters
- **Visual**: Compact bottom-border inputs with floating labels inside a card
- **UX fit for `ui-text-input`**: **POOR** — The filter bar uses multiple inputs side-by-side. `ui-text-input`'s h-14 external-label layout would make the bar vertically inconsistent and less dense.
- **Verdict**: **KEEP AS-IS**

### C. Out of scope (NOT filter/search inputs)

| Component | Inputs | Type | Reason out of scope |
|-----------|--------|------|---------------------|
| profile-account | 4 | Email + password | Account settings form, not filter |
| profile-personal | 4 | Name/phone/address | Personal data form, not filter |
| patient-neonatal-history | 7 | 4 number + 3 textarea | Clinical measurements, not filter |
| appointment-form | 2 | Date + time pickers | Not text inputs |
| sale-form | 4 | Form inputs + autocomplete | Sales form, not filter |
| adjustment-form-dialog | 2 | Autocomplete + textarea | Adjustment form, not filter |
| patient-registration-wizard | 2 | Datepicker + textarea | Registration form, not filter |
| sales-note-form-dialog | 1 | textarea | Observation field, not filter |
| purchase-order-dialog | 2 | Datepicker + textarea | Purchase form, not filter |

## Pattern Analysis

### matInput migration pattern
Each matInput text filter follows the same migration path:
1. Replace `<mat-form-field appearance="outline">` wrapper with `<ui-text-input>`
2. Move `<mat-label>` content to `[label]` input
3. Move `placeholder` to `[placeholder]` input
4. Replace `matPrefix` icons with `[icon]` input
5. Replace `[(ngModel)]` with `[(value)]` (two-way model) or `[value]` + `(valueChange)`
6. Replace `[formControl]` — works directly since `ui-text-input` is a `ControlValueAccessor`
7. Remove `MatFormFieldModule`, `MatInputModule` imports when no longer needed

### ui-input vs ui-text-input visual comparison

| Property | ui-input (InputAtom) | ui-text-input |
|----------|---------------------|---------------|
| Height | auto (padding-based) | `h-14` (3.5rem) |
| Border | Bottom-only (`border-bottom: 1px`) | Full border (`border border-gray-200`) |
| Corners | None | `rounded-2xl` |
| Label | Floating (inside input) | External (above input, uppercase) |
| Icon | None | Optional, positioned inside left |
| Clear button | Built-in (`clearable`) | Not supported |

## Migration Candidates

### Directly migratable (3 inputs, ~50 lines changed)

| # | Component | Input | Binding change |
|---|-----------|-------|----------------|
| 1 | `appointment-filters` | "Buscar Paciente" | `[(ngModel)]` → `[(value)]` (two-way model signal) |
| 2 | `movements-table` | "Usuario" filter | `[(ngModel)]` + `(input)` → `[(value)]`; clear button → manual outside |
| 3 | `customer-invoices-table` | "Filtrar por No. Factura" | `[formControl]` → `[formControl]` (direct CVA support) |

### Blocked (1 input)

| # | Component | Input | Reason |
|---|-----------|-------|--------|
| 1 | `patient-search` | Patient search with autocomplete | Requires `matAutocomplete` support; `ui-text-input` has no autocomplete |

### Keep as-is (2 components, ~2+ dynamic inputs)

| # | Component | Pattern | Reason |
|---|-----------|---------|--------|
| 1 | `search-bar` | `ui-input` in pill container | Compact search UX design; switching to h-14 would break |
| 2 | `search-filters` | Dynamic `ui-input` in filter bar | Inline compact filter bar needs bottom-border density |

## Risk Analysis

### Risk 1: Clear button on movements-table
The movements-table has a conditional clear button (`matSuffix` close icon). `ui-text-input` does not have a built-in clear button like `InputAtom.clearable`. The clear button will need to be implemented externally. Options:
- **A**: Add a sibling clear button outside `<ui-text-input>` 
- **B**: Add `clearable` support to `ui-text-input` (scope creep, but reusable)
- **Recommendation**: **Option A** for this change — keep scope minimal. Defer `clearable` to a separate enhancement.

### Risk 2: Import cleanup
When removing `MatFormFieldModule` and `MatInputModule`, verify no other inputs still depend on them in the same component. For example, `appointment-filters` also uses `mat-select` and `mat-datepicker` which need `MatFormFieldModule`. Don't remove the import if other mat-form-fields remain.

### Risk 3: Visual regression in filter layouts
`ui-text-input` is taller (`h-14` = 3.5rem) and has a full border vs the outline fields. The filter bars must be tested to ensure the taller inputs don't break layout alignment (especially the `grid grid-cols-4` in appointment-filters).

## Effort Estimate

| Task | Lines Changed | Risk |
|------|--------------|------|
| 1. `appointment-filters` migration | ~15 lines | Low |
| 2. `movements-table` migration + clear button | ~20 lines | Medium |
| 3. `customer-invoices-table` migration | ~12 lines | Low |
| 4. Import cleanup verification | ~5 lines | Low |
| **Total** | **~50 lines** | **Medium** |

## Recommendation

**Migrate the 3 directly migratable filter inputs** and **defer the blocked `patient-search` matAutocomplete input** to a separate change.

The 3 filter inputs are clean, low-risk migrations:
1. `appointment-filters` "Buscar Paciente" — straightforward `ngModel` → `model()` conversion
2. `movements-table` "Usuario" filter — needs external clear button, but otherwise straightforward
3. `customer-invoices-table` "Filtrar por No. Factura" — `formControl` works directly

The `search-bar` and `search-filters` should remain with `ui-input` (InputAtom) because their compact visual design is intentional for search UX. Migrating them would degrade the user experience.

### Ready for Proposal
**Yes** — proceed to `sdd-propose` for the 3 migration candidates.
