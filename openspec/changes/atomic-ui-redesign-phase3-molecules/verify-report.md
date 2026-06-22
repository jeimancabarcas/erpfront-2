# Verify Report — Phase 3 Molecules

## Status: **FAIL** — fixes required

---

## 1. Build Check — ✅ PASS

`npm run build` completed successfully. Warnings are limited to unrelated files (`purchase-order-detail-dialog.component.ts`) and a bundle budget warning — none block the build.

## 2. TypeScript Check — ✅ PASS

`npx tsc --noEmit` — zero errors.

## 3. Violation Greps

| Check | Result | Details |
|-------|--------|---------|
| Hex values in molecule SCSS | ✅ PASS | Zero hex values found. All SCSS uses `var(--...)` tokens only. |
| `@angular/material` imports in NEW molecule TS | ❌ FAIL | **3 violations** — see below |

### Material Import Violations

| File | Import | Usage |
|------|--------|-------|
| `menu-item/menu-item.component.ts:3` | `MatIconModule` from `@angular/material/icon` | `<mat-icon>` in template (lines 24, 41) |
| `search-bar/search-bar.component.ts:2` | `MatIconModule` from `@angular/material/icon` | `<mat-icon>` in template (line 13) |
| `stats-grid/stats-grid.component.ts:3` | `MatIconModule` from `@angular/material/icon` | `<mat-icon>` in template (lines 27, 41, 43) |

**Design violation**: Design.md states *"Icons use inline SVGs to avoid MatIconModule dependency in molecule source files"* (Architecture Decisions table). These 3 molecules should use inline SVGs, not `MatIconModule`.

## 4. File Existence — ✅ PASS

All 8 molecules have `.ts` + `.scss` + `.spec.ts` (24 files total):

| Molecule | TS | SCSS | Spec |
|----------|----|------|------|
| MenuItem | ✅ | ✅ | ✅ |
| SearchBar | ✅ | ✅ | ✅ |
| ContentCard | ✅ | ✅ | ✅ |
| PageHeader | ✅ | ✅ | ✅ |
| SearchFilters | ✅ | ✅ | ✅ |
| DataTable | ✅ | ✅ | ✅ |
| ConfirmDialog | ✅ | ✅ | ✅ |
| StatsGrid | ✅ | ✅ | ✅ |

## 5. FR Coverage

| FR | Molecule | Status | Notes |
|----|----------|--------|-------|
| FR1 | MenuItemMolecule | ✅ | Icon, label, badge, active/disabled states, `role="menuitem"`, `aria-current`, `aria-disabled`, click guard |
| FR2 | SearchBarMolecule | ✅ | Icon + InputAtom + ⌘K hint, focus border/shadow, mobile hint hidden via `@media` |
| FR3 | ContentCardMolecule | ✅ | Title/subtitle, 16/9 image area, text block, hover shadow lift |
| FR4 | PageHeaderMolecule | ✅ | h1 + description + breadcrumb/actions slots, responsive column layout |
| FR5 | SearchFiltersMolecule | ✅ | InputAtom/SelectAtom/date/ghost Button, horizontal→vertical responsive, 400ms debounce |
| FR6 | DataTableMolecule | ✅ | HTML table + SkeletonAtom loading, empty state, sort headers, aria-sort, paginator |
| FR7 | ConfirmDialogMolecule | ✅ | backdrop + CardAtom + buttons, Escape/Enter handlers, `role="alertdialog"`, `aria-modal` |
| FR8 | StatsGridMolecule | ✅ | CSS grid `auto-fill, minmax(250px, 1fr)`, trend up/down, hover lift |

### Spec Contract Table Discrepancies (minor)

| Molecule | Spec Contract | Implementation | Severity |
|----------|--------------|----------------|----------|
| SearchBar | Output `search` | Missing (only `valueChange` present) | Minor — debounced valueChange may substitute |
| DataTable | Output `pageChange` | Missing (has `rowClick` instead) | Minor — paginator exists but no page event |
| DataTable | Input `pageSize` | Missing (hardcoded to 10 via signal) | Minor |
| ContentCard | `routerLink` → navigation | Not implemented (input exists, routerLink not used in template) | Minor — consumer can bind routerLink externally |

## 6. NFR Compliance

| NFR | Status | Details |
|-----|--------|---------|
| **Token-only styling** | ✅ PASS | Zero hex values. All visuals via `var(--...)` Phase 1 tokens. |
| **Dark mode** | ✅ PASS | Automatic via `.dark` ancestor CSS var cascade. No hardcoded colors. |
| **A11y** | ✅ PARTIAL | ARIA roles on all interactive molecules (`menuitem`, `search`, `article`, `table`, `alertdialog`), `aria-current`, `aria-disabled`, `aria-sort`, `aria-busy`, `aria-modal`, `aria-labelledby`, `aria-describedby`. Focus-visible outlines in SCSS. |
| **Zero Material** | ❌ FAIL | 3 molecules import `MatIconModule` (see §3). |
| **Composition** | ✅ PASS | All molecules compose atoms only (`BadgeAtom`, `InputAtom`, `CardAtom`, `SelectAtom`, `ButtonAtom`, `SkeletonAtom`). |
| **Responsive** | ✅ PASS | SearchBar hint hidden ≤767px. PageHeader stacks columns ≤767px. SearchFilters flips to column ≤767px. DataTable `overflow-x: auto`. |

---

## Summary

```
status:  fail
build:   pass (npm run build + npx tsc --noEmit)
hex:     pass (0 violations)
material: fail (3 of 8 molecules use MatIconModule)
files:   pass (24/24 files exist)
frs:     pass (FR1–FR8 all implemented)
nfrs:    fail (3x Material import violations)
next:    fixes-required
```

### Required Fixes

1. **Replace `<mat-icon>` with inline SVGs** in 3 molecules:
   - `menu-item.component.ts` — 2 `<mat-icon>` instances
   - `search-bar.component.ts` — 1 `<mat-icon>` instance
   - `stats-grid.component.ts` — 3 `<mat-icon>` instances

2. **Remove `MatIconModule` imports** from those 3 files.

3. **Optional**: Add `search` output to SearchBar, `pageChange` output to DataTable, `pageSize` input to DataTable, and `RouterLink` usage in ContentCard to match spec contract table.
