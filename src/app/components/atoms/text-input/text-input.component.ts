import { Component, model, input, computed, signal, ChangeDetectionStrategy, untracked } from '@angular/core';
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
  styleUrl: './text-input.component.scss',
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
    untracked(() => this.value.set(val ?? ''));
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
