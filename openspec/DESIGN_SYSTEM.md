# Guía del Sistema de Diseño — ERP Frontend

## Principio de Diseño

Todos los campos de formulario siguen el mismo patrón visual canónico:

```
h-14 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900
focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all
```

**Label**: `text-xs font-black text-gray-500 uppercase tracking-widest`
**Wrapper**: `flex flex-col gap-1.5`
**Error**: `text-xs text-red-500 font-medium`
**Helper**: `text-xs text-gray-400`
**Disabled**: `opacity-50 cursor-not-allowed`
**Required**: `<span class="text-red-500">*</span>` junto al label

---

## Componentes Disponibles

### 1. `ui-text-input` — Input de texto

**Selector**: `<ui-text-input>`
**Archivo**: `src/app/components/atoms/text-input/text-input.component.ts`
**Spec**: `openspec/specs/text-input-atom/spec.md`

```html
<ui-text-input
  label="Nombre"
  icon="person"
  placeholder="Ej. Juan Pérez"
  [(value)]="name"
  [required]="true"
/>
```

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Label del campo |
| `icon` | `string` | `''` | Nombre de Material Icons |
| `type` | `'text'\|'email'\|'password'\|'number'` | `'text'` | Tipo de input |
| `placeholder` | `string` | `''` | Placeholder |
| `value` | `model<string>` | `''` | Valor (two-way binding) |
| `error` | `string` | `''` | Mensaje de error |
| `helperText` | `string` | `''` | Texto de ayuda |
| `required` | `boolean` | `false` | Requerido |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `iconLibrary` | `'material'\|'boxicons'` | `'material'` | Librería de íconos |

**Formas de binding**:
```html
<!-- Template-driven -->
<ui-text-input [(value)]="name" />

<!-- Reactive Forms -->
<ui-text-input [formControl]="nameControl" />

<!-- Solo lectura con handler -->
<ui-text-input [value]="name()" (valueChange)="name.set($event)" />
```

**Íconos válidos** (Material Icons): `person`, `email`, `phone`, `search`, `fingerprint`, `location_on`, `badge`, `inventory_2`, `barcode` → `qr_code_2`, `sell` → `payments`, `warning`, `lock`, `description`, `calendar_today`, `category`, `business`, `attach_money`, `payments`, `inventory`, `numbers`

---

### 2. `ui-textarea` — Área de texto

**Selector**: `<ui-textarea>`
**Archivo**: `src/app/components/atoms/textarea/textarea.component.ts`
**Spec**: `openspec/specs/textarea-atom/spec.md`

```html
<ui-textarea
  label="Observaciones"
  placeholder="Detalles adicionales..."
  [(value)]="notes"
  [rows]="4"
  resize="vertical"
  minHeight="120px"
/>
```

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Label |
| `placeholder` | `string` | `''` | Placeholder |
| `value` | `model<string>` | `''` | Valor (two-way) |
| `rows` | `number` | `3` | Filas visibles |
| `resize` | `string` | `'vertical'` | CSS resize (`none`, `both`, `vertical`, `horizontal`) |
| `minHeight` | `string` | `''` | Altura mínima CSS |
| `error` | `string` | `''` | Error |
| `helperText` | `string` | `''` | Ayuda |
| `required` | `boolean` | `false` | Requerido |
| `disabled` | `boolean` | `false` | Deshabilitado |

---

### 3. `ui-select` — Dropdown de selección

**Selector**: `<ui-select>`
**Archivo**: `src/app/components/atoms/select/select.component.ts`
**Spec**: `openspec/specs/select-atom/spec.md`

#### Uso básico

```html
<ui-select
  label="Categoría"
  placeholder="Seleccionar..."
  [options]="categoryOptions"
  [(value)]="selectedCategory"
/>
```

```typescript
// Opciones estáticas
statusOptions: SelectOption[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

// Opciones dinámicas (desde servicio/signal)
categoryOptions = computed(() =>
  this.categories().map(c => ({ value: c.id, label: c.name }))
);
```

#### Uso con búsqueda async (searchable)

```html
<ui-select
  label="Cliente"
  placeholder="Buscar cliente..."
  [searchable]="true"
  [loading]="isLoading()"
  [options]="customerOptions"
  [formControl]="customerSearchControl"
  (searchChange)="onSearch($event)"
  footerLabel="Crear nuevo cliente"
  (footerAction)="openCreateDialog()"
  emptyText="No se encontraron clientes"
/>
```

#### Uso con subtítulo

```html
<ui-select
  [searchable]="true"
  [options]="productOptions"
  [showSubtitle]="true"
  [formControl]="productControl"
/>

<!-- productOptions: SelectOption[] con subtitle -->
{ value: '1', label: 'Producto A', subtitle: 'Stock: 25' }
```

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Label |
| `placeholder` | `string` | `''` | Placeholder |
| `options` | `SelectOption[]` | `[]` | Opciones `{value, label, subtitle?, icon?}` |
| `value` | `model<string>` | `''` | Valor seleccionado (two-way) |
| `searchable` | `boolean` | `false` | Activa búsqueda |
| `loading` | `boolean` | `false` | Muestra spinner |
| `emptyText` | `string` | `'Sin resultados'` | Texto sin resultados |
| `showSubtitle` | `boolean` | `false` | Muestra subtítulo por opción |
| `footerLabel` | `string` | `''` | Label del botón footer |
| `error` | `string` | `''` | Error |
| `helperText` | `string` | `''` | Ayuda |
| `required` | `boolean` | `false` | Requerido |
| `disabled` | `boolean` | `false` | Deshabilitado |

