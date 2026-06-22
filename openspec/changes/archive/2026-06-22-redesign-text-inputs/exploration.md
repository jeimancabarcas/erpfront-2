# Exploration: redesign-text-inputs

## Current State

The ERP frontend (Angular 21 + Angular Material 21 + TailwindCSS 4) uses **three completely different text input patterns** across its forms, with no shared design system for text inputs that matches the "nuevo cliente" aesthetic. The reference design (customer-dialog organism) uses a clean, native-HTML + Tailwind approach with Material Icons inside inputs. However, this pattern is not replicated consistently anywhere else.

No shared input component exists that encapsulates the nuevo-cliente design. The existing `InputAtom` (`ui-input`) follows a different design system entirely (bottom-border, floating labels, SCSS variables).

## Reference Design: CustomerDialogOrganism (nuevo cliente)

**File**: `src/app/components/organisms/customer-dialog/customer-dialog.component.ts`

### Structure per text input

```html
<div class="flex flex-col gap-1.5">
  <label class="text-xs font-black text-gray-500 uppercase tracking-widest">
    Label Text
  </label>
  <div class="relative">
    <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">
      icon_name
    </span>
    <input
      [(ngModel)]="..."
      name="..."
      required
      placeholder="..."
      class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white
             text-sm font-bold text-gray-900
             focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
             transition-all">
  </div>
</div>
```

### Field-level design tokens

| Token | Value |
|-------|-------|
| **Height** | `h-14` (56px) |
| **Border radius** | `rounded-2xl` |
| **Border** | `border border-gray-200` |
| **Background** | `bg-white` |
| **Font size** | `text-sm` (14px) |
| **Font weight** | `font-bold` |
| **Text color** | `text-gray-900` |
| **Placeholder** | Inherits opacity from browser default |
| **Focus ring** | `ring-2 ring-indigo-200` |
| **Focus border** | `border-indigo-400` |
| **Transition** | `transition-all` |
| **Label size** | `text-xs` (12px) |
| **Label weight** | `font-black` |
| **Label color** | `text-gray-500` |
| **Label tracking** | `uppercase tracking-widest` |
| **Label gap** | `gap-1.5` |
| **Input padding (w/ icon)** | `pl-12 pr-4` |
| **Input padding (no icon)** | `px-4` |
| **Icon position** | `absolute left-4 top-1/2 -translate-y-1/2` |
| **Icon color** | `text-indigo-600` |
| **Form system** | `FormsModule` (ngModel, template-driven) |

### Fields in the reference form
1. **name** — text input with `person` icon
2. **email** — email input with `email` icon
3. **documentType** — native `<select>` with `badge` icon
4. **documentNumber** — text input with `fingerprint` icon
5. **status** — native `<select>` with `toggle_on` icon
6. **phone** — text input with `phone` icon
7. **address** — text input with `location_on` icon

All 7 fields follow identical structure. All icons are Boxicons-compatible Material Icons (`<span class="material-icons">`).

---

## Text Input Inventory — Complete Catalog

### Pattern 1: Native Tailwind Inputs (closest to reference)

| Component | Path | Type | Inputs | Icons | Labels Match | Form System |
|-----------|------|------|--------|-------|-------------|-------------|
| **customer-dialog** (REFERENCE) | `organisms/customer-dialog/` | organism | 5 text + 2 select | ✅ All fields | ✅ | FormsModule |
| **product-form** | `molecules/product-form/` | molecule | 8 inputs + 1 select | ❌ Only sellingPrice | ✅ Same label style | FormsModule |
| **sale-form** | `molecules/sale-form/` | molecule | 2 autocompletes + 1 textarea | ❌ MatAutocomplete | ❌ Uses mat-label | ReactiveForms |

### Pattern 2: Angular Material mat-form-field

