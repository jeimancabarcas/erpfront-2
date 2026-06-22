# Design: Atomic UI Redesign — Phase 4 Layout Organisms

## Technical Approach

Replace MatSidenav/MatToolbar/MatGrid with 3 standalone organisms built on existing atoms and molecules. Organisms are data-driven, fully token-compliant, and implement responsive behavior via CSS media queries + Angular `@media` bindings. `OnPush` change detection throughout.

## Architecture Decisions

### Decision: Sidebar expansion state ownership

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep `SidebarService` managing expansions | Tight coupling, service persists across route changes | Rejected — organism should be self-contained |
| Local `signal<Set<string>>` for expanded groups | Pure input→output, parent tracks state if needed | **Chosen** — groups keyed by `label`, toggled internally |

### Decision: User dropdown implementation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Extract `UserMenuMolecule` | Phase 3 scope, not yet built; would block this phase | Rejected |
| Inline dropdown in header | Self-contained, <40 LOC, can extract later | **Chosen** — keep it simple now, refactor if reused |

### Decision: Columns constraint strategy in CardGrid

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `grid-template-columns: repeat(N, 1fr)` | Exact count, breaks at narrow viewports without media queries | Rejected — too rigid |
| `auto-fill` + `max-width` on cards | Adaptive, respects columns input via max-width calc | **Chosen** — `repeat(auto-fill, minmax(280px, 1fr))` + `max-width: calc(100% / N)` |

## Data Flow

```
                    ┌──────────────────────┐
                    │   NavigationLayout    │
                    │   (parent template)   │
                    └──┬───────┬────────┬──┘
                       │       │        │
              ┌────────▼──┐ ┌──▼────┐ ┌─▼──────────┐
              │AppSidebar │ │Header │ │ <router-   │
              │Organism   │ │Organ- │ │ outlet>     │
              │           │ │ism    │ │ (page area) │
              └────────┬──┘ └───────┘ └─────────────┘
                       │
         ┌─────────────┼──────────────┐
         ▼             ▼              ▼
   MenuItemMolecule  BadgeAtom   LogoComponent
   (routerLink +     (counter)   (top slot)
    routerLinkActive)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/organisms/app-sidebar/app-sidebar.component.ts` | Create | Data-driven sidebar with collapsible groups |
| `src/app/components/organisms/app-sidebar/app-sidebar.component.scss` | Create | Token-based styles, responsive overlay variant |
| `src/app/components/organisms/app-header/app-header.component.ts` | Create | Sticky header with nav + search + user menu |
| `src/app/components/organisms/app-header/app-header.component.scss` | Create | Token-based styles, sticky positioning, dropdown |
| `src/app/components/organisms/card-grid/card-grid.component.ts` | Create | CSS Grid card container with loading/empty states |
| `src/app/components/organisms/card-grid/card-grid.component.scss` | Create | Grid layout, responsive columns, skeleton states |
| `src/app/components/atoms/logo/logo.component.ts` | Modify | Switch hardcoded colors to `var(--color-*)` tokens |

## Interfaces / Contracts

```typescript
// Shared — placed in each organism file or a shared model file

export interface MenuGroup {
  label: string;
  icon: string;
  items: MenuItemDef[];
  badge?: number;
}

export interface MenuItemDef {
  label: string;
  icon: string;
  routerLink: string;
  badge?: number;
  disabled?: boolean;
}

export interface UserInfo {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface CardItem {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
}
```

## Responsive Strategy

| Breakpoint | Sidebar | Header | CardGrid |
|------------|---------|--------|----------|
| <768px | Overlay w/ backdrop, hamburger toggle | Show hamburger, hide search bar | 1 column |
| 768px–1024px | Fixed 256px | Show all controls | 2 columns |
| 1024px–1440px | Fixed 256px | Show all controls | 3 columns |
| >1440px | Fixed 256px | Show all controls | 3–4 columns |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Sidebar: menu group toggle, active route highlight, mobile open/close | Input→DOM assertions, router mock |
| Unit | Header: back/forward, hamburger emits toggleSidebar, user dropdown open/close | Click events, output spy |
| Unit | CardGrid: columns mapping, skeleton count when loading, empty message, loadMore emit | Input variations, computed assertions |
| Integration | Sidebar + header interaction (hamburger toggles sidebar mobileOpen) | Parent test harness |

## Migration / Rollout

No migration required. Components are new — existing `SidebarComponent` (MatSidenav) continues working. Phase 5 swaps the old sidebar import for the new organism.

## Open Questions

- [ ] LogoComponent needs tokens — will the logo redesign affect other consumers?
- [ ] Is the existing `SidebarService` still needed after migration, or should its auto-expand logic move into the consumer?
- [ ] CardGrid load-more button — should it use `@defer` or a simple `*ngIf` on `hasMore`?
