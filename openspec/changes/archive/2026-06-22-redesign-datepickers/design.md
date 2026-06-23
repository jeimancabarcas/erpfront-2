# Design: Redesign Datepickers

## Technical Approach

Create a `ui-datepicker` standalone atom (CVA, OnPush) wrapping `<mat-calendar>` via CDK Overlay. Replace all 10 divergent date inputs (4 `mat-datepicker` + 6 native `<input type="date">`) across the app. Backed by the existing `ui-text-input` design tokens (`h-14 rounded-2xl`, indigo focus ring, `calendar_today` icon).

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| CDK Overlay + `<mat-calendar>` vs native `<input type="date">` | Native is simpler but format can't be controlled (OS locale) and styling is limited. CDK Overlay + `<mat-calendar>` gives exact DD/MM/YYYY display and consistent cross-browser UX. | **CDK Overlay + `<mat-calendar>`** — the overriding requirement is DD/MM/YYYY display, which native `<input type="date">` cannot enforce. |
| Reuse `<mat-calendar>` vs build calendar from scratch | `<mat-calendar>` is already in the bundle via `@angular/material` and handles date-picking logic, ARIA, keyboard nav. Building from scratch is ~500+ lines. | **Reuse `<mat-calendar>`** — matches Material version in the project, zero new calendar logic to maintain. |
| One atom for all (-10), or only migrate 4 mat-datepicker usages | 6 native inputs exist in transport dialogs with partial Tailwind styling. Normalizing them now prevents tech debt duplication. | **Migrate all 10** — consistent DX, single maintenance point. |
| Focus color param (`focusColor` input) vs indigo only | Transport dialogs use red/amber focus rings for incident/maintenance. Parametrizing adds complexity (+ icon color, border color). | **Indigo only** — matches proposal scope. Transport domain colors stay via wrapper if needed. |

## Data Flow

```
Form (formControlName / ngModel)
  │
  ▼
ui-datepicker (CVA)
  │  value: Date | null
  │
  ├── Trigger (click) ──► toggle() ──► CDK Overlay open/close
  │
  └── <mat-calendar> (selectedChange) ──► onDateSelected(date)
        │                                  format DD/MM/YYYY
        │                                  emit via onChange()
        ▼
  Form model updated (Date | null)
```

Clear input text → `onInput(event)` → value = null → emit null via onChange.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/atoms/datepicker/datepicker.component.ts` | Create | `ui-datepicker` atom: CVA, CDK Overlay, `<mat-calendar>`, DD/MM/YYYY |
| `src/app/components/atoms/datepicker/datepicker.component.scss` | Create | Calendar overlay panel styles (12 files via `@include` pattern) |
| `src/app/components/atoms/datepicker/datepicker.component.spec.ts` | Create | Unit tests (CVA, overlay toggle, date select, clear) |
| `src/app/components/organisms/purchase-order-dialog/purchase-order-dialog.component.ts` | Modify | Replace `mat-form-field` + datepicker with `<ui-datepicker>`; drop `MatDatepickerModule`, `MatNativeDateModule` |
| `src/app/components/molecules/appointment-filters/appointment-filters.component.ts` | Modify | Replace `mat-form-field` + datepicker with `<ui-datepicker>`; drop `::ng-deep` hack |
| `src/app/components/organisms/appointment-form/appointment-form.component.ts` | Modify | Replace mat-datepicker with `<ui-datepicker>`; keep `MatTimepickerModule` |
| `src/app/components/organisms/patient-registration-wizard/patient-registration-wizard.component.ts` | Modify | Replace mat-datepicker with `<ui-datepicker>` |
| `src/app/components/pages/transport-page/transport-dispatch-view/transport-dispatch-view.component.ts` | Modify | Replace native `<input type="date">` with `<ui-datepicker>` |
| `src/app/components/organisms/transport-dispatch-dialog/transport-dispatch-dialog.component.ts` | Modify | Same |
| `src/app/components/organisms/transport-operation-dialog/transport-operation-dialog.component.ts` | Modify | Same |
| `src/app/components/organisms/transport-maintenance-dialog/transport-maintenance-dialog.component.ts` | Modify | Same |
| `src/app/components/organisms/transport-incident-dialog/transport-incident-dialog.component.ts` | Modify | Same |
| `src/app/components/molecules/search-filters/search-filters.component.ts` | Modify | Replace native `<input type="date">`; drop legacy SCSS |

## Interfaces / Contracts

```typescript
// ui-datepicker public API (matching existing atom convention)
label = input<string>('')
placeholder = input<string>('')
value = model<Date | null>(null)
error = input<string>('')
helperText = input<string>('')
required = input(false)
disabled = input(false)
min = input<Date | null>(null)
max = input<Date | null>(null)
```

CVA provider: `NG_VALUE_ACCESSOR` with `useExisting: DatepickerComponent`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | CVA writeValue/onChange | Create host with formControlName, set value, verify display |
| Unit | Overlay toggle | Click trigger → verify `<mat-calendar>` visible; click outside → verify closed |
| Unit | Date selection | Click date in calendar → verify formatted value, verify onChange emitted, verify overlay closed |
| Unit | Clear input | Simulate empty input → verify null emitted |
| Unit | Disabled state | Set disabled → verify trigger click ignored, calendar stays closed |
| Component | Form integration | Test via `[formControl]` and `[(ngModel)]` bindings |

## Migration / Rollout

No data migration required. All consumers use `Date | string` models — `<mat-calendar>` emits `Date` objects; native `<input type="date">` returns ISO strings. Migration creates a Date from ISO strings at each consumer (existing form bindings already handle Date objects via `MatNativeDateModule`). Git commit per component group for clean review.

## Open Questions

None.

