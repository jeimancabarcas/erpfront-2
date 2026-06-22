# Tasks: Redesign Text Inputs

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,800 (all phases) |
| 800-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Phase 0) → PR 2 (Phases 1-2) → PR 3 (Phase 3) → PR 4a-c (Phase 4) |
| Chain strategy | feature-branch-chain |

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create `ui-text-input` atom + test suite | PR 1 | Base = feature/text-input-redesign; ~250 lines |
| 2 | Dogfood customer-dialog + aligned forms | PR 2 | Base = PR 1 branch; ~275 lines |
| 3 | Material-to-native (appointment, billing, invoices) | PR 3 | Base = PR 1 branch; ~300 lines |
| 4a | High-risk: pediatrics forms | PR 4a | Base = PR 1 branch; ~400 lines |
| 4b | High-risk: inventory + purchase-order | PR 4b | Base = PR 1 branch; ~300 lines |
| 4c | High-risk: transport dialogs | PR 4c | Base = PR 1 branch; ~250 lines |

---

## Phase 0: Create TextInputAtom (PR 1)

- [x] 0.1 Create `src/app/components/atoms/text-input/` directory and files
- [x] [TEST] 0.2 Write full spec `text-input.component.spec.ts` (12+ scenarios: label render, valueChange, icon render states, error/aria, disabled, required, ngModel host, formControl, boxicons, padding, helper text)
- [x] 0.3 Implement `text-input.component.ts` with `model()` value, CVA, inline template matching customer-dialog design
- [x] 0.4 Create `text-input.component.scss` with `:host { display: block; }`
- [x] [TEST] 0.5 Run `ng test` — all 12+ scenarios pass green
- [x] [VALIDATE] 0.6 Run `npx tsc --noEmit` — zero type errors

## Phase 1: Dogfood in customer-dialog (PR 2)

- [DDOG] 1.1 Add `TextInputComponent` to `customer-dialog.component.ts` imports
- [DDOG] 1.2 Replace name input block with `<ui-text-input label="Nombre Completo / Razón Social" icon="person" [(value)]="customer().name" name="name" required placeholder="Ej. Juan Pérez o Tech SA" />`
- [DDOG] 1.3 Replace email input with `<ui-text-input type="email" label="Correo Electrónico" icon="email" [(value)]="customer().email" name="email" required placeholder="ejemplo@correo.com" />`
- [DDOG] 1.4 Replace documentNumber input with `<ui-text-input label="Número de Documento" icon="fingerprint" [(value)]="customer().documentNumber" name="documentNumber" required placeholder="Ej. 123456789" />`
- [DDOG] 1.5 Replace phone input with `<ui-text-input label="Teléfono de Contacto" icon="phone" [(value)]="customer().phone" name="phone" placeholder="Ej. +57 300 123 4567" />`
- [DDOG] 1.6 Replace address input with `<ui-text-input label="Dirección" icon="location_on" [(value)]="customer().address" name="address" placeholder="Ej. Calle 123 #45-67" />`
- [VALIDATE] 1.7 Run `npx tsc --noEmit` — zero errors
- [VALIDATE] 1.8 Verify zero visual diff against reference design (same Tailwind tokens inherited from component)

## Phase 2: Aligned forms (PR 2)

- [MIGRATE] 2.1 Add `TextInputComponent` to `product-form.component.ts` imports
- [MIGRATE] 2.2 Replace name, sku, currentStock, minStock, maxStock, sellingPrice, averagePurchasePrice inputs with `<ui-text-input>` — add missing icons (inventory_2, barcode, inventory, warning, inventory_2, sell, paid) per field
- [MIGRATE] 2.3 Run `ng test` — product-form spec still passes
- [MIGRATE] 2.4 Add `TextInputComponent` to `login-form.component.ts` imports, drop `MatInputModule` if unused after migration
- [MIGRATE] 2.5 Replace Material `mat-form-field` email input with `<ui-text-input type="email" icon="email">`
- [MIGRATE] 2.6 Replace Material `mat-form-field` password input with `<ui-text-input type="password" icon="lock">`
- [VALIDATE] 2.7 Run `npx tsc --noEmit` — zero errors on both migrated forms

