# Tasks: Credit Portfolio Frontend Revision

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

Not needed — estimated ~350 lines, single PR.

## Phase 1: Credit Config Dialog

- [x] 1.1 Create `organisms/credit-config-dialog/credit-config-dialog.component.ts` with MatDialog, form (creditLimit + paymentTermsDays via ui-text-input + ui-select), and `setCustomerCredit()` call
- [x] 1.2 Create `organisms/credit-config-dialog/credit-config-dialog.component.spec.ts` testing form validation, submit, error/success states
- [x] 1.3 Wire config dialog in `sales-customer-detail-page.component.ts`: handle `configureCredit` output → `MatDialog.open(CreditConfigDialogOrganism)` → refresh on close

## Phase 2: Credit Portfolio Organism Updates

- [x] 2.1 Add `configureCredit` output + "Configurar Crédito" button (when `creditLimit === null`) / "Editar límite" button (when `creditLimit !== null`) in `credit-portfolio.component.ts`
- [x] 2.2 Extend `credit-portfolio.component.spec.ts` with tests for both button states and emission

## Phase 3: Sale Form Debt Visibility

- [x] 3.1 Add credit summary widget in `sale-form.component.ts` — fetch `getCustomerCredit()` when `isCreditPayment()` && customerId selected, display balance/limit/available/utilization inline
- [x] 3.2 Handle error/empty state: show "Crédito no configurado" when API errors or creditLimit is null
- [x] 3.3 Extend `sale-form.component.spec.ts` with tests for credit summary visibility, data display, and error state

## Phase 4: Integration & Polish

- [x] 4.1 Verify record payment flow is accessible from customer detail page (existing, no change needed)
- [x] 4.2 Run `npm run test -- --watch=false` — all touched component tests pass (pre-existing failures in unrelated files unchanged)
- [x] 4.3 Verify empty states: no credit portfolio → "Configurar Crédito" prompt, credit API error → graceful message in sale form
