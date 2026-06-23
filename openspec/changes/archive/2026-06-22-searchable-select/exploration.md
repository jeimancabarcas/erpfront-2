# Exploration: searchable-select

## Current State

### The ui-select Atom (src/app/components/atoms/select/select.component.ts)

`ui-select` is the app's standardized dropdown component. It is a Tailwind-native, OnPush, ControlValueAccessor-backed atom with 15 callers across the codebase.

**Existing API:**
```typescript
// Inputs (signals)
label: string            // Label text above trigger
placeholder: string      // Placeholder text ("Seleccionar..." default)
options: SelectOption[]  // Static option list { value: string, label: string }
value: model<string>     // Two-way bound selected value
required: boolean
disabled: boolean
error: string            // Red border + error message below
helperText: string       // Gray helper text below (hidden when error present)
searchable: boolean      // Renders search input inside dropdown panel
```

**Current searchable behavior (local filtering only):**
- `searchable=true` renders a search `<input>` inside the dropdown panel (line 68-75)
- `filteredOptions` is a `computed()` that filters `options()` by `searchQuery` locally — **no async/API support**
- Search query is never emitted externally — it stays internal as `searchQuery` signal
- No `output()` for search events; no way to hook into what the user types
- **No footer slot** — the dropdown panel ends at the options list (line 77-96)
- **No loading state** — no spinner/wait state for pending results
- **No empty-state customization** — "Sin resultados" is hardcoded (line 79-81)

**Template structure:**
```
<div class="relative">
  <button role="combobox">  <!-- trigger with chevron -->
  @if (open()) {
    <div>                     <!-- dropdown panel -->
      @if (searchable()) { search input }
      <div>                   <!-- scrollable options -->
        @if (empty) { "Sin resultados" }
        @for (options) { button[role="option"] }
      </div>
    </div>
  }
</div>
```

### How general-invoice-form-dialog Handles Search Today

The dialog at `src/app/components/organisms/general-invoice-form-dialog/` implements **two searchable selects from scratch**, using `ui-text-input` + manual dropdowns — not `ui-select`.

#### Customer Search (lines 49-69)
- Uses `FormControl('customerSearch')` bound to `ui-text-input`
- `filteredCustomers = toSignal(valueChanges.pipe(startWith(''), map(...)))` — reactive stream filtering `financeService.customers()` locally
- `showCustomerDropdown` signal toggled by valueChanges subscription
- Custom dropdown: `absolute left-0 right-0 top-16 z-20 bg-white rounded-2xl shadow-xl`
- Each result is a `<button>` showing `customer.name` + `customer.taxId`
- **No "Crear nuevo" action** — only search + select
- Selection sets `selectedCustomer` signal, clears search, closes dropdown

#### Product Search (lines 108-131)
- Per-item dropdown: `activeProductDropdown` signal tracks which item row's dropdown is open
- `productSearchQuery` signal updated on input event
- `filteredCatalog` computed filtering `financeService.catalog()` by name
- Each result shows `product.name` + `product.category` badge
- Uses `(focus)="openProductDropdown($index)"` + `(blur)="closeProductDropdown($index)"` with 200ms delay
- Selection patchValue into the FormArray item's unitPrice/taxRate
- **No "Crear nuevo" action**

**Key limitation:** Both dropdowns are custom-built inside this one dialog. No reuse possible. Every other dialog that needs this pattern would duplicate this code entirely.

### adjustment-form-dialog Invoice Search (src/app/components/organisms/adjustment-form-dialog/)

- Uses **MatAutocomplete** (`mat-form-field` + `input[matAutocomplete]`) for invoice reference search
- `filteredInvoices = toSignal(valueChanges.pipe(startWith(''), map(...)))` — reactive filtering
- Maps backend invoices to `FinanceInvoice` structure via `computed()`
- Each option shows `inv.id` + `inv.customerName` + amount
- Selection sets `selectedInvoice` signal, clears search
- **No "Crear nuevo" action** — only search + select from existing invoices
- Mixes Material Design (matAutocomplete) with the app's Tailwind-native atoms

## Pattern Inventory

