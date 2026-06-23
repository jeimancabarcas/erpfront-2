# Tasks: Settings Page + CRUD Maestros

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,500–3,000 (FE + BE) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Backend) → PR 2 (FE Settings + Tax CRUD) → PR 3 (Payment Methods + Types) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Estimated ~2,500–3,000 changed lines across both repos — well over the 800-line budget. Chained PRs recommended. User must pick chain strategy (`stacked-to-main`, `feature-branch-chain`) or approve `size:exception` before apply.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: module, entities, DTOs, services, controllers, tests | PR 1 | Base for all frontend CRUD |
| 2 | FE: models, services, settings page, Tax CRUD | PR 2 | Depends on PR 1 API |
| 3 | FE: Payment Method + Payment Type CRUD | PR 3 | Depends on PR 2 (same pattern, parallel scope) |

## Phase 1: Backend Foundation (6 tasks)

- `[x] T-01` Create `settings.module.ts` + 3 entities (`Tax`, `PaymentMethod`, `PaymentType`) in `erpbackend/src/modules/settings/`. Dep: none. AC: entities compile, module registers `TypeOrmModule.forFeature`. (M)
- `[x] T-02` Create 9 DTOs (create/update/query per entity) with `class-validator`. Dep: T-01. AC: validators match entity fields, `PartialType` for updates, `PaginationDto` extends for queries. (M)
- `[x] T-03` Create 3 services: CRUD + duplicate name/code checks + referential integrity guard. Dep: T-01, T-02. AC: duplicate→409, delete-while-referenced→409, paginated sorted list. (L)
- `[x] T-04` Create 3 controllers at `/api/settings/{taxes,payment-methods,payment-types}` with `@UseGuards(JwtAuthGuard)`. Dep: T-03. AC: `POST`→201, `GET`→200, `PATCH`→200, `DELETE`→200/409, `ParseUUIDPipe` on IDs. (M)
- `[x] T-05` Register `SettingsModule` + 3 entities in `app.module.ts`. Dep: T-01. AC: build passes, tables sync on dev. (S)
- `[x] T-06` Write Jest tests: 3 service specs + 3 controller specs. Dep: T-03, T-04. AC: CRUD paths + duplicate/reference error paths covered. (L)

## Phase 2: Frontend Models + Services (3 tasks)

- `[x] T-07` Create 3 model interfaces with `CreateDto`/`UpdateDto` in `src/app/models/`. Dep: none. AC: interfaces match backend DTOs. (S)
- `[x] T-08` Create 3 signals-based services in `src/app/services/` matching `CustomerService` pattern (`_data` signal, `asReadonly()`, `_meta` signal). Dep: T-07. AC: `load`/`create`/`update`/`delete` mutate signal state. (M)
- `[x] T-09` Write Vitest tests for all 3 services. Dep: T-08. AC: each CRUD method + error handling + signal state verified. (M)

## Phase 3: Frontend Settings Page (4 tasks)

- `[x] T-10` Add `/settings` lazy route with 3 children + wildcard 404 in `app.routes.ts` using existing auth/profiles guards. Dep: none. AC: routes load correct components, unauthenticated→login, unknown→404. (S)
- `[x] T-11` Wire "Configuración" in navbar: `[routerLink]="'/settings'"`. Dep: T-10. AC: NAV-01 passes (navigates + dropdown closes). (S)
- `[x] T-12` Create `SettingsPageComponent` with 3-card responsive grid (icon, title, description per card, routerLink to sub-route). Dep: T-10. AC: NAV-02/03 pass — 3 cards rendered, click navigates. (M)
- `[x] T-13` Write Vitest test for `SettingsPageComponent`: renders cards + navigation. Dep: T-12. AC: 5 tests pass — renders component, title + description, 3 cards with correct titles, routerLink to sub-routes, each card has icon + title + description. (M)

## Phase 4: Frontend Tax CRUD (3 tasks)

- `T-14` Create `TaxDialogOrganism` following `CustomerDialogOrganism` pattern: `MatDialogRef`+`MAT_DIALOG_DATA`, `isEditMode` signal, form with `ui-text-input` (name/code), `ui-select` (type: "Porcentaje"/"Monto Fijo"), `ui-toggle` (isPurchase/isSell/isActive), sortOrder. Dep: T-08. AC: create/edit modes, validation errors show, submit calls service. (M)
- `T-15` Create `SettingsTaxesPageComponent`: data table with sortable columns, pagination, isActive filter, Add button opens dialog, Edit/Delete per row with `ConfirmDeleteDialogOrganism`. Dep: T-14. AC: loads list, paginates, Add creates, Edit updates, Delete removes after confirmation. (M)
- `T-16` Write Vitest tests for TaxDialogOrganism + SettingsTaxesPageComponent. Dep: T-14, T-15. AC: TAX-01 to TAX-06 scenarios pass. (M)

## Phase 5: Frontend Payment Method CRUD (3 tasks)

- `T-17` Create `PaymentMethodDialogOrganism`: `ui-text-input` (name/code), `ui-textarea` (description), `ui-toggle` (isActive), sortOrder. Dep: T-08. AC: PM-01 to PM-05. (M)
- `T-18` Create `SettingsPaymentMethodsPageComponent` (same table pattern). Dep: T-17. AC: full CRUD flow verified. (M)
- `T-19` Vitest tests for dialog + page. Dep: T-17, T-18. AC: all PM scenarios covered. (M)

## Phase 6: Frontend Payment Type CRUD (3 tasks)

- `T-20` Create `PaymentTypeDialogOrganism`: same fields as PaymentMethod (name, code, description, isActive, sortOrder). Dep: T-08. AC: PT-01 to PT-05. (M)
- `T-21` Create `SettingsPaymentTypesPageComponent` (same table pattern). Dep: T-20. AC: full CRUD flow verified. (M)
- `T-22` Vitest tests for dialog + page. Dep: T-20, T-21. AC: all PT scenarios covered. (M)

## Phase 7: Integration & Verify (2 tasks)

- `T-23` Run full FE (`npm run test --watch=false`) + BE test suites, fix failures. Dep: all. AC: all tests green, build compiles clean. (M)
- `T-24` Manual E2E flow verification: `/settings` → card → CRUD → create/edit/delete → back. Dep: T-23. AC: all spec scenarios pass end-to-end. (S)

## Phase 8: Remove Frontend CRUDs (7 tasks)

- `[x] T-32` Delete CRUD pages: settings-page, settings-taxes-page, settings-payment-methods-page, settings-payment-types-page. Dep: none.
- `[x] T-33` Delete dialog organisms: tax-dialog, payment-method-dialog, payment-type-dialog. Dep: none.
- `[x] T-34` Remove `/settings` route block from app.routes.ts. Dep: T-32.
- `[x] T-35` Remove "Configuración" from navbar + RouterLink import. Dep: none.
- `[x] T-36` Simplify FE services — remove create/update/delete from all 3 services. Dep: none.
- `[x] T-37` Simplify FE models — remove CreateDto/UpdateDto from all 3 models. Dep: T-36.
- `[x] T-38` Update 3 service spec files — remove create/update/delete tests, keep loadData + error handling. Dep: T-36.