| Output | Tipo | Descripción |
|---|---|---|
| `valueChange` | `string` | Emite al seleccionar |
| `searchChange` | `string` | Emite al escribir en búsqueda |
| `footerAction` | `void` | Emite al clickear footer |

---

### 4. `ui-datepicker` — Selector de fecha

**Selector**: `<ui-datepicker>`
**Archivo**: `src/app/components/atoms/datepicker/datepicker.component.ts`
**Spec**: `openspec/specs/datepicker-atom/spec.md`

```html
<ui-datepicker
  label="Fecha de Pedido"
  [formControl]="form.controls.orderDate"
/>
```

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Label |
| `placeholder` | `string` | `''` | Placeholder |
| `value` | `model<string>` | `''` | Valor YYYY-MM-DD (two-way) |
| `min` | `string` | `''` | Fecha mínima YYYY-MM-DD |
| `max` | `string` | `''` | Fecha máxima YYYY-MM-DD |
| `error` | `string` | `''` | Error |
| `helperText` | `string` | `''` | Ayuda |
| `required` | `boolean` | `false` | Requerido |
| `disabled` | `boolean` | `false` | Deshabilitado |

**Conversión Date ↔ string**:
```typescript
// Date → YYYY-MM-DD
dateToString(d: Date | null): string {
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// YYYY-MM-DD → Date
const date = val ? new Date(val) : null;
```

---

## Reglas de Migración

### Al migrar desde `mat-form-field` + `matInput`:

1. ✅ Reemplazar por el atom correspondiente (`ui-text-input`, `ui-textarea`, `ui-select`, `ui-datepicker`)
2. ✅ Agregar el componente al array `imports` del `@Component`
3. ✅ Si es el último `matInput` del componente, eliminar `MatInputModule` de imports
4. ✅ Si es el último `mat-select`, eliminar `MatSelectModule`
5. ✅ Si es el último `mat-datepicker`, eliminar `MatDatepickerModule` + `MatNativeDateModule`
6. ✅ Solo mantener `MatFormFieldModule` si quedan otros controles Material (ej: timepicker)
7. ✅ Eliminar `::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }` si ya no hay `mat-form-field`

### Al crear opciones para `ui-select`:

```typescript
// Opciones estáticas
readonly statusOptions: SelectOption[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

// Desde signal
supplierOptions = computed<SelectOption[]>(() =>
  this.suppliers().map(s => ({ value: s.id, label: s.name }))
);

// Con subtítulo
productOptions = computed<SelectOption[]>(() =>
  this.products().map(p => ({
    value: p.id,
    label: p.name,
    subtitle: `Stock: ${p.currentStock}`
  }))
);
```

### Al usar `[formControl]` con componentes custom:

```html
<!-- ✅ Correcto — CVA registrado vía NG_VALUE_ACCESSOR -->
<ui-text-input [formControl]="form.controls.name" />
<ui-select [formControl]="form.controls.categoryId" />
<ui-datepicker [formControl]="form.controls.date" />
<ui-textarea formControlName="observations" />

<!-- ❌ Incorrecto — formControl requiere CVA en el componente -->
<div [formControl]="form.controls.x">...</div>
```

### Al migrar handlers de eventos:

```html
<!-- ❌ Antes: raw HTML con (input) handler -->
<input (input)="onFilterChange($event)" />

<!-- ✅ Ahora: binding directo al signal -->
<ui-text-input (valueChange)="filter.set($event)" />
```

---

## Lecciones Aprendidas

1. **Siempre agregar el componente al array `imports`**: El import de TypeScript no es suficiente — Angular standalone components requieren estar en `@Component.imports`.

2. **`untracked()` en `writeValue` de CVA**: Evita `ExpressionChangedAfterItHasBeenCheckedError` cuando Angular Forms inicializa controles.

3. **No remover `MatInputModule` si hay datepickers/timepickers/autocompletes**: Estos dependen de `matInput` internamente.

4. **`[(value)]` no funciona con tipos nullable**: Si el modelo es `string | null` o `Partial<T>`, usar `[value]` + `(valueChange)`.

5. **Íconos de Material Icons**: Verificar que el nombre existe. Nombres inválidos (`barcode`, `sell`) causan glifos rotos.

6. **`private` vs `protected` en métodos**: Angular AOT (`ng build`) rechaza métodos `private` llamados desde templates.

7. **`model()` → cambio de tipo**: Si el modelo del componente cambia de tipo (ej: `string` vs `Date`), los consumidores con `[(value)]` necesitan conversión explícita.

---

## Referencia Rápida

| Propósito | Componente | Binding |
|---|---|---|
| Texto corto | `<ui-text-input>` | `[(value)]` o `[formControl]` |
| Texto largo | `<ui-textarea>` | `[(value)]` o `formControlName` |
| Selección | `<ui-select>` | `[(value)]` o `[formControl]` |
| Búsqueda async | `<ui-select searchable="true">` | `[formControl]` + `(searchChange)` |
| Fecha | `<ui-datepicker>` | `[formControl]` |
| Footer "Crear nuevo" | `<ui-select footerLabel="...">` | `(footerAction)` |
