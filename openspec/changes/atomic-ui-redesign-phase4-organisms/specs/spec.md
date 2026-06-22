# Layout Organisms Specification — Phase 4

## Purpose

Defines 3 layout organisms forming the application shell. Replaces MatSidenav, MatToolbar, and grid patterns with custom components using design tokens.

## AppSidebarOrganism

### Requirement: Data-Driven Collapsible Sidebar

The sidebar MUST render from `MenuItemDefinition[]` input. It MUST support collapsible section groups, `routerLinkActive` highlighting, counter badges, and a logo slot. Desktop (≥768px): fixed 256px panel. Mobile: overlay, closes on backdrop or menu-item click. Role: `navigation` with `aria-label`.

#### Scenario: Desktop with active route highlight

- GIVEN viewport ≥768px, Ventas route /sales
- WHEN the user navigates to /sales
- THEN the sidebar renders as a 256px fixed panel
- AND Ventas MUST be highlighted via `routerLinkActive`

#### Scenario: Mobile overlay closes on backdrop click

- GIVEN viewport <768px, sidebar overlay is open
- WHEN the user clicks the backdrop
- THEN the sidebar MUST close

#### Scenario: Collapsible section with badge

- GIVEN an Inventario section with 3 sub-items and badge value 5
- WHEN the user clicks the section header
- THEN it MUST expand to show sub-items
- AND the badge SHALL display "5"

## AppHeaderOrganism

### Requirement: Sticky Application Header

Sticky bar (height 64px, bg `--color-surface`, `border-bottom` `--color-border`). Includes back/forward navigation, centered SearchBarMolecule, user menu (avatar + dropdown). Mobile: hamburger toggles sidebar. Role: `banner`.

#### Scenario: Header renders all controls

- GIVEN the user is logged in with browser history
- WHEN the header renders
- THEN back/forward buttons, search bar, and user avatar SHALL be visible
- AND clicking the avatar SHALL open a dropdown with Profile, Settings, Logout

#### Scenario: Hamburger toggles sidebar on mobile

- GIVEN viewport <768px
- WHEN the user clicks the hamburger button
- THEN the sidebar SHALL open
- AND clicking again SHALL close it

#### Scenario: Stays sticky on scroll

- GIVEN page content exceeds viewport
- WHEN the user scrolls down
- THEN the header MUST remain at the top
- AND keep `--color-surface` bg with `--color-border` bottom border

## CardGridOrganism

### Requirement: Configurable Responsive Card Grid

CSS Grid container for ContentCardMolecule items. Inputs: `items`, `columns` (1-4), `loading`, `emptyMessage`, `hasMore`. Output: `loadMore`. Grid gap: `--spacing-6`. Columns default to `auto-fill`, overridable via input.

#### Scenario: Renders in specified column count

- GIVEN items = 4 cards and columns = 2
- WHEN the component renders
- THEN the grid SHALL display 4 cards in 2 columns
- WITH gap `--spacing-6`

#### Scenario: Loading shows skeleton placeholders

- GIVEN loading = true and items = []
- WHEN the component renders
- THEN SkeletonAtom cards SHALL fill the grid
- AND no ContentCardMolecule SHALL appear

#### Scenario: Load more pagination

- GIVEN items = 8 and hasMore = true
- WHEN the user clicks "Load More"
- THEN the component SHALL emit `loadMore`
- AND show a loading indicator until new items arrive

## Non-functional Requirements

### NFR-01: Token Compliance
All organisms MUST use `@theme` tokens for colors, spacing, typography, shadows. No hardcoded values.

### NFR-02: Dark Mode
All MUST render correctly under `.dark`. Backgrounds, text, borders, shadows MUST switch to dark token values.

### NFR-03: Accessibility
Sidebar: `role="navigation"` + `aria-label`. Header: `role="banner"`. All interactive elements MUST be keyboard-operable.

### NFR-04: Change Detection
Sidebar and Header MUST use `OnPush`. CardGrid SHOULD track items by identity.

## Component Contracts

| Component | Inputs | Outputs |
|---|---|---|
| AppSidebarOrganism | `menuItems: MenuItemDefinition[]`, `logoUrl?: string` | `menuItemClick: MenuItemDefinition` |
| AppHeaderOrganism | `user: UserProfile`, `searchPlaceholder?: string` | `toggleSidebar`, `search: string`, `logout` |
| CardGridOrganism | `items: CardItem[]`, `columns: number`, `loading: boolean`, `emptyMessage: string`, `hasMore: boolean` | `loadMore` |

## Navigation Layout (Preserved)

The `navigation-layout` spec (menu order, accordion state, route highlighting) is preserved. No requirement changes — implementation migrates from MatSidenav to AppSidebarOrganism. Existing scenarios SHALL pass unchanged.
