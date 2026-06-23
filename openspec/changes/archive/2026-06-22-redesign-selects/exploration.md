# Exploration: redesign-selects

## Current State

La aplicación erpfrontend tiene **~45 elementos `<select>`** distribuidos en **~28 componentes**, usando tres patrones completamente distintos y al menos 4 sub-variantes visuales de Tailwind. No hay consistencia en diseño, comportamiento ni API de binding.

La brecha más crítica: el componente atómico `ui-select` (`SelectAtom`) que YA EXISTE en `src/app/components/atoms/select/` tiene un diseño visual incompatible con el sistema de diseño Tailwind del resto de la app (usa SCSS con CSS variables y metodología BEM, sin clases de Tailwind), y además carece de integración con Reactive Forms (`ControlValueAccessor`).

---

## Select Inventory

### Pattern A: Native `<select>` con Tailwind inline (~27 instancias)

#### Sub-patrón A1 — Reference Design (customer-dialog style)
Igual que `ui-text-input`: wrapper con label + icon + select con Tailwind.

| Component | File | Field(s) | Binding | Lines |
|-----------|------|----------|---------|-------|
| `CustomerDialogOrganism` | `organisms/customer-dialog/` | `documentType`, `status` | `[(ngModel)]` | 69, 85 |
| `ProductFormMolecule` | `molecules/product-form/` | `categoryId` | `[(ngModel)]` | 59 |

**Clases exactas (reference):**
```
container: flex flex-col gap-1.5
label:     text-xs font-black text-gray-500 uppercase tracking-widest
icon:      material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600
select:    w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900
           focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none
```

El `ProductFormMolecule` omite el icono (`px-4` en vez de `pl-12 pr-4`) y no tiene `<div class="relative">`.

#### Sub-patrón A2 — Page-level filter selects
Usados en páginas de listado como filtros principales. Mismas clases base pero `bg-gray-50`, sin wrapper de label/icon.

| Component | File | Field(s) | Binding | Lines |
|-----------|------|----------|---------|-------|
| `SalesPageComponent` | `pages/sales-page/` | `customerFilter`, `statusFilter` | `(change)` → signal | 58, 68 |
| `InventoryProductsPage` | `pages/inventory-page/inventory-products-page/` | `categoryFilter` | `(change)` → signal | 61 |
| `InventoryPurchasesPage` | `pages/inventory-page/inventory-purchases-page/` | `supplierFilter`, `statusFilter` | `(change)` → signal | 56, 69 |
| `TransportDispatchView` | `pages/transport-page/transport-dispatch-view/` | `customerName`, `vehicleId` | `formControlName` | 36, 68 |

**Clases:**
```
w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900
focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none
```

**⚠️ Riesgo**: Sales y transport usan `formControlName` (Reactive Forms), el resto usa `(change)` con señales. Migrar a `ui-select` requeriría `ControlValueAccessor`.

#### Sub-patrón A3 — Dialog selects (compactos)
Border-radius y padding más pequeños, foco en `indigo-500` en vez de `indigo-200`.

| Component | File | Field(s) | Binding | Lines |
|-----------|------|----------|---------|-------|
| `AppointmentConfirmationDialog` | `organisms/appointment-confirmation-dialog/` | `provider` | `formControlName` | 83 |
| `IncapacityDialog` | `organisms/incapacity-dialog/` | `type`, `specialLicense` | `formControlName` | 68, 78 |
| `OrdersDialog` | `organisms/orders-dialog/` | `route` | `formControlName` | 95 |
| `TransportChangeVehicleDialog` | `organisms/transport-change-vehicle-dialog/` | `newVehicleId` | `formControlName` | 54 |
| `TransportDispatchDialog` | `organisms/transport-dispatch-dialog/` | `customerName` | `formControlName` | 58 |
| `TransportExpenseDialog` | `organisms/transport-expense-dialog/` | `type` | `formControlName` | 58 |
| `TransportIncidentDialog` | `organisms/transport-incident-dialog/` | `type` | `formControlName` | 54 |
| `TransportMaintenanceDialog` | `organisms/transport-maintenance-dialog/` | `type` | `formControlName` | 58 |
| `TransportOperationDialog` | `organisms/transport-operation-dialog/` | `type`, `vehicleId` | `formControlName` | 58, 83 |

**Clases:**
```
w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500
focus:border-transparent outline-none transition-all text-sm bg-white
```
Variantes de `pl-10 pr-4` cuando tienen icono (transport dialogs).

#### Sub-patrón A4 — Page size selects (mini)
Selects de paginación, diseño completamente distinto.

