# Proposal: Menu Reorganization

## Intent
Improve the ERP navigation hierarchy by separating Sales (Ventas) and Purchases (Compras) from Inventory (Inventario). This simplifies the layout, removes nested accordions, and groups business domains logically.

## Scope

### In Scope
- Move "Ventas" and "Compras" links from the "Inventario" accordion to root-level options in the sidebar.
- Move "Categorías", "Productos", and "Proveedores" directly under the "Inventario" accordion.
- Remove the nested "Configuración" accordion inside "Inventario".
- Reorganize the menu order to: Inicio -> Clientes -> Ventas -> Compras -> Inventario -> Finanzas -> Pediatría -> Transporte.
- Update active state highlighting logic (`isInventoryActive()`) to prevent overlap and incorrect highlighting.
- Configure the "Inventario" accordion to start collapsed by default.
- Maintain existing styles, icons (`payments` for Ventas, `shopping_cart` for Compras), and Tailwind classes.

### Out of Scope
- Modifying route definitions, page views, or component routes.
- Changing icons or global CSS/Tailwind configuration colors.

## Capabilities

### New Capabilities
- `navigation-layout`: Define the new sidebar menu structure and active routing highlighted states.

### Modified Capabilities
None

## Approach
- Modify `src/app/components/organisms/sidebar/sidebar.component.ts` HTML template to relocate items and remove the inner `mat-accordion` for Configuración.
- Update CSS classes in the template to apply root-level formatting (`!h-14 hover:!bg-gray-100`) to Ventas and Compras, and sub-menu formatting (`!h-12 hover:!bg-gray-50`) to the promoted inventory items.
- Remove the `[expanded]="isInventoryActive()"` binding from the Inventario `mat-expansion-panel` so it starts collapsed by default.
- Clean up unused CSS class rules for `.inner-accordion`.
- Refactor active state checks:
  - Update `isInventoryActive()` to return true if the URL starts with `/inventory` but not `/inventory/purchases`.
  - Remove `isInventorySettingsActive()` and `isSalesActive()` if no longer needed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/components/organisms/sidebar/sidebar.component.ts` | Modified | Structure, styling, and active state methods. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Multi-accordion highlighting | Low | Refactor `isInventoryActive()` to exclude Compras (`/inventory/purchases`). |
| Collapsed accordion hiding active route | Low | Keep header text/icon highlighted if route is active, even if panel is collapsed. |

## Rollback Plan
Discard working directory changes in `src/app/components/organisms/sidebar/sidebar.component.ts` using `git checkout` or `git restore`.

## Dependencies
None.

## Success Criteria
- [ ] Sidebar menu order matches the requested sequence.
- [ ] "Ventas" and "Compras" are root-level options with correct icons and root styling.
- [ ] "Configuración" accordion is removed; its sub-items are under "Inventario".
- [ ] "Inventario" accordion is collapsed by default on page load.
- [ ] Selecting "Ventas" or "Compras" does not highlight "Inventario" or expand its accordion.
- [ ] Navigation functions properly and styling matches the rest of the application.
