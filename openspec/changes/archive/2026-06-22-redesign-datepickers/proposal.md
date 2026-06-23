# Proposal: Uniform Datepicker Atom

## Intent

Replace 10 divergent date inputs (4 `mat-datepicker` + 6 native `<input type="date">`) with a single `ui-datepicker` atom that uses Angular CDK Overlay + `<mat-calendar>` for a custom-styled calendar, matching the `ui-text-input`/`ui-select` design system (`h-14 rounded-2xl`, indigo focus ring).

## Scope

### In Scope

- Create `ui-datepicker` atom: CVA-compatible, CDK Overlay trigger + `<mat-calendar>`, DD/MM/YYYY display, Tailwind/SCSS custom calendar styles
- Migrate 4 `mat-datepicker` usages: `purchase-order-dialog`, `appointment-filters`, `appointment-form`, `patient-registration-wizard`
- Migrate 6 native `<input type="date">`: all 5 transport dialogs + `search-filters`
- Remove `MatDatepickerModule`/`MatNativeDateModule` imports where no longer needed
- Preserve `MatTimepickerModule` in `appointment-form`

### Out of Scope

- `focusColor` parametrization (indigo only; transport domain colors stay via wrapper if needed)
- Timepicker migration (`MatTimepickerModule` untouched)
- Browser-native calendar fallback

## Capabilities

### New Capabilities

- `ui-datepicker`: Date selection atom using CDK Overlay + `<mat-calendar>`. Covers label, icon (`calendar_today`), DD/MM/YYYY display, min/max constraints, error/disabled/required states, CVA for FormsModule/ReactiveFormsModule, click-outside dismiss.

### Modified Capabilities

None. No existing spec covers date inputs.

## API

| Input/Output | Type | Default |
|---|---|---|
| `label`, `placeholder`, `error`, `helperText` | `string` | `''` |
| `value` | `Date\|null` | `null` |
| `required`, `disabled` | `boolean` | `false` |
| `min`, `max` | `Date\|null` | `null` |
| `valueChange` | `output<Date\|null>` | — |

CVA via `NG_VALUE_ACCESSOR` — compatible with `formControlName` and `ngModel`.

## Approach

1. **Trigger**: Styled `div` with `h-14 rounded-2xl border-gray-200` + label + `calendar_today` icon (matching `ui-text-input`). Displays date as DD/MM/YYYY or placeholder.
2. **Overlay**: Angular CDK `OverlayModule` with `FlexibleConnectedPositionStrategy` (drop-down below trigger, fallback above). `<mat-calendar>` inside overlay panel, Tailwind/SCSS for custom header, selected-day highlight, and hover states.
3. **Interaction**: Click trigger → open overlay. Click date → update model + close. Click outside → close. Clear text in trigger → emit `null`.
4. **CVA**: Standard `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider. `writeValue` accepts `Date | null`.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/atoms/ui-datepicker/` | **New** | Atom component, template, SCSS, spec |
| `src/app/components/organisms/purchase-order-dialog/` | Modified | Replace mat-datepicker with ui-datepicker |
| `src/app/components/organisms/appointment-form/` | Modified | Replace mat-datepicker; keep MatTimepickerModule |
| `src/app/components/organisms/patient-registration-wizard/` | Modified | Replace mat-datepicker inside MatStepper |
| `src/app/components/molecules/appointment-filters/` | Modified | Replace mat-datepicker; drop ::ng-deep |
| `src/app/components/features/transport/*/` (5 dialogs) | Modified | Replace native `<input type="date">` with ui-datepicker |
| `src/app/components/molecules/search-filters/` | Modified | Replace native `<input type="date">`; drop legacy SCSS |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| CDK overlay positioning conflicts with `MatStepper` z-index | Medium | Test in `patient-registration-wizard` early; use `cdk-overlay-connected-position` with panel class fallback |
| `<mat-calendar>` date adapter mismatch (NativeDate vs Moment) | Low | Verify app uses `MatNativeDateModule`; switch to `provideNativeDateAdapter` if needed |
| `appointment-form` timepicker breaks when removing datepicker module | Low | Remove only `MatDatepickerModule`; `MatTimepickerModule` stays |
| Calendar rendering diff between OS/browser locales | Low | `<mat-calendar>` uses `DateAdapter` — locale-invariant; display format is explicit DD/MM/YYYY |

## Rollback Plan

Git revert the commit. Each migration site is self-contained (one template block replaced). No DB schema changes, no API contract changes. The underlying `Date` model is unchanged — only the UI layer is affected.

## Dependencies

- Angular CDK `@angular/cdk/overlay` (already in project)
- `MatCalendar` from `@angular/material/datepicker`
- `provideNativeDateAdapter` from `@angular/material/core`

## Success Criteria

- [ ] All 12 date inputs render with `h-14 rounded-2xl` and indigo focus ring
- [ ] Custom calendar overlay opens on trigger click, closes on date select or click-outside
- [ ] CVA works with both `formControlName` and `ngModel`
- [ ] DD/MM/YYYY display format consistent across all usages
- [ ] Clear trigger text → model emits `null`
- [ ] `MatDatepickerModule` removed from all 4 original component imports
- [ ] Appointment timepicker still functional
