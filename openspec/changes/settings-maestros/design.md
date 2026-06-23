# Design: Settings Page + CRUD Maestros (Taxes, Payment Methods, Payment Types)

## Technical Approach

Card-based settings launchpad at `/settings` with 3 lazy-loaded child CRUD routes, matching the existing `/inventory` and `/comercial` navigation pattern. Single `SettingsModule` backend. Each maesto gets its own dialog organism, service, and model — following the **exact** CustomerDialogOrganism / CustomerService pattern identically. Strict TDD (tests before code) enforced throughout.

## Architecture Decisions

### Decision: Single backend module vs. separate modules per entity

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single `settings` module | One registration, co-located maestros; could grow but all are simple CRUD | **Chosen** — matches exploration recommendation |
| Separate modules per entity | More granular but overkill for entities with zero business logic | Rejected |

### Decision: Card-based launchpad vs. tabs

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Card grid at `/settings` | Scalable for future items, matches dashboard aesthetic, bookmarkable sub-routes | **Chosen** — per spec NAV-02/03 |
| Tabs on single page | No sub-routes, gets crowded, breaks URL-per-section | Rejected |

### Decision: Dialog form pattern

Follow `CustomerDialogOrganism` verbatim: `MatDialogRef` + `MAT_DIALOG_DATA`, `isEditMode` signal, template-driven form via atoms (`ui-text-input`, `ui-select`, `ui-toggle`), `save()` calling create/update with signal update on success, `DIALOG_DEFAULTS` for sizing. Each dialog gets its own data interface (`TaxDialogData`, etc.).

### Decision: State management

`_data` signal + `readonly` public signal + `_meta` signal per service, exactly as `CustomerService` does it. No additional state layer needed.

## Data Flow

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│ SettingsPage  │────→│ TaxDialogOrg  │────→│ TaxesService     │
│ (card grid)   │     │ (create/edit) │     │ (signals + HTTP) │
└──────────────┘     └───────────────┘     └────────┬─────────┘
                                                    │
