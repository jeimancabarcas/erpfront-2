# Delta for Customer Management

## MODIFIED Requirements

### Requirement: Customer Detail Page with Credit Management

The customer detail page MUST include a credit management section with configuration capability. The CreditPortfolioOrganism MUST be displayed when credit data is available, and the page MUST allow configuring credit limits and payment terms via a dialog.
(Previously: No credit management section existed on the customer detail page)

#### Scenario: Credit section on detail page
- GIVEN a customer detail page is loaded
- AND the customer has credit data
- THEN the credit portfolio section MUST display limit, balance, and status

#### Scenario: Configure credit from detail page
- GIVEN the customer detail page shows the credit portfolio
- WHEN the user clicks the credit configuration button
- THEN the credit configuration dialog MUST open

### Requirement: Customer Stats with Credit Status

The customer stats component MUST display creditStatus when credit data is available, showing creditLimit, currentBalance, and creditStatus alongside existing billing stats.
(Previously: Customer stats only showed totalBilled and invoiceCount)

#### Scenario: Stats with credit info
- GIVEN a customer with credit data
- WHEN viewing customer stats
- THEN credit status, limit, and balance MUST be displayed

#### Scenario: Stats without credit
- GIVEN a customer without credit configuration
- WHEN viewing customer stats
- THEN no credit information MUST be shown
