# Navigation Layout Specification

## Purpose

Defines the structure, behavior, and visual highlighting states of the main sidebar navigation layout.

## Requirements

### Requirement: Sidebar Menu Structure

The sidebar menu SHALL be ordered as follows:
1. Inicio
2. Clientes
3. Ventas
4. Compras
5. Inventario
6. Finanzas
7. Pediatría
8. Transporte

Ventas and Compras MUST be root-level entries directly under the main sidebar container.
Categorías, Productos, and Proveedores MUST be placed directly inside the Inventario accordion, removing the nested Configuración accordion panel.

#### Scenario: Verify order and hierarchy of sidebar elements
- GIVEN the user has loaded the application
- WHEN the sidebar navigation menu is visible
- THEN the menu list sequence SHALL display as Inicio, Clientes, Ventas, Compras, Inventario, Finanzas, Pediatría, and Transporte
- AND Ventas and Compras SHALL appear as root-level items
- AND Categorías, Productos, and Proveedores SHALL be direct child elements under the Inventario accordion header, with no nested Configuración panel

### Requirement: Inventario Accordion State

The Inventario accordion panel MUST start collapsed by default. The accordion MUST expand only when explicitly clicked by the user.

#### Scenario: Accordion collapsed on default load
- GIVEN the user loads any page in the application
- WHEN the sidebar is rendered
- THEN the Inventario accordion MUST be in a collapsed state

#### Scenario: Expand accordion on click
- GIVEN the Inventario accordion is collapsed
- WHEN the user clicks the Inventario header
- THEN the Inventario accordion MUST expand to show its sub-items

### Requirement: Active Route Highlighting

When a route is active, its header link in the sidebar MUST be highlighted.

Specifically:
- When the active route is Ventas (/sales), the Ventas sidebar item MUST be highlighted, and the Inventario accordion MUST NOT highlight and MUST NOT auto-expand.
- When the active route is Compras (/inventory/purchases), the Compras sidebar item MUST be highlighted, and the Inventario accordion MUST NOT highlight and MUST NOT auto-expand.
- When the active route is Inventario Resumen (/inventory), Categories (/inventory/categories), Products (/inventory/products), or Suppliers (/inventory/suppliers), the Inventario item header MUST be highlighted, but the accordion panel MUST start collapsed on initial load.

#### Scenario: Highlight active Ventas route
- GIVEN the user navigates to the Ventas route (/sales)
- WHEN the sidebar renders
- THEN the Ventas menu item MUST be highlighted
- AND the Inventario accordion header MUST NOT be highlighted
- AND the Inventario accordion panel MUST NOT auto-expand

#### Scenario: Highlight active Compras route
- GIVEN the user navigates to the Compras route (/inventory/purchases)
- WHEN the sidebar renders
- THEN the Compras menu item MUST be highlighted
- AND the Inventario accordion header MUST NOT be highlighted
- AND the Inventario accordion panel MUST NOT auto-expand

#### Scenario: Highlight active Inventario route and child routes on load
- GIVEN the user navigates to any of /inventory, /inventory/categories, /inventory/products, or /inventory/suppliers on a fresh page load
- WHEN the sidebar renders
- THEN the Inventario accordion header MUST be highlighted
- AND the Inventario accordion panel MUST be collapsed
