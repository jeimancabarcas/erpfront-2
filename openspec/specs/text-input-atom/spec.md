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
