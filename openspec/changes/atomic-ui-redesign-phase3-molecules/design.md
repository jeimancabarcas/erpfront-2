# Design: Phase 3 — Composed Molecules

## Technical Approach

8 standalone Angular molecules composing Phase 2 atoms under `src/app/components/molecules/`. Each molecule follows the same structure as atoms: `.ts` (inline template + signal inputs) + `.scss` (token-only via `styleUrl`), OnPush change detection, zero Material imports. Icons use inline SVGs to avoid `MatIconModule` dependency in molecule source files.

Dark mode is automatic — `.dark` ancestor overrides CSS vars.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|---|---|
| **Icon strategy** | Inline SVG templates | `MatIconModule` import, IconAtom | Zero Material imports in molecules. Inline keeps each molecule self-contained. SVGs for 6 icons total (search, chevron, arrow up/down, close, sort) |
| **SearchBar InputAtom** | CSS override in molecule SCSS | New `borderless` variant on InputAtom | InputAtom API is stable (Phase 2 shipped). A molecule-level SCSS override avoids changing the atom contract |
| **ConfirmDialog focus trap** | Template refs + native `focus()` | CDK FocusTrap, custom directive | Zero CDK import rule. Only 2 focusable elements (confirm/cancel buttons) — native is simplest |
| **DataTable paginator** | Inline HTML template | Dedicated PaginatorAtom | Proposal lists 7 atoms, not 8. Prev/Next buttons + page info is simple enough for inline template |
| **StatsGrid icon** | Content-projected `[icon]` slot | `icon` string input + SVG map | Keeps grid flexible — consumer provides any icon (inline SVG, mat-icon, etc.) without coupling |

## Data Flow

```
User Interaction → Molecule Handler → Atom Input Binding → Atom Renders
                      ↓
                 Output emit → Parent Component (via @Output)
```