| Component | Path | Type | Inputs | Notes |
|-----------|------|------|--------|-------|
| **login-form** | `molecules/login-form/` | molecule | 2 (email, password) | `matInput` + `appearance="outline"` |
| **appointment-form** | `organisms/appointment-form/` | organism | 2 date/time + 1 mat-select | `appearance="outline"`, `::ng-deep` hides subscript |
| **billing-filters** | `molecules/billing-filters/` | molecule | 1 search + 2 mat-selects | `appearance="outline"` |
| **appointment-filters** | `molecules/appointment-filters/` | molecule | 1 search + 1 date + 1 select | `appearance="outline"` |
| **patient-search** | `molecules/patient-search/` | molecule | 1 autocomplete | `mat-form-field` with `matAutocomplete` |
| **invoice-form-dialog** | `organisms/invoice-form-dialog/` | organism | numerical + patient-search | uses patient-search molecule |
| **general-invoice-form-dialog** | `organisms/general-invoice-form-dialog/` | organism | form fields | `appearance="outline"` |
| **sales-note-form-dialog** | `organisms/sales-note-form-dialog/` | organism | form fields | `appearance="outline"` |

**Common across all Pattern 2**: All use `::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }` to hide Material's error/hint area. Labels use `text-[10px]` uppercase.

### Pattern 3: Custom InputAtom (ui-input) — Different Design System

| Component | Path | Type | Inputs |
|-----------|------|------|--------|
| **search-bar** | `molecules/search-bar/` | molecule | 1 `ui-input` |
| **search-filters** | `molecules/search-filters/` | molecule | N `ui-input` / `ui-select` via iterated `FilterDefinition[]` |

**InputAtom design**: SCSS-based, bottom-border style, floating labels, CSS custom properties (`var(--color-*)`), textarea variant. Uses `ChangeDetectionStrategy.OnPush`. Has test file.

### Additional Forms with Text Inputs (not fully audited — identified via directory listing)

These organisms contain forms with text inputs but use the same patterns above:

- `adjustment-form-dialog/` — Pattern 1 or 2 (needs verification)
- `supplier-dialog/` — likely Pattern 1
- `inventory-category-dialog/` — likely Pattern 1
- `inventory-batch-dialog/` — likely Pattern 1
- `patient-registration-wizard/` — likely Pattern 2 (the largest form in the app, ~20+ fields)
- `diagnostics-dialog/`, `anamnesis-dialog/`, `physical-exam-dialog/`, `incapacity-dialog/` — Pattern 2
- `orders-dialog/` — Pattern 2 (ReactiveForms + FormArray)
- `transport-*` dialogs (7 dialogs) — likely Pattern 2 or native
- `purchase-order-dialog/` — likely Pattern 2
- `consultation-summary/` — display only

---

## Pattern Analysis

### Inconsistencies vs Reference Design

#### Structural
1. **product-form**: Same `h-14` / `rounded-2xl` / `border-gray-200` base, same label style. BUT: no icon wrapper div, no icons on 6 of 8 inputs, uses `px-4` instead of `pl-12 pr-4` for icon-less inputs. The sellingPrice field alone has the icon pattern — **inconsistent within the same component**.

2. **login-form**: Uses Material `mat-form-field` with `appearance="outline"` — completely different visual than the reference. No Tailwind input classes. Material's own styling governs borders, focus rings, and typography.

3. **appointment-form etc.**: Same Material pattern as login-form. Labels are `text-[10px]` (vs reference `text-xs`), placed above the `mat-form-field`.

4. **sale-form**: Uses `matAutocomplete` for customer/product search. Hybrid approach — not comparable to standard text inputs.

#### Behavioral
- **Reference**: `transition-all` on focus. Simple and consistent.
- **Material**: Angular Material handles focus rings internally with ripple + outline color. Not customizable via Tailwind.
- **InputAtom**: SCSS `transition: border-color var(--duration-fast) var(--ease-default)`. Different animation system.

#### Validation / Error States
- **Reference**: No error state styling visible. Uses `ngForm` valid/invalid for submit button disabling only.
- **Material**: Built-in error state via `mat-error`. But all Material components hide the subscript wrapper (`display: none`).
- **InputAtom**: Has `error` input that adds `.is-error` class, changes border color to `var(--color-error)` and displays `<span class="input__error">`.

#### Accessibility
- **Reference**: Labels associated via DOM proximity, not `<label for="...">`. No `aria-*` attributes on inputs.
- **Material**: `<mat-label>` provides accessible labeling via `aria-labelledby`. Better accessibility.
- **InputAtom**: `aria-invalid` + `aria-describedby` for error/helper text. Best accessibility of the three.

---

## Affected Areas

### Directly redesignable (22+ components, ~80+ text inputs)

