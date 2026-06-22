# Proposal: Atomic Design UI Redesign with Clean/Soft UI

## Intent

Replace Angular Material entirely with custom Tailwind CSS components following Atomic Design methodology, applying Clean/Soft UI aesthetics. Deliver dark mode support. Remove dead dependencies (`@boxicons/core`). Enable phased delivery through 6 chained SDD changes.

## Scope

### In Scope
- **Phase 1 (Foundation)**: Design tokens, dark mode config, typography scale, shadow/border-radius tokens, palette (`#F9FAFB` bg, `#111827` text). Remove `@boxicons/core`.
- **Phase 2 (Atoms)**: 10 custom components replacing Material: Button, Input, Select, Card, Badge, Avatar, Skeleton, Divider, Spinner, Toggle.
- **Phase 3 (Molecules)**: 7 composed components: PageHeader, SearchFilters, DataTable, ConfirmDialog, FormField, StatsGrid, UserMenu.
- **Phase 4 (Organisms)**: 3 layout organisms: AppSidebar, AppHeader, CardGrid. Replaces MatSidenav + MatToolbar.
- **Phase 5 (Migration)**: Restyle 29 pages. Remove `@angular/material` and `@angular/cdk` from package.json.
- **Phase 6 (Dark Mode Polish)**: Universal dark mode support, toggle in header, localStorage persistence.

### Out of Scope
- Changing page functionality or business logic
- Replacing Material Icons library
- New pages or features
- E2E tests (not available in project config)

## Capabilities

### New Capabilities
- `design-tokens`: `@theme` block in Tailwind v4 with colors, spacing, typography, shadows, radii
- `button-atom`: Primary, secondary, outline, ghost, icon, danger variants; sm/md/lg sizes; loading/disabled states
- `input-atom`: Text, number, textarea, password; label/error/hint slots; focus ring
- `select-atom`: Dropdown with searchable variant
- `card-atom`: Base, stat, action card variants with Soft UI styling
- `badge-atom`: Status colors, counter pill, dot indicator
- `avatar-atom`: Image with fallback initials
- `skeleton-atom`: Text, card, table-row loading placeholders
- `divider-atom`: Horizontal and vertical
- `spinner-atom`: Loading spinner
- `toggle-atom`: Switch/toggle component
- `page-header-molecule`: H1 + description + action slot + breadcrumb
- `search-filters-molecule`: Configurable filter bar (type, search, date range)
- `data-table-molecule`: Sort, paginate, empty, loading, selection states — replaces MatTable
- `confirm-dialog-molecule`: Modal confirm/cancel with title, message, actions
- `form-field-molecule`: Label + input/select + error + hint in consistent layout
- `stats-grid-molecule`: Responsive KPI stat cards grid
- `user-menu-molecule`: Avatar + name + dropdown (profile, settings, logout)
- `menu-item-molecule`: Icon + label + optional badge, active state highlight
- `app-sidebar-organism`: Data-driven collapsible menu, active route highlighting, responsive (side/overlay)
- `app-header-organism`: Back/forward nav, pill search bar (⌘K), user menu, mobile hamburger
- `card-grid-organism`: CSS Grid container for card molecules

### Modified Capabilities
- `navigation-layout`: Active route highlighting and accordion behavior preserved; rebuilt on custom AppSidebarOrganism instead of MatSidenav

## Approach

- **Design tokens first**: Define `@theme` block in `styles.css` — the single source of truth for all visual primitives. All components reference tokens, never raw values.
- **Incremental delivery**: Each phase is an independent SDD change with its own proposal → specs → design → tasks → apply → verify → archive cycle. No phase depends on future phases for function.
- **Component replacement strategy**: Build new components alongside Material ones. Phase 5 swaps imports globally, then removes Material from package.json.
- **Dark mode**: Implement via Tailwind `dark:` variants. Preference persisted in localStorage. Default follows `prefers-color-scheme`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/styles.css` | Modified | Add `@theme` block, dark variant config |
| `src/app/shared/atoms/` | New | 10 atom components |
| `src/app/shared/molecules/` | New | 7 molecule components |
| `src/app/shared/organisms/` | Modified | 3 organisms rebuilt |
| `src/app/pages/**/*` | Modified | 29 pages restyled |
| `angular.json` | Modified | Remove Material CSS imports |
| `package.json` | Modified | Remove `@angular/material`, `@angular/cdk`, `@boxicons/core` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| MatTable replacement not feature-complete | Med | Phase 3 DataTable spec must enumerate all required MatTable features used across 29 pages |
| Visual regression during migration | Med | Phase 5 applies one page at a time; visual comparison screenshots |
| Dark mode incomplete on migration | High | Phase 2-4 components built with dark variants from start. Phase 6 is polish, not retrofitting |
| Phase coupling causes blocking | Low | Each phase delivers standalone value; no runtime dependency between phases |

## Rollback Plan

Each phase is independently revertible: revert its PR/commits. Phase 5 (Material removal) is the point of no return — ensure phases 1-4 are fully verified before executing phase 5.

## Dependencies

- Tailwind CSS v4.1.12 (already installed)
- Material Icons font (already loaded via `index.html`)
- Inter + Roboto fonts (already loaded)

## Success Criteria

- [ ] All Angular Material imports removed from codebase
- [ ] `@angular/material` and `@angular/cdk` removed from `package.json`
- [ ] 29 pages render correctly in light and dark modes
- [ ] Design token system is single source of truth — no inline arbitrary Tailwind values
- [ ] Sidebar navigation passes existing `navigation-layout` spec unchanged
- [ ] `@boxicons/core` removed from `package.json`
- [ ] 0 linting errors on new components
