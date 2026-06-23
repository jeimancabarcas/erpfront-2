# Exploration: Redesign Textareas

## Current State

The `erpfrontend` application has ~24 distinct `<textarea>` usages across 17 component files, split into three incompatible patterns. The reference design system (`ui-text-input`, `ui-select`, customer-dialog) uses consistent Tailwind tokens (`h-14 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all`), but NO textarea currently matches this system.

### Textarea Inventory

#### Pattern A — Native `<textarea>` with Tailwind (15 instances, most common)

These use a similar-but-not-identical class string. The "most common" variant is:
`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-{color}-500 focus:border-transparent outline-none transition-all text-sm`

Key inconsistencies vs. reference input design:
- Uses `rounded-xl` instead of `rounded-2xl`
- Uses `focus:ring-{color}-500` (strong, saturated) instead of `focus:ring-indigo-200` (subtle)
- Uses `focus:border-transparent` instead of `focus:border-indigo-400`
- Uses `py-3` with `rows` attribute instead of `min-h-[56px]` (equivalent to `h-14`)
- Missing `font-bold` and explicit `bg-white`
- Mix of `pl-10` (with icon) and `px-4` (no icon)
- Focus ring color varies by domain: `indigo-500`, `emerald-500`, `red-500`, `amber-500`

| # | Component | File | Field | Rows | Icon | Focus Color | bg-white | rounded | font-bold |
|---|-----------|------|-------|------|------|-------------|----------|---------|-----------|
| 1 | anamnesis-dialog | `organisms/anamnesis-dialog/` | `reason` | 3 | No | indigo-500 | No | rounded-xl | No |
| 2 | anamnesis-dialog | `organisms/anamnesis-dialog/` | `currentIllness` | 6 | No | indigo-500 | No | rounded-xl | No |
| 3 | incapacity-dialog | `organisms/incapacity-dialog/` | `recommendations` | 5 | No | indigo-500 | No | rounded-xl | No |
| 4 | orders-dialog | `organisms/orders-dialog/` | `observations` | 2 | No | indigo-500 | No | rounded-xl | No |
| 5 | transport-standby-dialog | `organisms/transport-standby-dialog/` | `notes` | 4 | Yes | indigo-500 | No | rounded-xl | No |
| 6 | transport-settle-dialog | `organisms/transport-settle-dialog/` | `notes` | 4 | Yes | emerald-500 | No | rounded-xl | No |
| 7 | transport-incident-dialog | `organisms/transport-incident-dialog/` | `description` | 4 | Yes | red-500 | No | rounded-xl | No |
| 8 | transport-expense-dialog | `organisms/transport-expense-dialog/` | `description` | 3 | Yes | emerald-500 | No | rounded-xl | No |
| 9 | transport-operation-dialog | `organisms/transport-operation-dialog/` | `description` | 3 | Yes | indigo-500 | No | rounded-xl | No |
| 10 | transport-cancel-dialog | `organisms/transport-cancel-dialog/` | `notes` | 4 | Yes | red-500 | No | rounded-xl | No |
| 11 | transport-change-vehicle-dialog | `organisms/transport-change-vehicle-dialog/` | `reason` | 4 | Yes | indigo-500 | No | rounded-xl | No |
| 12 | transport-operation-closure-dialog | `organisms/transport-operation-closure-dialog/` | `notes` | 4 | Yes | indigo-500 | No | rounded-xl | No |
| 13 | transport-maintenance-dialog | `organisms/transport-maintenance-dialog/` | `description` | 4 | Yes | amber-500 | No | rounded-xl | No |
| 14 | physical-exam-dialog | `organisms/physical-exam-dialog/` | `findings` | 6 | No | indigo-500 | No | rounded-xl | No |
| 15 | inventory-category-dialog | `organisms/inventory-category-dialog/` | `description` | 3 | No | indigo-200 | Yes | rounded-2xl | Yes |

**Note:** #15 (inventory-category-dialog) is the ONLY textarea that matches the reference input design pattern — it uses `rounded-2xl`, `focus:ring-indigo-200`, `focus:border-indigo-400`, `font-bold`, `bg-white`, and adds `resize-none`.

#### Pattern B — `<textarea matInput>` inside `<mat-form-field>` (7 instances, Material Design legacy)

These use Angular Material's form field wrapper, which is visually inconsistent with the Tailwind design system.

