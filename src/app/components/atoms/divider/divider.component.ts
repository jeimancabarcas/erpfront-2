import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-divider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './divider.component.scss',
  template: `
    @if (direction() === 'horizontal') {
      <div
        class="divider divider--horizontal"
        role="separator"
        aria-orientation="horizontal"
        [style.--divider-thickness]="thickness()"
      >
        @if (label()) {
          <span class="divider__label">{{ label() }}</span>
        }
      </div>
    } @else {
      <div
        class="divider divider--vertical"
        role="separator"
        aria-orientation="vertical"
        [style.--divider-thickness]="thickness()"
      ></div>
    }
  `
})
export class DividerAtom {
  direction = input<'horizontal' | 'vertical'>('horizontal');
  label = input<string>('');
  thickness = input<string>('1px');
}
