import {
  Component,
  model,
  input,
  signal,
  ChangeDetectionStrategy,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'ui-datepicker',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DatepickerComponent,
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="inputId()" class="text-xs font-black text-gray-500 uppercase tracking-widest">
          {{ label() }}
          @if (required()) { <span class="text-red-500">*</span> }
        </label>
      }

      <div class="relative">
        <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">calendar_today</span>
        <input
          type="date"
          [id]="inputId()"
          [value]="displayValue()"
          [required]="required()"
          [disabled]="disabled()"
          [min]="minValue()"
          [max]="maxValue()"
          [attr.aria-invalid]="!!error() || null"
          class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          [class.border-red-500]="!!error()"
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
  `,
})
export class DatepickerComponent implements ControlValueAccessor {
  label = input<string>('');
  error = input<string>('');
  helperText = input<string>('');
  required = input(false);
  disabled = input(false);

  // Internal model as YYYY-MM-DD string for native date input
  value = model<string>('');

  protected inputId = signal(`ui-datepicker-${nextId++}`);

  // Computed display value: convert internal string to YYYY-MM-DD for native input
  protected displayValue = this.value.asReadonly();

  // Min/max as YYYY-MM-DD strings
  private _min = signal<string>('');
  private _max = signal<string>('');
  protected minValue = this._min.asReadonly();
  protected maxValue = this._max.asReadonly();

  // ── ControlValueAccessor ──
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | Date | null): void {
    const str = this.toDateString(val);
    untracked(() => this.value.set(str));
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // handled by disabled input
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

  // ── Helpers ──
  private toDateString(val: string | Date | null): string {
    if (!val) return '';
    if (typeof val === 'string') {
      // Already a string — could be YYYY-MM-DD or ISO
      if (val.includes('T')) {
        return val.substring(0, 10);
      }
      return val.length === 10 ? val : '';
    }
    // Date object → YYYY-MM-DD
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  }
}
