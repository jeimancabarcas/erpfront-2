# Delta for text-input-atom

## ADDED Requirements

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
