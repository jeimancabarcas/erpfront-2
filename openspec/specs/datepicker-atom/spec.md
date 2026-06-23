# ui-datepicker Specification

## Purpose

Reusable date selection atom using CDK Overlay + `<mat-calendar>`. Provides consistent DD/MM/YYYY date picking across the ERP, matching the `ui-text-input` design system (indigo focus ring, h-14 height, rounded-2xl).

## Requirements

### Requirement: Render and Display

The system MUST render a label, a styled trigger div with `calendar_today` icon, and display the date as DD/MM/YYYY or the placeholder text when value is null.

- `label`, `placeholder`, `helperText`, `error` inputs are strings; `value` is `Date | null`.

#### Scenario: Default render with placeholder

- GIVEN a ui-datepicker with label "Fecha" and placeholder "Seleccionar fecha"
- WHEN the component renders
- THEN the label "Fecha" is displayed above the trigger
- AND the trigger shows the `calendar_today` icon and "Seleccionar fecha" text

#### Scenario: Displays formatted date

- GIVEN a ui-datepicker with value set to 15 March 2025
- WHEN the component renders
- THEN the trigger displays "15/03/2025"

### Requirement: Calendar Overlay

The system MUST open a CDK overlay containing `<mat-calendar>` when the trigger is clicked, and close it on date selection or click-outside.

- Triggers: `@angular/cdk/overlay` with `FlexibleConnectedPositionStrategy`.

#### Scenario: Open on trigger click

- GIVEN a rendered ui-datepicker with closed overlay
- WHEN the user clicks the trigger
- THEN a CDK overlay appears below the trigger with a `<mat-calendar>` component

#### Scenario: Close on date selection

- GIVEN the calendar overlay is open
- WHEN the user clicks a date in `<mat-calendar>`
- THEN the overlay closes
- AND `valueChange` emits the selected `Date`
- AND the trigger displays the date as DD/MM/YYYY

#### Scenario: Close on click-outside

- GIVEN the calendar overlay is open
- WHEN the user clicks outside the overlay and trigger
- THEN the overlay closes
- AND the previously selected value is preserved

### Requirement: Clear Value

The system MUST emit `null` and display the placeholder when the trigger text content is fully deleted.

#### Scenario: Delete text clears value

- GIVEN a ui-datepicker with a selected date displayed
- WHEN the user deletes all characters from the trigger
- THEN `valueChange` emits `null`
- AND the trigger reverts to placeholder text

### Requirement: Validation States

The system MUST visually reflect error, disabled, and required states consistent with `ui-text-input` styling.

#### Scenario: Error state

- GIVEN a ui-datepicker with `error` set to "Campo requerido"
- WHEN the component renders
- THEN the trigger has a red border (`border-red-500`)
- AND the error text "Campo requerido" is displayed below the trigger

#### Scenario: Disabled state

- GIVEN a ui-datepicker with `disabled` set to true
- WHEN the component renders
- THEN the trigger shows `opacity-50 cursor-not-allowed`
- AND clicking the trigger does NOT open the overlay

#### Scenario: Required indicator

- GIVEN a ui-datepicker with `required` set to true
- WHEN the component renders
- THEN an asterisk or "requerido" visual is shown alongside the label

### Requirement: Min/Max Constraints

The system MUST restrict selectable dates in `<mat-calendar>` based on `min` and `max` inputs.

#### Scenario: Calendar respects bounds

- GIVEN a ui-datepicker with `min=2025-06-01` and `max=2025-06-30`
- WHEN the overlay opens
- THEN dates before 1 June 2025 and after 30 June 2025 are disabled in `<mat-calendar>`
- AND selecting a disabled date does NOT emit a value

### Requirement: Form Integration (CVA)

The system MUST implement `ControlValueAccessor` via `NG_VALUE_ACCESSOR` to support `ngModel` and `FormControl` bindings.

- `ChangeDetectionStrategy.OnPush`
- `writeValue(Date | null)`, `registerOnChange`, `registerOnTouched`, `setDisabledState`.

#### Scenario: ngModel binding

- GIVEN a component with `<ui-datepicker [(ngModel)]="myDate">`
- WHEN the user selects a date in the calendar
- THEN `myDate` is updated to the selected `Date`
- AND setting `myDate = null` in the parent clears the trigger display

#### Scenario: formControl binding

- GIVEN a component with `<ui-datepicker [formControl]="dateCtrl">`
- WHEN `dateCtrl.setValue(new Date(2025, 5, 15))` is called
- THEN the trigger displays "15/06/2025"
- AND when the user clears the value, `dateCtrl.value` is `null`

### Requirement: Overlay Positioning

The overlay MUST position below the trigger as the primary strategy, falling back above when insufficient space exists below.

#### Scenario: Position below trigger

- GIVEN a ui-datepicker near the top of the viewport
- WHEN the overlay opens
- THEN the overlay appears directly below the trigger with matching width
