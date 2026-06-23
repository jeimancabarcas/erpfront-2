# Tax CRUD Specification

## Purpose

Full CRUD for Tax master data: name, code, percentage, type, purchase/sell flags, active status, sort order.

## Requirements

### Requirement: TAX-01 — Create tax

The system MUST create a tax given valid POST data. The backend MUST validate all required fields, unique constraints, and return 201 on success.

#### Scenario: Happy path creation
- GIVEN the user is on `/settings/taxes` and clicks "Add"
- WHEN the dialog form submits `{ name: "IVA 19%", code: "IVA19", percentage: 19.00, type: "percentage", isPurchase: true, isSell: true, isActive: true, sortOrder: 0 }`
- THEN POST `/api/settings/taxes` returns 201 with the created tax
- AND the tax prepends to the list

#### Scenario: Missing required fields
- WHEN the user submits the form with an empty name field
- THEN the form shows inline validation "El nombre es requerido"
- AND the dialog does NOT close

### Requirement: TAX-02 — Reject duplicates

The system MUST reject creation when name or code already exists, returning 409 with a user-facing error message.

#### Scenario: Duplicate name
- GIVEN a tax "IVA 19%" already exists
- WHEN creating another tax with name "IVA 19%"
- THEN POST returns 409 `{ message: "Ya existe un impuesto con ese nombre" }`

#### Scenario: Duplicate code
- GIVEN "IVA19" already exists
- WHEN creating with code "IVA19"
- THEN POST returns 409 `{ message: "Ya existe un impuesto con ese código" }`

### Requirement: TAX-03 — List taxes

The system MUST return taxes sorted by sortOrder ASC then name ASC, with pagination and optional isActive filter.

#### Scenario: Sorted list
- GIVEN taxes with sortOrder 0 ("IVA 5%"), 1 ("IVA 19%"), 2 ("Exento")
- WHEN GET `/api/settings/taxes`
- THEN results are `[IVA 5%, IVA 19%, Exento]`

#### Scenario: Filter by isActive
- GIVEN active and inactive taxes exist
- WHEN GET `/api/settings/taxes?isActive=true`
- THEN only active taxes are returned

### Requirement: TAX-04 — Update tax

The system MUST update a tax via PATCH. It MUST reject duplicate name/code when another entity already has that value.

#### Scenario: Update isPurchase flag
- GIVEN a tax exists with isPurchase: false
- WHEN the user edits and sets isPurchase: true
- THEN PATCH returns 200 with `{ isPurchase: true }`

#### Scenario: Reject duplicate name on update
- GIVEN tax A ("IVA 19%") and tax B ("IVA 5%") exist
- WHEN renaming tax B to "IVA 19%"
- THEN PATCH returns 409 with duplicate error

### Requirement: TAX-05 — Delete tax

The system MUST delete a tax after confirmation. It MUST reject deletion if the tax is referenced by other entities.

#### Scenario: Delete with confirmation
- GIVEN a tax with no references exists
- WHEN the user confirms deletion in ConfirmDeleteDialogOrganism
- THEN DELETE returns 200 and the tax is removed from the list

#### Scenario: Referential integrity violation
- GIVEN a tax is referenced by an invoice or product
- WHEN the user confirms deletion
- THEN DELETE returns 409 `{ message: "No se puede eliminar: el impuesto está en uso" }`
