# Payment Method CRUD Specification

## Purpose

Full CRUD for PaymentMethod master data: name, code, description, active status, sort order.

## Requirements

### Requirement: PM-01 — Create payment method

The system MUST create a payment method given valid POST data. It MUST validate required fields and unique constraints.

#### Scenario: Create "Efectivo"
- GIVEN the user is on `/settings/payment-methods` and clicks "Add"
- WHEN submitting `{ name: "Efectivo", code: "CASH", description: "Pago en efectivo", isActive: true, sortOrder: 0 }`
- THEN POST `/api/settings/payment-methods` returns 201
- AND the new method appears in the list

#### Scenario: Missing required fields
- WHEN the user submits with empty name
- THEN the form shows "El nombre es requerido"
- AND the dialog stays open

### Requirement: PM-02 — Reject duplicates

The system MUST reject creation when name or code already exists, returning 409.

#### Scenario: Duplicate name
- GIVEN "Efectivo" already exists
- WHEN creating another named "Efectivo"
- THEN POST returns 409

#### Scenario: Duplicate code
- GIVEN "CASH" already exists
- WHEN creating another with code "CASH"
- THEN POST returns 409

### Requirement: PM-03 — List payment methods

The system MUST return payment methods sorted by sortOrder ASC then name ASC, paginated.

#### Scenario: Sorted list
- GIVEN methods with sortOrder 0 ("Efectivo"), 1 ("Tarjeta Débito"), 2 ("Tarjeta Crédito")
- WHEN GET `/api/settings/payment-methods`
- THEN results are `[Efectivo, Tarjeta Débito, Tarjeta Crédito]`

### Requirement: PM-04 — Update payment method

The system MUST update a payment method via PATCH. Reject duplicate name/code on update.

#### Scenario: Update description
- GIVEN "Efectivo" has no description
- WHEN the user sets description to "Pago en efectivo" via edit dialog
- THEN PATCH returns 200 with the updated description

### Requirement: PM-05 — Delete payment method

The system MUST delete after confirmation. Reject if referenced by other entities.

#### Scenario: Delete with confirmation
- GIVEN a method exists with no references
- WHEN the user confirms deletion
- THEN DELETE returns 200 and the method is removed

#### Scenario: Delete rejected due to references
- GIVEN a method is in use on an invoice
- WHEN the user confirms deletion
- THEN DELETE returns 409 `{ message: "No se puede eliminar: el método de pago está en uso" }`
