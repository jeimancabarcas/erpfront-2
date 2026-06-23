import {
  Component,
  model,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
  untracked,
  ElementRef,
  inject,
  HostListener,
  viewChild,
} from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

let nextId = 0;

@Component({
  selector: 'ui-datepicker',
  standalone: true,
  imports: [CommonModule, OverlayModule, MatNativeDateModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DatepickerComponent,
      multi: true,
    },
  ],
  styleUrl: './datepicker.component.scss',
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="inputId()" class="text-xs font-black text-gray-500 uppercase tracking-widest">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <div class="relative" #triggerContainer>
        <button
          type="button"
          data-testid="datepicker-trigger"
          [id]="inputId()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error() || null"
          [attr.aria-describedby]="
            error() ? inputId() + '-error' : helperText() ? inputId() + '-helper' : null
          "
          [class.border-red-500]="!!error()"
          [class.border-gray-200]="!error()"
          [class.opacity-50]="disabled()"
          [class.cursor-not-allowed]="disabled()"
          class="w-full h-14 pl-12 pr-4 rounded-2xl border bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-left flex items-center"
          (click)="toggle()"
        >
          <span
            class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg pointer-events-none"
            >calendar_today</span
          >
          <span class="truncate" [class.text-gray-400]="!formattedValue()">
            {{ formattedValue() || placeholder() }}
          </span>
        </button>

        <ng-template
          cdkConnectedOverlay
          [cdkConnectedOverlayOpen]="isOpen()"
          [cdkConnectedOverlayOrigin]="triggerContainer"
          [cdkConnectedOverlayPositions]="overlayPositions"
          (overlayOutsideClick)="close()"
        >
          <div class="datepicker-calendar-panel">
            <mat-calendar
              [(selected)]="selectedDate"
              [minDate]="min() || undefined"
              [maxDate]="max() || undefined"
              (selectedChange)="onDateSelected($event)"
            />
          </div>
        </ng-template>
      </div>

      @if (error()) {
        <span [id]="inputId() + '-error'" class="text-xs text-red-500 font-medium">{{
          error()
        }}</span>
      } @else if (helperText()) {
        <span [id]="inputId() + '-helper'" class="text-xs text-gray-400">{{ helperText() }}</span>
      }
    </div>
  `,
})
export class DatepickerComponent implements ControlValueAccessor {
  // ── Public API (signal inputs) ──
  label = input<string>('');
  placeholder = input<string>('');
  value = model<Date | null>(null);
  error = input<string>('');
  helperText = input<string>('');
  required = input(false);
  disabled = input(false);
  min = input<Date | null>(null);
  max = input<Date | null>(null);

  // ── Outputs ──
  valueChange = this.value;

  // ── Internal state ──
  protected inputId = signal(`ui-datepicker-${nextId++}`);
  isOpen = signal(false);
  selectedDate = signal<Date | null>(null);

  // ── Overlay positions ──
  protected overlayPositions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 4,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -4,
    },
  ];

  private elementRef = inject(ElementRef);

  // ── Computed ──
  protected formattedValue = computed(() => {
    const val = this.value();
    if (!val) return '';
    return formatDate(val, 'dd/MM/yyyy', 'en-US');
  });

  // ── ControlValueAccessor ──
  private onChange: (val: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: Date | null): void {
    untracked(() => this.value.set(val));
  }

  registerOnChange(fn: (val: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Consumer controls disabled input; no override needed
  }

  // ── Event handlers ──
  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onDateSelected(date: Date): void {
    this.value.set(date);
    this.onChange(date);
    this.onTouched();
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
