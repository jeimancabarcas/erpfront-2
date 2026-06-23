# Exploration: redesign-datepickers

> Migrate datepicker fields to Tailwind-consistent design matching `ui-text-input` / `ui-select` (`h-14 rounded-2xl`, indigo focus ring).

## Datepicker Inventory

### mat-datepicker Usages (target for migration — 4 occurrences)

| # | File | Pattern | Notes |
|---|------|---------|-------|
| 1 | `src/app/components/organisms/purchase-order-dialog/purchase-order-dialog.component.ts` (lines 92-96) | `mat-form-field appearance="outline"` → `matInput [matDatepicker]` + `mat-datepicker-toggle matIconSuffix` + `mat-datepicker` | Form field with `orderDate` FormControl. Imports `MatDatepickerModule`, `MatNativeDateModule`. |
| 2 | `src/app/components/molecules/appointment-filters/appointment-filters.component.ts` (lines 30-34) | `mat-form-field appearance="outline"` → `matInput [matDatepicker]` + `mat-datepicker-toggle matIconSuffix` + `mat-datepicker` | Used with `ngModel` binding. Hides subscript wrapper via `::ng-deep`. |
| 3 | `src/app/components/organisms/appointment-form/appointment-form.component.ts` (lines 61-64) | `mat-form-field appearance="outline"` → `matInput [matDatepicker]` + `mat-datepicker-toggle matSuffix` + `mat-datepicker` | FormControl `date`. Hides subscript wrapper. Also uses `MatTimepickerModule` in same grid. |
| 4 | `src/app/components/organisms/patient-registration-wizard/patient-registration-wizard.component.ts` (lines 59-63) | `mat-form-field appearance="outline"` → `matInput [matDatepicker]` + `mat-datepicker-toggle matSuffix` + `mat-datepicker` | FormControl `birthDate` inside `MatStepper`. |

**Common imports across all 4**: `MatDatepickerModule`, `MatFormFieldModule`, `MatInputModule`

### Native `<input type="date">` Already in Production (precedent — 6 occurrences)

| # | File | Styling | Matches ui-text-input? |
|---|------|---------|------------------------|
| 1 | `transport-dispatch-view` (line 62) | `h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all` | **YES — exact match** |
| 2 | `transport-dispatch-dialog` (line 71) | `rounded-xl focus:ring-2 focus:ring-indigo-500` | Partial (older variant) |
| 3 | `transport-incident-dialog` (line 59) | `rounded-xl focus:ring-red-500` | Partial (domain color) |
| 4 | `transport-maintenance-dialog` (line 62) | `rounded-xl focus:ring-amber-500` | Partial (domain color) |
| 5 | `transport-operation-dialog` (line 62) | `rounded-xl focus:ring-indigo-500` | Partial (older variant) |
| 6 | `search-filters` (line 50) | SCSS with `border-bottom`, `webkit-calendar-picker-indicator` | No (legacy SCSS) |

## Reference Design

### Current: purchase-order-dialog datepicker (mat-form-field)

```html
<mat-form-field appearance="outline" class="w-full">
  <mat-label>Fecha de Pedido</mat-label>
  <input matInput [matDatepicker]="picker" formControlName="orderDate">
  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>
```

Problems:
- Uses Material outline style that doesn't match `h-14 rounded-2xl` design tokens
- Requires `MatFormFieldModule` + `MatInputModule` + `MatDatepickerModule` + `MatNativeDateModule` (4 modules)
- Extra wrapper element (`mat-form-field`) adds DOM depth
- Error messages use Material's `mat-error`, not the app's `text-xs text-red-500` convention

### Target: transport-dispatch-view native date input (the pattern to replicate)

```html
<div class="flex flex-col gap-1.5">
  <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Fecha de Inicio</label>
  <div class="relative">
    <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg">calendar_today</span>
    <input type="date" formControlName="departureDate"
      class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
  </div>
</div>
```

Design tokens used:
- `h-14` — consistent height with ui-text-input
- `rounded-2xl` — consistent border-radius
- `border-gray-200 bg-white` — default border/bg
- `focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400` — indigo focus ring
- `transition-all` — smooth state transitions
- `pl-12 pr-4` — icon padding pattern (12 = icon space, 4 = right padding)
- Calendar icon: `calendar_today` via Material Icons, positioned absolute, `text-indigo-500`

### Existing UI Atoms Design System

All three existing atoms share these Tailwind classes:

```
ui-text-input:  w-full h-14 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed
ui-textarea:    w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-y
ui-select:      Custom dropdown overlay, not a form-field wrapper
```

