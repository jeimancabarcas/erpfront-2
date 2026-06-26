import { Component, model, input, signal, ChangeDetectionStrategy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: TextareaComponent,
    multi: true
  }],
  styleUrl: './textarea.component.scss',
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
        <textarea
          [id]="inputId()"
          [value]="value()"
          [placeholder]="placeholder()"
          [rows]="rows()"
          [required]="required()"
          [disabled]="disabled()"
          [style.min-height]="minHeight()"
          [attr.aria-invalid]="!!error() || null"
          [attr.aria-describedby]="error() ? inputId() + '-error' : (helperText() ? inputId() + '-helper' : null)"
          class="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-y"
          [class.resize-y]="resize() === 'vertical'"
          [class.resize-both]="resize() === 'both'"
          [class.resize-none]="resize() === 'none'"
          (input)="onInput($event)"
          (blur)="onBlur()"
        ></textarea>
      </div>

      @if (error()) {
        <span [id]="inputId() + '-error'" class="text-xs text-red-500 font-medium">{{ error() }}</span>
      } @else if (helperText()) {
        <span [id]="inputId() + '-helper'" class="text-xs text-gray-400 dark:text-gray-500">{{ helperText() }}</span>
      }
    </div>
  `
})
export class TextareaComponent implements ControlValueAccessor {
  // ── Public API (signal inputs) ──
  label = input<string>('');
  placeholder = input<string>('');
  value = model<string>('');
  rows = input<number>(3);
  resize = input<'vertical' | 'both' | 'none'>('vertical');
  minHeight = input<string>('3.5rem');
  error = input<string>('');
  helperText = input<string>('');
  required = input(false);
  disabled = input(false);

  // ── Internal state ──
  protected inputId = signal(`ui-textarea-${nextId++}`);

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
    const val = (event.target as HTMLTextAreaElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }
}
