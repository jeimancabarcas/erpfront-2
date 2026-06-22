import {
  Component,
  input,
  output,
  signal,
  computed,
  inject,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './select.component.scss',
  template: `
    <div
      class="select-wrapper"
      [class.is-open]="isOpen()"
      [class.is-disabled]="disabled()"
      [class.is-error]="!!error()"
    >
      <!-- Trigger -->
      <button
        type="button"
        class="select__trigger"
        role="combobox"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-label]="label() || placeholder()"
        [disabled]="disabled()"
        (click)="toggleDropdown()"
        (keydown)="onTriggerKeydown($event)"
      >
        <span class="select__value" [class.select__value--placeholder]="!displayValue()">
          {{ displayValue() || placeholder() }}
        </span>
        <svg class="select__arrow" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Label -->
      @if (label()) {
        <label class="select__label">{{ label() }}</label>
      }

      <!-- Error -->
      @if (error()) {
        <span class="select__error">{{ error() }}</span>
      }

      <!-- Dropdown panel -->
      @if (isOpen()) {
        <div class="select__panel" role="listbox" [attr.aria-label]="label() || 'Opciones'">
          @if (searchable()) {
            <input
              class="select__search"
              type="text"
              autofocus
              [placeholder]="'Buscar…'"
              (input)="onSearch($event)"
              (keydown)="onSearchKeydown($event)"
              (click)="$event.stopPropagation()"
            />
          }

          @if (filteredOptions().length === 0) {
            <div class="select__empty">Sin resultados</div>
          }

          @for (opt of filteredOptions(); track opt.value; let i = $index) {
            <div
              class="select__option"
              [class.is-selected]="opt.value === value()"
              [class.is-focused]="focusedIndex() === i"
              role="option"
              [attr.aria-selected]="opt.value === value()"
              (click)="selectOption(opt.value)"
              (mouseenter)="focusedIndex.set(i)"
            >
              {{ opt.label }}
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SelectAtom {
  options = input<SelectOption[]>([]);
  value = input<string>('');
  searchable = input(false);
  label = input<string>('');
  error = input<string>('');
  disabled = input(false);
  placeholder = input<string>('Seleccionar...');

  valueChange = output<string>();

  // Internal state
  isOpen = signal(false);
  searchQuery = signal('');
  focusedIndex = signal(-1);

  private elementRef = inject(ElementRef);

  // Computed display value
  displayValue = computed(() => {
    const opt = this.options().find(o => o.value === this.value());
    return opt ? opt.label : '';
  });

  // Filtered options
  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(opt =>
      opt.label.toLowerCase().includes(query)
    );
  });

  toggleDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.searchQuery.set('');
      this.focusedIndex.set(-1);
    }
  }

  selectOption(val: string): void {
    this.valueChange.emit(val);
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.focusedIndex.set(-1);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
      if (this.isOpen() && this.filteredOptions().length > 0) {
        this.focusedIndex.set(0);
      }
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.isOpen.set(true);
      }
      const len = this.filteredOptions().length;
      if (len === 0) return;
      if (event.key === 'ArrowDown') {
        this.focusedIndex.update(i => (i + 1) % len);
      } else {
        this.focusedIndex.update(i => (i - 1 + len) % len);
      }
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.filteredOptions().length > 0) {
        this.focusedIndex.set(0);
      }
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.focusedIndex();
      if (idx >= 0 && idx < this.filteredOptions().length) {
        this.selectOption(this.filteredOptions()[idx].value);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
