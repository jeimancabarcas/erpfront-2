# Design: Redesign Text Inputs

## Technical Approach

Create a standalone `ui-text-input` atom component (Angular signals, `ChangeDetectionStrategy.OnPush`, `ControlValueAccessor`) encapsulating the customer-dialog reference design. Migrate ~120 text inputs across ~35 forms incrementally per domain, starting with customer-dialog (zero visual diff).

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `model()` vs `input()`+`output()` for value | `model()` is writable internally, enables CVA naturally; `input()` needs an internal signal bridge | **`model()`** — cleaner CVA, auto `valueChange` |
| Inline template vs separate `.html` | All existing atoms (button, input, select) use inline templates | **Inline** for consistency |
| SCSS file vs Tailwind-only | Existing atoms use `styleUrl: './*.scss'` with minimal `:host { display: block; }` | **Keep minimal `.scss`** with just host display style; all visuals via Tailwind |
| Separate CVA vs integrated | CVA enables `[(ngModel)]` + `[formControl]` — both patterns used across forms | **Integrated CVA** via `NG_VALUE_ACCESSOR` provider |

## Data Flow

```
Parent (ngModel/formControl)
       │
       ▼
┌─────────────────────┐
│   TextInputComponent │
│  ┌─────────────────┐ │
│  │  value (model)  │◄├──── writeValue() from CVA
│  │  valueChange    │─├────► onChange() → CVA
│  └─────────────────┘ │
│  ┌─────────────────┐ │
│  │  iconClasses()  │─┤ computed from icon() + iconLibrary()
│  │  inputPadding() │─┤ computed from icon()
│  └─────────────────┘ │
│  ┌─────────────────┐ │
│  │  inputId        │─┤ stable unique ID for label[for]
│  └─────────────────┘ │
└─────────────────────┘
       │
       ▼
Native <input> element with Tailwind classes
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/atoms/text-input/text-input.component.ts` | Create | Component class + inline template + CVA |
| `src/app/components/atoms/text-input/text-input.component.scss` | Create | Minimal `:host { display: block; }` |
| `src/app/components/atoms/text-input/text-input.component.spec.ts` | Create | Full test suite (12+ scenarios) |
| `src/app/components/organisms/customer-dialog/customer-dialog.component.ts` | Modify | Replace 5 raw input blocks with `<ui-text-input>` (Phase 1) |
| `src/app/components/molecules/product-form/product-form.component.ts` | Modify | Migrate 9 inputs (Phase 2) |
| `src/app/components/molecules/login-form/login-form.component.ts` | Modify | Replace mat-form-field with ui-text-input (Phase 2) |
| ~30 additional form components | Modify | Phased migration per domain |

## Component Implementation

### text-input.component.ts

```typescript
import { Component, model, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'ui-text-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: TextInputComponent,
    multi: true
  }],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label
          [for]="inputId()"
          class="text-xs font-black text-gray-500 uppercase tracking-widest"
        >
          {{ label() }}
          @if (required()) { <span class="text-red-500">*</span> }
        </label>
      }

      <div class="relative">
        @if (icon()) {
          <span
            [class]="iconClasses()"
            style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #4f46e5; pointer-events: none;"
          >{{ icon() }}</span>
        }

        <input
          [id]="inputId()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [required]="required()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error() || null"
          [attr.aria-describedby]="error() ? inputId() + '-error' : (helperText() ? inputId() + '-helper' : null)"
          [class.pl-12]="!!icon()"
          [class.pr-4]="!!icon()"
          [class.px-4]="!icon()"
          class="w-full h-14 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      </div>

      @if (error()) {
        <span [id]="inputId() + '-error'" class="text-xs text-red-500 font-medium">{{ error() }}</span>
      } @else if (helperText()) {
        <span [id]="inputId() + '-helper'" class="text-xs text-gray-400">{{ helperText() }}</span>
      }
    </div>
  `
})
export class TextInputComponent implements ControlValueAccessor {
  // ── Public API (signal inputs) ──
  label = input<string>('');
  icon = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number'>('text');
  placeholder = input<string>('');
  value = model<string>('');
  error = input<string>('');
  helperText = input<string>('');
  required = input(false);
  disabled = input(false);
  iconLibrary = input<'material' | 'boxicons'>('material');

  // ── Internal state ──
  protected inputId = signal(`ui-text-input-${nextId++}`);

  // ── Computed ──
  protected iconClasses = computed(() => {
    if (!this.icon()) return '';
    return this.iconLibrary() === 'boxicons'
      ? `bx bx-${this.icon()}`
      : 'material-icons';
  });

  // ── ControlValueAccessor ──
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Consumer controls disabled input; no override needed
  }

  // ── Event handlers ──
  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }
}
```

### text-input.component.scss

```scss
:host {
  display: block;
}
```

## Usage Patterns

All three form-binding patterns work:

```html
<!-- Pattern 1: Template-driven (customer-dialog, product-form) -->
<ui-text-input
  label="Nombre"
  icon="person"
  placeholder="Ej. Juan Pérez"
  [(value)]="customer().name"
  required
