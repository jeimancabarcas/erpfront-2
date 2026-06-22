import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './card.component.scss',
  template: `
    <div class="card" [style.--card-padding]="padding()">
      <div class="card__header">
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card__body">
        <ng-content></ng-content>
      </div>
      <div class="card__footer">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardAtom {
  padding = input<string>('var(--spacing-6)');
}
