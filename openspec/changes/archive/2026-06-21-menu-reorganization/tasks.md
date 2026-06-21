# Tasks: Menu Reorganization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 50-80 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Restructure sidebar layout, refactor TS active checks, and implement tests | PR 1 | Base branch; all changes and tests in a single PR |

## Phase 1: Sidebar Layout Restructuring

- [x] 1.1 Move "Ventas" (`/sales`, icon: `payments`) from the Inventario accordion to a root-level item below "Clientes" in `src/app/components/organisms/sidebar/sidebar.component.ts`.
- [x] 1.2 Move "Compras" (`/inventory/purchases`, icon: `shopping_cart`) from the Inventario accordion to a root-level item below "Ventas" in `src/app/components/organisms/sidebar/sidebar.component.ts`.
- [x] 1.3 Remove the nested `Configuración` accordion inside Inventario in `src/app/components/organisms/sidebar/sidebar.component.ts`.
- [x] 1.4 Move "Categorías" (`/inventory/categories`), "Productos" (`/inventory/products`), and "Proveedores" (`/inventory/suppliers`) directly under the Inventario accordion.
- [x] 1.5 Update Tailwind classes for the new root-level items (Ventas/Compras) to use root-level height/hover styling (`!h-14 hover:!bg-gray-100`) and active highlight (`!bg-indigo-100 !text-indigo-900`) in `src/app/components/organisms/sidebar/sidebar.component.ts`.
- [x] 1.6 Update Tailwind classes for the promoted sub-items (Categorías/Productos/Proveedores) to use sub-menu height/hover styling (`!h-12 hover:!bg-gray-50`) in `src/app/components/organisms/sidebar/sidebar.component.ts`.
- [x] 1.7 Remove the `[expanded]="isInventoryActive()"` binding from the Inventario `mat-expansion-panel` in `src/app/components/organisms/sidebar/sidebar.component.ts`.
- [x] 1.8 Clean up the unused `.inner-accordion` CSS rules in the `styles` metadata block in `src/app/components/organisms/sidebar/sidebar.component.ts`.

## Phase 2: Active State & Highlighting Code Refactoring

- [x] 2.1 Refactor `isInventoryActive()` in `src/app/components/organisms/sidebar/sidebar.component.ts` to return true only if the current URL matches `/inventory`, `/inventory/categories`, `/inventory/products`, or `/inventory/suppliers` (excluding purchases).
- [x] 2.2 Delete the redundant `isSalesActive()` and `isInventorySettingsActive()` methods in `src/app/components/organisms/sidebar/sidebar.component.ts`.

## Phase 3: Unit Testing

- [x] 3.1 Create `src/app/components/organisms/sidebar/sidebar.component.spec.ts` and set up standard Angular testing module declarations with `TestBed`.
- [x] 3.2 Write a Vitest test in `sidebar.component.spec.ts` verifying the sidebar menu sequence displays as Inicio -> Clientes -> Ventas -> Compras -> Inventario -> Finanzas -> Pediatría -> Transporte.
- [x] 3.3 Write a Vitest test in `sidebar.component.spec.ts` to verify the Inventario accordion is collapsed by default.
- [x] 3.4 Write a Vitest test in `sidebar.component.spec.ts` mocking Router events/URLs to verify `isInventoryActive()` returns true for `/inventory`, `/inventory/categories`, `/inventory/products`, and `/inventory/suppliers`, but false for `/inventory/purchases` and `/sales`.

## Phase 4: Verification & Cleanup

- [x] 4.1 Execute project test runner (e.g. Vitest) to ensure all tests pass and `SidebarComponent` compiles successfully.
- [x] 4.2 Run linter and formatter (e.g. Prettier/ESLint) on modified files to verify styling consistency.