| Component | File | Binding | Lines |
|-----------|------|---------|-------|
| `SalesPageComponent` | `pages/sales-page/` | `(change)` → signal | 163 |
| `SalesCustomersPage` | `pages/sales-page/sales-customers-page/` | `(change)` → signal | 163 |
| `InventoryProductsPage` | `pages/inventory-page/inventory-products-page/` | `(change)` → signal | 164 |
| `InventorySuppliersPage` | `pages/inventory-page/inventory-suppliers-page/` | `(change)` → signal | 131 |
| `InventoryPurchasesPage` | `pages/inventory-page/inventory-purchases-page/` | `(change)` → signal | 165 |
| `InventoryCategoriesPage` | `pages/inventory-page/inventory-categories-page/` | `(change)` → signal | 123 |

**Clases:**
```
text-xs font-bold text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none
```

**⚠️ Riesgo**: Estos selects de paginación probablemente deberían quedarse como nativos — son mini-controles funcionales, no form inputs del sistema de diseño.

---

### Pattern B: `<mat-select>` inside `<mat-form-field>` (~16 instancias)

Todas siguen el mismo patrón Material `appearance="outline"`. Mezclan `[(ngModel)]` (template-driven) y `formControlName` (reactive).

| Component | File | Field(s) | Binding | Lines |
|-----------|------|----------|---------|-------|
| `AppointmentFiltersMolecule` | `molecules/appointment-filters/` | `statusFilter` | `[(ngModel)]` | 39 |
| `BillingFiltersMolecule` | `molecules/billing-filters/` | `providerFilter`, `statusFilter` | `[(ngModel)]` | 33, 44 |
| `MovementsTableMolecule` | `molecules/movements-table/` | `filterType` | `[(ngModel)]` | 36 |
| `AdjustmentFormDialog` | `organisms/adjustment-form-dialog/` | `correctionConceptCode` | `formControlName` | 155 |
| `AppointmentFormOrganism` | `organisms/appointment-form/` | `type` | `formControlName` | 83 |
| `InvoiceFormDialog` | `organisms/invoice-form-dialog/` | `appointmentType`, `provider` | `formControlName` | 80, 105 |
| `PatientRegistrationWizard` | `organisms/patient-registration-wizard/` | `gender`, `idType`, `zone`, `healthRegime` | `formControlName` | 66, 75, 107, 138 |
| `SalesNoteFormDialog` | `organisms/sales-note-form-dialog/` | `noteType`, `correctionConceptCode` | `formControlName` | 80, 92 |
| `PurchaseOrderDialog` | `organisms/purchase-order-dialog/` | `supplierId`, `productId` | `formControlName` | 90, 140 |

**Patrón Material típico:**
```html
<mat-form-field appearance="outline" class="w-full !m-0">
  <mat-label>Estado</mat-label>
  <mat-select [(ngModel)]="statusFilter">
    <mat-option value="all">Todos los estados</mat-option>
    ...
  </mat-select>
  <mat-icon matPrefix class="mr-2 text-gray-400">icon_name</mat-icon>
</mat-form-field>
```

**⚠️ Riesgo**: `PatientRegistrationWizard` es el componente con más mat-selects (4) y usa Material Stepper — migrar estos requiere cuidado con la integración del stepper.

---

### Pattern C: `<ui-select>` (SelectAtom) — ~2 usos

El componente YA EXISTE en `src/app/components/atoms/select/` como `SelectAtom`, selector `ui-select`, standalone.

**Único consumidor real**: `SearchFiltersMolecule` (`molecules/search-filters/`) — 2 instancias (una por cada filter definition de tipo `'select'`).

```html
<ui-select
  class="search-filters__select"
  [label]="filter.label"
  [placeholder]="filter.label"
  [options]="filter.options ?? []"
  [value]="filterValues()[filter.key]"
  (valueChange)="onFilterChange(filter.key, $event)"
/>
```

---

## Existing Component: SelectAtom API

### Public Inputs
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `options` | `input<SelectOption[]>` | `[]` | Array `{value: string, label: string}` |
| `value` | `input<string>` | `''` | Valor seleccionado actual |
| `searchable` | `input<boolean>` | `false` | Habilita búsqueda inline en el dropdown |
| `label` | `input<string>` | `''` | Label flotante (se mueve arriba al abrir) |
| `error` | `input<string>` | `''` | Mensaje de error |
| `disabled` | `input<boolean>` | `false` | Deshabilita el select |
| `placeholder` | `input<string>` | `'Seleccionar...'` | Placeholder cuando no hay valor |

### Public Outputs
| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | `output<string>()` | Emite el `value` seleccionado |