All molecules are presentation components. No service injection, no side effects. State flows down via inputs, events flow up via outputs. Molecules mediate between parent and atoms — they translate user events into structured outputs (e.g., SearchFilters debounces and emits `Record<string, string>`).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/molecules/menu-item/menu-item.component.ts` | Create | MenuItemMolecule — nav item with icon/label/badge/active |
| `src/app/components/molecules/menu-item/menu-item.component.scss` | Create | Token-driven pill styles, hover/active/disabled states |
| `src/app/components/molecules/search-bar/search-bar.component.ts` | Create | SearchBarMolecule — pill input with icon + keyboard hint |
| `src/app/components/molecules/search-bar/search-bar.component.scss` | Create | Pill container, focus ring, responsive hint |
| `src/app/components/molecules/content-card/content-card.component.ts` | Create | ContentCardMolecule — image + text card |
| `src/app/components/molecules/content-card/content-card.component.scss` | Create | 70/30 split card with hover shadow lift |
| `src/app/components/molecules/page-header/page-header.component.ts` | Create | PageHeaderMolecule — title + desc + breadcrumb/actions slots |
| `src/app/components/molecules/page-header/page-header.component.scss` | Create | Responsive flex layout, typography tokens |
| `src/app/components/molecules/search-filters/search-filters.component.ts` | Create | SearchFiltersMolecule — configurable filter bar |
| `src/app/components/molecules/search-filters/search-filters.component.scss` | Create | Horizontal→vertical responsive layout |
| `src/app/components/molecules/data-table/data-table.component.ts` | Create | DataTableMolecule — sort/paginate/select/loading/empty |
| `src/app/components/molecules/data-table/data-table.component.scss` | Create | Table styles, sort indicators, responsive overflow |
| `src/app/components/molecules/confirm-dialog/confirm-dialog.component.ts` | Create | ConfirmDialogMolecule — modal with backdrop |
| `src/app/components/molecules/confirm-dialog/confirm-dialog.component.scss` | Create | Backdrop, centered card, focus trap |
| `src/app/components/molecules/stats-grid/stats-grid.component.ts` | Create | StatsGridMolecule — responsive KPI grid |
| `src/app/components/molecules/stats-grid/stats-grid.component.scss` | Create | CSS grid, card layout, trend indicators |

**16 files total** (8 `.ts` + 8 `.scss`).

## Molecule Specifications

### 1. MenuItemMolecule — `<ui-menu-item>`

**Atom deps**: `<ui-badge variant="counter" size="sm" [count]="count">`

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `icon` | `input<string>` | Material icon name for inline SVG |
| `label` | `input<string>` | Menu item text |
| `count` | `input<number>` | Optional counter badge (0 = hidden) |
| `active` | `input(false)` | Active route state |
| `disabled` | `input(false)` | Disabled state |
| `routerLink` | `input<string>` | Router navigation path |
| `clicked` | `output<void>` | Click event |

**States**: `default` (transparent bg, primary text) → `active` (`--color-interactive-active` bg, `--color-accent` text, `aria-current="page"`) → `disabled` (opacity 0.5, `pointer-events: none`, `aria-disabled="true"`) → `hover` (`--color-interactive-active` bg when not active/disabled)

**Token usage**: `--color-interactive-active` (hover/active bg), `--color-accent` (active text), `--color-text-primary` (default text), `--color-text-secondary` (icon tint), `--radius-pill` (shape), `--spacing-3` (padding), `--duration-fast` (transition), `--font-sans`, `--text-sm`

**Template**: `<a>` or `<button>` depending on `routerLink`, wrapping inline SVG icon + `<span>` label + `<ui-badge>` for count. Uses `RouterLink` directive when `routerLink` is set.

**A11y**: `role="menuitem"`, `aria-current="page"` when active, `aria-disabled="true"` when disabled.

---

### 2. SearchBarMolecule — `<ui-search-bar>`

**Atom deps**: `<ui-input>` (borderless override via CSS)

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `placeholder` | `input('Buscar...')` | Input placeholder |
| `value` | `input<string>` | Controlled value |
| `valueChange` | `output<string>` | Emitted on input |

**States**: `default` (`--color-surface` bg, `--color-border` border) → `focus-within` (border→`--color-accent`, `--shadow-md`) over `--duration-fast`

**Token usage**: `--color-surface` (bg), `--color-border` (border), `--color-accent` (focus border), `--color-text-secondary` (hint text), `--radius-pill` (shape), `--shadow-sm` (default), `--shadow-md` (focus), `--spacing-3` (padding), `--duration-fast` (transition)

**Template**: Container div with search icon (inline SVG) + `<ui-input>` (borderless — SCSS override: `border-bottom: none`, remove label offset) + keyboard hint `<kbd>` span.

**Keyboard hint**: `<kbd class="hint">⌘K</kbd>`, hidden via `@media (max-width: 767px)` in SCSS.

**A11y**: `role="search"`, `aria-label="Buscar"` on container.

---

### 3. ContentCardMolecule — `<ui-content-card>`

**Atom deps**: `<ui-card>`

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `title` | `input<string>` | Card title |
| `subtitle` | `input<string>` | Optional subtitle |
| `imageUrl` | `input<string>` | Optional image URL |
| `routerLink` | `input<string>` | Navigation link |
| `clicked` | `output<void>` | Click emission |

**Template**: `<ui-card>` with inline image placeholder div (70%) + text block (30%). Image uses `<img>` when `imageUrl` set, otherwise styled placeholder. Text block: `<h3>` title + `<p>` subtitle.

**Image placeholder**: Height ratio via `aspect-ratio: 16/9`, `--color-border` background, `border-radius: var(--radius-lg) var(--radius-lg) 0 0`.

**States**: `default` → `hover` (shadow lifts from `--shadow-sm` to `--shadow-md` via `--duration-slow`)

**Token usage**: `--color-border` (img placeholder), `--color-surface` (text bg), `--color-text-primary` (title), `--color-text-secondary` (subtitle), `--color-accent` (hover border tint), `--text-lg` / `--font-bold` (title), `--text-sm` (subtitle), `--spacing-4` (padding), `--radius-lg` (top radius), `--shadow-sm` / `--shadow-md`, `--duration-slow`

**A11y**: `role="article"`, entire card focusable when `routerLink` or `clicked` output bound, `tabindex="0"`.

---

### 4. PageHeaderMolecule — `<ui-page-header>`

**Atom deps**: None (uses native HTML + slots)

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `title` | `input<string>` | Page heading |
| `description` | `input<string>` | Optional subtitle |
| `[breadcrumb]` | Slot | Content projected above title |
| `[actions]` | Slot | Content projected at right (desktop) or below (mobile) |

**Template**: `<header>` element. Optional breadcrumb slot → `<h1>` title → `<p>` description → `<div class="actions">` slot.

**Layout**: Desktop = flex row with actions right-aligned; mobile = column via `@media (max-width: 767px)`.

**Token usage**: `--text-3xl` / `--font-extrabold` / `--leading-tight` / `--color-text-primary` (title), `--text-sm` / `--color-text-secondary` (description), `--spacing-10` (margin-bottom on header)

---

### 5. SearchFiltersMolecule — `<ui-search-filters>`

**Atom deps**: `<ui-input>`, `<ui-select>`, `<ui-button variant="ghost">` (clear)

**Interfaces**:
```typescript
interface SelectOption { value: string; label: string; }
interface FilterDefinition {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: SelectOption[];
}
```

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `filters` | `input<FilterDefinition[]>` | Filter configuration |
| `filtersChange` | `output<Record<string, string>>` | Debounced filter values |
| `clear` | `output<void>` | Clear all filters |

**Template**: `<ui-card>` container. `@for` over filters → render `<ui-input>` for `'text'`, `<ui-select>` for `'select'`, native `<input type="date">` for `'date'`. Clear button at end.

**Debounce**: 400ms using internal `effect()` or `setTimeout` + cleanup. Filters stored as plain signal `Record<string, string>`.

**Layout**: Desktop = `display: flex; flex-wrap: wrap; gap: var(--spacing-4);`. Mobile = column via `flex-direction: column`.

**States**: `default` (surface bg, border, shadow) → `filter-active` (when any filter has value)

**Token usage**: `--color-surface` (card bg), `--color-border` (card border), `--radius-xl` (card radius), `--shadow-sm`, `--spacing-6` (card padding), `--spacing-4` (gap), `--duration-fast`

**A11y**: Role `[attr.aria-label]` on card, form labels via atom inputs.

---

### 6. DataTableMolecule — `<ui-data-table>`

**Atom deps**: `<ui-skeleton variant="table-row">`, `<app-empty-state>` (existing atom)

**Interfaces**:
```typescript
interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}
```

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `columns` | `input<ColumnDef[]>` | Column definitions |
| `data` | `input<any[]>` | Table data |
| `loading` | `input(false)` | Skeleton state |
| `sortBy` | `input<string>` | Current sort column |
| `sortOrder` | `input<'ASC' \| 'DESC'>` | Current sort direction |
| `selectable` | `input(false)` | Row selection mode |
| `emptyMessage` | `input('No data')` | Empty state message |
| `sortChange` | `output<{ column: string, order: 'ASC' \| 'DESC' }>` | Sort toggle |
| `rowClick` | `output<any>` | Row click |
| `selectionChange` | `output<any[]>` | Selected rows |

**Template**:
- **Loading**: 5 rows of `<ui-skeleton variant="table-row">` with `aria-busy="true"` on table
- **Empty**: `<app-empty-state>` with `emptyMessage` as description
- **Data**: `<table>` with `<thead>` (column headers with sort indicators) + `<tbody>` (data rows). If `selectable`, first column has `<input type="checkbox">`

**Sort indicator**: Inline SVG chevron icons on sortable headers. Click toggles ASC/DESC/off.

**Paginator**: Inline Prev/Next buttons using `<ui-button variant="ghost" size="sm">` + page info span.

**Responsive**: `<div class="table-wrapper" style="overflow-x: auto">` wraps the table.

**States**: Data, Loading (5 skeleton rows), Empty (empty-state atom), Error (via empty-state with error msg)

**Token usage**: `--color-border` (header bottom border, cell bottom border), `--color-text-secondary` (header text), `--color-text-primary` (cell text), `--color-interactive-active` (row hover), `--color-accent` (sort indicator), `--text-xs` / `--font-bold` (header), `--text-sm` (cell), `--spacing-4` (cell padding), `--duration-fast` (row hover transition)

**A11y**: `role="table"` on `<table>`, `role="columnheader"` on `<th>`, `aria-sort` on sortable headers (`"ascending"` / `"descending"` / `"none"`), `aria-busy="true"` when loading. Checkboxes have `<label>` with visually-hidden text.

---

### 7. ConfirmDialogMolecule — `<ui-confirm-dialog>`

**Atom deps**: `<ui-card>`, `<ui-button variant="primary">`, `<ui-button variant="secondary">`

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `open` | `input(false)` | Dialog visibility |
| `title` | `input<string>` | Dialog title |
| `message` | `input<string>` | Dialog body text |
| `confirmLabel` | `input('Confirmar')` | Confirm button text |
| `cancelLabel` | `input('Cancelar')` | Cancel button text |
| `variant` | `input<'default' \| 'danger'>` | Visual variant |
| `confirm` | `output<void>` | Confirm emitted |
| `cancel` | `output<void>` | Cancel emitted |

**Template**: Conditionally rendered (`@if(open())`): backdrop `<div>` (fixed, full-screen, `--color-bg` 50% opacity) + centered `<ui-card>`. Card contains: `[header]` slot (title `#dialog-title`) + `[body]` slot (message `#dialog-message`) + `[footer]` slot (cancel → confirm buttons). Escape key emits cancel via `@HostListener('document:keydown.escape')`.

