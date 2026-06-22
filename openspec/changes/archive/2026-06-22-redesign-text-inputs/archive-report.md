# Archive Report

**Change**: redesign-text-inputs
**Archived to**: `openspec/changes/archive/2026-06-22-redesign-text-inputs/`
**Date**: 2026-06-22
**Tester**: sdd-archive sub-agent
**Artifact Store**: hybrid (filesystem + Engram)

## Task Completion Gate Reconciliation

Two unchecked tasks existed in `tasks.md` at archive time. Both are justified stale/blocked items, not incomplete implementation:

| Task | Status | Evidence |
|------|--------|----------|
| 3.7 `Run ng test — full suite passes` | **Pre-existing failures** — 21 failures across 8 components NOT touched by this migration. TextInputComponent (12/12) and ProductForm (3/3) both pass. | verify-report.md confirms failures are pre-existing and unrelated. |
| 4.1 `Migrate patient-search` | **Architecturally blocked** — `matAutocomplete` requires native `<input>` for `[matAutocomplete]` directive binding. Correctly identified as out-of-scope in the proposal. | verify-report.md confirms the architectural block. |

**Verdict**: Reconcile stale checkboxes. All 48 implementable tasks are complete. The verify-report proves both unchecked items are not genuine implementation gaps. Archive proceeds with intentional-warnings flag.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `text-input-atom` | Created | New main spec at `openspec/specs/text-input-atom/spec.md` — 18 scenarios across 6 requirement groups (Input API, State Rendering, Icon Rendering, Form Integration, Accessibility, Helper Text) |

## Verification Report Summary
- **Verdict**: PASS WITH WARNINGS
- **Build**: `npx tsc --noEmit` — zero errors
- **Tests**: 138 passed, 21 failed (all pre-existing)
- **Spec compliance**: 19/20 scenarios compliant, 1 partially compliant
- **Critical issues**: None

## Archive Contents

| Artifact | Status |
|----------|--------|
| exploration.md | ✅ Archived |
| proposal.md | ✅ Archived |
| spec.md | ✅ Archived |
| design.md | ✅ Archived |
| tasks.md | ✅ Archived (48/50 tasks complete; 2 stale/blocked reconciled) |
| verify-report.md | ✅ Archived |
| archive-report.md | ✅ This file |

## Migration Summary

| Phase | Scope | Components Migrated | Result |
|-------|-------|--------------------|--------|
| 0 | Create atom + tests | `text-input/` | ✅ 12/12 tests pass |
| 1 | Dogfood | customer-dialog (5 inputs) | ✅ Zero visual diff |
| 2 | Aligned forms | product-form (6+ inputs), login-form (2) | ✅ tsc passes |
| 3 | Material-to-native | billing-filters, invoice-form-dialog, general-invoice-form-dialog, sales-note-form-dialog | ✅ MatInputModule removed |
| 4a | Pediatrics | patient-registration-wizard (~18), diagnostics-dialog, physical-exam-dialog, incapacity-dialog, orders-dialog | ✅ tsc passes |
| 4b | Inventory + Purchase | supplier-dialog, inventory-category-dialog, adjustment-form-dialog, purchase-order-dialog | ✅ MatInputModule removed |
| 4c | Transport | dispatch, expense, maintenance, standby (4 dialogs) | ✅ tsc passes |
| — | Skipped (valid) | appointment-form (date/time only), anamnesis-dialog (textareas only), inventory-batch-dialog (read-only), transport-incident (date/time), transport-operation (date/time/file), transport-settle (no inputs), appointment-filters (date/time), patient-search (autocomplete) | ✅ Valid reasons per proposal |

## MatFormField Remaining (Text Inputs Only)
- patient-neonatal-history (4) — out of scope
- profile-account (4) — out of scope
- profile-personal (4) — out of scope
- patient-search (1) — blocked by matAutocomplete

## Notes
- The archive uses `hybrid` mode (config.yaml). The archive report is persisted to both the filesystem archive AND Engram (`sdd/redesign-text-inputs/archive-report`).
- No `state.yaml` existed in the change folder — DAG state was managed externally by the orchestrator.
