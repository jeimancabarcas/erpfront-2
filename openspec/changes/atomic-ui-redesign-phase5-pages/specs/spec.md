# Phase 5 — Page Migration Specification

## Purpose

Migrate 29 existing pages from Angular Material components to Phase 2–4 atomic components (atoms, molecules, organisms). Business logic, routing, and data fetching MUST remain unchanged. Only templates and styles are modified.

## Functional Requirements

### FR1: No Angular Material Imports

Every page component MUST remove all `@angular/material/*` imports from TypeScript and the `imports` array. Material icons use `<span class="material-icons">` instead of `<mat-icon>`. The `@angular/material` and `@angular/cdk` packages SHALL be removed from `package.json` after all pages pass verification.

#### Scenario: Core pages have zero Material imports

- GIVEN DashboardPage, ProfilePage
- WHEN the source is inspected after migration
- THEN zero `@angular/material/*` imports SHALL exist in their `.ts` files
- AND `<span class="material-icons">` SHALL replace `<mat-icon>` elements

#### Scenario: Inventory pages have zero Material imports

- GIVEN InventoryPage, CategoriesPage, ProductsPage, SuppliersPage, PurchasesPage
- WHEN the source is inspected after migration
- THEN zero `@angular/material/*` imports SHALL exist
- AND `MatTableDataSource` references SHALL be replaced with signal-based data passing to `<ui-data-table>`

#### Scenario: Sales + Finance pages have zero Material imports

- GIVEN SalesPage, SalesCustomersPage, SalesCustomerDetailPage, FinancePage, FinanceInvoicingView, FinanceAdjustmentsView
- WHEN the source is inspected after migration
- THEN zero `@angular/material/*` imports SHALL exist
- AND `<ui-data-table>` SHALL replace `mat-table` + `mat-paginator` + `mat-sort`

### FR2: Atomic Component Replacement

Material components MUST be replaced with their Phase 2–4 equivalents:

| Material | Replace With |
|----------|-------------|
| `<mat-card>` | `<ui-card>` |
| `<mat-button>`, `<mat-flat-button>`, `<mat-stroked-button>`, `<mat-icon-button>` | `<ui-button>` |
| `<mat-form-field>` + `<mat-input>` | `<ui-input>` |
| `<mat-select>` | `<ui-select>` |
| `<mat-table>` + `<mat-sort>` + `<mat-paginator>` | `<ui-data-table>` |
| `<mat-dialog>` | `<ui-confirm-dialog>` (or custom dialog wrapper) |
| `<mat-tab-group>` / `<mat-tab>` | Tab navigation via buttons + conditional rendering |
| `<mat-divider>` | `<ui-divider>` |
| `<mat-icon>` | `<span class="material-icons">` |
| `<mat-snack-bar>` | Inline notification or custom toast |
| `<mat-tooltip>` | Native `title` attribute |

#### Scenario: DataTable pages render with `<ui-data-table>`

- GIVEN SalesPage, CustomersPage, CategoriesPage, ProductsPage, SuppliersPage, PurchasesPage, PatientsPage, ConsultationsPage
- WHEN the template is rendered
- THEN `<ui-data-table>` SHALL render with `columns`, `dataSource`, `loading`, `sortChange`, and `pageChange` bindings
- AND `mat-table`, `mat-paginator`, `mat-sort` SHALL NOT appear in the template

#### Scenario: Dialog-based interactions use atomic components

- GIVEN any page that opens MatDialog (patients, sales, inventory, agenda, billing, finance, transport)
- WHEN a dialog is triggered
- THEN Material `MatDialog` SHALL be replaced with `<ui-confirm-dialog>` or a custom dialog using `<ui-card>` + `<ui-button>` + `<ui-input>`
- AND the `MatDialog` injection token SHALL be removed from the component class

#### Scenario: Form fields replaced with atomic inputs

- GIVEN ConsultationPage, SalesPage, SalesCustomersPage, FinanceInvoicingView, TransportDispatchView
- WHEN the template is rendered
- THEN `<mat-form-field>` + `<mat-input>` SHALL be `<ui-input>` with `label`, `placeholder`, `error`, and `valueChange`
- AND `<mat-select>` SHALL be `<ui-select>` with `options`, `searchable`, and `valueChange`

