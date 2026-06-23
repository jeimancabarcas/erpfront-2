# Design: Unified Select Component (SelectAtom Redesign)

## Technical Approach

Rewrite `SelectAtom` in-place following the same pattern as `TextInputComponent` — `model()` for value binding, `ControlValueAccessor` for Reactive Forms, Tailwind classes matching the reference visual contract (`h-14 rounded-2xl`). Keep the custom dropdown panel, keyboard navigation, click-outside, and searchable. Remove SCSS entirely — styles move inline via Tailwind.

## Architecture Decisions

| Decision | Options | Trade-off | Choice |
|----------|---------|-----------|--------|
| Value binding | `input`+`output` vs `model()` | input+output needs manual CVA plumbing; `model()` is the established atom pattern | **`model()`** — matches `TextInputComponent` |
| CVA pattern | Class-level implements vs forward ref | No tradeoff — both work; existing atoms implement directly | **implements ControlValueAccessor** — consistent with codebase |
| Styles | SCSS (keep) vs Tailwind inline | SCSS is legacy and incompatible with the design system; Tailwind is the project standard | **Tailwind inline** — remove SCSS file |
| Backward compat | New selector vs same selector | New selector breaks the only consumer; same selector is drop-in | **Keep `ui-select` selector** — zero migration for SearchFiltersMolecule |
| Panel | Keep custom vs native `<select>` | Native has better mobile UX but can't style consistently | **Keep custom panel** — necessary for visual contract |

## Data Flow

```
Consumer template
  │
  ├── [value] / [(ngModel)] / [formControl]
  │     └──→ CVA.writeValue() → value.set()
  │
  ├── (valueChange) / user select
  │     └──→ selectOption()
  │           ├── value.set()        ← updates model signal
  │           ├── onChange(val)      ← notifies CVA
  │           ├── onTouched()        ← marks touched
  │           └── open.set(false)    ← closes dropdown
  │
  └── filteredOptions()
        └── computed from searchQuery() + options()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `atoms/select/select.component.ts` | Modify | Rewrite template (Tailwind), add CVA + model(), new inputs (`required`, `helperText`). Keep `SelectOption` interface, keyboard nav, click-outside. |
| `atoms/select/select.component.scss` | Delete | SCSS removed — all styles via Tailwind inline classes |
| `atoms/select/select.component.spec.ts` | Modify | Expand from 5→12 tests covering CVA, states, keyboard |

## Interfaces / Contracts

```typescript
// select.component.ts
export interface SelectOption {
  value: string;
  label: string;
}

// Component API (all inputs + model kept in same file)
label = input<string>('');
placeholder = input<string>('Seleccionar...');
options = input<SelectOption[]>([]);
value = model<string>('');                // CVA-backed, emits valueChange
required = input(false);
disabled = input(false);
error = input<string>('');
helperText = input<string>('');
searchable = input(false);

// Internal
open = signal(false);
searchQuery = signal('');
filteredOptions = computed(...);          // derived from searchQuery + options
highlightedIndex = signal(-1);

// CVA wiring (matches text-input pattern)
writeValue(val: string): void → untracked(() => value.set(val ?? ''))
registerOnChange(fn) → this.onChange = fn
registerOnTouched(fn) → this.onTouched = fn
```

## Template Design

```html
<div class="flex flex-col gap-1.5">
  @if (label()) {
    <label class="text-xs font-black text-gray-500 uppercase tracking-widest">
      {{ label() }} @if (required()) { <span class="text-red-500">*</span> }
    </label>
  }
  <div class="relative">
    <button type="button" role="combobox"
      class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900
             focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
             transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
      [disabled]="disabled()" (click)="toggle()"
      [attr.aria-expanded]="open()">
      <span>{{ selectedLabel() || placeholder() }}</span>
      <span class="material-icons transition-transform"
        [class.rotate-180]="open()">expand_more</span>
    </button>

    @if (open()) {
      <div class="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-xl max-h-64 overflow-hidden">
        @if (searchable()) {
          <div class="p-3 border-b border-gray-100">
            <input (input)="onSearch($event)" placeholder="Buscar..."
              class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        }
        <div class="overflow-y-auto max-h-48">
          @if (filteredOptions().length === 0) {
            <div class="px-4 py-6 text-sm text-gray-400 text-center">Sin resultados</div>
          }
          @for (opt of filteredOptions(); track opt.value; let i = $index) {
            <button (click)="selectOption(opt)" (mouseenter)="highlightedIndex.set(i)"
              class="w-full text-left px-4 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors"
              [class.bg-indigo-50]="highlightedIndex() === i"
              [class.text-indigo-600]="opt.value === value()">
              {{ opt.label }}
            </button>
          }
        </div>
      </div>
    }
  </div>
  @if (error()) {
    <span class="text-xs text-red-500 font-medium">{{ error() }}</span>
  } @else if (helperText()) {
    <span class="text-xs text-gray-400">{{ helperText() }}</span>
  }
</div>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Default render, label + placeholder | `fixture.nativeElement.textContent` assertions |
| Unit | Open/close toggle | Click trigger → assert panel; click outside → assert closed |
| Unit | Option selection emits valueChange | Subscribe to `value`, click option, assert value |
| Unit | Searchable filters options | Set `searchable=true`, type in search input, assert filtered list |
| Unit | Error state | Set `error`, assert error text and helper text hidden |
| Unit | Disabled state | Set `disabled=true`, assert button disabled attribute |
| Unit | Required indicator | Set `required` + `label`, assert asterisk |
| Unit | ngModel binding | Test host with `[(ngModel)]`, type → assert host property |
| Unit | formControl binding | `FormControl`, `writeValue`, assert UI reflects |
| Unit | Keyboard navigation | Arrow down → first option highlighted, Enter selects |

## Migration / Rollout

**Phase 0** — Rewrite + TDD: Atom rewrite, SCSS removal, all 12+ tests pass. `SearchFiltersMolecule` verified with existing tests.

**Phase 1** — Dogfood: Verify search-filters works with new component. Replace `[value]` + `(valueChange)` with two-way `[(value)]` if cleaner (non-breaking).

**Phase 2** — Pattern A native selects (~21): Pages + dialogs with native `<select>` → `<ui-select>`.

**Phase 3** — Pattern B mat-selects (~16): Replace `<mat-form-field>` + `<mat-select>` with `<ui-select>`, drop `MatSelectModule` per component.

**Phase 4** — PatientRegistrationWizard (high-risk): 4 mat-selects inside `mat-stepper`. Keep `MatStepperModule` imported; verify stepper nav after replacement.

No data migration required. Feature flag: none — atomic per file change.

## Open Questions

None.
