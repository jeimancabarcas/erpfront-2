import { Component, input, output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { InputAtom } from '../../atoms/input/input.component';

@Component({
  selector: 'ui-search-bar',
  standalone: true,
  imports: [InputAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './search-bar.component.scss',
  template: `
    <div class="search-bar" role="search" aria-label="Buscar">
      <span class="search-bar__icon material-icons">search</span>
      <ui-input
        class="search-bar__input"
        [value]="value()"
        [placeholder]="placeholder()"
        (valueChange)="onValueChange($event)"
      />
      <kbd class="search-bar__hint">⌘K</kbd>
    </div>
  `
})
export class SearchBarMolecule implements OnDestroy {
  placeholder = input<string>('Buscar...');
  value = input<string>('');

  valueChange = output<string>();

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onValueChange(val: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.valueChange.emit(val);
    }, 400);
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