## Phase 3: Material-to-native (PR 3)

- [MIGRATE] 3.1 Migrate `appointment-form` — replace mat-form-field inputs with `<ui-text-input>`, drop unused Material modules
- [MIGRATE] 3.2 Migrate `billing-filters` search input — replace mat-form-field with `<ui-text-input icon="search">`
- [MIGRATE] 3.3 Migrate `invoice-form-dialog` — replace numerical mat-inputs with `<ui-text-input type="number">`
- [MIGRATE] 3.4 Migrate `general-invoice-form-dialog` — replace text inputs
- [MIGRATE] 3.5 Migrate `sales-note-form-dialog` — replace text inputs
- [VALIDATE] 3.6 Run `npx tsc --noEmit` — zero errors across all migrated components
- [VALIDATE] 3.7 Run `ng test` — full suite passes

## Phase 4: High-risk forms (PR 4a — pediatrics)

- [MIGRATE] 4.1 Migrate `patient-search` — replace mat-autocomplete input (keep matAutocomplete panel, replace trigger input with ui-text-input)
- [MIGRATE] 4.2 Migrate `patient-registration-wizard` — replace all text inputs across wizard steps with `<ui-text-input>`
- [MIGRATE] 4.3 Migrate `diagnostics-dialog` text inputs
- [MIGRATE] 4.4 Migrate `anamnesis-dialog` text inputs (textarea stays native, only single-line text inputs)
- [MIGRATE] 4.5 Migrate `physical-exam-dialog` text inputs
- [MIGRATE] 4.6 Migrate `incapacity-dialog` text inputs
- [MIGRATE] 4.7 Migrate `orders-dialog` — replace FormArray text inputs with `<ui-text-input>` in ReactiveForms mode
- [VALIDATE] 4.8 Run `npx tsc --noEmit` — zero errors

## Phase 4b: Inventory + Purchase (PR 4b)

- [MIGRATE] 4.9 Migrate `supplier-dialog` text inputs
- [MIGRATE] 4.10 Migrate `inventory-category-dialog` text inputs
- [MIGRATE] 4.11 Migrate `inventory-batch-dialog` text inputs
- [MIGRATE] 4.12 Migrate `adjustment-form-dialog` text inputs
- [MIGRATE] 4.13 Migrate `purchase-order-dialog` text inputs
- [VALIDATE] 4.14 Run `npx tsc --noEmit` — zero errors

## Phase 4c: Transport dialogs (PR 4c)

- [MIGRATE] 4.15 Migrate transport dispatch dialog text inputs
- [MIGRATE] 4.16 Migrate transport expense dialog text inputs
- [MIGRATE] 4.17 Migrate transport incident dialog text inputs
- [MIGRATE] 4.18 Migrate transport maintenance dialog text inputs
- [MIGRATE] 4.19 Migrate transport operation dialog text inputs
- [MIGRATE] 4.20 Migrate transport settle dialog text inputs
- [MIGRATE] 4.21 Migrate transport standby dialog text inputs
- [VALIDATE] 4.22 Run `npx tsc --noEmit` — zero errors

## Validation (cross-cutting)

- [VALIDATE] V.1 Confirm zero new `mat-form-field` usages for text inputs in migrated components
- [VALIDATE] V.2 Run `ng test` — full test suite passes
- [VALIDATE] V.3 Run `npx tsc --noEmit` across entire project — zero errors
- [VALIDATE] V.4 Verify `TextInputComponent` spec covers: default render, valueChange, error + aria, icons (material + boxicons), no-icon padding, disabled, required indicator, ngModel host, formControl CVA, helper text