| Component | Mechanism | Data Source | Async? | Footer? | Reusable? |
|-----------|-----------|-------------|--------|---------|-----------|
| **ui-select** (`searchable`) | Internal `<input>` + `filteredOptions` computed | Static `options()` array | ❌ Local only | ❌ No | ✅ Atom |
| **general-invoice-form-dialog** (customer) | `ui-text-input` + `FormControl` + `toSignal(valueChanges)` | `financeService.customers()` signal | ❌ Local filter | ❌ No | ❌ Inline |
| **general-invoice-form-dialog** (product) | `ui-text-input` + `productSearchQuery` signal + `filteredCatalog` computed | `financeService.catalog()` signal | ❌ Local filter | ❌ No | ❌ Inline |
| **adjustment-form-dialog** (invoice) | `matAutocomplete` + `FormControl` + `toSignal(valueChanges)` | `invoiceService.invoices()` signal | ❌ Local filter | ❌ No | ❌ Inline |
| **patient-search** molecule | `matAutocomplete` + `searchQuery` signal + `filteredPatients` computed | `pediatricsService.patients()` signal | ❌ Local filter | ❌ No | ✅ Molecule, but Material-specific |
| **search-bar** molecule | Text input + debounced output | N/A (emits query) | N/A | N/A | ✅ Molecule |
| **search-filters** molecule | `ui-select` with static options | Pre-mapped `SelectOption[]` | ❌ Static | ❌ No | ✅ Molecule |

