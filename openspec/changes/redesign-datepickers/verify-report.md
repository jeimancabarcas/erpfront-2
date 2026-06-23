## Verification Report

**Change**: redesign-datepickers
**Version**: N/A
**Mode**: Standard

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 15 |
| Tasks complete | 14 |
| Tasks incomplete | 1 |

**Incomplete tasks**:
- 4.1 `npm run test -- --watch=false` — blocked by compilation errors (datepicker spec + pre-existing sale-form spec)

### Build & Tests Execution

**TypeScript (`npx tsc --noEmit`)**: ✅ Passed (0 errors)

**Production Build (`ng build`)**: ❌ Failed — 3 errors

```text
Error 1: src/app/components/molecules/appointment-filters/appointment-filters.component.ts:28
  TS2322: Type 'Date | null' is not assignable to type 'string'.
  [(value)]="dateFilter" — model typed Date|null, ui-datepicker model is string

Error 2: src/app/components/molecules/search-filters/search-filters.component.ts:56
  TS2322: Type 'Date | null' is not assignable to type 'string'.
  [value]="parseDate(...)" returns Date|null, ui-datepicker value input expects string

Error 3: src/app/components/molecules/search-filters/search-filters.component.ts:57
  TS2345: Argument of type 'string' is not assignable to parameter of type 'Date'.
  (valueChange) emits string, onDateChange expects Date|null
```

**Unit Tests (`ng test`)**: ❌ Failed to compile — 13 errors (3 from datepicker spec + 5 from sale-form spec + 3 from appointment-filters/search-filters + 2 others)

Datepicker spec errors:
- TS2339: `valueChange` does not exist on `DatepickerComponent` (test imports expect Date|null output, component emits string)
- TS2358: `instanceof Date` — emitted value type is string, not Date
- TS18047: `trigger` possibly null — `[data-testid="datepicker-trigger"]` does not exist in component template

Pre-existing errors in `sale-form.component.spec.ts`: 8 TS errors (unrelated to this change)

**Coverage**: ➖ Not available (tests did not run)

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|---|---|---|---|
| Render and Display | Default render with placeholder | `renders label and placeholder` | ❌ UNTESTED — test has no `placeholder` input in component; compilation error blocks execution |
| Render and Display | Displays formatted date (DD/MM/YYYY) | `displays formatted date as DD/MM/YYYY` | ❌ FAILING — native input displays YYYY-MM-DD (or OS locale), not DD/MM/YYYY; `data-testid="datepicker-trigger"` missing in template |
| Calendar Overlay | Open on trigger click | `opens overlay when trigger is clicked` | ❌ UNTESTED — no CDK overlay or mat-calendar in implementation; test references `.mat-calendar` which doesn't exist |
| Calendar Overlay | Close on date selection | `closes overlay on date selection` | ❌ UNTESTED — no CDK overlay; template uses native `<input type="date">` |
| Calendar Overlay | Close on click-outside | `closes overlay on click-outside` | ❌ UNTESTED — no CDK overlay |
| Clear Value | Delete text clears value | No passing test | ❌ UNTESTED — no clear-value logic in component |
| Validation States | Error state | `shows red border and error text when error is set` | ❌ FAILING — `trigger` is possibly null (`data-testid="datepicker-trigger"` missing) |
| Validation States | Disabled state | `does not open overlay when disabled` | ❌ UNTESTED — native input handles disabled natively; test expects overlay behavior |
| Validation States | Required indicator | `shows required indicator` | ⚠️ PARTIAL — template has `*` asterisk for required, but compilation error blocks test |
| Min/Max Constraints | Calendar respects bounds | No test | ❌ UNTESTED — `min`/`max` are private unused signals, not exposed as component inputs |
| Form Integration (CVA) | ngModel binding | `supports ngModel two-way binding` | ❌ FAILING — CVA exists but model type mismatch (string vs Date|null); compilation blocks execution |
| Form Integration (CVA) | formControl binding | `supports formControl binding` | ❌ FAILING — same type mismatch; compilation blocks execution |
| Overlay Positioning | Position below trigger | No test | ❌ UNTESTED — no CDK overlay |