| Domain | Components | Input count (est.) | Current pattern |
|--------|-----------|-------------------|----------------|
| Customers | customer-dialog | 7 (reference) | Native Tailwind |
| Products | product-form | 9 | Native Tailwind (partial) |
| Auth | login-form | 2 | Material |
| Appointments | appointment-form, appointment-filters | 4 | Material |
| Billing | billing-filters, invoice-form-dialog, general-invoice-form-dialog, sales-note-form-dialog | 8+ | Material |
| Pediatrics | patient-search, patient-registration-wizard, diagnostics-dialog, anamnesis-dialog, physical-exam-dialog, incapacity-dialog, orders-dialog | 40+ | Material + ReactiveForms |
| Sales | sale-form | 2 autocompletes + 1 textarea | Material (hybrid) |
| Search | search-bar, search-filters | ~8 | InputAtom (ui-input) |
| Inventory | supplier-dialog, inventory-category-dialog, inventory-batch-dialog, adjustment-form-dialog | 15+ | Mixed |
| Transport | 7 dialogs (dispatch, expense, incident, maintenance, operation, settle, standby) | 20+ | Mixed |
| Purchases | purchase-order-dialog | 5+ | Material |

### Estimated total: **~120+ text inputs across ~35+ components**

---

## Approaches

### Approach A: Shared Tailwind Input Component (recommended)

Create a new `ui-text-input` atom that encapsulates the reference design pattern. Components replace their individual `<input>` + wrapper HTML with a single `<ui-text-input>` tag.

```html
<ui-text-input
  label="Nombre Completo"
  icon="person"
  placeholder="Ej. Juan Pérez"
  [(ngModel)]="customer().name"
  required
/>
```

- **Pros**:
  - Single source of truth for the input design
  - Future design changes propagate everywhere automatically
  - Reduces HTML boilerplate from ~8 lines to 1-3 lines per input
  - Can include built-in validation error display
  - Can add accessibility attributes once (aria, label associations)
  - Compatible with both FormsModule and ReactiveFormsModule (via ControlValueAccessor or simple input/output)
- **Cons**:
  - Requires creating, testing, and maintaining a new component
  - Migration requires touching every form in the app (~35 components)
  - "Material icon inside" pattern requires icon name input — won't work for inputs that need non-icon prefixes (like $ currency prefix)
  - Adds abstraction layer; debugging form issues becomes one hop removed
- **Effort**: High (100+ lines for the component, 35+ files to migrate)

### Approach B: Tailwind Utility Class System (CSS-only, no component)

Extract the reference design into a set of Tailwind `@apply` directives or a CSS class like `.input-tailwind` that components apply to their existing `<input>` elements.

- **Pros**:
  - No new component dependency
  - Less invasive — just change classes on existing inputs
  - Easier incremental migration (one form at a time)
  - Preserves existing form logic and ngModel/FormControl bindings unchanged
- **Cons**:
  - Still requires wrapping `<div class="relative">` + icon + label boilerplate per input
  - No behavioral encapsulation (validation display, clear button, etc.)
  - DRY only for styling, not for structure
  - Harder to enforce consistency — devs can still drift
- **Effort**: Medium (CSS class created once, then class-name replacements across forms)

### Approach C: Angular Directive + Tailwind Classes

Create an Angular directive (`[uiTextInput]`) that applies the reference design Tailwind classes to any host `<input>` element.

- **Pros**:
  - Apply to any existing input with a single directive
  - Works with native inputs, matInput, any input element
  - No wrapper required (though icon/label still needs manual handling)
  - Incremental adoption
- **Cons**:
  - Directives can't add wrapper divs or sibling elements (icon, label, error span)
  - Only styles the input itself, not the surrounding layout
  - Icon placement still manual per input
  - Less complete than a component approach
- **Effort**: Low-Medium (single directive file, per-input adoption)

### Approach D: Extend/Morph InputAtom to Match Reference

Modify the existing `InputAtom` to support the reference design as a variant (e.g., `variant="tailwind-outline"`), keeping backward compatibility.

- **Pros**:
  - Reuses existing component infrastructure (tests, imports, integration)
  - Single component with multiple visual variants
  - Existing consumers (search-bar, search-filters) continue working