| # | Component | File | Field | Rows | Binding |
|---|-----------|------|-------|------|---------|
| 16 | adjustment-form-dialog | `organisms/adjustment-form-dialog/` | `reason` | 4 | Reactive Forms (`formControlName`) |
| 17 | patient-registration-wizard | `organisms/patient-registration-wizard/` | `observations` | 3 | Reactive Forms (`formControlName`) |
| 18 | patient-neonatal-history | `organisms/patient-neonatal-history/` | `neonatalNotes` | 4 | Template-driven (`[value]`) |
| 19 | patient-neonatal-history | `organisms/patient-neonatal-history/` | `personalBackground` | 3 | Template-driven (`[value]`) |
| 20 | patient-neonatal-history | `organisms/patient-neonatal-history/` | `familyBackground` | 3 | Template-driven (`[value]`) |
| 21 | purchase-order-dialog | `organisms/purchase-order-dialog/` | `observations` | 3 | Reactive Forms (`formControlName`) |
| 22 | sales-note-form-dialog | `organisms/sales-note-form-dialog/` | `observation` | 3 | Reactive Forms (`formControlName`) |

These use Material form field styling (outline appearance, Material typography, Material animations) that contradicts the Tailwind `rounded-2xl` + `focus:ring-indigo-200` pattern. Migrating these requires removing `<mat-form-field>` wrappers, switching to native textarea with Tailwind classes, and updating form binding patterns.

#### Pattern C — `ui-input type="textarea"` (InputAtom, 1 definition only)

The existing InputAtom (`src/app/components/atoms/input/input.component.ts`) supports `type='textarea'` but uses a completely different design language:

- **CSS variables** (`var(--color-border)`, `var(--spacing-3)`) — no Tailwind utility classes
- **Bottom-border only** (`border-bottom: 1px solid`) — no rounded corners, no background
- **Floating label** positioned absolutely — different label pattern
- **`resize: vertical`** — no size constraints
- **Zero known consumers** — no component in the codebase currently uses `<ui-input type="textarea">`

This component belongs to a separate, older design system and should NOT be used as the base for the redesign.

## Affected Areas

- **Atoms**: `src/app/components/atoms/input/` (InputAtom with textarea variant), `src/app/components/atoms/text-input/` (potential extension target)
- **Dialogs (medical)**: anamnesis-dialog, incapacity-dialog, physical-exam-dialog, orders-dialog, adjustment-form-dialog
- **Dialogs (transport)**: standby-dialog, settle-dialog, incident-dialog, expense-dialog, operation-dialog, cancel-dialog, change-vehicle-dialog, operation-closure-dialog, maintenance-dialog
- **Dialogs (inventory/sales)**: inventory-category-dialog, purchase-order-dialog, sales-note-form-dialog
- **Forms (patient)**: patient-registration-wizard, patient-neonatal-history
- **Dependencies**: Pattern B files import `MatFormFieldModule`, `MatInputModule` — removing matInput textareas may allow removing these Material imports (but only if no other `matInput` inputs remain)

## Reference Design

### Current input canonical style (`ui-text-input`)

```html
<input class="w-full h-14 rounded-2xl border border-gray-200 bg-white text-sm
              font-bold text-gray-900 focus:outline-none focus:ring-2
              focus:ring-indigo-200 focus:border-indigo-400 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed" />
```

### Proposed canonical textarea style

Adapted from the input pattern with textarea-specific adjustments:

```html
<textarea class="w-full min-h-[3.5rem] px-4 py-3 rounded-2xl border border-gray-200
                   bg-white text-sm font-bold text-gray-900 resize-y
                   focus:outline-none focus:ring-2 focus:ring-indigo-200
                   focus:border-indigo-400 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
          rows="3"></textarea>
```

Key differences from input:
- `min-h-[3.5rem]` instead of `h-14` — allows growth beyond single-line
- `py-3` instead of implicit vertical centering — text starts at top
- `resize-y` (or configurable) — vertical-only resize by default
- `rows` attribute for initial height
- Icon positioned at `top: 1rem` (not `top: 50%`) for multi-line alignment

### Label, icon, error, helper pattern (shared with `ui-text-input`)

The label/error/helper wrapper pattern from `ui-text-input` should be reused identically:

```html
<div class="flex flex-col gap-1.5">
  <label class="text-xs font-black text-gray-500 uppercase tracking-widest">
    {{ label }} <span class="text-red-500">*</span>  <!-- if required -->
  </label>
  <div class="relative">
    <span class="material-icons absolute left-4 top-4 text-indigo-600">{{ icon }}</span>
    <textarea class="w-full min-h-[3.5rem] pl-12 pr-4 py-3 ..." />
  </div>
  <span class="text-xs text-red-500">{{ error }}</span>
</div>
```

