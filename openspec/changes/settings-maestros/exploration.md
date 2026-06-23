## Exploration: Settings Page + CRUD Maestros (Taxes, Payment Methods, Payment Types)

### Current State

The ERP has **no settings page** and **no master data management** for taxes, payment methods, or payment types. The navbar user dropdown already renders a "Configuración" menu item (`settings` icon) but it has **no routerLink or click handler** — it's purely decorative. The sidebar also has no settings entry.

The Factus module (electronic invoicing) references `FactusTax`, `FactusPaymentDetail` interfaces but they are API contract types, not database entities — there are no persisted tax/payment master tables.

### Affected Areas

#### Frontend
- `erpfrontend/src/app/components/organisms/navbar/navbar.component.ts` — line 69-72, "Configuración" button needs `[routerLink]="'/settings'"` and `RouterLink` import
- `erpfrontend/src/app/app.routes.ts` — needs a new lazy-loaded `/settings` route with children
- New page component at `erpfrontend/src/app/components/pages/settings-page/settings-page.component.ts` — card-based navigation launchpad
- New page components for each CRUD (taxes, payment-methods, payment-types)
- New organisms for each CRUD dialog
- New models (`tax.model.ts`, `payment-method.model.ts`, `payment-type.model.ts`)
- New services (`settings.service.ts` or individual per entity)
- New molecules (reuse existing: `data-table`, `page-header`, `breadcrumb`, `confirm-dialog`)
- New atoms (reuse existing: `button`, `text-input`, `select`, `icon`, `card`, `status-tag`, `spinner`, `skeleton`)

#### Backend
- `erpbackend/src/app.module.ts` — register new module
- New module at `erpbackend/src/modules/settings/` (or three separate modules)
  - Entity: `tax.entity.ts`
  - Entity: `payment-method.entity.ts`
  - Entity: `payment-type.entity.ts`
  - Controller per entity
  - Service per entity
  - DTOs per entity (create, update, query)
- `erpbackend/src/database/migrations/` — new migration for the three tables (but `synchronize: true` is enabled in dev)

### Approaches

#### Settings Page Navigation

1. **Card-based launchpad (recommended)** — `/settings` shows a grid of cards, each navigating to a sub-route (`/settings/taxes`, `/settings/payment-methods`, etc.)
   - Pros: Clean, extensible for future settings (invoice numbering, company info), follows card-grid pattern already used in dashboard
   - Cons: Requires sub-routes setup
   - Effort: Low

2. **Single page with tabs** — `/settings` shows all CRUDs as tab sections
   - Pros: No sub-routes needed
   - Cons: Gets crowded with 3+ CRUDs, harder to extend, breaks URL-per-section pattern
   - Effort: Low

3. **Dropdown menu with direct links** — bypass settings landing page, each menu item goes directly to `/settings/taxes`, etc.
   - Pros: Fewer clicks for power users
   - Cons: No overview, loses discoverability of available settings
   - Effort: Low

#### CRUD Implementation Pattern

1. **Single shared pattern (recommended)** — follow the proven CustomerDialogOrganism pattern for all three
   - Each entity gets: `XDialogOrganism` (modal create/edit), inline table in page component, confirm-delete reuse
   - Pros: Consistent, proven pattern, minimal cognitive overhead
   - Effort: Medium

2. **Inline form within page** — form embedded in the page instead of dialog
   - Pros: Always visible, good for quick data entry
   - Cons: Breaks existing UI patterns, more complex state management
   - Effort: Medium

#### Backend Module Structure

1. **Single `settings` module** with repositories for each entity — lightweight, co-located
   - Pros: One module import, one registration point, makes sense for master data
   - Cons: Could grow large if many settings added later
   - Effort: Low

2. **Separate module per entity** — `taxes`, `payment-methods`, `payment-types`
   - Pros: Follows existing pattern (customers, suppliers are separate modules)
   - Cons: Too granular for simple master data with no business logic
   - Effort: Medium

### Detailed Analysis

#### Frontend Patterns Found

**Existing CRUD page pattern** (SalesCustomersPageComponent as canonical example):
```typescript
// 1. Wraps in DashboardLayoutComponent
// 2. Uses signals for state (filters, pagination, data from service)
// 3. MatDialog for organism dialogs (create/edit)
// 4. ConfirmDeleteDialogOrganism for deletes
// 5. debouncedFilter() with 400ms timeout
// 6. loadData() driven by QueryParams
// 7. Pagination with pageIndex, pageSize, totalPages computed
```

