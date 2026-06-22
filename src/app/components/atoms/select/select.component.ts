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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectAtom,
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label class="text-xs font-black text-gray-500 uppercase tracking-widest">
          {{ label() }}
          @if (required()) { <span class="text-red-500">*</span> }
        </label>
      }
      <div class="relative">
        <button
          type="button"
          role="combobox"
          class="w-full h-14 px-4 rounded-2xl border bg-white text-sm font-bold text-gray-900
                 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
                 transition-all flex items-center justify-between
                 disabled:opacity-50 disabled:cursor-not-allowed"
          [class.border-red-500]="!!error()"
          [class.border-gray-200]="!error()"
          [disabled]="disabled()"
          [attr.aria-expanded]="open()"
          [attr.aria-invalid]="!!error() || null"
          (click)="toggle()"
        >
          <span>{{ selectedLabel() || placeholder() }}</span>
          <span
            class="material-icons transition-transform"
            [class.rotate-180]="open()"
          >expand_more</span>
        </button>

        @if (open()) {
          <div
            class="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-xl max-h-64 overflow-hidden"
          >
            @if (searchable()) {
              <div class="p-3 border-b border-gray-100">
                <input
                  (input)="onSearch($event)"
                  placeholder="Buscar..."
                  class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            }
            <div class="overflow-y-auto max-h-48">
              @if (filteredOptions().length === 0) {
                <div class="px-4 py-6 text-sm text-gray-400 text-center">
                  Sin resultados
                </div>
              }
              @for (opt of filteredOptions(); track opt.value; let i = $index) {
                <button
                  type="button"
                  role="option"
                  (click)="selectOption(opt)"
                  (mouseenter)="highlightedIndex.set(i)"
                  class="w-full text-left px-4 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors"
                  [class.bg-indigo-50]="highlightedIndex() === i"
                  [class.text-indigo-600]="opt.value === value()"
                >
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
  `,
})
export class SelectAtom implements ControlValueAccessor {
  // ── Public API (signal inputs) ──
  label = input<string>('');
  placeholder = input<string>('Seleccionar...');
  options = input<SelectOption[]>([]);
  value = model<string>('');
  required = input(false);
  disabled = input(false);
  error = input<string>('');
  helperText = input<string>('');
  searchable = input(false);

  // ── Internal state ──
  open = signal(false);
  searchQuery = signal('');
  highlightedIndex = signal(-1);

  private elementRef = inject(ElementRef);

  // ── Computed ──
  selectedLabel = computed(() => {
    const opt = this.options().find((o) => o.value === this.value());
    return opt ? opt.label : '';
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter((opt) =>
      opt.label.toLowerCase().includes(query),
    );
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
  toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
    if (this.open()) {
      this.searchQuery.set('');
      this.highlightedIndex.set(-1);
    }
  }

  selectOption(opt: SelectOption): void {
    this.value.set(opt.value);
    this.onChange(opt.value);
    this.onTouched();
    this.open.set(false);
    this.searchQuery.set('');
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.highlightedIndex.set(-1);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}
