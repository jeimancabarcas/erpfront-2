# Select Atom Specification

## Purpose

The `<ui-select>` atom replaces the legacy SelectAtom (SCSS/BEM) with a Tailwind-native custom dropdown panel that visually matches `text-input-atom`. Implements `ControlValueAccessor`, supports searchable, and unifies 39+ select instances across 3 currently incompatible patterns.

## Requirements

### Requirement: Component API

MUST use `ChangeDetectionStrategy.OnPush`, implement `ControlValueAccessor`, and expose via signals:

| Input/Output | Type | Default |
|---|---|---|
| `label`, `placeholder`, `value`, `error`, `helperText` | `string` | `''` |
| `options` | `SelectOption[]` (value/label) | `[]` |
| `required`, `disabled`, `searchable` | `boolean` | `false` |
| `valueChange` | `output<string>` | — |

#### Scenario: Default renders label and trigger with placeholder

- GIVEN `<ui-select label="Status" placeholder="Select..." [options]="opts">`
- WHEN rendered
- THEN label "Status" renders above trigger
- AND trigger displays placeholder text, uses `h-14 rounded-2xl border border-gray-200`

#### Scenario: valueChange emits on selection

- GIVEN dropdown open with options
- WHEN user clicks option with value `"active"`
- THEN `valueChange` emits `"active"` and dropdown closes

#### Scenario: Open state shows panel with backdrop

- GIVEN trigger clicked
- WHEN dropdown opens
- THEN absolute positioned panel renders with options and `shadow-lg`
- AND `aria-expanded="true"`, outside click closes panel

### Requirement: Searchable Mode

`searchable` MUST render an input inside the dropdown that filters options by label match.

#### Scenario: Search input filters options

- GIVEN `<ui-select [searchable]="true">` with 10 options
- WHEN user types "cat" in search input
- THEN only options whose label contains "cat" are visible
- AND "Sin resultados" shown when no match

#### Scenario: Keyboard navigation in search

- GIVEN searchable dropdown open with filtered results
- WHEN ArrowDown pressed then Enter
- THEN focused option selected, dropdown closes, value emitted

### Requirement: State Rendering

Visual tokens per reference: `h-14 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all`. Label: `text-xs font-black text-gray-500 uppercase tracking-widest`. Panel: `absolute z-50 rounded-xl shadow-lg border border-gray-100`.

#### Scenario: Error state shows red border and message

- GIVEN `<ui-select error="Campo requerido">`
- WHEN rendered
- THEN trigger has `border-red-500`, error message visible below
- AND trigger has `aria-invalid="true"`

#### Scenario: Disabled prevents interaction

- GIVEN `<ui-select [disabled]="true">`
- WHEN rendered
- THEN trigger has `disabled`, click no-ops, `opacity-50 cursor-not-allowed`

#### Scenario: Required indicator on label

- GIVEN `<ui-select [required]="true" label="City">`
- WHEN rendered
- THEN label shows red asterisk suffix

### Requirement: Form Integration

SHOULD support `[(ngModel)]` and `[formControl]` via `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider.

#### Scenario: ngModel two-way binding

- GIVEN `<ui-select [(ngModel)]="status" name="status">`
- WHEN user selects "active"
- THEN `status` equals `"active"`, trigger displays selected label

#### Scenario: formControl with validators

- GIVEN `<ui-select [formControl]="ctrl">` with `ctrl = new FormControl('', Validators.required)`
- WHEN control is invalid and touched
- THEN component shows error state, form invalid

#### Scenario: writeValue updates trigger display

- GIVEN `<ui-select [formControl]="ctrl">`
- WHEN `ctrl.setValue('pending')`
- THEN trigger displays the matching option label

### Requirement: Migration Compatibility

SHOULD be drop-in replacement for native `<select>` and `<mat-select>` without breaking consumers.

#### Scenario: Native select replacement

- GIVEN form with native `<select [(ngModel)]="x">`
- WHEN replaced with `<ui-select [(ngModel)]="x">`
- THEN value binding and change detection behave identically

#### Scenario: mat-select replacement

- GIVEN `<mat-select formControlName="type">` inside `<mat-form-field>`
- WHEN replaced with `<ui-select formControlName="type">`
- THEN `MatSelectModule` MAY be removed from imports if no other usage

#### Scenario: SearchFiltersMolecule no regression

- GIVEN `SearchFiltersMolecule` with `<ui-select [value]="filterValues()[key]" (valueChange)="onFilterChange(...)">`
- WHEN atom is rewritten with CVA + Tailwind
- THEN filterValues signal updates correctly, existing vitest tests pass

#### Scenario: PatientRegistrationWizard stepper compat

- GIVEN `PatientRegistrationWizard` with 4 `<ui-select>` inside `mat-stepper`
- WHEN navigating steps
- THEN selected values persist, stepper validation works
- AND `MatStepperModule` stays imported
