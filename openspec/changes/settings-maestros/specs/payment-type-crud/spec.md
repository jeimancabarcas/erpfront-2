# Payment Type CRUD Specification

## Purpose

Full CRUD for PaymentType master data: name, code, description, active status, sort order.

## Requirements

### Requirement: PT-01 — Create payment type

The system MUST create a payment type given valid POST data. Validate required fields and unique constraints.

#### Scenario: Create "Contado"
- GIVEN the user is on `/settings/payment-types` and clicks "Add"
- WHEN submitting `{ name: "Contado", code: "CASH", description: "Pago de contado", isActive: true, sortOrder: 0 }`
- THEN POST `/api/settings/payment-types` returns 201

#### Scenario: Missing code
- WHEN the user submits with empty code
- THEN the form shows "El código es requerido"
- AND the dialog stays open

### Requirement: PT-02 — Reject duplicates

The system MUST reject creation when name or code already exists, returning 409.

#### Scenario: Duplicate name
- GIVEN "Contado" already exists
- WHEN creating another type named "Contado"
- THEN POST returns 409

#### Scenario: Duplicate code
- GIVEN "CASH" already exists
- WHEN creating another with code "CASH"
- THEN POST returns 409

### Requirement: PT-03 — List payment types

The system MUST return payment types sorted by sortOrder ASC then name ASC, with pagination.

#### Scenario: Paginated list
- GIVEN 25 payment types exist
- WHEN GET `/api/settings/payment-types?page=1&limit=10`
- THEN 10 types are returned with total items = 25, total pages = 3

### Requirement: PT-04 — Update payment type

The system MUST update via PATCH. Reject duplicate name/code on update.

#### Scenario: Toggle isActive
- GIVEN "Contado" has isActive: true
- WHEN the user sets isActive to false via edit
- THEN PATCH returns 200 with isActive: false
- AND the type shows as inactive in the table

### Requirement: PT-05 — Delete payment type

The system MUST delete after confirmation. Cancel action MUST NOT delete.

#### Scenario: Cancel delete
- GIVEN the ConfirmDeleteDialogOrganism is open for a payment type
- WHEN the user clicks "Cancel"
- THEN the dialog closes
- AND the type is NOT deleted

#### Scenario: Confirm delete
- GIVEN a type exists with no references
- WHEN the user confirms deletion
- THEN DELETE returns 200 and the type is removed