┌──────────────────┐     ┌──────────────────┐       │
│ ConfirmDelete    │←────│ SettingsTaxesPage│       │
│ DialogOrganism   │     │ (table + filter) │       │
└──────────────────┘     └──────────────────┘       │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Backend:        │
                                          │  settings/*      │
                                          │  (NestJS +       │
                                          │   TypeORM)       │
                                          └────────┬─────────┘
                                                   │
                                           ┌───────▼───────┐
                                           │  PostgreSQL   │
                                           │  (taxes,      │
                                           │   payment_*)  │
                                           └───────────────┘
```

Same flow for PaymentMethods and PaymentTypes — three parallel pipelines, identical pattern.

## File Changes

### Frontend (`erpfrontend`)

| File | Action | Description |
|------|--------|-------------|
| `src/app/app.routes.ts` | Modify | Add `/settings` lazy route with 3 child CRUD routes + wildcard 404 |
| `src/app/components/organisms/navbar/navbar.component.ts` | Modify | Add `[routerLink]="'/settings'"` + `(click)="menu?.close()"` to Configuración button (lines 69-72) |
| `src/app/models/tax.model.ts` | Create | `Tax`, `CreateTaxDto`, `UpdateTaxDto` interfaces |
| `src/app/models/payment-method.model.ts` | Create | `PaymentMethod`, `CreatePaymentMethodDto`, `UpdatePaymentMethodDto` |
| `src/app/models/payment-type.model.ts` | Create | `PaymentType`, `CreatePaymentTypeDto`, `UpdatePaymentTypeDto` |
| `src/app/services/taxes.service.ts` | Create | Signals-based CRUD, matching CustomerService pattern |
| `src/app/services/payment-methods.service.ts` | Create | Same pattern |
| `src/app/services/payment-types.service.ts` | Create | Same pattern |
| `src/app/components/pages/settings-page/settings-page.component.ts` | Create | Card grid with 3 cards, responsive grid, routerLink per card |
| `src/app/components/pages/settings-page/settings-page.component.spec.ts` | Create | Vitest: renders 3 cards, navigates on click |
| `src/app/components/pages/settings-taxes-page/settings-taxes-page.component.ts` | Create | CRUD table page, reuses DashboardLayout + data table pattern |
| `src/app/components/pages/settings-taxes-page/settings-taxes-page.component.spec.ts` | Create | Vitest: load, paginate, open dialog, confirm delete |
| `src/app/components/pages/settings-payment-methods-page/settings-payment-methods-page.component.ts` | Create | Same pattern |
| `src/app/components/pages/settings-payment-methods-page/settings-payment-methods-page.component.spec.ts` | Create | Same |
| `src/app/components/pages/settings-payment-types-page/settings-payment-types-page.component.ts` | Create | Same pattern |
| `src/app/components/pages/settings-payment-types-page/settings-payment-types-page.component.spec.ts` | Create | Same |
| `src/app/components/organisms/tax-dialog/tax-dialog.component.ts` | Create | MatDialog form: name, code, percentage, type (select), isPurchase/isSell (toggle), isActive, sortOrder |
| `src/app/components/organisms/tax-dialog/tax-dialog.component.spec.ts` | Create | Vitest: create mode, edit mode, validation, submit |
| `src/app/components/organisms/payment-method-dialog/payment-method-dialog.component.ts` | Create | MatDialog form: name, code, description, isActive, sortOrder |
| `src/app/components/organisms/payment-method-dialog/payment-method-dialog.component.spec.ts` | Create | Same |
| `src/app/components/organisms/payment-type-dialog/payment-type-dialog.component.ts` | Create | MatDialog form: name, code, description, isActive, sortOrder |
| `src/app/components/organisms/payment-type-dialog/payment-type-dialog.component.spec.ts` | Create | Same |

### Backend (`erpbackend`)

| File | Action | Description |
|------|--------|-------------|
| `src/app.module.ts` | Modify | Import `SettingsModule` + register entities in TypeOrm config |
| `src/modules/settings/settings.module.ts` | Create | `TypeOrmModule.forFeature([Tax, PaymentMethod, PaymentType])` |
| `src/modules/settings/entities/tax.entity.ts` | Create | TypeORM entity: name, code, percentage, type enum, isPurchase, isSell, isActive, sortOrder |
| `src/modules/settings/entities/payment-method.entity.ts` | Create | TypeORM entity: name, code, description, isActive, sortOrder |
| `src/modules/settings/entities/payment-type.entity.ts` | Create | TypeORM entity: name, code, description, isActive, sortOrder |
| `src/modules/settings/dto/create-tax.dto.ts` | Create | class-validator: @IsString, @IsNumber, @IsEnum, @IsBoolean, @IsOptional |
| `src/modules/settings/dto/update-tax.dto.ts` | Create | `extends PartialType(CreateTaxDto)` |
| `src/modules/settings/dto/query-tax.dto.ts` | Create | Extends `PaginationDto` with isActive filter |
| `src/modules/settings/dto/create-payment-method.dto.ts` | Create | Same pattern |
| `src/modules/settings/dto/update-payment-method.dto.ts` | Create | `PartialType` |
| `src/modules/settings/dto/query-payment-method.dto.ts` | Create | Same |
| `src/modules/settings/dto/create-payment-type.dto.ts` | Create | Same |
| `src/modules/settings/dto/update-payment-type.dto.ts` | Create | `PartialType` |
| `src/modules/settings/dto/query-payment-type.dto.ts` | Create | Same |
| `src/modules/settings/controllers/taxes.controller.ts` | Create | `@Controller('settings/taxes')`, `@UseGuards(JwtAuthGuard)` |
| `src/modules/settings/controllers/payment-methods.controller.ts` | Create | `@Controller('settings/payment-methods')` |
| `src/modules/settings/controllers/payment-types.controller.ts` | Create | `@Controller('settings/payment-types')` |
| `src/modules/settings/services/taxes.service.ts` | Create | CRUD + duplicate checks (name + code), referential integrity check |
| `src/modules/settings/services/payment-methods.service.ts` | Create | Same pattern |
| `src/modules/settings/services/payment-types.service.ts` | Create | Same pattern |
| `src/modules/settings/tests/` | Create | Jest spec per service |

## Interfaces / Contracts

```typescript
// Frontend models
export interface Tax {
  id: string;
  name: string;
  code: string;
  percentage: number;
  type: 'percentage' | 'fixed';
  isPurchase: boolean;
  isSell: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateTaxDto {
  name: string; code: string; percentage: number;
  type: 'percentage' | 'fixed';
  isPurchase?: boolean; isSell?: boolean;
  isActive?: boolean; sortOrder?: number;
}
export interface UpdateTaxDto extends Partial<CreateTaxDto> {}

// PaymentMethod / PaymentType follow the same structure
// (name, code, description?, isActive, sortOrder)

// Dialog data interfaces
export interface TaxDialogData { tax?: Tax; }
export interface PaymentMethodDialogData { paymentMethod?: PaymentMethod; }
export interface PaymentTypeDialogData { paymentType?: PaymentType; }
```

```typescript
// Backend entity — snake_case columns, UUID PK
@Entity('taxes')
export class Tax {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true, length: 100 }) name: string;
  @Column({ unique: true, length: 20 }) code: string;
  @Column('decimal', { precision: 5, scale: 2 }) percentage: number;
  @Column({ type: 'enum', enum: ['percentage', 'fixed'] }) type: string;
  @Column({ default: false }) isPurchase: boolean;
  @Column({ default: false }) isSell: boolean;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) sortOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (FE) | Each dialog organism | Create/edit modes, validation errors, submit success/failure |
| Unit (FE) | Each settings page | loadData, paginate, openDialog, confirmDelete |
| Unit (FE) | Each service | All CRUD methods, error handling, signal state after ops |
| Unit (FE) | Navbar | Click Configuración → navigates to `/settings`, dropdown closes |
| Unit (BE) | Each service | CRUD, duplicate name/code rejection, not-found, reference check |
| Unit (BE) | Each controller | Route params, guard setup, DTO validation |

## Migration / Rollout

No migration required: `synchronize: true` in dev creates tables automatically. Generate a proper TypeORM migration before production deploy via `npx typeorm migration:generate` pointing to the three new entities.

## Open Questions

- [ ] Confirm exact `options` for the `tax.type` enum on `ui-select` (enum labels in Spanish?)
- [ ] Confirm toggle atom — `ui-toggle` or `mat-slide-toggle` for `isPurchase`/`isSell`/`isActive` booleans?
- [ ] Confirm sidebar: does `/settings` also need a sidebar nav entry now, or only navbar dropdown?
- [ ] Confirm `description` field — textarea atom (`ui-textarea`) or simple `ui-text-input`?