### FR3: Token-Based Styling

Inline arbitrary Tailwind values MUST be replaced with Phase 1 CSS custom properties (`--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`). The `!important` overrides on Material classes (`!rounded-[28px]`, `!shadow-[...]`) SHALL be removed since atomic components use tokens natively.

#### Scenario: No inline arbitrary values in migrated templates

- GIVEN any migrated page template
- WHEN scanned for `[`, `!rounded-`, `!shadow-`, `!text-[`, `!w-[`, `!h-[`
- THEN zero matches SHALL be found (except pre-existing utility classes like `text-3xl` from the token scale)
- AND all borders SHALL use `--color-border`, all shadows SHALL use `--shadow-*`, all radii SHALL use `--radius-*`

### FR4: Page Pattern Consistency

Pages with list+detail patterns MUST use `<ui-page-header>` + `<ui-search-filters>` + `<ui-data-table>` composition where applicable. Simple/dashboard pages MAY use direct `<ui-card>` layouts without the full pattern.

#### Scenario: List pages follow the three-molecule pattern

- GIVEN SalesPage, CustomersPage, CategoriesPage, ProductsPage, SuppliersPage, PurchasesPage, PatientsPage, BillingPage
- WHEN the template is inspected
- THEN `<ui-page-header>` SHALL contain the page title + description
- AND `<ui-search-filters>` SHALL provide search + filter controls
- AND `<ui-data-table>` SHALL render the data rows

#### Scenario: Dashboard pages use `<ui-card>` grid

- GIVEN DashboardPage, FinancePage, TransportDashboardView
- WHEN the template is inspected
- THEN card-based layouts SHALL use `<ui-card>` with `padding` variant
- AND `<ui-stats-grid>` SHALL replace hand-rolled KPI card rows

### FR5: Backward Compatibility

All business logic, service calls, routing, component inputs/outputs, and Angular signal subscriptions MUST remain unmodified. Only the template HTML and component styles SHALL change. Spec files (.spec.ts) SHALL be updated only to fix selector references (`mat-icon` → `.material-icons`, `mat-table` → `ui-data-table`).

#### Scenario: Business logic unchanged after template swap

- GIVEN any migrated page component
- WHEN the component class is compared before and after migration
- THEN all service injections, signal declarations, computed properties, method bodies, and router calls SHALL be identical
- AND only the `imports` array and template string SHALL differ

## Non-Functional Requirements

### NFR-01: Token Compliance

All migrated pages MUST use Phase 1 `@theme` tokens for colors, spacing, typography, shadows, radii. Zero hardcoded hex values or arbitrary Tailwind brackets.

### NFR-02: Dark Mode Compatibility

Migrated pages SHALL render correctly under `.dark`. All backgrounds, text colors, borders, and shadows MUST switch to dark token values via the atomic components' built-in dark support.

### NFR-03: Bundle Impact

Removing `@angular/material` and `@angular/cdk` from `package.json` SHALL reduce vendor bundle size. The migration SHALL verify that no transitive Material imports remain.

## Page Migration Checklist