/>

<!-- Pattern 2: ReactiveForms (sale-form, appointment-form) -->
<ui-text-input
  label="Correo"
  icon="email"
  [formControl]="emailControl"
/>

<!-- Pattern 3: Boxicons variant (if needed) -->
<ui-text-input
  label="Usuario"
  icon="user"
  iconLibrary="boxicons"
  [(value)]="username"
/>
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Default render | Verify `<label>` + `<input>` rendered, `label[for]` matches `input[id]` |
| Unit | Icon rendering | Verify `material-icons` class; icon visible when `icon` set |
| Unit | Boxicons | Verify `bx bx-{name}` class when `iconLibrary="boxicons"` |
| Unit | Error state | Verify error text visible, `aria-invalid="true"`, `aria-describedby` linked |
| Unit | Disabled | Verify `<input>` has `disabled` attr |
| Unit | Required indicator | Verify `<span class="text-red-500">*</span>` in label |
| Unit | valueChange emission | Subscribe to `valueChange`, dispatch input event, verify emitted string |
| Unit | No icon padding | Verify `px-4` class, no `pl-12` when icon absent |
| Unit | ngModel binding | Wrap in test host with `[(ngModel)]`, type in input, verify model updates |
| Unit | formControl binding | Wire `FormControl`, set value programmatically, verify input reflects it |
| Unit | Helper text | Verify helper text visible when error is empty |

### Test structure (spec)

```typescript
import { TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Component } from '@angular/core';

// ── Test host for ngModel integration ──
@Component({
  standalone: true,
  imports: [TextInputComponent, FormsModule],
  template: `<ui-text-input [(ngModel)]="name" name="name" />`
})
class NgModelHost {
  name = '';
}

describe('TextInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent]
    }).compileComponents();
  });

  it('renders label and input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label')!;
    const input = el.querySelector('input')!;
    expect(label.textContent).toContain('Name');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('emits valueChange on input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    const component = fixture.componentInstance;
    let emitted = '';
    component.valueChange.subscribe(v => emitted = v);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe('test');
  });

  it('shows error with aria-invalid', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    expect(el.textContent).toContain('Required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders material-icons span', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('icon', 'person');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span.material-icons');
    expect(span).toBeTruthy();
    expect(span.textContent).toContain('person');
  });

  it('renders boxicons with bx prefix', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('icon', 'user');
    fixture.componentRef.setInput('iconLibrary', 'boxicons');
    fixture.detectChanges();
    const i = fixture.nativeElement.querySelector('.bx');
    expect(i).toBeTruthy();
    expect(i.className).toContain('bx-user');
  });

  it('supports ngModel two-way binding', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'John';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.name).toBe('John');
  });

  it('supports formControl binding', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    const ctrl = new FormControl('initial');
    fixture.componentRef.setInput('value', ctrl.value);
    // CVA: simulate writeValue path
    fixture.componentInstance.writeValue('written');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('written');
  });

  it('disables input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
```

## Migration / Rollout

| Phase | Scope | Components | Risk | Guard |
|-------|-------|-----------|------|-------|
| 0 | Create atom + tests | `text-input/` | Low | All spec tests pass |
| 1 | Dogfood | customer-dialog (5 inputs) | Low | Zero visual diff; `npx tsc --noEmit` |
| 2 | Aligned forms | product-form (9), login-form (2) | Medium | Verify ngModel bindings + form submit |
| 3 | Material-to-native | appointment-form, billing-filters, invoices (3-4) | Medium | Verify FormControl + validation |
| 4+ | Highest risk | pediatrics, inventory, transport (~20 forms) | High | Manual QA on each form |

**Rollback**: Each phase is its own commit. Revert the commit to undo a specific migration. The atom itself (`text-input.component.ts`) can be removed via git revert of the Phase 0 commit.

## Interfaces / Contracts

```typescript
interface TextInputComponent {
  // Signal inputs (all optional with defaults)
  label: InputSignal<string>;
  icon: InputSignal<string>;
  type: InputSignal<'text' | 'email' | 'password' | 'number'>;
  placeholder: InputSignal<string>;
  value: ModelSignal<string>;           // Two-way binding via model()
  error: InputSignal<string>;
  helperText: InputSignal<string>;
  required: InputSignal<boolean>;
  disabled: InputSignal<boolean>;
  iconLibrary: InputSignal<'material' | 'boxicons'>;

  // Output (auto-generated by model())
  valueChange: OutputEmitterRef<string>;

  // CVA interface
  writeValue(val: string): void;
  registerOnChange(fn: any): void;
  registerOnTouched(fn: any): void;
}
```

## Open Questions

- [ ] Confirm `model()` approach is acceptable — it auto-generates `valueChange` and enables CVA, but replaces separate `input()` + `output()` for value
