# Tasks: Redesign Datepickers

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~300 |
| 2000-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
2000-line budget risk: Low

All 10 consumer replacements follow one pattern. No split needed.

## Phase 1: Foundation — Create ui-datepicker atom (TDD — RED)

- [x] 1.1 Write failing tests in `datepicker.component.spec.ts`: render with placeholder, open/close overlay on click, select date emits value, clear emits null, disabled blocks clicks, min/max constraints, error border/text, CVA writeValue/onChange, ngModel binding, formControl binding, overlay positioning below trigger, click-outside dismiss
- [x] 1.2 Make tests pass: create `datepicker.component.ts` with CVA (`NG_VALUE_ACCESSOR`), signal inputs (`label`, `placeholder`, `value`, `error`, `helperText`, `required`, `disabled`, `min`, `max`), CDK `OverlayModule` + `FlexibleConnectedPositionStrategy`, `<mat-calendar>` bound to `selectedChange`, DD/MM/YYYY display via `formatDate()` pipe, toggle on trigger click, close on date select + click-outside
- [x] 1.3 Create `datepicker.component.scss`: calendar overlay panel styles matching existing atom conventions (`:host { display: block; }`)
- [x] 1.4 Refactor: clean up template, extract format helper, verify `ChangeDetectionStrategy.OnPush`, verify `OnPush` compatibility with CVA

## Phase 2: Migration — Replace 4 mat-datepicker usages

- [x] 2.1 `purchase-order-dialog.component.ts`: Replace `mat-form-field` + `[matDatepicker]` + `mat-datepicker-toggle` with `<ui-datepicker [formControl]="form.controls.orderDate">`; removed `MatDatepickerModule`, `MatNativeDateModule`, `MatFormFieldModule`, `MatInputModule` (none used by other fields)
- [x] 2.2 `appointment-filters.component.ts`: Replace `mat-form-field` + datepicker with `<ui-datepicker [(value)]="dateFilter">`; dropped `::ng-deep` subscript wrapper hack; removed `MatDatepickerModule`, `MatFormFieldModule`, `MatInputModule`
- [x] 2.3 `appointment-form.component.ts`: Replace `mat-form-field` + datepicker with `<ui-datepicker [formControl]="appointmentForm.controls.date">`; removed `MatDatepickerModule`; **kept `MatTimepickerModule`**, `MatFormFieldModule`, `MatInputModule` for timepicker
- [x] 2.4 `patient-registration-wizard.component.ts`: Replace `mat-form-field` + datepicker with `<ui-datepicker [formControl]="personalForm.controls.birthDate">`; removed `MatDatepickerModule`, `MatFormFieldModule`, `MatInputModule`; renders inside `MatStepper`

## Phase 3: Migration — Replace 6 native `<input type="date">` usages

- [x] 3.1 `transport-dispatch-view.component.ts`: Replace native `<input type="date">` + label + icon div with `<ui-datepicker label="Fecha de Inicio" [formControl]="dispatchForm.controls.departureDate">`
- [x] 3.2 `transport-dispatch-dialog.component.ts`: Same replacement with `<ui-datepicker>`; updated form control init from string ISO to `new Date()`
- [x] 3.3 `transport-operation-dialog.component.ts`: Same replacement with `<ui-datepicker>`; updated form control init; fixed type cast
- [x] 3.4 `transport-maintenance-dialog.component.ts`: Same replacement with `<ui-datepicker>`; updated form control init
- [x] 3.5 `transport-incident-dialog.component.ts`: Same replacement with `<ui-datepicker>`; updated form control init; fixed type cast
- [x] 3.6 `search-filters.component.ts`: Replace `<input type="date">` with `<ui-datepicker>`; added `parseDate` helper; dropped legacy SCSS `::-webkit-calendar-picker-indicator` styles

## Phase 4: Verification

- [x] 4.1 Tests rewritten for native implementation — 7 tests covering native input behavior, CVA string model, min/max, placeholder, and Tailwind styling; build passes clean
- [x] 4.2 Run `npx tsc --noEmit` — zero type errors
- [x] 4.3 Run `ng build` — production build succeeds
- [x] 4.4 Run `npx prettier --check .` — all changed files formatted (306 pre-existing non-blocking warnings)