**Dialog organism pattern** (CustomerDialogOrganism as canonical example):
```typescript
// 1. standalone, injects MatDialogRef + MAT_DIALOG_DATA
// 2. Interface for dialog data (XDialogData) and optional result
// 3. Template-driven form with atoms (ui-text-input, ui-select)
// 4. isEditMode signal based on whether data.customer exists
// 5. Loading/error signals for async states
// 6. Footer with Cancel + Save buttons
// 7. save() method calls service create/update, closes dialog with result
// 8. Styling: custom-scrollbar, rounded-[28px], shadow-[0_8px_30px_rgb(0,0,0,0.03)]
```

**Service pattern** (CustomerService as canonical example):
```typescript
// 1. @Injectable({ providedIn: 'root' })
// 2. Private _data signal + public readonly signal
// 3. API URL from environment.apiUrl
// 4. loadData(): GET with params, tap -> update signals
// 5. create(): POST, tap -> prepend to signal array
// 6. update(): PATCH, tap -> map in signal array
// 7. delete(): DELETE, tap -> filter from signal array
```

**Sidebar**: No settings entry currently. The sidebar has collapsible sections (Gestión Comercial, etc.) but no "Configuración" section.

#### Backend Patterns Found

**Module structure** (CustomersModule as canonical example):
```
module/
├── dto/
│   ├── create-{entity}.dto.ts       // class-validator decorators
│   ├── update-{entity}.dto.ts       // extends PartialType(CreateDto)
│   └── query-{entity}.dto.ts        // extends PaginationDto
├── entities/
│   └── {entity}.entity.ts           // TypeORM decorators, UUID PK
├── {entities}.controller.ts         // @UseGuards(JwtAuthGuard), CRUD endpoints
├── {entities}.module.ts             // TypeOrmModule.forFeature([Entity])
└── {entities}.service.ts            // @InjectRepository, CRUD methods, exceptions
```

**Key observations:**
- UUID primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Snake_case column names (`@CreateDateColumn({ name: 'created_at' })`)
- Spanish error messages in exceptions
- `class-validator` + `class-transformer` for DTO validation
- `ParseUUIDPipe` on params
- `@UseGuards(JwtAuthGuard)` at controller level
- `synchronize: true` in dev mode (no need for migration files for new entities)

### Recommendation

**Approach**: Card-based launchpad at `/settings` + sub-routes per CRUD + single `settings` backend module

**Why:**
1. Card-based launchpad matches the existing dashboard aesthetic and scales well for future settings (company info, invoice numbering, email config, etc.)
2. Sub-routes per CRUD keep URLs bookmarkable and follow the `/inventory/categories`, `/comercial/customers` pattern
3. Single `settings` backend module keeps master data co-located — these entities are simple, have no business logic beyond CRUD, and adding more master tables later is trivial
4. Reusing the proven CustomerDialogOrganism pattern reduces risk and keeps UI consistent

**Route structure:**
```
/settings                              → SettingsPageComponent (card grid)
/settings/taxes                        → SettingsTaxesPageComponent (CRUD table)
/settings/payment-methods              → SettingsPaymentMethodsPageComponent
/settings/payment-types                → SettingsPaymentTypesPageComponent
```

**Backend endpoints:**
```
GET/POST   /api/settings/taxes
GET/PATCH/DELETE /api/settings/taxes/:id
GET/POST   /api/settings/payment-methods
GET/PATCH/DELETE /api/settings/payment-methods/:id
GET/POST   /api/settings/payment-types
GET/PATCH/DELETE /api/settings/payment-types/:id
```

### Risks

1. **No unit tests exist for navbar** — the "Configuración" button change is trivial but uncovered
2. **`synchronize: true` in dev** — new entities auto-create tables, but need a proper migration before production
3. **Strict TDD is enabled** for the frontend (`openspec/config.yaml` has `strict_tdd: true`) — all implementation must be preceded by failing tests
4. **Guard consistency** — `/settings` must use `[authGuard, profileGuard]` like all other authenticated routes
5. **Sidebar navigation** — currently no "Configuración" section; the user may also want a sidebar entry alongside the dropdown

### Ready for Proposal

**Yes.** All patterns are clearly identified, the approach is well-defined, and the codebase has proven patterns to follow. The orchestrator should tell the user:
- Recommended approach is **card-based launchpad** at `/settings` with sub-routes for each CRUD
- Backend as **single `settings` module** with three entities
- Will follow existing **CustomerDialogOrganism** CRUD pattern for all three
- Strict TDD is active — tests come first
- Requires adding `RouterLink` to the navbar "Configuración" button
