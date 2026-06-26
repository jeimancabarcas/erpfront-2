# Proposal: Credit Portfolio Frontend Revision

## Intent

Customer credit config UI is missing. During sales, debt/balance is invisible. Backend APIs exist but frontend has three gaps: no credit config on customer detail, no debt visibility in sale form, payment recording unreachable without credit configured.

## Scope

### In Scope
- Credit limit + payment terms config dialog on customer detail
- Customer debt/balance badge in sale form when credit payment selected
- Actionable "Configurar Crédito" button when creditLimit is null
- Payment recording always accessible from customer detail

### Out of Scope
- Backend changes (APIs exist)
- Full credit management (dunning, statements, interest)
- Credit status in customer list table

## Capabilities

### New Capabilities
- `credit-portfolio-config`: Set credit limit and payment terms per customer
- `credit-debt-visibility`: Show debt/balance/available credit inline during sales form

### Modified Capabilities
- None

## Approach

Extend existing components — no new pages or services.

1. **CreditPortfolioOrganism**: Add `configureCredit` output + "Configurar Crédito" button in empty state.
2. **CreditConfigDialogOrganism**: Dialog with ui-text-input (limit) + ui-select (terms days). Calls `setCustomerCredit()`.
3. **SaleFormMolecule**: When `isCreditPayment()` + customer selected, fetch credit portfolio. Show inline summary widget.
4. **SalesCustomerDetailPageComponent**: Wire config button → dialog. Refresh on close.

All new UI uses `ui-button`, `ui-select`, `ui-text-input`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `organisms/credit-portfolio/` | Modified | Add config button + output |
| `molecules/sale-form/` | Modified | Add credit-status widget |
| `pages/.../sales-customer-detail-page/` | Modified | Wire credit config dialog |
| `organisms/credit-config-dialog/` | New | Config dialog organism |
| `models/customer.model.ts` | Unchanged | Already has types |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Credit API 404 for uncustomered customers | Low | Graceful error → "not configured" |
| Sale form UX clutter | Med | Compact inline badge, expandable |

## Rollback Plan

Revert modified files via git. Remove `credit-config-dialog/` directory. No migration needed.

## Dependencies

- `customerService.setCustomerCredit()` at line 81
- `customerService.getCustomerCredit()` at line 77
- `customerService.recordPayment()` at line 85

## Success Criteria

- [ ] Set credit limit + terms from customer detail page
- [ ] "Configurar Crédito" shown when no credit exists
- [ ] Sale form shows balance/available credit when credit payment selected
- [ ] All new UI uses existing atoms (ui-button, ui-select, ui-text-input)