## Existing Component Analysis

### InputAtom (`ui-input`) — textarea variant

- **Path**: `src/app/components/atoms/input/input.component.ts`
- **Selector**: `ui-input`
- **API**: `type('text'|'number'|'textarea'|'password')`, `label`, `placeholder`, `value`, `error`, `helperText`, `disabled`, `clearable`, `valueChange`
- **Styling**: CSS variables via `input.component.scss` — bottom-border only, floating label, `resize: vertical`
- **Form integration**: Template-driven only (`value` input + `valueChange` output) — NO `ControlValueAccessor`
- **Consumers**: 3 callers (search-bar, search-filters) — but NONE use `type='textarea'`
- **Assessment**: **Different design system entirely.** Belongs to an older CSS-variable approach. Reusing this for the Tailwind migration would create more inconsistency, not less. The textarea variant should be **deprecated** in InputAtom or left as-is for any theoretical consumers of the old design system.

### `ui-text-input` — reference component

- **Path**: `src/app/components/atoms/text-input/text-input.component.ts`
- **Selector**: `ui-text-input`
- **API**: `label`, `icon`, `type('text'|'email'|'password'|'number')`, `placeholder`, `value` (model), `error`, `helperText`, `required`, `disabled`, `iconLibrary`
- **Form integration**: Full `ControlValueAccessor` (works with `ngModel`, `formControl`, `formControlName`)
- **Styling**: Tailwind utility classes inline — `h-14 rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-indigo-200`
- **Consumers**: 29 callers across the app
- **Assessment**: **This is the design system standard.** Extending it with `type='textarea'` would bloat the component with conditional logic for icon positioning, sizing, and element type. Creating a sibling `ui-textarea` atom that reuses the same patterns is cleaner.

## Approaches

### 1. New `ui-textarea` atom (RECOMMENDED)

Create a dedicated `<ui-textarea>` component as a sibling to `<ui-text-input>` and `<ui-select>`.

**API** (mirrors `ui-text-input`):
```
label, icon, placeholder, value (model), error, helperText,
required, disabled, rows (default 3), resize ('none'|'vertical'|'both', default 'vertical')
```

**Form integration**: Full `ControlValueAccessor` (same pattern as `ui-text-input`)

**Styling**: Same Tailwind token set as `ui-text-input`:
- `rounded-2xl border border-gray-200 bg-white`
- `focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400`
- `transition-all disabled:opacity-50 disabled:cursor-not-allowed`
- Textarea-specific: `min-h-[3.5rem] py-3 resize-y`

**Pros**:
- Clean, single-responsibility component — no conditional textarea logic inside `ui-text-input`
- Reuses proven pattern from `ui-text-input` + `ui-select` (label wrapper, icon, error, helper)
- Full CVA — works with both template-driven and reactive forms
- Independent evolution — textarea-specific props (rows, resize, min-height) don't pollute input API
- Consistent atom family: `ui-text-input` / `ui-textarea` / `ui-select` / `ui-button`
- Each textarea migration becomes: delete 30-line `<div>` + `<textarea>` block, insert `<ui-textarea>`

**Cons**:
- New component to maintain (~120 lines, similar to `ui-text-input`)
- Duplicated label/icon/error wrapper pattern (though identical, not divergent)
- Need spec + tests + story (if applicable)

**Effort**: Medium

### 2. Extend `ui-text-input` with `type='textarea'`

Add a textarea variant to the existing `ui-text-input` component.

**Changes needed**:
- Add `'textarea'` to `type` union
- Conditional `<textarea>` vs `<input>` in template
- Conditional icon positioning (`top: 1rem` vs `top: 50%`)
- Add `rows` input (only relevant for textarea)
- Add `resize` input (only relevant for textarea)
- Change `h-14` to `min-h-14` when textarea

**Pros**:
- No new component file
- Single import for consumers
- Less boilerplate

**Cons**:
- Bloats `ui-text-input` with conditional branches
- Textarea-specific props (`rows`, `resize`) are noise for 95% of usages (all current 29 consumers use `<input>`)
- Icon positioning logic becomes more complex
- The `h-14` constraint doesn't make sense for textareas — needs `min-h` override
- Violates Single Responsibility — one component serving two different HTML elements
- Harder to test independently

**Effort**: Low-Medium

### 3. Direct Tailwind classes (no component)

Standardize the Tailwind class string and apply it directly to each `<textarea>`.

**Pros**:
- No new component
- Maximum flexibility per instance
- Zero abstraction overhead

