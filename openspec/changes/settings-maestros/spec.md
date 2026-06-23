# Settings Page + Maestros — Specification

FULL specs for 4 new capabilities. No existing behavior to modify.

---

## 1. settings-page — Navigation & Routing

### Purpose
Wire navbar "Configuración" → `/settings`, render 3 setting cards, guard all routes, handle 404.

### Requirements

| ID | Priority | Rule |
|----|----------|------|
| NAV-01 | P0 | Clicking "Configuración" MUST navigate to `/settings` and close the dropdown |
| NAV-02 | P0 | `/settings` MUST render exactly 3 cards (Taxes, Payment Methods, Payment Types) in a responsive grid |
| NAV-03 | P0 | Clicking a card MUST navigate to its sub-route (`/settings/taxes`, `/settings/payment-methods`, `/settings/payment-types`) |
| NAV-04 | P0 | Each CRUD page MUST have a back button returning to `/settings` |
| NAV-05 | P0 | All `/settings` routes MUST require auth; unauthenticated users redirect to `/login` |
| NAV-06 | P0 | All `/settings` routes MUST require profile guard; incomplete profiles redirect to profile setup |
| NAV-07 | P1 | Unknown `/settings/*` sub-routes MUST show a 404 page |

#### Scenario: NAV-01 — Navbar navigates to settings
- GIVEN the user is authenticated and the navbar dropdown is open
- WHEN the user clicks "Configuración"
- THEN `router.navigate(['/settings'])` is called AND the dropdown closes

#### Scenario: NAV-02 — Card grid renders
- GIVEN the user navigates to `/settings`
- THEN 3 Material cards are rendered in a responsive grid
- AND each card has an icon, title, and description

#### Scenario: NAV-03 — Card navigates to sub-route
- GIVEN the card grid is visible
- WHEN the user clicks the "Taxes" card
- THEN the router navigates to `/settings/taxes`

#### Scenario: NAV-04 — Back from sub-page
- GIVEN the user is on `/settings/taxes`
- WHEN the user clicks the back button
- THEN the router navigates to `/settings`

#### Scenario: NAV-05 — Unauthenticated redirect
- GIVEN the user is not authenticated
- WHEN the user navigates to `/settings` or any sub-route
- THEN the user is redirected to `/login`

#### Scenario: NAV-06 — Incomplete profile blocked
- GIVEN the user is authenticated but has no profile
- WHEN the user navigates to `/settings`
- THEN auth guard passes but profile guard redirects to profile setup

#### Scenario: NAV-07 — Unknown sub-route
- GIVEN the user navigates to `/settings/unknown-route`
- THEN a 404 page is displayed

---

## 2. tax-crud — Tax Master Data

### Purpose
Full CRUD for Tax entity: name, code, percentage, type, purchase/sell flags, active, sort.

### Entity Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | YES | Unique, max 100 chars |
| code | string | YES | Unique, max 20 chars |
| percentage | decimal(5,2) | YES | e.g., 19.00, 5.00, 0.00 |
| type | enum | YES | `percentage` or `fixed` |
| isPurchase | boolean | YES | Default false |
| isSell | boolean | YES | Default false |
| isActive | boolean | YES | Default true |
| sortOrder | integer | YES | Default 0 |

### Requirements

| ID | Priority | Rule |
|----|----------|------|
| TAX-01 | P0 | The system MUST create a tax given valid data |
| TAX-02 | P0 | The system MUST reject creation when name or code already exists |
| TAX-03 | P0 | The system MUST list taxes sorted by sortOrder ASC then name ASC, with pagination and isActive filter |
| TAX-04 | P0 | The system MUST update a tax given valid data; reject duplicate name/code on update |
| TAX-05 | P0 | The system MUST delete a tax after confirmation; reject if referenced by other entities |
| TAX-06 | P0 | The form MUST validate required fields and type enum before submission |

#### Scenario: TAX-01 — Create happy path
- GIVEN the user is on `/settings/taxes` and clicks "Add"
- WHEN the dialog is filled with valid data (`name: "IVA 19%", code: "IVA19", percentage: 19.00, type: percentage, isPurchase: true, isSell: true`) and submitted
- THEN POST `/api/settings/taxes` returns 201 with the new tax
- AND the tax appears in the list

#### Scenario: TAX-02 — Duplicate name
- GIVEN a tax named "IVA 19%" already exists
- WHEN the user creates another with the same name
- THEN the system returns 409 with `{ message: "Ya existe un impuesto con ese nombre" }`

#### Scenario: TAX-02b — Duplicate code
- GIVEN "IVA19" already exists
- WHEN creating another with code "IVA19"
- THEN the system returns 409 with `{ message: "Ya existe un impuesto con ese código" }`

#### Scenario: TAX-03 — Sorted list
- GIVEN taxes exist with sortOrder 0, 1, 2
- WHEN the user loads `/settings/taxes`
- THEN taxes display in sortOrder ASC then name ASC

#### Scenario: TAX-04 — Update with duplicate name
- GIVEN tax A ("IVA 19%") and tax B ("IVA 5%") exist
- WHEN the user edits tax B changing its name to "IVA 19%"
- THEN the system returns 409 with duplicate name error

#### Scenario: TAX-05 — Delete referenced tax
- GIVEN a tax is referenced by an invoice/product
- WHEN the user confirms deletion
- THEN the system returns 409 with `{ message: "No se puede eliminar: el impuesto está en uso" }`

#### Scenario: TAX-06 — Missing required fields
- WHEN the user submits the form with empty name
- THEN the form shows "El nombre es requerido" and the dialog stays open

