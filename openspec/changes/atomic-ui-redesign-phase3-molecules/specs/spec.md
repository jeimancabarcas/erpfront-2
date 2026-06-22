# Phase 3 — Molecules Specification

## Purpose

8 composed Angular molecules combining Phase 2 atoms. Zero Material deps. Phase 1 tokens. Dark mode + a11y.

## Requirements

### FR1: MenuItemMolecule — `<ui-menu-item>`
Composes icon + label + optional BadgeAtom. Pill via `--radius-pill`.
- **Default**: GIVEN default WHEN rendered THEN icon+label visible, `role="menuitem"`
- **Active**: GIVEN `active=true` WHEN rendered THEN `--color-interactive-active` bg, `--color-accent` text, `aria-current="page"`
- **Disabled**: GIVEN `disabled=true` WHEN clicked THEN no emit, `aria-disabled="true"`

### FR2: SearchBarMolecule — `<ui-search-bar>`
Composes icon + InputAtom + keyboard hint (⌘K). Pill via `--radius-pill`.
- **Focus**: GIVEN focused WHEN rendered THEN `--color-surface` bg, border→`--color-accent`, `--shadow-md`
- **Hint**: GIVEN desktop WHEN rendered THEN ⌘K badge in `--color-text-secondary`
- **Mobile**: GIVEN mobile WHEN rendered THEN badge hidden

### FR3: ContentCardMolecule — `<ui-content-card>`
Composes image area (70%, `--color-border`) + text block (30%, `--color-surface`).
- **Default**: GIVEN title+subtitle WHEN rendered THEN `--radius-lg` top, title bold `--text-lg`, subtitle `--text-sm` secondary
- **Hover**: GIVEN user hovers WHEN hovered THEN shadow lifts over `--duration-slow`
- **Click**: GIVEN routerLink WHEN clicked THEN navigates

### FR4: PageHeaderMolecule — `<ui-page-header>`
Composes h1 + description + breadcrumb slot + action slot.
- **Full**: GIVEN title+desc+actions WHEN rendered THEN title `--text-3xl` `--font-extrabold`, desc `--text-sm` secondary
- **Breadcrumb**: GIVEN breadcrumb ng-content WHEN rendered THEN breadcrumb above title
- **Mobile**: GIVEN mobile viewport WHEN rendered THEN stacks vertically

### FR5: SearchFiltersMolecule — `<ui-search-filters>`
Composes InputAtom + SelectAtom + date inputs + ghost ButtonAtom.
- **Desktop**: GIVEN filters WHEN rendered THEN horizontal, `--color-surface`, `--radius-xl`, `--shadow-sm`
- **Mobile**: GIVEN mobile WHEN rendered THEN vertical stack
- **Debounce**: GIVEN typing WHEN 300ms idle THEN searchChange emits

### FR6: DataTableMolecule — `<ui-data-table>`
Composes HTML table + SkeletonAtom + DividerAtom + paginator.
- **Data**: GIVEN dataSource WHEN rendered THEN `role="table"`, hover `--color-interactive-active`, sort headers
- **Loading**: GIVEN `loading=true` WHEN rendered THEN SkeletonAtom rows, `aria-busy="true"`
- **Empty**: GIVEN empty dataSource WHEN rendered THEN empty state, horizontal scroll on mobile

### FR7: ConfirmDialogMolecule — `<ui-confirm-dialog>`
Composes CardAtom + title + message + cancel/confirm ButtonAtom.
- **Open**: GIVEN `visible=true` WHEN rendered THEN 50% `--color-bg` overlay, centered `--radius-xl` `--shadow-xl`, `role="alertdialog"`, focus trap
- **Escape**: GIVEN dialog open WHEN Escape pressed THEN closes, cancel emitted
- **Enter**: GIVEN confirm focused WHEN Enter pressed THEN confirm emitted

### FR8: StatsGridMolecule — `<ui-stats-grid>`
Composes responsive CSS grid of CardAtom KPI instances.
- **Grid**: GIVEN 4 cards WHEN rendered THEN `repeat(auto-fill, minmax(250px, 1fr))`, `gap: --spacing-6`
- **Trend up**: GIVEN `trend=positive` WHEN rendered THEN up arrow, `--color-success`
- **Trend down**: GIVEN `trend=negative` WHEN rendered THEN down arrow, `--color-error`

## Component Contracts

| Molecule | Inputs | Outputs | Slots |
|----------|--------|---------|-------|
| MenuItem | icon, label, badgeCount?, active, disabled, routerLink? | clicked | |
| SearchBar | placeholder, value, disabled | valueChange, search | |
| ContentCard | title, subtitle?, imageSrc?, routerLink? | clicked | |
| PageHeader | title, description? | | `[breadcrumb]`, `[actions]` |
| SearchFilters | filters, values | valuesChange, searchChange | |
| DataTable | columns, dataSource, loading, selectable?, pageSize | sortChange, selectionChange, pageChange | |
| ConfirmDialog | visible, title, message, confirmLabel, cancelLabel | confirm, cancel | |
| StatsGrid | stats, columns? | cardClick | |

## NFRs

- **Dark Mode**: MUST render via `.dark` using only Phase 1 CSS vars.
- **Token-Only**: All visuals via Phase 1 tokens. Zero hex/raw values.
- **A11y**: Keyboard nav, ARIA roles, focus-visible via `--color-accent`.
- **No Material**: Zero `@angular/material` imports.
- **Composition**: Atoms only (Button, Input, Select, Card, Badge, Skeleton, Divider).
- **Responsive**: All molecules adapt to mobile.

## Acceptance Criteria

- [ ] All 8 molecules render in light + dark mode
- [ ] Keyboard nav works on interactive molecules
- [ ] Zero Material imports in molecule source files
- [ ] All visuals use Phase 1 CSS vars (no hex values)
- [ ] Molecules compose only Phase 2 atoms + HTML
- [ ] Each molecule has unit tests: happy path, edge, error/disabled