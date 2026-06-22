# Tasks: Replace Filter Text Inputs with ui-text-input

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Page Filter Inputs — Pattern A (5 pages, 8 inputs)

- [x] 1.1 `inventory-products-page` — Add `TextInputComponent` import; replace 2 raw inputs with `<ui-text-input icon="search" placeholder="Nombre">` / `icon="fingerprint"`; wire `(valueChange)="nameFilter.set($event); debouncedFilter()"` / `(valueChange)="skuFilter.set($event); debouncedFilter()"`; remove `onNameFilterChange()` / `onSkuFilterChange()`
- [x] 1.2 `inventory-suppliers-page` — Same pattern: add import, replace 2 inputs (search/fingerprint), wire signals, remove `onNameFilterChange` / `onNitFilterChange`
- [x] 1.3 `inventory-categories-page` — Same pattern: 1 input (search), h-12→h-14 accepted, remove `onNameFilterChange`
- [x] 1.4 `sales-page` — Replace invoiceNumber raw input with `<ui-text-input icon="search" placeholder="No. Factura">`; wire signal; remove `onInvoiceNumberFilterChange`
- [x] 1.5 `sales-customers-page` — Replace 2 raw inputs (search/badge); wire signals; remove `onNameFilterChange` / `onDocumentFilterChange`

## Phase 2: Molecule/Organism Migration — Pattern B (3 components)

- [x] 2.1 `appointment-filters` — Replace search mat-form-field with `<ui-text-input icon="search">`; change `[(ngModel)]="searchQuery"` → `[(value)]="searchQuery"`; keep `MatInputModule` (datepicker needs `matInput`)
- [x] 2.2 `movements-table` — Replace user filter mat-form-field with `<ui-text-input icon="search">`; change `[(ngModel)]="filterUser"` → `[value]="filterUser()" (valueChange)="onUserInput($event)"`; add external `<button>` sibling for clear; remove `MatInputModule` if no other uses
- [x] 2.3 `customer-invoices-table` — Replace search mat-form-field with `<ui-text-input icon="search">`; keep `[formControl]="invoiceFilter"` (CVA); remove `MatInputModule` + `MatFormFieldModule` if zero remaining

## Phase 3: Verification

- [x] 3.1 Run `npx tsc --noEmit` — zero compilation errors
- [x] 3.2 Run `ng build` — successful production build
