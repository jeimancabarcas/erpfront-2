# Text Input Atom Specification

## Purpose

The `<ui-text-input>` atom encapsulates the customer-dialog reference design — `h-14`, `rounded-2xl`, indigo focus ring, Material Icons. It standardizes text inputs across the ERP frontend forms, replacing three divergent patterns (native Tailwind, Angular Material `mat-form-field`, legacy `InputAtom`).

## Requirements

### Requirement: Input API

Component MUST use `ChangeDetectionStrategy.OnPush` and expose via Angular signals:

| Input/Output | Type | Default |
|---|---|---|
| `label`, `icon`, `placeholder`, `value`, `error`, `helperText` | `string` | `''` |
| `type` | `'text'\|'email'\|'password'\|'number'` | `'text'` |
| `required`, `disabled` | `boolean` | `false` |
| `iconLibrary` | `'material'\|'boxicons'` | `'material'` |
| `valueChange` | `output<string>` | — |

#### Scenario: Default renders label and input

- GIVEN `<ui-text-input label="Name" placeholder="Enter name">`
- WHEN rendered
- THEN `<label>` with "Name" and `<input placeholder="Enter name">` exist
- AND `label[for]` matches `input[id]`

#### Scenario: valueChange emits on input

- GIVEN `<ui-text-input>` with value binding
- WHEN user types "A"
- THEN `valueChange` emits `"A"`

### Requirement: State Rendering

Tokens per reference: `h-14 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all`. Label: `text-xs font-black text-gray-500 uppercase tracking-widest`.

#### Scenario: Error shows message and aria-invalid

- GIVEN `<ui-text-input error="Required">`
- WHEN rendered
- THEN "Required" is visible, `aria-invalid="true"` on input, error linked via `aria-describedby`

#### Scenario: Disabled disables native input

- GIVEN `<ui-text-input [disabled]="true">`
- WHEN rendered
- THEN `<input>` has `disabled` attribute, component has reduced opacity

#### Scenario: Required shows indicator

- GIVEN `<ui-text-input [required]="true" label="Email">`
- WHEN rendered
- THEN label has asterisk, `<input>` has `required` attribute

### Requirement: Icon Rendering

Icon span: `absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600`. Input padding: `pl-12 pr-4` with icon, `px-4` without.

#### Scenario: Material Icons span renders

- GIVEN `<ui-text-input icon="person">`
- WHEN rendered
- THEN `<span class="material-icons">person</span>` is positioned left of input

#### Scenario: Boxicons uses bx prefix

- GIVEN `<ui-text-input icon="user" iconLibrary="boxicons">`
- WHEN rendered
- THEN `<i class="bx bx-user">` renders instead

#### Scenario: No icon uses standard padding

- GIVEN `<ui-text-input>` without `icon`
- WHEN rendered
- THEN no icon element in DOM, input uses `px-4`

### Requirement: Form Integration

SHOULD support `[(ngModel)]` and `[formControl]` binding.

#### Scenario: ngModel two-way binding

- GIVEN form with `<ui-text-input [(ngModel)]="name" name="name">`
- WHEN user types "John"
- THEN `name` equals `"John"`

#### Scenario: formControl validation

- GIVEN `<ui-text-input [formControl]="ctrl">` with `ctrl = new FormControl('', Validators.required)`
- WHEN form submits empty
- THEN component reflects error state

### Requirement: Accessibility

MUST provide `<label for>`, `aria-invalid` on error, `aria-describedby` to error text, `required` passthrough.

### Requirement: Helper Text

SHOULD display helper text below the input when no error is present.

#### Scenario: Helper text visible when no error

- GIVEN `<ui-text-input helperText="Enter your full name">` and no `error` input
- WHEN rendered
- THEN the helper text is visible below the input

#### Scenario: Helper text hidden when error present

- GIVEN `<ui-text-input helperText="Help" error="Required">`
- WHEN rendered
- THEN the helper text is NOT visible, error message is shown instead

### Requirement: Migration Sequence

SHOULD be incremental (1–2 forms per PR). Each phase MUST pass `npx tsc --noEmit` with zero visual diff.

| Phase | Scope | Risk |
|---|---|---|
| 0 | Create `ui-text-input`, write tests | Low |
| 1 | customer-dialog: dogfood replace raw HTML | Low |
| 2 | product-form (9 inputs), login-form (2) | Medium |
| 3 | appointment-form, billing-filters, invoices | Medium |
| 4+ | pediatrics, inventory, transport | High |

#### Scenario: Phase 0 gates further phases

- GIVEN failing `ui-text-input` component tests
- WHEN test suite runs
- THEN Phase 1 MUST NOT proceed until all scenarios pass

### Requirement: Filter Text Input Integration

The system MUST support using `<ui-text-input>` for filter/search text inputs in pages, molecules, and organisms. Two migration patterns apply: **Pattern A** replaces raw HTML `<input>` with `<ui-text-input>` and direct signal binding; **Pattern B** replaces `<mat-form-field>` with `<ui-text-input>` while preserving existing binding semantics.

#### Scenario: Page filter renders with icon and placeholder

- GIVEN a filter bar with `<ui-text-input icon="search" placeholder="Buscar por nombre...">`
- WHEN rendered
- THEN the Material Icons `search` icon and placeholder text display
- AND input uses `bg-white` with `h-14` layout (`bg-gray-50` replaced uniformly)

#### Scenario: valueChange binds to signal setter

- GIVEN `<ui-text-input (valueChange)="nameFilter.set($event)">` replacing raw HTML `(input)="onNameFilterChange($event)"`
- WHEN user types "Widget"
- THEN `nameFilter()` equals `"Widget"`
- AND the `onNameFilterChange` handler is removed from the class

#### Scenario: ngModel replaced by model signal binding

- GIVEN `<ui-text-input [(value)]="searchQuery">` replacing `<mat-form-field><input matInput [(ngModel)]="searchQuery">`
- WHEN user types "patient"
- THEN `searchQuery()` emits `"patient"`
- AND `MatInputModule` MAY be removed if no other `matInput` remains in the component

#### Scenario: formControl binding via CVA

- GIVEN `<ui-text-input [formControl]="invoiceFilter">` replacing `<mat-form-field><input matInput [formControl]="invoiceFilter">`
- WHEN the form control value changes from code
- THEN the input reflects the new value
- AND `valueChanges.pipe(debounceTime(400))` subscription continues to work downstream

#### Scenario: External clear button alongside ui-text-input

- GIVEN `<div><ui-text-input [(value)]="filterUser"></div><button (click)="clearUserFilter()">` replacing `<mat-form-field><input matInput [(ngModel)]="filterUser"><button matSuffix>`
- WHEN user clicks the clear button
- THEN `filterUser` signal resets to `""`
- AND the ui-text-input value clears
- AND a debounced search query re-emits

### Requirement: TypeScript Compilation

The full migration across all 8 components MUST pass `npx tsc --noEmit` with zero errors.

#### Scenario: All 11 inputs migrated compile cleanly

- GIVEN all 11 filter inputs migrated across 8 components (5 pages, 3 molecules/organisms)
- WHEN `npx tsc --noEmit` runs
- THEN no type or binding errors are reported