- **Cons**:
  - InputAtom's current SCSS architecture clashes with the Tailwind approach
  - Would need either full rewrite to Tailwind or SCSS that mimics Tailwind
  - Risk of breaking existing search-bar/search-filters behavior
  - Component already has floating-label behavior that conflicts with the reference's static label
- **Effort**: Medium-High (significant internal refactor of InputAtom)

---

## Recommendation

**Approach A: Shared Tailwind Input Component** is the right long-term investment for this codebase.

The reference design is consistent and intentional — it's the one form the team deliberately polished. The other 30+ forms are either using Angular Material defaults (never customized to match) or were built before the reference existed. A single shared component:

1. **Enforces the design** at the component API level — impossible to deviate
2. **Reduces code** — the 8-line boilerplate per input becomes 1 line
3. **Future-proofs** — when the design evolves, change one component, not 35
4. **Can co-exist** — keep the existing InputAtom for search-style inputs, create a separate `TextInputAtom` for form-style inputs

**Migration strategy**: Ship the new component first, then migrate forms incrementally (1-2 forms per PR) rather than a single massive change. Customer-dialog becomes the first adopter (it already matches visually — just replace the DOM with the component).

### Scaffold for the recommended component API

```typescript
@Component({
  selector: 'ui-text-input',
  // ...
})
export class TextInputAtom {
  label = input<string>('');
  icon = input<string>('');               // material-icons name
  type = input<'text' | 'email' | 'password' | 'number'>('text');
  placeholder = input<string>('');
  value = input<string>('');
  error = input<string>('');
  required = input(false);
  disabled = input(false);
  
  valueChange = output<string>();
}
```

Supports both `[(ngModel)]` via standard input/output binding and ReactiveForms via `[value]` + `(valueChange)`.

---

## Risks

1. **Patient Registration Wizard** — the largest form in the app with ~20-40 fields. Likely Pattern 2 (Material). Migrating this form requires careful testing as it spans multiple steps/tabs. **This is the highest-risk component**.

2. **sale-form autocomplete** — The autocomplete inputs can't be trivially converted to the reference design since they depend on `matAutocomplete`. This requires either keeping `mat-form-field` for autocompletes or building a custom autocomplete overlay compatible with the new design.

3. **ReactiveForms incompatibility** — The reference design uses template-driven forms (`ngModel`). A shared component that only supports two-way binding (`value` + `valueChange`) works for ReactiveForms but requires form integration testing.

4. **Existing InputAtom consumers** — search-bar and search-filters already use `ui-input`. These should NOT be migrated to the new component (they serve a different UX purpose: compact search inputs vs tall form inputs). The naming convention must avoid collision.

5. **Boxicons vs Material Icons** — The project lists `@boxicons/core` as the icon dependency, but the reference design uses `<span class="material-icons">`. Verify which icon library is actually the standard. If Material Icons (Google Fonts), the component should default to that.

6. **No covering tests** — Zero components in this audit have covering tests for form behavior. Any migration will need manual QA or new tests written alongside.

---

## Estimated Scope

| Category | Count |
|----------|-------|
| **Components with text inputs** | ~35 |
| **Total text inputs** | ~120+ |
| **Forms using Reference pattern already** | 2 (customer-dialog, product-form - partial) |
| **Forms using Material pattern** | ~15+ |
| **Forms using InputAtom pattern** | 2 |
| **New component to create** | 1 (`TextInputAtom`) |
| **Existing components to NOT change** | 2 (search-bar, search-filters — keep InputAtom) |
| **High-risk components** | 3 (patient-registration-wizard, sale-form, adjustment-form-dialog) |

---

## Ready for Proposal

**Yes.** The exploration has identified:
- A clear, consistent reference design
- All three existing input patterns with their locations
- A recommended approach (shared component) with a concrete API scaffold
- Migration risks and high-priority components

The orchestrator should present this report to the user and ask:

1. Confirm the shared component approach (Approach A) is acceptable
2. Confirm whether Material Icons (`<span class="material-icons">`) or Boxicons is the canonical icon system
3. Decide migration strategy: all-at-once or incremental per form
4. Decide whether to keep `matAutocomplete` in sale-form or build a custom autocomplete matching the new design
5. Confirm naming: `ui-text-input` or another prefix to avoid collision with existing `ui-input`
