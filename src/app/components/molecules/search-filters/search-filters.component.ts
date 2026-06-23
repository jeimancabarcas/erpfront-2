import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputAtom } from '../../atoms/input/input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { CardAtom } from '../../atoms/card/card.component';
import { DatepickerComponent } from '../../atoms/datepicker/datepicker.component';

export interface FilterDefinition {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: SelectOption[];
}

@Component({
  selector: 'ui-search-filters',
  standalone: true,
  imports: [CommonModule, InputAtom, SelectAtom, ButtonAtom, CardAtom, DatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './search-filters.component.scss',
  template: `
    <ui-card class="search-filters">
      <div class="search-filters__bar">
        @for (filter of filters(); track filter.key) {
          @switch (filter.type) {
            @case ('text') {
              <ui-input
                class="search-filters__input"
                [label]="filter.label"
                [placeholder]="filter.label"
                [value]="filterValues()[filter.key]"
                (valueChange)="onFilterChange(filter.key, $event)"
              />
            }
            @case ('select') {
              <ui-select
                class="search-filters__select"
                [label]="filter.label"
                [placeholder]="filter.label"
                [options]="filter.options ?? []"
                [value]="filterValues()[filter.key]"
                (valueChange)="onFilterChange(filter.key, $event)"
              />
            }
            @case ('date') {
              <ui-datepicker
                [label]="filter.label"
                [value]="parseDate(filterValues()[filter.key])"
                (valueChange)="onDateChange(filter.key, $event)"
              />
            }
          }
        }

        @if (hasActiveFilters) {
          <ui-button variant="ghost" (clicked)="onClear()"> Limpiar </ui-button>
        }
      </div>
    </ui-card>
  `,
})
export class SearchFiltersMolecule implements OnDestroy {
  filters = input<FilterDefinition[]>([]);

  filtersChange = output<Record<string, string>>();

  filterValues = signal<Record<string, string>>({});

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  get hasActiveFilters(): boolean {
    return Object.values(this.filterValues()).some((v) => v !== '');
  }

  onFilterChange(key: string, value: string): void {
    this.filterValues.update((prev) => ({ ...prev, [key]: value }));
    this.emitWithDebounce();
  }

  onDateChange(key: string, date: Date | null): void {
    this.onFilterChange(key, date ? date.toISOString().split('T')[0] : '');
  }

  parseDate(value: string): Date | null {
    return value ? new Date(value) : null;
  }

  onClear(): void {
    this.filterValues.set({});
    this.filtersChange.emit({});
  }

  private emitWithDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.filtersChange.emit({ ...this.filterValues() });
    }, 400);
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