### Capacidades
- ✅ Dropdown custom con panel posicionado absolutamente
- ✅ Búsqueda inline (`searchable`)
- ✅ Navegación por teclado (ArrowDown/Up, Enter, Escape)
- ✅ Click outside para cerrar
- ✅ Estado disabled, error, placeholder
- ✅ `ChangeDetectionStrategy.OnPush`
- ✅ Tests unitarios (5 tests con Vitest)
- ❌ **NO implementa `ControlValueAccessor`** — no funciona con `formControlName` ni `[(ngModel)]` reactivo
- ❌ **NO tiene input `icon`** — el reference design siempre lleva icono
- ❌ **NO tiene `required`** — sin indicador visual de required
- ❌ **NO tiene `helperText`**
- ❌ **NO tiene `name` attribute**
- ❌ **NO tiene `id` automático** para label `[for]`

### Diseño Visual Actual (vía SCSS)
- Usa `border-bottom: 1px solid var(--color-border)` (estilo underline, NO outline)
- Sin border-radius en el trigger
- Sin ícono de dropdown nativo (usa un SVG inline)
- Sin focus ring (solo cambia border-bottom-color)
- Label flotante (se mueve hacia arriba al enfocar/abrir)
- Dropdown panel con `border-radius: var(--radius-md)`

**🔴 Gap crítico**: El diseño visual es completamente incompatible con el reference design (customer-dialog / ui-text-input). El reference usa Tailwind (`rounded-2xl`, `border`, `focus:ring-2`, `h-14`, icono Material), mientras que `SelectAtom` usa SCSS con CSS variables y un estilo underline sin bordes redondeados.

---

## Pattern Analysis: Gaps vs Reference Design

| Característica | Reference (customer-dialog) | SelectAtom actual | Gap |
|---------------|----------------------------|-------------------|-----|
| **Estilo visual** | Tailwind: rounded-2xl, border, h-14, focus:ring-indigo | SCSS: border-bottom, sin rounded, sin focus ring | 🔴 Total |
| **Altura** | `h-14` (56px) | Sin altura fija (padding interno) | 🔴 |
| **Border** | `border border-gray-200` full | Solo `border-bottom` | 🔴 |
| **Border radius** | `rounded-2xl` (16px) | Sin border-radius | 🔴 |
| **Focus ring** | `focus:ring-2 focus:ring-indigo-200` | Solo `border-bottom-color` | 🔴 |
| **Ícono** | Material icon dentro del select (`left-4`) | SVG inline arrow solamente | 🔴 |
| **Label** | Fuera del select, `text-xs font-black uppercase` | Flotante sobre el borde inferior | 🔴 |
| **Reactive Forms** | ✅ `[(ngModel)]` y `formControlName` | ❌ Sin ControlValueAccessor | 🔴 |
| **Dropdown** | Nativo del browser | Custom panel | 🟡 Diferente |
| **`required` indicator** | ✅ asterisco rojo en label | ❌ | 🟡 |
| **`appearance-none`** | ✅ Remove native arrow | ❌ No aplica (no es nativo) | - |
| **`disabled` state** | `disabled:opacity-50` | `opacity: 0.4` | 🟢 Similar |
| **Color de texto** | `text-gray-900`, `font-bold` | `var(--color-text-primary)` | 🟡 CSS var |

---

## Recommendation

### Enfoque recomendado: **Reescribir `SelectAtom` con diseño Tailwind + ControlValueAccessor**

**NO extender** el `SelectAtom` actual — su diseño SCSS/BEM es incompatible con el sistema Tailwind. Rewrite completo del template y estilos.

#### Qué migrar a `ui-select` (nuevo diseño):
- ✅ Todos los Pattern A1, A2, A3 (~21 selects) → migrar a `<ui-select>` con API ampliada
- ✅ Todos los Pattern B (`mat-select`) (~16 selects) → migrar a `<ui-select>` para unificar

#### Qué DEJAR como nativo (no migrar):
- ⚠️ Sub-patrón A4 — Page size selects (6 instancias): son mini-controles de paginación, no form inputs. Dejarlos como `<select>` nativo con sus clases actuales.

#### Nueva API propuesta para `ui-select`:
```typescript
// Mantener inputs existentes + agregar:
icon = input<string>('');                          // Material icon name
required = input(false);                           // Muestra asterisco en label
helperText = input<string>('');                    // Texto de ayuda
name = input<string>('');                          // Atributo name para forms

// Implementar ControlValueAccessor para Reactive Forms
// providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: SelectAtom, multi: true }]
```