| # | Page | Material Deleted | Atomic Replacement | Pattern |
|---|------|-----------------|-------------------|---------|
| 1 | DashboardPage | MatCard, MatIcon | `<ui-card>`, `<span class="material-icons">` | Card grid |
| 2 | ProfilePage | MatTabs, MatIcon | Tab buttons + conditional render | Custom tabs |
| 3 | InventoryPage | MatTabs, MatButton, MatIcon, MatDialog | Custom tabs, `<ui-button>`, `<span>` | Tab layout |
| 4 | InventoryCategoriesPage | MatTable, MatSort, MatPaginator, MatButton, MatIcon, MatDialog | `<ui-data-table>`, `<ui-button>` | PageHeader + SearchFilters + DataTable |
| 5 | InventoryProductsPage | Same + MatSelect, MatFormField, MatInput | Same + `<ui-select>`, `<ui-input>` | Full pattern |
| 6 | InventorySuppliersPage | MatTable, MatSort, MatPaginator, MatButton, MatIcon, MatDialog | `<ui-data-table>`, `<ui-button>` | Full pattern |
| 7 | InventoryPurchasesPage | Same | Same | Full pattern |
| 8 | SalesPage | MatTable, MatSort, MatPaginator, MatButton, MatIcon, MatDialog, MatSelect, MatFormField, MatInput | `<ui-data-table>`, `<ui-button>`, `<ui-select>`, `<ui-input>` | Full pattern |
| 9 | SalesCustomersPage | Same + MatDialog | Same + `<ui-confirm-dialog>` | Full pattern |
| 10 | SalesCustomerDetailPage | MatButton, MatIcon | `<ui-button>` | Detail layout |
| 11 | FinancePage | MatCard, MatIcon, MatDialog, MatSnackBar | `<ui-card>`, `<ui-button>`, `<ui-confirm-dialog>` | Card grid |
| 12 | FinanceInvoicingView | MatButton, MatIcon, MatInput, MatFormField, MatDialog | `<ui-button>`, `<ui-input>`, `<ui-confirm-dialog>` | Filter + table |
| 13 | FinanceAdjustmentsView | MatButton, MatIcon, MatDialog | `<ui-button>`, `<ui-confirm-dialog>` | Stats + table |
| 14 | PatientsPage | MatTable, MatButton, MatIcon, MatDialog | `<ui-data-table>`, `<ui-button>` | Full pattern |
| 15 | PatientDetailPage | MatIcon, MatButton, MatDivider, MatTabs | `<span>`, `<ui-button>`, `<ui-divider>`, custom tabs | Detail tabs |
| 16 | ConsultationPage | MatDialog, MatIcon, MatButton, MatInput, MatFormField, MatDivider, MatSelect, MatTooltip | `<ui-button>`, `<ui-input>`, `<ui-select>`, `<ui-divider>`, native title | Complex form |
| 17 | AgendaPage | MatButton, MatIcon, MatDialog, MatSnackBar | `<ui-button>`, `<ui-confirm-dialog>` | Full pattern |
| 18 | BillingPage | MatButton, MatIcon, MatSnackBar, MatDialog | `<ui-button>`, `<ui-confirm-dialog>` | Full pattern |
| 19 | TransportPage | MatButton, MatIcon, MatTabs | `<ui-button>`, custom tabs | Tab layout |
| 20 | TransportDashboardView | MatButton, MatDialog | `<ui-button>`, `<ui-confirm-dialog>` | Dashboard |
| 21 | TransportVehicleDetailPage | MatButton, MatDialog | `<ui-button>`, `<ui-confirm-dialog>` | Detail |
| 22 | TransportServiceDetailPage | MatButton, MatDialog | `<ui-button>`, `<ui-confirm-dialog>` | Detail |
| 23 | TransportDispatchView | MatFormField, MatInput, MatSelect, MatButton | `<ui-input>`, `<ui-select>`, `<ui-button>` | Form |
| 24 | TransportTrackingView | MatButton, MatDialog | `<ui-button>`, `<ui-confirm-dialog>` | Tracking |
| 25 | TransportSettlementView | MatButton | `<ui-button>` | Settlement |
| 26 | LoginPage | None (clean) | No changes needed | Auth template |
| 27 | GeneralInvoiceFormDialog | MatDialog | `<ui-card>` + `<ui-button>` + `<ui-input>` | Dialog |
| 28 | InvoiceDetailDialog | MatDialog | `<ui-card>` + `<ui-button>` | Dialog |
| 29 | AdjustmentFormDialog | MatDialog | `<ui-card>` + `<ui-button>` + `<ui-input>` | Dialog |

## Acceptance Criteria

- [ ] All 29 pages render without Angular Material component imports
- [ ] All 29 pages use Phase 2–4 atomic components in templates
- [ ] Zero `@angular/material/*` or `@angular/cdk/*` imports in page source files
- [ ] Zero inline arbitrary Tailwind values (`[`, `!rounded-`, `!shadow-`) in migrated templates
- [ ] Business logic, routing, and data fetching are identical before/after migration (git diff shows only template + style changes)
- [ ] `@angular/material` and `@angular/cdk` removed from `package.json`
- [ ] Light and dark mode render correctly on all migrated pages
