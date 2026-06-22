import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-header.component.scss',
  template: `
    <header class="page-header">
      <div class="page-header__content">
        <div class="page-header__breadcrumb">
          <ng-content select="[breadcrumb]"></ng-content>
        </div>

        <h1 class="page-header__title">{{ title() }}</h1>

        @if (description()) {
          <p class="page-header__description">{{ description() }}</p>
        }
      </div>

      <div class="page-header__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `
})
export class PageHeaderMolecule {
  title = input<string>('');
  description = input<string>('');
}