**Conclusion:** Every searchable dropdown in the app is either:
1. `ui-select` with `searchable=true` — local filtering of a pre-loaded static `options[]` array
2. Custom-built inline using `ui-text-input` + manual dropdown + manual filtering
3. Material `matAutocomplete` (inconsistent with the app's Tailwind-native design system)

There is **zero reuse** across dialogs that need the same pattern. The `general-invoice-form-dialog` alone has TWO independent implementations of the same concept (customer search + product search).

## Affected Areas

- **`src/app/components/atoms/select/select.component.ts`** — Primary candidate for extension. Has 15 callers across the app. Any change to its API must not break existing consumers.
- **`src/app/components/atoms/select/select.component.spec.ts`** — 296 lines, 12 tests. Must be updated/expanded for new async + footer features.
- **`src/app/components/organisms/general-invoice-form-dialog/`** — Primary consumer target. Both customer and product searches would be replaced.
- **`src/app/components/organisms/adjustment-form-dialog/`** — Invoice search could be replaced (removing `matAutocomplete` dependency).
- **`src/app/components/molecules/patient-search/`** — Could potentially be refactored to use the new component, but patient search has unique rendering (patient name + document ID) and is already a dedicated molecule.
- **`src/app/services/finance.service.ts`** — `customers()` and `catalog()` signals are the data sources for this use case.
- **`openspec/specs/select-atom/spec.md`** — Existing spec must be extended with async search + footer slot requirements.

## Approaches

### Approach A: Extend `ui-select` with async search + footer slot (RECOMMENDED)

Add new inputs/outputs to the existing `SelectAtom`:

```typescript
// New inputs
asyncSearch?: (query: string) => Observable<SelectOption[]>  // Callback for async filtering
loading: boolean                                               // Show spinner while fetching
footerLabel: string                                            // Text for footer button ("Crear nuevo")
emptyLabel: string                                             // Custom empty message

// New outputs
searchChange: output<string>          // Emits search query (debounced by parent)
footerAction: output<void>            // Emits when footer button clicked
```

**Pros:**
- Single component serves all use cases (static local, static searchable, async searchable, async + footer)
- No new component to maintain — extends existing tested atom
- Existing consumers unaffected (all new inputs are optional, default behavior unchanged)
- Consistent with the app's pattern of few, powerful atoms

**Cons:**
- `SelectAtom` class grows (currently 192 lines) — more responsibility in one component
- The async callback pattern (`Observable` return) couples the component to RxJS, but the app already uses RxJS heavily
- Loading spinner placement needs careful design to not break existing dropdown layout

**Complexity:** Medium

### Approach B: Create new `ui-search-select` atom

Create a standalone atom dedicated to async searchable selects. `ui-select` stays unchanged.

```typescript
@Component({ selector: 'ui-search-select' })
export class SearchSelectAtom implements ControlValueAccessor {
  searchFn = input<(query: string) => Observable<SelectOption[]>>();
  footerLabel = input<string>('');
  loading = input(false);
  // ... mirrors ui-select inputs where relevant
}
```

**Pros:**
- Clean separation of concerns — `ui-select` for static, `ui-search-select` for async
- No risk of breaking existing 15 `ui-select` consumers
- Easier to reason about (dedicated purpose)

**Cons:**
- New component = new spec, new tests, new docs, new maintenance burden
- Duplicates trigger styling, dropdown panel, CVA, aria — lot of overlap with `ui-select`
- Consumers now have to choose between TWO select atoms — cognitive load
- The app's design philosophy is "few, powerful atoms" not "many, specialized atoms"

**Complexity:** Medium-High

### Approach C: Extract shared base + two variants

Create a base select class/directive with shared logic, then two derived components: `ui-select` (static) and `ui-search-select` (async).

**Pros:**
- DRY — shared trigger, panel, CVA, aria logic
- Clean separation at the consumer level

**Cons:**
- Angular component inheritance is fragile and poorly supported
- Directives/composition over inheritance is the Angular way — but this adds abstraction layers
- Over-engineering for what is essentially adding ~40 lines to an existing component
- Adds 2-3 files for marginal benefit

**Complexity:** High

## Recommendation: Approach A — Extend `ui-select`

**Rationale:**

1. **The existing `ui-select` already supports searchable mode** — it has the search input, the filtered options computed, the dropdown panel. Adding async support is a natural extension of what's already there.

2. **All new inputs are optional** — `asyncSearch`, `loading`, `footerLabel`, `footerAction`, `searchChange`, `emptyLabel`. When not provided, behavior is 100% backward-compatible. No breaking change for 15 existing callers.

3. **The app's pattern is "few, powerful atoms"** — `ui-text-input` handles text, email, password, number. `ui-select` should handle static, searchable-local, and searchable-async selects. Adding a second select atom contradicts the design system's DNA.

4. **Real-world precedent in the app** — `ui-text-input` already bundles `type`, `icon`, `iconLibrary`, error, helper, CVA — all in one component. The select should follow the same pattern of configurability over fragmentation.

5. **Test coverage is already strong** — 12 tests for `ui-select`. Adding tests for async search + footer is additive, not a rewrite.

### Proposed API Design

```typescript
export interface SelectOption {
  value: string;
  label: string;
  // Optional: extra data for custom rendering
  subtitle?: string;  // e.g., taxId, category
}

@Component({ selector: 'ui-select' })
export class SelectAtom implements ControlValueAccessor {
  // ── Existing (unchanged) ──
  label = input<string>('');
  placeholder = input<string>('Seleccionar...');
  options = input<SelectOption[]>([]);
  value = model<string>('');
  required = input(false);
  disabled = input(false);
  error = input<string>('');
  helperText = input<string>('');
  searchable = input(false);

  // ── NEW: Async search ──
  /** When set, overrides local filtering. Called with debounced query, returns Observable of options. */
  asyncSearch = input<((query: string) => Observable<SelectOption[]>) | null>(null);
  /** Show loading spinner in dropdown while asyncSearch is pending (managed by parent). */
  loading = input(false);
  /** Emits the raw search query on every keystroke. Parent debounces and calls API. */
  searchChange = output<string>();

  // ── NEW: Footer slot ──
  /** Label for the always-visible footer action button. If empty, no footer renders. */
  footerLabel = input<string>('');
  /** Emits when the footer action button is clicked. */
  footerAction = output<void>();

  // ── NEW: Customization ──
  /** Override the default "Sin resultados" message. */
  emptyLabel = input<string>('Sin resultados');
  /** Show subtitle in option rows when SelectOption.subtitle is populated. */
  showSubtitle = input(false);

  // ── Internal (unchanged) ──
  open = signal(false);
  searchQuery = signal('');
  highlightedIndex = signal(-1);
  private elementRef = inject(ElementRef);
}
```

**Async search flow:**
```
User types in search input
  → searchChange.emit(query)              // parent receives raw query
  → Parent debounces (300-400ms)
  → Parent calls API: service.search(query)
  → Parent sets loading=true, then subscribes
  → On response: parent sets options(), loading=false
  → Component renders updated options (via filteredOptions or directly)
```

**Why `searchChange` output + parent-managed loading vs. injected callback:**
- The parent should control the API call — it knows which service to call, how to map results, and handles errors
- A callback approach (`asyncSearch(query) => Observable`) would require the component to manage subscriptions, which adds lifecycle complexity
- The output pattern matches the app's existing patterns (`search-bar` molecule, `search-filters` molecule)
- It keeps the component "dumb" — it just renders what it's given

**Footer slot template addition:**
```html
@if (open()) {
  <div class="dropdown-panel">
    @if (searchable()) { search input }
    @if (loading()) { spinner }
    <div class="options-scroll">
      @if (empty) { {{ emptyLabel() }} }
      @for (options) { option buttons }
    </div>
    @if (footerLabel()) {
      <button class="footer-action" (click)="footerAction.emit()">
        <span class="material-icons">add</span>
        {{ footerLabel() }}
      </button>
    }
  </div>
}
```

**Consumer usage example (general-invoice-form-dialog):**
```html
<ui-select
  label="Seleccionar Cliente"
  placeholder="Buscar por nombre o identificación..."
  [searchable]="true"
  [loading]="customerSearchLoading()"
  [options]="customerOptions()"
  footerLabel="Crear nuevo cliente"
  [showSubtitle]="true"
  (searchChange)="onCustomerSearch($event)"
  (footerAction)="openCreateCustomerDialog()"
  [formControl]="invoiceForm.controls.customerSearch"
/>
```

## Risk Areas

1. **Debouncing strategy** — The parent must debounce `searchChange` emissions before calling the API. The component should NOT debounce internally, as different use cases need different debounce times (300ms for local, 500ms for remote API). A shared `debounceTime` utility or rxjs operator pattern should be documented.

2. **Race conditions** — If the user types "abc" then quickly types "def", the "abc" API call may return AFTER the "def" call. The parent MUST handle this (e.g., `switchMap` in the observable chain). Document this clearly.

3. **`SelectOption.subtitle` — breaking interface change?** Adding `subtitle?: string` to `SelectOption` is backward-compatible (optional field), but existing consumers that construct `SelectOption` arrays won't include it. The `showSubtitle` input gates rendering — if false, subtitle is ignored. If true but subtitle is undefined, nothing renders — no visual breakage.

4. **Loading state placement** — Should the spinner replace the options list, or appear above it? Recommendation: show a small spinner inside the search input area (like a suffix icon) while keeping previous results visible. This prevents jarring UI flicker between searches.

5. **Keyboard navigation with async** — Currently, `highlightedIndex` tracks mouse hover. With async results, the index could point to a stale position after new options arrive. Reset `highlightedIndex` to -1 when `options()` changes while `open()` is true.

6. **Footer button focus** — When the footer button is clicked, the dropdown should NOT close (unlike option selection). The footer action emits, and the parent decides what to do (open dialog, navigate, etc.). The dropdown stays open to allow multiple interactions.

7. **Test impact** — 12 existing tests for `ui-select`. The `searchable` test (line 124-148) tests local filtering with `searchable=true`. This test should still pass with async search disabled (null). New tests needed for: async search mode, loading spinner visibility, footer slot rendering, footerAction emission, searchChange emission, emptyLabel customization.

8. **`redesign-selects` change is active** — `openspec/changes/redesign-selects/` exists with a `tasks.md`. Any changes to `ui-select` must not conflict with in-flight redesign work. The `searchable-select` change should be sequenced after or in coordination with `redesign-selects`.

## Ready for Proposal

**Yes.** The exploration confirms:
- A clear gap exists (no reusable async-searchable-select in the app)
- Multiple dialogs duplicate this pattern inline
- `ui-select` is the right home for this extension (Approach A)
- The proposed API is backward-compatible and follows existing patterns
- Risks are manageable with proper docs and test coverage

**The orchestrator should proceed to `sdd-propose` with:**
- Change name: `searchable-select`
- Approach: Extend `ui-select` (Approach A)
- Primary consumer: `general-invoice-form-dialog`
- Secondary consumers: `adjustment-form-dialog` (invoice search), future dialogs that need searchable entity selection
- Coordination needed: check `redesign-selects` change status before implementing