- All use `ControlValueAccessor` for reactive forms integration
- All use signal-based inputs
- All use `ChangeDetectionStrategy.OnPush`
- All have `label`, `error`, `helperText`, `required`, `disabled` inputs
- All generate unique IDs for label/aria associations

## Approaches

### A) Replace with native `<input type="date">` (inline, same pattern as transport-dispatch-view)

**Description**: Replace all 4 `mat-form-field` + `mat-datepicker` blocks with native `<input type="date">` styled with the established Tailwind pattern. Remove `MatDatepickerModule`, `MatFormFieldModule`, `MatInputModule`, and `MatNativeDateModule` imports from each component.

**Pros**:
- Already proven in production (transport-dispatch-view and 4 other transport dialogs)
- Zero new dependencies — drops 4 Material modules per component
- Exact match with `ui-text-input` design tokens
- Simpler DOM (no extra mat-form-field wrapper)
- Uses browser-native calendar picker (accessible, works offline, no JS overhead)
- `ControlValueAccessor` already supported natively — works with `formControlName` and `ngModel`
- Error display uses the app's own `text-xs text-red-500` convention (or `ui-text-input` atom)
- ~20 lines of HTML change per component

**Cons**:
- Browser-native calendar UI can't be customized (varies by OS/browser)
- No date format control in the input display (browser-dependent: DD/MM/YYYY vs MM/DD/YYYY)
- The `::-webkit-calendar-picker-indicator` icon is browser-styled, not our calendar icon
- No min/max date constraints via template (but can use FormControl validators)
- No "clear" button built-in

**Effort**: Low — ~80 lines changed across 4 files

---

### B) Create reusable `ui-date-input` atom component

**Description**: Extract the native date input pattern from transport-dispatch-view into a new `ui-date-input` atom (like `ui-text-input` but for `type="date"`). Includes consistent label, icon, error states. Replace all 4 mat-datepicker + all 6 native date usages with the atom. Optionally use `mat-calendar` + CDK overlay for custom calendar dropdown.

**Pros**:
- Single source of truth for date input design
- Consistent behavior (validation, disabled state, aria attributes)
- Extensible: can add CDK overlay calendar later without touching consumers
- Eliminates ALL inline date input styles across the app
- Matches the existing atom pattern (`ui-text-input`, `ui-select`, `ui-textarea`)
- ~12 usage sites upgraded to a single atom

**Cons**:
- New component to create + test (~120 lines TS + spec)
- Custom calendar overlay via CDK adds significant complexity (~300+ lines for overlay positioning, calendar bindings, date adapter)
- The 6 native date inputs in transport dialogs may need different ring colors (indigo, red, amber) — the atom would need a `focusColor` input or similar
- Browser-native picker still means no custom calendar UI without CDK

**Effort**: Medium (atom only) / High (atom + CDK calendar overlay)

---

### C) Deep-style mat-form-field with `::ng-deep` to match Tailwind

**Description**: Keep `mat-form-field` + `mat-datepicker` but use `::ng-deep` CSS overrides to force Material's internal elements to use `h-14 rounded-2xl border-gray-200` and indigo focus ring styling.

**Pros**:
- Keeps Material's calendar popup (customizable theme, date range, locale)
- No changes to component logic
- Can be done globally in `styles.scss` for all datepickers at once

**Cons**:
- `::ng-deep` is deprecated and fragile — breaks on Angular Material updates
- Fighting Material's internal CSS specificity is error-prone
- Different DOM structure than the rest of the form (mat-form-field wrapper vs. Tailwind direct input)
- Does NOT actually match the design system — it's a hack
- Still requires 4 Material module imports per component
- Maintenance burden: every Material upgrade risks regressions

**Effort**: Low initially, High maintenance — NOT recommended

---

### D) Custom trigger button + native `<input type="date">` (hidden native + styled button)

**Description**: Use a hidden native `<input type="date">` triggered by a styled button/icon. The trigger looks like `ui-text-input` but clicking it opens the browser's native date picker via `input.showPicker()` or click delegation.

**Pros**:
- Full control over trigger styling (matches ui-text-input perfectly)
- Leverages browser-native picker (no CDK needed)
- Can show formatted date in the trigger display

**Cons**:
- `showPicker()` has limited browser support
- Click delegation to hidden input is hacky
- Adds complexity for minimal gain over plain native input
- Same browser-native calendar limitations

**Effort**: Medium

---

## Recommendation

**Approach A (native `<input type="date">` inline, following transport-dispatch-view pattern) for the 4 mat-datepicker usages.**

