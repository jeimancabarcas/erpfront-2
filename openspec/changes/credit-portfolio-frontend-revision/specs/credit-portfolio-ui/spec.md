# Delta for Credit Portfolio UI

## ADDED Requirements

### Requirement: Credit Configuration Dialog

The system MUST provide a dialog to set creditLimit and paymentTermsDays per customer. All new UI MUST use existing atom components (ui-button, ui-select, ui-text-input).

#### Scenario: Configure credit from customer detail
- GIVEN a customer detail page is displayed
- WHEN the user clicks "Configurar Crédito" or "Editar límite"
- THEN a dialog opens with fields for credit limit and payment terms days
- AND the user can save the configuration

### Requirement: Conditional Credit Button States

The CreditPortfolioOrganism MUST display "Configurar Crédito" when creditLimit is null and "Editar límite" when creditLimit exists. Clicking either MUST open the credit configuration dialog.

#### Scenario: Empty state shows configure action
- GIVEN a customer with no credit limit set
- WHEN viewing the credit portfolio section
- THEN a "Configurar Crédito" button MUST be displayed
- AND clicking it opens the credit configuration dialog

#### Scenario: Configured state shows edit action
- GIVEN a customer with an existing credit limit
- WHEN viewing the credit portfolio section
- THEN an "Editar límite" button MUST be displayed
- AND clicking it opens the credit configuration dialog pre-filled

### Requirement: Sale Form Credit Debt Visibility

When a customer is selected AND the payment type is Crédito, the sale form MUST display currentBalance, creditLimit, availableCredit, and creditStatus inline.

#### Scenario: Credit customer in sale form
- GIVEN a customer with credit data is selected in the sale form
- WHEN the payment type changes to "Crédito"
- THEN the form MUST display current balance, credit limit, available credit, and credit status

#### Scenario: No credit configured during sale
- GIVEN a customer without credit limit is selected
- WHEN payment type is "Crédito"
- THEN the form MUST show an inline message that credit is not configured

### Requirement: Record Payment Accessibility

The record payment flow MUST be accessible from both the customer detail page and the credit portfolio section.

#### Scenario: Record payment from customer detail
- GIVEN the customer detail page is displayed
- AND the credit portfolio section is visible
- WHEN the user clicks "Registrar Pago"
- THEN the record payment dialog opens

### Requirement: Empty State with Call-to-Action

When no credit limit is configured for a customer, the UI MUST show a clear call-to-action prompting the user to configure it.

#### Scenario: Empty credit portfolio
- GIVEN a customer has no credit limit configured
- WHEN the credit portfolio section renders
- THEN it MUST display a message indicating no limit is set
- AND a "Configurar Crédito" action MUST be available