#### Template propuesto (Tailwind, consistente con ui-text-input):
```html
<div class="flex flex-col gap-1.5">
  @if (label()) {
    <label [for]="selectId()" class="text-xs font-black text-gray-500 uppercase tracking-widest">
      {{ label() }}
      @if (required()) { <span class="text-red-500">*</span> }
    </label>
  }
  <div class="relative">
    @if (icon()) {
      <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 z-10">
        {{ icon() }}
      </span>
    }
    <button type="button" class="w-full h-14 pl-12 pr-4 rounded-2xl border ...">
      <!-- trigger con las clases del reference design -->
    </button>
  </div>
  <!-- dropdown panel -->
  <!-- error / helper text -->
</div>
```

#### Estrategia de migración (3 fases):

**Fase 1 — Rewrite del átomo (bajo riesgo)**
- Reescribir `SelectAtom` template con Tailwind (consistente con `ui-text-input`)
- Agregar `ControlValueAccessor`
- Agregar inputs: `icon`, `required`, `helperText`, `name`
- Actualizar tests
- **Impacto**: Solo `SearchFiltersMolecule` (2 usos) — verificar que no se rompa

**Fase 2 — Migrar Pattern B (mat-select) primero (~16 selects)**
- Mayor ganancia: eliminar dependencia de `MatSelectModule` en ~9 componentes
- El `mat-select` actual ya está dentro de Reactive Forms → el nuevo `ui-select` con `ControlValueAccessor` hace drop-in replacement
- Componentes a migrar: `AppointmentFilters`, `BillingFilters`, `MovementsTable`, `AdjustmentFormDialog`, `AppointmentForm`, `InvoiceFormDialog`, `PatientRegistrationWizard`, `SalesNoteFormDialog`, `PurchaseOrderDialog`

**Fase 3 — Migrar Pattern A1/A2/A3 native selects (~21 selects)**
- Ya usan Tailwind — el nuevo `ui-select` replica exactamente las mismas clases visuales
- Unificar `(change)` handlers y `formControlName` bindings

---

## Risk Areas

### 🔴 Alto riesgo
1. **`PatientRegistrationWizard`**: 4 mat-selects dentro de un `mat-stepper`. Migrar requiere verificar que el stepper navigation ( `matStepperNext` / `matStepperPrevious`) siga funcionando con los nuevos componentes. Posiblemente requiera mantener `MatStepperModule` importado aunque se remplacen los `mat-select`.

2. **`SelectAtom` breaking change**: `SearchFiltersMolecule` es el único consumidor actual. El nuevo diseño Tailwind + `ControlValueAccessor` podría cambiar el comportamiento de `valueChange`. Verificar que los tests de `search-filters` sigan pasando.

3. **Dropdown nativo vs custom**: El `SelectAtom` actual implementa un dropdown custom (no es un `<select>` nativo). Esto significa:
   - No funciona `appearance-none` (no aplica)
   - El comportamiento de accesibilidad es diferente
   - En móviles, el dropdown nativo tiene mejor UX táctil

### 🟡 Riesgo medio
4. **Page size selects**: Si se migran incorrectamente, pierden su diseño compacto. Deben quedarse como nativos o el `ui-select` necesita un `size` variant (`'sm' | 'md' | 'lg'`).

5. **Template-driven vs Reactive**: Algunos componentes usan `[(ngModel)]` (template-driven), otros `formControlName` (reactive). El `ControlValueAccessor` soporta ambos, pero hay que verificar cada binding durante la migración.

6. **MatIconModule**: Al migrar `mat-select`, algunos componentes podrían seguir necesitando `MatIconModule` para otros iconos (ej. `mat-datepicker-toggle`). No se debe eliminar el import sin verificar.

### 🟢 Riesgo bajo
7. **Estilos condicionales**: Algunos selects nativos cambian `focus:ring-indigo-500` por `focus:ring-emerald-500` o `focus:ring-red-500` según el contexto (transport dialogs). El `ui-select` podría necesitar un input `variant` o usar `class` merging.

---

## Ready for Proposal

**Sí**. La exploración identificó todos los selects (45 instancias, 3 patrones, 4 sub-patrones), documentó el reference design exacto, analizó el `SelectAtom` existente y sus gaps, y propuso un enfoque de migración en 3 fases con riesgos identificados.

**El orchestrator debe informar al usuario**:
- Hay un `SelectAtom` existente pero con diseño incompatible — se reescribirá
- ~39 de 45 selects migrarán a `ui-select`; 6 page-size selects se quedan nativos
- La migración de `mat-select` (Pattern B) es la de mayor valor: elimina dependencia Material en 9 componentes
- El `PatientRegistrationWizard` es el componente más riesgoso (mat-stepper + 4 selects)
- Se recomienda proposal → spec → design → tasks en ese orden