**Rationale**:
1. **Precedent already exists**: The transport dispatch-view ships in production with this exact pattern. The codebase has already chosen this direction for new forms.
2. **Least effort**: ~80 lines changed. No new components, no new tests, no new dependencies.
3. **Design consistency achieved**: The Tailwind class string matches `ui-text-input` exactly (minus `type="date"` instead of `type="text"`).
4. **Removes Material dependency**: Each component drops 4 Material module imports (`MatDatepickerModule`, `MatFormFieldModule`, `MatInputModule`, `MatNativeDateModule`), reducing bundle size.
5. **Future path**: If the team later decides the browser-native calendar is insufficient, a `ui-date-input` atom (Approach B) can be extracted at that point with CDK overlay. Today's change doesn't close that door — it removes the deprecated pattern.

**What to do for the other 6 native date inputs**: Leave them as-is for this change. They already use native `<input type="date">`. A follow-up change could normalize all date inputs to a single atom, but that scope exceeds "redesign datepickers" which targets the `mat-datepicker` migration specifically. The transport-dispatch-view pattern serves as the reference for the migration.

### Migration plan per component

| Component | Current | Change |
|-----------|---------|--------|
| `purchase-order-dialog` | `mat-form-field` appearance="outline" | Replace with native `<input type="date">` + label + calendar icon, Tailwind classes matching transport-dispatch-view |
| `appointment-filters` | `mat-form-field` appearance="outline" | Same, using `ngModel` binding |
| `appointment-form` | `mat-form-field` appearance="outline" | Same, using `formControlName` binding |
| `patient-registration-wizard` | `mat-form-field` appearance="outline" | Same, inside `MatStepper` |

Each replacement follows this template:

```html
<div class="flex flex-col gap-1.5">
  <label for="date-id" class="text-xs font-black text-gray-500 uppercase tracking-widest">
    {{ label }}
  </label>
  <div class="relative">
    <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg">calendar_today</span>
    <input type="date" id="date-id" formControlName="fieldName"
      class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
  </div>
</div>
```

Remove imports: `MatDatepickerModule`, `MatFormFieldModule`, `MatInputModule`, `MatNativeDateModule` (where no longer needed — `MatFormFieldModule` and `MatInputModule` may be used by other fields in the same component).

**When to add `[attr.disabled]`**: Wire to the form's disabled state (e.g., `fieldset[disabled]` in `purchase-order-dialog` already handles this).

## Risks

1. **Date format differences**: `mat-datepicker` uses `MatNativeDateModule` which formats dates as `MM/DD/YYYY` in the input. Native `<input type="date">` displays dates according to the OS/browser locale. In a Latin American context (the app uses Spanish labels), the native picker should show `DD/MM/YYYY` — but this must be verified. The underlying `Date` object behavior (and ISO serialization) is unchanged — only the display format changes.

2. **Calendar icon click behavior**: The native `<input type="date">` opens the browser calendar when clicking the input itself OR the `::-webkit-calendar-picker-indicator`. The Material Icons `calendar_today` span placed inside the input wrapper is NOT clickable — it sits on top and blocks clicks to the input. This is fine if the icon is purely decorative, but in the transport-dispatch-view pattern, the icon has `pointer-events: none` implicitly (Material Icons don't intercept pointer events by default). Double-check this behavior with a quick smoke test after implementation.

3. **`appointment-form` has both datepicker AND timepicker**: This component uses `MatTimepickerModule` alongside `MatDatepickerModule`. When removing `MatDatepickerModule`, ensure `MatTimepickerModule` stays. The timepicker is NOT in scope for this change.

4. **`patient-registration-wizard` uses `MatStepperModule`**: The wizard's template uses `MatStepperModule` (which depends on `MatFormFieldModule` internal styles). Removing `MatFormFieldModule` from the imports is safe because the stepper is a separate component — but verify rendering after change.

5. **`search-filters` component has `::-webkit-calendar-picker-indicator` styling**: This existing native date input uses old SCSS classes. Not in scope for this change, but noted as a normalization opportunity.

## Ready for Proposal

**Yes.** The exploration has identified all 4 mat-datepicker usages, established the target pattern (transport-dispatch-view's native date input), and confirmed that the codebase already uses this pattern in production. The effort is low (~4 files, ~80 lines changed), the risk is minimal, and the approach aligns with the existing design system.

**What the orchestrator should tell the user**: The codebase has 4 `mat-datepicker` usages across 4 components. Transport dialogs already use native `<input type="date">` styled exactly like `ui-text-input`. The recommended approach is to replace all 4 `mat-datepicker` instances with that same native pattern — low effort, proven in production, drops Material dependencies. Ready to proceed to `sdd-propose`.
