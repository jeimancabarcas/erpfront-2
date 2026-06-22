# Tasks: Atomic UI Redesign — Phase 4 Layout Organisms

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–1000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: CardGrid + tokens → PR 2: Sidebar → PR 3: Header + specs |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | CardGridOrganism + shared types + LogoComponent tokens | PR 1 | Base: main. Simplest, no blocking deps. |
| 2 | AppSidebarOrganism | PR 2 | Base: main. Depends on MenuItemMolecule (existing). |
| 3 | AppHeaderOrganism + all specs verification | PR 3 | Base: main. Depends on ButtonAtom, SearchBarMolecule (existing). |

## Phase 1: Foundation

- [x] 1.1 Create shared interfaces: `MenuGroup`, `MenuItemDef`, `UserInfo`, `CardItem`
- [x] 1.2 Tokenize `LogoComponent` — replace hardcoded colors with `var(--color-*)` tokens

## Phase 2: CardGridOrganism (WU1)

- [x] 2.1 Write CardGrid unit tests (columns, skeleton, empty, loadMore emit)
- [x] 2.2 Create `card-grid.component.ts` — inputs/outputs, grid logic, OnPush
- [x] 2.3 Create `card-grid.component.scss` — CSS Grid, responsive columns, skeleton/empty states

## Phase 3: AppSidebarOrganism (WU2)

- [x] 3.1 Write AppSidebar unit tests (collapse toggle, route highlight, mobile overlay)
- [x] 3.2 Create `app-sidebar.component.ts` — data-driven menu, collapsible groups, OnPush
- [x] 3.3 Create `app-sidebar.component.scss` — fixed 256px panel, overlay variant, responsive

## Phase 4: AppHeaderOrganism (WU3)

- [x] 4.1 Write AppHeader unit tests (controls render, hamburger emit, sticky, dropdown)
- [x] 4.2 Create `app-header.component.ts` — nav buttons, SearchBarMolecule, user dropdown, OnPush
- [x] 4.3 Create `app-header.component.scss` — sticky, dropdown, responsive hamburger/show/hide

## Phase 5: Verification

- [ ] 5.1 Run full test suite — all unit tests pass (`npm run test -- --watch=false`)
- [ ] 5.2 Verify token compliance — no hardcoded colors, all `@theme` tokens
- [ ] 5.3 Verify dark mode — each organism renders correctly under `.dark`
- [ ] 5.4 Verify accessibility — roles (`navigation`, `banner`), keyboard, aria-labels