**Compliance summary**: 0/13 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| CVA via NG_VALUE_ACCESSOR | ✅ Implemented | `providers: [NG_VALUE_ACCESSOR]`, `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState` present |
| Signal-based inputs (label, error, helperText, required, disabled) | ✅ Implemented | All present |
| DD/MM/YYYY display | ❌ Not implemented | Native input displays OS-locale format; component converts to YYYY-MM-DD internally |
| CDK overlay with `<mat-calendar>` | ❌ Not implemented | Uses native `<input type="date">` instead |
| Date `Date | null` model | ❌ Not implemented | Uses `string` model (YYYY-MM-DD) |
| `min`/`max` constraint inputs | ❌ Not implemented | Internal signals exist but no public inputs |
| `placeholder` input | ❌ Not implemented | Not present in component |
| Click-outside dismiss | ❌ Not implemented | Native input behavior, no CDK overlay |
| 10 consumers migrated | ✅ Verified | All 10 usages import DatepickerComponent with `<ui-datepicker>` |
| No remaining `mat-datepicker` | ✅ Verified | Zero matches across all .html and .ts files |
| `MatDatepickerModule` removed | ✅ Verified | Only in test file (for spec compilation) |
| `MatTimepickerModule` preserved | ✅ Verified | Still imported in `appointment-form` |
| Tailwind classes match `ui-text-input` | ✅ Implemented | `h-14 rounded-2xl border-gray-200 bg-white focus:ring-indigo-200 focus:border-indigo-400` |
| `calendar_today` icon | ✅ Implemented | Material Icons with `pointer-events-none` |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| CDK Overlay + `<mat-calendar>` for DD/MM/YYYY | ❌ No | Implementation uses native `<input type="date">` — DD/MM/YYYY requirement NOT met |
| Reuse `<mat-calendar>` from Material bundle | ❌ No | No CDK overlay, no `<mat-calendar>` usage |
| One atom for all 10 usages | ✅ Yes | Single `DatepickerComponent` used by all 10 consumers |
| Indigo focus ring only (no focusColor param) | ✅ Yes | Hardcoded indigo ring in template class |
| CVA with `NG_VALUE_ACCESSOR` | ✅ Yes | Implemented as designed |
| OnPush change detection | ✅ Yes | `ChangeDetectionStrategy.OnPush` set |
| File at `src/app/components/atoms/datepicker/` | ✅ Yes | Files created at expected path |

### Issues Found

**CRITICAL**:
1. **Spec compliance failure**: 0/13 spec scenarios are passing. The implementation uses native `<input type="date">` while the spec requires CDK Overlay + `<mat-calendar>` with DD/MM/YYYY display. The spec file tests were written for the design contract but the actual implementation does not match — tests reference `data-testid="datepicker-trigger"`, `.mat-calendar`, `.mat-calendar-body-cell` and CDK overlay behavior that do not exist.
2. **Build fails**: 3 TypeScript errors in `appointment-filters` and `search-filters` where `Date | null` consumers are incompatible with the `string`-typed `value` model.
3. **Min/max constraints non-functional**: `_min`/`_max` signals exist but are never exposed as component inputs — consumers have no way to set date boundaries.
4. **6 spec requirements unimplemented**: Calendar overlay, click-outside dismiss, DD/MM/YYYY formatting, clear-to-null, min/max constraints, and overlay positioning are all absent.

**WARNING**:
1. **Design deviation**: The design explicitly chose CDK Overlay + `<mat-calendar>` over native input, stating "the overriding requirement is DD/MM/YYYY display, which native `<input type="date">` cannot enforce." The implementation uses native input, which is a documented design reversal without an updated design artifact.
2. **Test file mismatch**: `datepicker.component.spec.ts` was written for the CDK Overlay design contract but not updated for the native implementation. All spec-covering tests reference non-existent elements and behaviors.
3. **API contract differs from spec**: Spec defines `value` as `Date | null`, implementation uses `string` (YYYY-MM-DD). This breaks consumers using `Date`-typed models.
4. **`placeholder` input missing**: The spec requires placeholder support but the component has no `placeholder` input and the template has no placeholder binding.

**SUGGESTION**:
1. Update the design artifact to reflect the native `<input type="date">` decision (or implement CDK overlay as designed).
2. Update the spec tests to match the actual component behavior (native input, string model).
3. Fix the type mismatch between `Date | null` consumer models and the `string` model in the atom.
4. Either remove the unused `_min`/`_max` signals or wire them as proper `min`/`max` inputs.
5. Consider extracting DD/MM/YYYY display logic if that requirement is critical — native `<input type="date">` cannot enforce display format across browsers.

### Verdict

**FAIL**

Multiple CRITICAL issues block archive readiness: the implementation does not meet spec requirements (0/13 scenarios compliant), the build fails with 3 TypeScript errors, and the core design decision (CDK Overlay + `<mat-calendar>`) was not followed without updating the design artifact or spec tests. The atom works as a basic native date input wrapper, but it does not satisfy the SDD contract established in proposal, specs, and design.
