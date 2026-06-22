import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './input.component.scss',
  template: `
    <div
      class="input-wrapper"
      [class.has-value]="!!value()"
      [class.is-error]="!!error()"
      [class.is-disabled]="disabled()"
      [class.is-textarea]="type() === 'textarea'"
    >
      @if (type() === 'textarea') {
        <textarea
          class="input__field"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error() || null"
          [attr.aria-describedby]="error() ? 'input-error' : (helperText() ? 'input-helper' : null)"
          (input)="onInput($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
        ></textarea>
      } @else {
        <input
          class="input__field"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error() || null"
          [attr.aria-describedby]="error() ? 'input-error' : (helperText() ? 'input-helper' : null)"
          (input)="onInput($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
        />
      }

      @if (label()) {
        <label class="input__label" [class.is-float]="!!value() || focused()">
          {{ label() }}
        </label>
      }

      @if (clearable() && !!value() && !disabled()) {
        <button
          class="input__clear"
          type="button"
          tabindex="-1"
          aria-label="Limpiar campo"
          (click)="onClear()"
        >
          &times;
        </button>
      }

      @if (error()) {
        <span id="input-error" class="input__error">{{ error() }}</span>
      } @else if (helperText()) {
        <span id="input-helper" class="input__helper">{{ helperText() }}</span>
      }
    </div>
  `
})
export class InputAtom {
  type = input<'text' | 'number' | 'textarea' | 'password'>('text');
  label = input<string>('');
  placeholder = input<string>('');
  value = input<string>('');
  error = input<string>('');
  helperText = input<string>('');
  disabled = input(false);
  clearable = input(false);

  valueChange = output<string>();

  focused = signal(false);

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }

  onClear(): void {
    this.valueChange.emit('');
  }
}
