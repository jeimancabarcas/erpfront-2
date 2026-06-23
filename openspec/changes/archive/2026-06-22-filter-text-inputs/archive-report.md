# Archive Report: filter-text-inputs

**Archived**: 2026-06-22
**Mode**: openspec
**Author**: sdd-archive sub-agent

## Change Summary

Migrated 11 filter/search text inputs across 8 components to `<ui-text-input>`. 8 page-level raw HTML inputs + 3 molecule/organism `mat-form-field` inputs replaced. Zero atom changes needed.

- **Pattern A** (5 pages, 8 inputs): replaced raw `<div>`+`<input>` with `<ui-text-input>`, wired `(valueChange)="signal.set($event); debouncedFilter()"`, removed `onXFilterChange` handlers
- **Pattern B** (3 components): replaced `<mat-form-field>`+`<input matInput>` with `<ui-text-input>`, preserved existing binding semantics (`[(value)]`, `[formControl]`)
- ~125 lines changed across 4 commits
- Branch: `feature/filter-text-inputs`

## Task Completion Gate

- All 8 implementation tasks marked `[x]` ✅
- Verify report: **PASS WITH WARNINGS** (no CRITICAL issues)
- Warnings: unused import statements (movements-table, customer-invoices-table) and placeholder mismatch (sales-page) — non-blocking

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| text-input-atom | Updated | +2 requirements (Filter Text Input Integration with 5 scenarios, TypeScript Compilation with 1 scenario) appended to main spec |

## Archive Contents

| Artifact | Status |
|----------|--------|
| exploration.md | ✅ |
| proposal.md | ✅ |
| specs/text-input-atom/spec.md | ✅ (delta) |
| design.md | ✅ |
| tasks.md | ✅ (8/8 tasks complete) |
| verify-report.md | ✅ |

## Source of Truth Updated

- `openspec/specs/text-input-atom/spec.md` — now includes filter text input integration scenarios (Pattern A/B migrations, signal binding, CVA passthrough, clear button, compilation requirements)

## Notes

- No CRITICAL issues in verification report — only 3 warnings (unused imports, placeholder mismatch)
- Proposal's `variant` input scope was **not implemented** — the user decided to unify on `bg-white` without adding a variant. Design reflects this decision correctly.
- `MatInputModule` kept in `appointment-filters` because the datepicker still uses `matInput`
- All imports verified across 8 components

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived. Ready for the next change.
