# Design: Credit Portfolio Frontend Revision

## Technical Approach

Pure frontend change extending existing Angular components. Three additions: a credit config dialog (MatDialog), conditional "Configurar/Editar" buttons in CreditPortfolioOrganism, and contextual credit summary in the sale form. All new UI reuses existing atoms (`ui-button`, `ui-text-input`, `ui-select`). Backend APIs (`getCustomerCredit`, `setCustomerCredit`) already exist — no service changes needed.

## Architecture Decisions

### Decision: Credit Config — Dialog vs Inline

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Dialog (MatDialog) | + established pattern (customer creation, product selection, record payment) + reusable | **Chosen** |
| Inline edit | - fewer clicks, but breaks portfolio layout consistency | Rejected |

**Rationale**: MatDialog is used throughout the app. Consistent UX, keeps portfolio focused on display.

### Decision: Debt Visibility — Badge vs Always Visible

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Contextual inline widget | + clean for cash sales + only shown when relevant | **Chosen** |
| Always in header | - clutter for non-credit customers | Rejected |

**Rationale**: Show credit summary only when customer is selected **and** payment type is Crédito. Matches spec.

### Decision: New Organism vs Extend Existing

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New CreditConfigDialogOrganism | + single responsibility + reusable | **Chosen** |
| Extend RecordPaymentFormMolecule | - conflates config with payment recording | Rejected |

**Rationale**: Credit config is a distinct concern. Following existing dialog pattern (RecordPaymentFormMolecule as reference).

## Data Flow

```
Credit Config:
CreditPortfolioOrganism ──(configureCredit)──→ SalesCustomerDetailPage
  ──→ MatDialog.open(CreditConfigDialogOrganism)
  ──→ setCustomerCredit(id, dto) ──→ API
  ──→ dialog closed → loadCreditData(id) → refresh portfolio

Debt in Sale Form:
[Customer selected + paymentType=Crédito]
  ──→ getCustomerCredit(customerId) ──→ API response
  ──→ display balance/limit/available/utilization inline
  ──→ on error → "Crédito no configurado" message
  ──→ on paymentType change or customer change → reset
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `organisms/credit-config-dialog/credit-config-dialog.component.ts` | Create | Dialog: `ui-text-input` (limit, number), `ui-select` (terms: 15/30/45/60/90d). Calls `setCustomerCredit()`. |
| `organisms/credit-portfolio/credit-portfolio.component.ts` | Modify | Add `configureCredit` output. "Configurar Crédito" when no limit, "Editar límite" when limit exists. |
| `molecules/sale-form/sale-form.component.ts` | Modify | Add credit summary block triggered by `isCreditPayment() && customerId`. Fetch + display inline. |
| `pages/.../sales-customer-detail-page.component.ts` | Modify | Wire `configureCredit` → open CreditConfigDialogOrganism. Refresh on close. |

## Interfaces / Contracts

```typescript
// Dialog data (passed via MAT_DIALOG_DATA)
interface CreditConfigData {
  customerId: string;
  creditLimit?: number | null;    // pre-fill for edit
  paymentTermsDays?: number;       // pre-fill for edit
}

// Dialog result
type CreditConfigResult = { success: true } | undefined;
```

`setCustomerCredit` API (unchanged, exists in `customer.service.ts:81`):
```typescript
setCustomerCredit(id: string, dto: { 
  creditLimit: number | null; paymentTermsDays?: number 
}): Observable<Customer>
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | CreditConfigDialog — form validation, submit, error/success states | Vitest, new spec |
| Unit | CreditPortfolioOrganism — button label conditional on creditLimit | Extend existing spec |
| Unit | SaleForm — credit summary visibility based on customer + paymentType | Extend existing spec |
| Component | Detail page — dialog opens on configureCredit, refreshes on close | Component test |

## Migration / Rollout

No migration required. All changes are frontend-only, additive. Feature is gated by user interaction (clicking configure or selecting Crédito payment type).

## Open Questions

None.
