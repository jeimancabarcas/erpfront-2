# Tasks: Unified Select Component (SelectAtom Redesign)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1200–1800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (atom rewrite) → PR 2 (native migs) → PR 3 (mat-select) → PR 4 (wizard) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Rewrite SelectAtom + TDD tests | PR 1 | Base: `feature/redesign-selects`; atom, spec, remove SCSS |
| 2 | Native `<select>` migrations + search-filters dogfood | PR 2 | Depends on PR 1; 15 files across pages/dialogs |
| 3 | `<mat-select>` migrations (excl. wizard) | PR 3 | Depends on PR 2; ~20 files, drop `MatSelectModule` |
| 4 | `PatientRegistrationWizard` (highest risk) | PR 4 | Depends on PR 3; stepper compat verification |

## Phase 0: Rewrite SelectAtom (TDD)

- [x] 0.1 RED: Write `atoms/select/select.component.spec.ts` — render, open/close, selection, search, error, disabled, required, ngModel, formControl, keyboard
- [x] 0.2 GREEN: Rewrite `atoms/select/select.component.ts` — Tailwind template, `model()`, `ControlValueAccessor`, new inputs (`required`, `helperText`)
- [x] 0.3 Delete `atoms/select/select.component.scss` — styles moved to Tailwind inline
- [x] 0.4 Run vitest → green; `npx tsc --noEmit`

## Phase 1: Dogfood SearchFiltersMolecule

- [ ] 1.1 Update `molecules/search-filters/search-filters.component.ts` if binding changed
- [ ] 1.2 Run search-filters vitest tests → green

## Phase 2: Native `<select>` → `<ui-select>` (15 selects)

- [ ] 2.1 `organisms/customer-dialog` — documentType, status
- [ ] 2.2 `molecules/product-form` — categoryId
- [ ] 2.3 `pages/inventory-page/inventory-products-page` — categoryFilter
- [ ] 2.4 `pages/inventory-page/inventory-purchases-page` — supplierFilter, statusFilter
- [ ] 2.5 `pages/sales-page` — customerFilter, statusFilter
- [ ] 2.6 `pages/transport-page/transport-dispatch-view` — customerName, vehicleId
- [ ] 2.7 `organisms/appointment-confirmation-dialog` — provider
- [ ] 2.8 `organisms/incapacity-dialog` — type, specialLicense
- [ ] 2.9 `organisms/orders-dialog` — route
- [ ] 2.10 Transport dialogs (6): change-vehicle, dispatch, expense, incident, maintenance, operation

## Phase 3: `<mat-select>` → `<ui-select>` (~20 selects)

- [ ] 3.1 `molecules/appointment-filters` — statusFilter
- [ ] 3.2 `molecules/billing-filters` — providerFilter, statusFilter
- [ ] 3.3 `molecules/movements-table` — filterType
- [ ] 3.4 `organisms/adjustment-form-dialog` — correctionConceptCode
- [ ] 3.5 `organisms/appointment-form` — type
- [ ] 3.6 `organisms/invoice-form-dialog` — appointmentType, provider
- [ ] 3.7 `organisms/sales-note-form-dialog` — noteType, correctionConceptCode
- [ ] 3.8 `organisms/purchase-order-dialog` — supplierId, productId
- [ ] 3.9 Remove `MatSelectModule` imports where unused per component
- [ ] 3.10 `organisms/general-invoice-form-dialog` — remaining selects

## Phase 4: PatientRegistrationWizard (High Risk)

- [ ] 4.1 Replace 4 mat-selects (gender, idType, zone, healthRegime) with `<ui-select>`
- [ ] 4.2 Keep `MatStepperModule` — verify step navigation works
- [ ] 4.3 Manual QA: selected values persist on stepper transitions

## Validation

- [ ] V.1 `npx tsc --noEmit` — zero errors
- [ ] V.2 `ng build` — production build passes
- [ ] V.3 Run affected component tests