---

## 3. payment-method-crud — Payment Method Master Data

### Purpose
Full CRUD for PaymentMethod entity: name, code, description, active, sort.

### Entity Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | YES | Unique, max 100 chars |
| code | string | YES | Unique, max 20 chars |
| description | string | NO | Max 255 chars |
| isActive | boolean | YES | Default true |
| sortOrder | integer | YES | Default 0 |

### Requirements

| ID | Priority | Rule |
|----|----------|------|
| PM-01 | P0 | The system MUST create a payment method given valid data |
| PM-02 | P0 | The system MUST reject creation when name or code already exists |
| PM-03 | P0 | The system MUST list payment methods sorted by sortOrder ASC then name ASC, paginated |
| PM-04 | P0 | The system MUST update a payment method; reject duplicate name/code on update |
| PM-05 | P0 | The system MUST delete a payment method after confirmation; reject if referenced |

#### Scenario: PM-01 — Create "Efectivo"
- GIVEN the user is on `/settings/payment-methods`
- WHEN they create a method with `name: "Efectivo", code: "CASH", description: "Pago en efectivo"`
- THEN POST `/api/settings/payment-methods` returns 201

#### Scenario: PM-02 — Duplicate name
- GIVEN "Efectivo" already exists
- WHEN creating another with name "Efectivo"
- THEN the system returns 409

#### Scenario: PM-03 — List sorted
- GIVEN methods with sortOrder 0 (CASH), 1 (DEBIT), 2 (CREDIT)
- WHEN the page loads
- THEN methods display in sortOrder ASC then name ASC

#### Scenario: PM-04 — Update description
- GIVEN "Efectivo" exists
- WHEN the user adds a description via edit dialog
- THEN PATCH `/api/settings/payment-methods/:id` returns 200 with updated data

#### Scenario: PM-05 — Delete with confirmation
- GIVEN a payment method exists
- WHEN the user clicks "Delete" and confirms in the confirmation dialog
- THEN DELETE `/api/settings/payment-methods/:id` returns 200
- AND the method is removed from the list

---

## 4. payment-type-crud — Payment Type Master Data

### Purpose
Full CRUD for PaymentType entity: name, code, description, active, sort.

### Entity Validation

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | YES | Unique, max 100 chars |
| code | string | YES | Unique, max 20 chars |
| description | string | NO | Max 255 chars |
| isActive | boolean | YES | Default true |
| sortOrder | integer | YES | Default 0 |

### Requirements

| ID | Priority | Rule |
|----|----------|------|
| PT-01 | P0 | The system MUST create a payment type given valid data |
| PT-02 | P0 | The system MUST reject creation when name or code already exists |
| PT-03 | P0 | The system MUST list payment types sorted by sortOrder ASC then name ASC, paginated |
| PT-04 | P0 | The system MUST update a payment type; reject duplicate name/code on update |
| PT-05 | P0 | The system MUST delete a payment type after confirmation; reject if referenced |

#### Scenario: PT-01 — Create "Contado"
- GIVEN the user is on `/settings/payment-types`
- WHEN they create `name: "Contado", code: "CASH"`
- THEN POST `/api/settings/payment-types` returns 201

#### Scenario: PT-02 — Duplicate code
- GIVEN code "CASH" already exists
- WHEN creating another type with code "CASH"
- THEN the system returns 409

#### Scenario: PT-03 — List with pagination
- GIVEN 25 payment types exist
- WHEN the page loads with page=1, limit=10
- THEN 10 types are shown with totalPages=3

#### Scenario: PT-04 — Toggle isActive
- GIVEN "Contado" is active
- WHEN the user toggles isActive to false via edit
- THEN PATCH returns 200 and the type shows as inactive

#### Scenario: PT-05 — Cancel delete
- GIVEN the confirmation dialog is open for a payment type
- WHEN the user clicks "Cancel"
- THEN the dialog closes and the type is NOT deleted

---

## Shared UI Behavior (applies to all 3 CRUDs)

### Dialog Flow
- GIVEN the user clicks "Add" or an edit icon on any CRUD page
- WHEN the dialog opens
- THEN it follows the `dialog-pattern` spec: `MatDialogRef`, typed `DialogData`, `rounded-[32px]`, `shadow-2xl`, `max-h-[95vh]`
- AND the form uses signal forms or reactive forms per project convention
- AND loading/error signals control spinner and error banner

### Delete Confirmation
- GIVEN the user clicks the delete icon on a row
- WHEN `ConfirmDeleteDialogOrganism` opens
- THEN clicking "Confirm" sends the DELETE request
- AND clicking "Cancel" closes the dialog with no action

### Error Display
- GIVEN an API call fails (network error, 409 conflict, 500 server error)
- WHEN the error response is received
- THEN a dismissible error banner shows the error message
- AND the user can dismiss it

---

## Route Spec

| Route | Component | Guards | Notes |
|-------|-----------|--------|-------|
| `/settings` | `SettingsPageComponent` | `authGuard, profileGuard` | Lazy-loaded |
| `/settings/taxes` | `SettingsTaxesPageComponent` | `authGuard, profileGuard` | Child of `/settings` |
| `/settings/payment-methods` | `SettingsPaymentMethodsPageComponent` | `authGuard, profileGuard` | Child of `/settings` |
| `/settings/payment-types` | `SettingsPaymentTypesPageComponent` | `authGuard, profileGuard` | Child of `/settings` |
| `/settings/**` | 404 | — | Wildcard child |
