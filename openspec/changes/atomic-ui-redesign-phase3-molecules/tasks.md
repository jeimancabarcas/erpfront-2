# Tasks: Phase 3 — Atomic UI Molecules

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,740 (24 new files: 8 TS + 8 SCSS + 8 spec) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (simple) → PR 2 (interactive) → PR 3 (DataTable + specs) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | 4 simple molecules (no state) | PR 1 | base=feature/phase3-molecules; MenuItem, ContentCard, PageHeader, StatsGrid |
| 2 | 3 interactive molecules | PR 2 | base=PR#1 branch; SearchBar, SearchFilters, ConfirmDialog |
| 3 | DataTable + all 8 specs | PR 3 | base=PR#2 branch; complex molecule + full TDD test suite |

## PR 1: Simple Molecules

- [x] 1.1 Create `molecules/menu-item/menu-item.component.ts` — icon/label/badge/active/disabled signals + `RouterLink`
- [x] 1.2 Create `molecules/menu-item/menu-item.component.scss` — pill, hover/active/disabled token states
- [x] 1.3 Create `molecules/content-card/content-card.component.ts` — image/text split, routerLink, clicked output
- [x] 1.4 Create `molecules/content-card/content-card.component.scss` — 70/30 layout, hover shadow lift via `--duration-slow`
- [x] 1.5 Create `molecules/page-header/page-header.component.ts` — title/desc + breadcrumb/action `ng-content`
- [x] 1.6 Create `molecules/page-header/page-header.component.scss` — responsive flex, mobile column stack at 767px
- [x] 1.7 Create `molecules/stats-grid/stats-grid.component.ts` — `StatItem[]` grid, cardClick output, trend arrows
- [x] 1.8 Create `molecules/stats-grid/stats-grid.component.scss` — `auto-fill` grid, card hover lift, trend up/down colors

## PR 2: Interactive Molecules

- [x] 2.1 Create `molecules/search-bar/search-bar.component.ts` — search icon + InputAtom (borderless override) + ⌘K `<kbd>`
- [x] 2.2 Create `molecules/search-bar/search-bar.component.scss` — pill container, focus ring, hint hidden on mobile
- [x] 2.3 Create `molecules/search-filters/search-filters.component.ts` — `FilterDefinition[]`, 400ms debounce, filter values signal
- [x] 2.4 Create `molecules/search-filters/search-filters.component.scss` — card container, horizontal→vertical responsive
- [x] 2.5 Create `molecules/confirm-dialog/confirm-dialog.component.ts` — `@if(open())` backdrop, native focus trap, Esc handler
- [x] 2.6 Create `molecules/confirm-dialog/confirm-dialog.component.scss` — fixed overlay, centered card, `z-index: 50`, danger variant

## PR 3: DataTable + Tests

- [x] 3.1 Create `molecules/data-table/data-table.component.ts` — sort/paginate/select/loading/empty states, `ColumnDef[]`, `aria-sort`
- [x] 3.2 Create `molecules/data-table/data-table.component.scss` — table, sort icons, responsive overflow, skeleton rows
- [x] 3.3 Write `menu-item.component.spec.ts` — default/active/disabled render, click output `toHaveBeenCalled`, ARIA attrs
- [x] 3.4 Write `search-bar.component.spec.ts` — valueChange output, focus-within style, hint hidden on mobile
- [x] 3.5 Write `content-card.component.spec.ts` — title+subtitle render, hover shadow class, routerLink navigation
- [x] 3.6 Write `page-header.component.spec.ts` — breadcrumb/action slot projection, mobile column layout
- [x] 3.7 Write `search-filters.component.spec.ts` — filter config render, 400ms debounce, clear output, mobile stack
- [x] 3.8 Write `data-table.component.spec.ts` — data render, sort toggle ASC/DESC, paginate, loading skeleton, empty state
- [x] 3.9 Write `confirm-dialog.component.spec.ts` — open/close visibility, Escape→cancel emit, focus trap, danger variant
- [x] 3.10 Write `stats-grid.component.spec.ts` — grid columns, card click index, trend up/down color classes