**Focus trap**: `@if(open())` sets a template ref variable on confirm button, then `ngAfterViewInit` calls `confirmBtn.nativeElement.focus()`. Tab cycles between the two buttons.

**States**: `closed` (hidden), `open` (visible with backdrop), `danger` (confirm button uses `--color-error` bg via class)

**Token usage**: `--color-bg` (backdrop at 50% opacity), `--color-surface` (card bg), `--color-text-primary` (title), `--color-text-secondary` (message), `--color-error` (danger variant), `--radius-xl` (card radius), `--shadow-xl` (card shadow), `--spacing-6` (message margin), `z-index: 50`

**A11y**: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`, `aria-describedby="dialog-message"`. Focus trapped inside dialog when open.

---

### 8. StatsGridMolecule — `<ui-stats-grid>`

**Atom deps**: `<ui-card>`

**Interfaces**:
```typescript
interface StatItem {
  label: string;
  value: number;
  icon?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
}
```

**Component API**:

| Member | Type | Description |
|--------|------|-------------|
| `stats` | `input<StatItem[]>` | KPI data array |
| `cardClick` | `output<number>` | Card index on click |

**Template**: CSS Grid container. `@for` over `stats` → each card is `<ui-card>` with flex row: icon placeholder (48px circle, `--color-accent` at 10% opacity bg, inline SVG) + text group (value + label). Trend indicator: inline arrow SVG + percentage text.

**Grid**: `display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--spacing-6)`

**States**: `default` → `hover` (subtle translateY(-2px) + shadow transition over `--duration-slow`). Trend: up = `--color-success` arrow, down = `--color-error` arrow.

**Token usage**: `--spacing-6` (grid gap), `--color-accent` (icon bg at 10%), `--color-text-primary` (value), `--color-text-secondary` (label), `--color-success` (trend up), `--color-error` (trend down), `--text-2xl` / `--font-extrabold` (value), `--text-xs` (label uppercase), `--shadow-sm` / `--shadow-md` (hover lift), `--duration-slow` (hover transition)

## Token Usage Summary

| Token | MenuItem | SearchBar | ContentCard | PageHeader | SearchFilters | DataTable | ConfirmDialog | StatsGrid |
|-------|----------|-----------|-------------|------------|---------------|-----------|---------------|-----------|
| `--color-bg` | | | | | | | backdrop 50% | |
| `--color-surface` | | container bg | text bg | | card bg | | card bg | |
| `--color-text-primary` | label | input text | title | title | | cell text | title | value |
| `--color-text-secondary` | icon | hint | subtitle | description | | header text | message | label |
| `--color-accent` | active text | focus border | | | | sort icon | | icon bg |
| `--color-interactive-active` | hover/active bg | | | | | row hover | | |
| `--color-border` | | default border | img placeholder | | card border | header/cell border | | |
| `--color-error` | | | | | | | danger confirm | trend down |
| `--color-success` | | | | | | | | trend up |
| `--shadow-sm` | | default | default | | card | | | default |
| `--shadow-md` | | focus | hover | | | | | hover |
| `--shadow-xl` | | | | | | | card shadow | |
| `--radius-pill` | shape | shape | | | | | | |
| `--radius-lg` | | | img top | | | | | |
| `--radius-xl` | | | | | card | | card | card |
| `--spacing-3` | padding | padding | | | | | | |
| `--spacing-4` | | | text padding | | gap | cell padding | | |
| `--spacing-6` | | | | | card padding | | message margin | grid gap |
| `--spacing-10` | | | | mb | | | | |
| `--duration-fast` | transitions | transitions | | | | row hover | transitions | |
| `--duration-slow` | | | shadow | | | | | hover lift |
| `--text-xs` | | | | | | header | | label |
| `--text-sm` | | | subtitle | description | | cell text | message | |
| `--text-lg` | | | title | | | | title | |
| `--text-2xl` | | | | | | | | value |
| `--text-3xl` | | | | title | | | | |
| `--font-bold` | | | title | | | header | title | |
| `--font-extrabold` | | | | title | | | | value |
| `--leading-tight` | | | | title | | | | |

## Interfaces / Contracts

```typescript
// SearchFilters
interface SelectOption { value: string; label: string; }
interface FilterDefinition {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: SelectOption[];
}

// DataTable
interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

// StatsGrid
interface StatItem {
  label: string;
  value: number;
  icon?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Each molecule | Render with default inputs, verify DOM output |
| State | States per molecule | Toggle active/disabled/loading/open, verify CSS class + ARIA |
| Events | Click/keyboard/outputs | Simulate user events, verify output emissions |
| Dark mode | All molecules | Render inside `.dark` parent, verify token inheritance |
| Responsive | SearchBar, PageHeader, SearchFilters, DataTable, StatsGrid | Resize viewport (CSS media query assertions via `matchMedia` mock) |
| A11y | Interactive molecules | Verify `role`, `aria-*` attributes, keyboard handlers |

## Migration / Rollout

No migration required. New molecules alongside existing code. The `molecules/` directory already exists and houses 24 existing molecules — these 8 new ones follow the same structure with stricter token-only and zero-Material conventions.

## Open Questions

- None identified at design time.
