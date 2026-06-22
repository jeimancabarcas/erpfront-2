import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CardAtom } from '../../atoms/card/card.component';

@Component({
  selector: 'ui-content-card',
  standalone: true,
  imports: [CardAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './content-card.component.scss',
  template: `
    <ui-card padding="0" class="content-card">
      <div
        class="content-card__image-wrapper"
        tabindex="0"
        role="article"
        (click)="onClick()"
        (keydown.enter)="onClick()"
      >
        @if (imageUrl()) {
          <img
            class="content-card__image"
            [src]="imageUrl()"
            [alt]="title()"
            loading="lazy"
          />
        } @else {
          <div class="content-card__placeholder"></div>
        }
      </div>
      <div class="content-card__text">
        <h3 class="content-card__title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="content-card__subtitle">{{ subtitle() }}</p>
        }
      </div>
    </ui-card>
  `
})
export class ContentCardMolecule {
  title = input<string>('');
  subtitle = input<string>('');
  imageUrl = input<string>('');
  routerLink = input<string>('');

  clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
