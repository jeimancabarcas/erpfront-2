# Design: Menu Reorganization

## Technical Approach
Reorganize the main sidebar navigation to improve user experience. This changes Ventas and Compras from sub-items in the Inventario accordion to root-level items. It also flattens the Inventario sub-menu by promoting Categorías, Productos, and Proveedores and removing the nested Configuración accordion panel. The Inventario accordion panel will remain collapsed on load, highlighting its header icon/text only if an inventory route is active. Redundant TS active-state check methods will be removed.

## Architecture Decisions

### Decision 1: Navigation Layout & Hierarchy
| Option | Tradeoff | Decision |
| :--- | :--- | :--- |
| **Keep current hierarchy** | High nesting depth (3 levels under Configuración) leads to excessive click fatigue and hides key modules like Ventas/Compras. | **Flattened root-level and promoted sub-items**: Promote Ventas and Compras to root level. Remove inner Configuración accordion and place Categorías, Productos, and Proveedores directly inside the Inventario panel. |

### Decision 2: Accordion Behavior
| Option | Tradeoff | Decision |
| :--- | :--- | :--- |
| **Auto-expanded panel** (`[expanded]="isInventoryActive()"`) | Automatically shows sub-items if active, but can overwhelm the navigation menu layout on load. | **Collapsed by default**: Remove `[expanded]` property from the Inventario panel so it remains collapsed on page load and expands only upon explicit click. |

### Decision 3: Active Route Highlighting Logic
| Option | Tradeoff | Decision |
| :--- | :--- | :--- |
| **Custom active state methods** (`isSalesActive()`, `isInventorySettingsActive()`) | Redundant class logic that replicates standard Angular routing features. | **Built-in `routerLinkActive` & clean TS**: Highlight root-level items using template `routerLinkActive`. Delete `isSalesActive()` and `isInventorySettingsActive()`. Refactor `isInventoryActive()` to verify URL matching `/inventory/*` paths except `/inventory/purchases`. |

## Data Flow
The sidebar listens to the Angular router's active route via `RouterLinkActive` and the `Router` service.
```
  [Router Navigation Event]
            │
            ├────────► [routerLinkActive] ────────► Active class applied to Root items (e.g. Ventas)
            │
            └────────► [Router.url] ──────────────► isInventoryActive() check ──► Highlights Inventario header
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/organisms/sidebar/sidebar.component.ts` | Modify | Adjust HTML template layout, update Tailwind classes for promoted sub-menu items, and clean up TS active check methods. |
| `src/app/components/organisms/sidebar/sidebar.component.spec.ts` | Create | Unit tests to verify correct navigation ordering, collapsing default behavior, and active route highlighting checks. |

## Interfaces / Contracts

The refactored `isInventoryActive` method signature and logic:
```typescript
isInventoryActive(): boolean {
  const url = this.router.url;
  const paths = ['/inventory', '/inventory/categories', '/inventory/products', '/inventory/suppliers'];
  return paths.some(path => url === path || url.startsWith(path + '/')) && !url.includes('/inventory/purchases');
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Sidebar component structure, default state, and active highlighting. | Test using Vitest and `TestBed`. Verify menu ordering. Verify Inventario is collapsed by default. Mock `Router.url` to verify `isInventoryActive()` returns true for categories, products, suppliers, and false for purchases/sales. |

## Migration / Rollout
No migration required.

## Open Questions
None.
