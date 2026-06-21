## Exploration: Menu Reorganization

### Current State
Currently, the sidebar menu has a nested structure where the "Ventas" (Sales) and "Compras" (Purchases) links are integrated under the "Inventario" (Inventory) accordion. This nesting is reflected both in the template logic of `SidebarComponent` (which groups them inside the `<mat-expansion-panel>` for Inventario) and in the component's active-state checks (e.g., `isInventoryActive()` returns true if the current URL contains `/sales` or `/inventory`).

Specifically, the "Ventas" link leads to `/sales` (pointing to `SalesPageComponent`) and "Compras" leads to `/inventory/purchases` (pointing to `InventoryPurchasesPageComponent`), creating a mix of routes from different root contexts inside the same accordion.

### Affected Areas
- `src/app/components/organisms/sidebar/sidebar.component.ts` — The sidebar template, styles, and active-state checking methods (`isInventoryActive()`, `isSalesActive()`) will need modification to restructure how Ventas, Compras, and Inventario are presented.
- `src/app/app.routes.ts` — While the routing definitions themselves are clean, we must verify if any layout-level route grouping or guards need adjustments when the menu structure changes.

### Approaches
1. **Flat / Semi-Flat Module Separation** — Separate "Ventas" and "Compras" into their own standalone sidebar entries or dedicated collapsible modules, leaving "Inventario" purely for inventory operations (Summary, Categories, Products, Suppliers).
   - **Pros**:
     - Cleaner separation of concerns; Sales/Ventas and Purchases/Compras are distinct business domains from Inventory/Inventario.
     - Better align routes (`/sales` and `/inventory/purchases`) with logical top-level modules.
     - Improves usability by reducing accordion nesting depth.
   - **Cons**:
     - Increases the number of root-level items in the sidebar, which may clutter the UI if more modules are added.
   - **Effort**: Low

2. **Grouped Commercial Module (Ventas & Compras unified)** — Group Ventas and Compras under a single "Comercial" or "Operaciones" collapsible module, while keeping "Inventario" separate.
   - **Pros**:
     - Groups transactional/commercial views together.
     - Keeps the sidebar compact.
   - **Cons**:
     - Adds another layer of grouping that users might not expect.
     - Requires renaming or redefining the logical domain grouping.
   - **Effort**: Low

### Recommendation
Option 1 (Flat / Semi-Flat Module Separation) is recommended. "Ventas" should be moved to a top-level sidebar link (similar to Clientes and Transporte) or grouped under a "Ventas" module (along with Clientes, as Clientes is currently at `/sales/customers`). "Compras" should be moved out of "Inventario" and either placed under a dedicated module or grouped logically with other purchasing features. This matches standard ERP patterns where Sales, Purchasing, and Inventory are top-level functional modules.

### Risks
- **Active State Detection**: Moving links around means the `isInventoryActive()` and `isSalesActive()` logic in the sidebar component needs to be rewritten carefully to avoid visual selection bugs (e.g., highlighting the wrong accordion or multiple accordions simultaneously).
- **Deep-linking UX**: Users bookmarked or accustomed to the existing URL structure should not be broken, as we only reorganize the navigation structure, keeping routes the same.

### Ready for Proposal
Yes — The sidebar component structure is simple, well-defined, and ready to be reorganized. The orchestrator should proceed to define the proposal for how the menu should be structured.
