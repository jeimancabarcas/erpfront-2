# Textarea Atom Specification

## Purpose

The `<ui-textarea>` atom provides a textarea sibling to `<ui-text-input>`, sharing the same `rounded-2xl` + indigo focus ring design. It standardizes all 24 ERP textareas under a single Tailwind-based component with full ControlValueAccessor support.

## Requirements

### Requirement: Component API

MUST use `ChangeDetectionStrategy.OnPush`, signals, and expose via inputs/outputs:

| Input | Type | Default |
|-------|------|---------|
| `label`, `placeholder`, `value`, `error`, `helperText` | `string` | `''` |
| `rows` | `number` | `3` |
| `resize` | `'vertical'\|'both'\|'none'` | `'vertical'` |
| `minHeight` | `string` | `'3.5rem'` |
| `required`, `disabled` | `boolean` | `false` |

| Output | Type |
|--------|------|
| `valueChange` | `EventEmitter<string>` |

#### Scenario: Default renders label and textarea

- GIVEN `<ui-textarea label="Notes" placeholder="Enter notes">`
- WHEN rendered
- THEN `<label>` with "Notes" and `<textarea placeholder="Enter notes">` exist
- AND `label[for]` matches `textarea[id]`

#### Scenario: Resize-y class applied by default

- GIVEN `<ui-textarea>` without `resize` input
- WHEN rendered
- THEN textarea has `resize-y` class applied

#### Scenario: Custom rows and minHeight

- GIVEN `<ui-textarea [rows]="6" minHeight="200px">`
- WHEN rendered
- THEN textarea has `rows="6"` and `min-height: 200px` style

#### Scenario: Error shows message and aria-invalid

- GIVEN `<ui-textarea error="Required">`
- WHEN rendered
- THEN error message is visible, `aria-invalid="true"` on textarea, error linked via `aria-describedby`

#### Scenario: Disabled disables native textarea

- GIVEN `<ui-textarea [disabled]="true">`
- WHEN rendered
- THEN `<textarea>` has `disabled` attribute, component has reduced opacity

#### Scenario: Required shows indicator

- GIVEN `<ui-textarea [required]="true" label="Reason">`
- WHEN rendered
- THEN label has asterisk, `<textarea>` has `required` attribute

#### Scenario: Placeholder shown

- GIVEN `<ui-textarea placeholder="Describe the issue...">`
- WHEN rendered
- THEN placeholder text is visible in the textarea

### Requirement: Form Integration

SHOULD support `[(ngModel)]` and `[formControl]` binding via CVA.

#### Scenario: ngModel two-way binding

- GIVEN `<ui-textarea [(ngModel)]="notes" name="notes">`
- WHEN user types "Patient update"
- THEN `notes` equals `"Patient update"`

#### Scenario: formControl binding

- GIVEN `<ui-textarea [formControl]="ctrl">`
- WHEN user types into textarea
- THEN `ctrl.value` reflects the typed value

#### Scenario: Required validation

- GIVEN `<ui-textarea [formControl]="ctrl">` with `Validators.required`
- WHEN ctrl is touched and empty
- THEN component reflects error state

### Requirement: Migration

MUST support incremental migration from all three existing patterns.

#### Scenario: Native textarea replaced by ui-textarea

- GIVEN a Pattern A file with `<textarea class="...rounded-xl focus:ring-indigo-500...">` and `[(ngModel)]`
- WHEN replaced with `<ui-textarea [(value)]="model">`
- THEN `npx tsc --noEmit` passes, visual matches indigo focus ring design

#### Scenario: matInput textarea replaced, MatInputModule cleaned

- GIVEN a Pattern B file with `<mat-form-field><textarea matInput formControlName="obs">` importing `MatFormFieldModule`
- WHEN replaced with `<ui-textarea formControlName="obs">`
- THEN if no other `matInput` remains, `MatFormFieldModule` is removed from imports

#### Scenario: patient-neonatal-history one-way binding upgraded

- GIVEN `<textarea matInput [value]="neonatalNotes">` with no writeback
- WHEN replaced with `<ui-textarea [(value)]="neonatalNotes">`
- THEN two-way binding syncs parent model on input