**Cons**:
- 24+ textareas each need manual class updates
- Future design changes require touching 17 files instead of 1 component
- No CVA — each form needs manual binding wiring
- No label/error/helper consistency guarantee
- Easy to drift — one dev changes rounded-xl to rounded-2xl, forgets the rest
- What we have TODAY (Pattern A) is exactly this approach, and it's already inconsistent

**Effort**: Low initially, HIGH maintenance

### 4. Hybrid — `ui-textarea` atom + deprecate InputAtom textarea

Create the new `ui-textarea` atom for all Tailwind-system forms, and keep the old InputAtom textarea variant as-is for any legacy consumers (currently zero known).

**Pros**:
- Clean migration path — no need to touch InputAtom
- All benefits of Option 1
- No regression risk for old design system

**Cons**:
- Two textarea components exist simultaneously (but serve different design systems)

**Effort**: Medium (same as Option 1)

## Recommendation

**Option 4 (hybrid): Create `ui-textarea` atom, leave `InputAtom` textarea variant untouched.**

Rationale:
1. **Architecture consistency**: The atom family pattern (`ui-text-input`, `ui-select`, `ui-textarea`, `ui-button`) is already established. A new sibling atom is the natural extension.
2. **Single Responsibility**: Textareas have fundamentally different layout needs (rows, resize, icon at `top: 1rem`, `min-h` instead of `h-14`). Forcing this into `ui-text-input` would create a component with two personalities.
3. **Clean migration**: Each Pattern A textarea becomes a one-line replacement. Pattern B (matInput) textareas need additional work (remove `mat-form-field` wrappers), but the textarea element itself still becomes `<ui-textarea>`.
4. **Proven pattern**: `ui-text-input` has 29 consumers and a stable API. Copying its structure for `ui-textarea` is low-risk — the label/icon/error/helper wrapper is battle-tested.
5. **Zero regression**: InputAtom's textarea variant has no known consumers. Leaving it alone costs nothing and avoids breaking anything.

### Migration Priority

| Phase | Pattern | Count | Effort per file |
|-------|---------|-------|-----------------|
| 1 | Pattern A (native + Tailwind) | 15 textareas / 14 files | Low — swap `<textarea class="...">` for `<ui-textarea>` |
| 2 | Pattern B (matInput) | 7 textareas / 5 files | Medium — remove `<mat-form-field>`, restructure form |
| 3 | Pattern C (InputAtom deprecation note) | 1 definition | None — add deprecation comment |

## Risks

- **matInput removal cascade**: Some Pattern B files import `MatFormFieldModule`/`MatInputModule` ONLY for the textarea. After migration, those imports should be removed — but verify no other `matInput` elements remain in the same component.
- **patient-neonatal-history**: Uses `[value]` binding (one-way, no writeback). Needs to be updated to `[(value)]` (two-way model) for `ui-textarea` to work properly. This may require adding event handlers to the parent.
- **orders-dialog**: Contains dynamic prescription rows, each with a textarea inside a `FormArray`. The textarea uses `formControlName="observations"` — `ui-textarea` with CVA should handle this, but test thoroughly with dynamic form arrays.
- **matAutocomplete interaction**: The `patient-registration-wizard` may have matAutocomplete on other fields. Verify no interference when removing `MatFormFieldModule` from that component.
- **Focus ring color variance**: Pattern A textareas use domain-specific focus colors (emerald, red, amber). The canonical design uses `indigo-200`/`indigo-400`. Some dialogs (settle uses emerald, incident uses red) may lose their semantic color hint. Consider whether `ui-textarea` should support a `variant` or `color` input, or whether indigo ring is sufficient for all contexts. The expense-dialog and settle-dialog currently use emerald for "positive/financial" operations — this may be intentional UX signaling.
- **`resize` behavior**: Current Pattern A textareas have NO explicit resize control (browser default: `resize: both`). `inventory-category-dialog` uses `resize-none`. The proposal defaults to `resize-y`. Verify this is acceptable UX for all 15 instances.

## Ready for Proposal

**Yes** — the scope is clear, the inventory is complete, and the recommended approach has a concrete API design. The orchestrator should proceed to `sdd-propose` with this exploration as input.

Key decisions for the proposal phase:
1. Confirm `ui-textarea` atom (not extending `ui-text-input`)
2. Decide whether to support a `color`/`variant` input for semantic focus rings (emerald, red, amber)
3. Prioritize: Phase 1 (Pattern A) first, Phase 2 (Pattern B) as follow-up change
4. `inventory-category-dialog` textarea is the reference implementation to match
