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
          class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
        >
          {{ label() }}
          @if (required()) { <span class="text-red-500">*</span> }
        </label>
      }

      <div class="relative">
        @if (icon()) {
          <span
            [class]="iconClasses()"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 pointer-events-none"
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
          class="w-full h-14 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      </div>

      @if (error()) {
        <span [id]="inputId() + '-error'" class="text-xs text-red-500 font-medium">{{ error() }}</span>
      } @else if (helperText()) {
        <span [id]="inputId() + '-helper'" class="text-xs text-gray-400 dark:text-gray-500">{{ helperText() }}</span>
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
