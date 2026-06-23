# Proposal: Settings Page + CRUD Maestros (Taxes, Payment Methods, Payment Types)

## Intent

No settings UI or persisted master data. Navbar "Configuración" button is decorative. Without tax/payment master tables, Factus invoicing and financial features cannot reference rates or metadata.

## Scope

### In Scope
- Wire navbar "Configuración" → `/settings`
- `/settings` card grid (3 cards) + sub-routes per entity
- Full CRUD: Tax (name, code, percentage, type, isPurchase, isSell, isActive, sortOrder), PaymentMethod (name, code, description, isActive, sortOrder), PaymentType (name, code, description, isActive, sortOrder)
- Backend: single `settings` module — 3 services, 3 controllers, 3 entities, DTOs
- Frontend: 1 page, 3 CRUD pages, 3 dialog organisms, 3 services, 3 models
- Tests: frontend Vitest + backend Jest

### Out of Scope
- Sidebar settings entry
- Company/profile config
- Electronic invoicing (next milestone)
- Invoice numbering config
- Placeholder cards for future settings

## Capabilities

### New Capabilities
- `settings-page`: `/settings` card grid + navbar wiring + route + guards
- `tax-crud`: Tax CRUD — name, code, percentage, type, isPurchase, isSell, isActive, sortOrder
- `payment-method-crud`: PaymentMethod CRUD — name, code, description, isActive, sortOrder
- `payment-type-crud`: PaymentType CRUD — name, code, description, isActive, sortOrder

### Modified Capabilities
- None

## Approach

Card grid → sub-route per CRUD → single `settings` backend module.

**Frontend**: Reuse CustomerDialogOrganism pattern (MatDialog CRUD, signals, debounced filter, pagination per page), data table, confirm-delete, DashboardLayout.

**Backend**: `TypeOrmModule.forFeature([Tax, PaymentMethod, PaymentType])` under one module. Controllers at `/api/settings/`. UUID PKs, snake_case, JWT guards — existing conventions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../organisms/navbar/` | Modified | `[routerLink]` to Configuración |
| `src/app/app.routes.ts` | Modified | `/settings` lazy route + children |
| `.../pages/settings-page/` | New | Card grid launchpad |
| `.../pages/settings-{taxes,payment-methods,payment-types}-page/` | New | 3 CRUD pages |
| `.../organisms/{tax,payment-method,payment-type}-dialog/` | New | 3 CRUD dialog organisms |
| `src/app/models/` | New | 3 model files |
| `src/app/services/` | New | 3 services |
| `erpbackend/src/modules/settings/` | New | Module + entities + services + controllers + DTOs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Navbar change breaks layout | Low | Existing test suite catches regressions |
| Strict TDD slows delivery | Med | Proven test patterns to copy |
| `synchronize: true` vs. missing prod migration | Low | Generate migration before deploy |

## Rollback Plan

1. Frontend: revert `app.routes.ts` + delete settings pages/organisms
2. Backend: remove `SettingsModule` import → delete module folder
3. DB: revert migration dropping `taxes`, `payment_methods`, `payment_types`

## Dependencies

- Existing: `DashboardLayoutComponent`, `MatDialog`, `CustomerDialogOrganism`

## Success Criteria

- [ ] `/settings` loads 3 cards → each navigates to its CRUD
- [ ] Every CRUD supports create, read, update, delete + confirmation
- [ ] Frontend tests pass (`npm run test -- --watch=false`)
- [ ] Backend tests pass
- [ ] Navbar "Configuración" routes to `/settings`
