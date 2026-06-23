# Delta for dialog-pattern

## MODIFIED Requirements

### Requirement: REQ-6 — Handle `undefined`/partial `MAT_DIALOG_DATA` with sensible defaults (P1)

The component MUST handle three `MAT_DIALOG_DATA` cases: (1) no data at all — use empty defaults; (2) partial data — merge with defaults without crashing; (3) mode-driven data (`{ mode: 'add' | 'edit', ... }`) — initialize form state accordingly. Every injected data field SHOULD have a safe fallback.

(Previously: Handle `undefined`/partial `MAT_DIALOG_DATA` with sensible defaults.)

#### Scenario: Create mode (no data)
- GIVEN a dialog opened without `MAT_DIALOG_DATA`
- WHEN the form initializes
- THEN all controls have empty/null defaults and the form is pristine

#### Scenario: Mode-driven data — Add mode
- GIVEN a dialog opened with `{ mode: 'add' }`
- WHEN the component initializes
- THEN form is initialized in create/empty state
- AND no pre-existing item data is loaded
- AND any item-specific fields are disabled or hidden

#### Scenario: Mode-driven data — Edit mode
- GIVEN a dialog opened with `{ mode: 'edit', item: { ...existingData } }`
- WHEN the component initializes
- THEN form controls are pre-filled with `item` values
- AND identity fields (e.g., product selector) are locked/disabled to prevent identity changes
- AND mutable fields (quantity, price) remain editable

#### Scenario: Partial data — missing optional fields
- GIVEN a dialog opened with `{ mode: 'add', product: { ... } }` but no `item`
- WHEN the form initializes
- THEN product data is available for reference display
- AND form fields that depend on `item` use safe defaults without error

#### Scenario: FormArray consumer pattern
- GIVEN a dialog that returns data via `dialogRef.close(payload)`
- WHEN the parent component subscribes to `afterClosed()`
- THEN the parent pushes the payload into its own `FormArray` or updates an existing `FormGroup`
- AND the dialog itself does NOT own or mutate the parent's `FormArray` directly
