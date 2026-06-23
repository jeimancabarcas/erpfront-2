# Tasks: Redesign Textareas

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–900 |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

## Phase 0: Create ui-textarea atom (TDD)

- [x] 0.1 Write 9+ spec scenarios as failing tests in `atoms/textarea/textarea.component.spec.ts`
- [x] 0.2 Implement `atoms/textarea/textarea.component.ts` with CVA, OnPush, signal API
- [x] 0.3 Add `atoms/textarea/textarea.component.scss` (`:host { display: block; }`)
- [x] 0.4 Run `ng test` (RED→GREEN) `+ npx tsc --noEmit` — all pass

## Phase 1: Migrate Pattern A (native Tailwind) — 15 textareas, 14 files

- [x] 1.1 `anamnesis-dialog` (reason, currentIllness) + `incapacity-dialog` (recommendations) → tsc ✅
- [x] 1.2 `orders-dialog` (observations) + `transport-standby-dialog` (notes) + `transport-settle-dialog` (notes) → tsc ✅
- [x] 1.3 `transport-incident-dialog` (description) + `transport-expense-dialog` (description) + `transport-operation-dialog` (description) → tsc ✅
- [x] 1.4 `transport-cancel-dialog` (notes) + `transport-change-vehicle-dialog` (reason) + `transport-operation-closure-dialog` (notes) → tsc ✅
- [x] 1.5 `transport-maintenance-dialog` (description) + `physical-exam-dialog` (findings) + `inventory-category-dialog` (description) → tsc ✅

## Phase 2: Migrate Pattern B (matInput) — 7 textareas, 5 files

- [x] 2.1 `adjustment-form-dialog` (reason) — removed mat-form-field; verified autocomplete matInput remains (line 114), NOT removed MatInputModule ✅
- [x] 2.2 `patient-registration-wizard` (observations) — removed mat-form-field; verified matDatepicker matInput remains (line 59) ✅
- [x] 2.3 `patient-neonatal-history` (neonatalNotes, personalBackground, familyBackground) — upgraded `[value]`→`[value]+(valueChange)` two-way; verified 4 matInput fields remain (weight, height, cefalic, thoracic) ✅
- [x] 2.4 `purchase-order-dialog` (observations) — removed mat-form-field; verified matDatepicker matInput remains (line 92) ✅
- [x] 2.5 `sales-note-form-dialog` (observation) — removed mat-form-field AND removed MatInputModule/MatFormFieldModule imports (sole consumer) ✅

## Phase 3: Validation

- [x] 3.1 Run `npx tsc --noEmit` — zero errors ✅
- [x] 3.2 Run `ng build` — production build succeeds ✅
- [x] 3.3 Verify CVA bindings in migrated components (formControlName, ngModel, [value]) — all patterns verified ✅

## Phase 4: Cleanup

- [x] 4.1 Remove unused MatInputModule/MatFormFieldModule from components where textarea was the sole consumer — done in Phase 2.5 (sales-note-form-dialog) ✅
- [x] 4.2 Add deprecation JSDoc to InputAtom textarea variant (`input.component.ts: type='textarea'`) ✅
