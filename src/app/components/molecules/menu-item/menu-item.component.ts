import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeAtom } from '../../atoms/badge/badge.component';

@Component({
  selector: 'ui-menu-item',
  standalone: true,
  imports: [RouterLink, BadgeAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './menu-item.component.scss',
  template: `
    @if (routerLink()) {
      <a
        [routerLink]="routerLink()"
        class="menu-item"
        [class.menu-item--active]="active()"
        [class.menu-item--disabled]="disabled()"
        role="menuitem"
        [attr.aria-current]="active() ? 'page' : null"
        [attr.aria-disabled]="disabled() || null"
        (click)="onClick($event)"
      >
        <span class="menu-item__icon material-icons">{{ icon() }}</span>
        <span class="menu-item__label">{{ label() }}</span>
        @if (count() > 0) {
          <ui-badge variant="counter" size="sm" [count]="count()" />
        }
      </a>
    } @else {
      <button
        class="menu-item"
        [class.menu-item--active]="active()"
        [class.menu-item--disabled]="disabled()"
        role="menuitem"
        [attr.aria-current]="active() ? 'page' : null"
        [attr.aria-disabled]="disabled() || null"
        [disabled]="disabled()"
        (click)="onClick($event)"
      >
        <span class="menu-item__icon material-icons">{{ icon() }}</span>
        <span class="menu-item__label">{{ label() }}</span>
        @if (count() > 0) {
          <ui-badge variant="counter" size="sm" [count]="count()" />
        }
      </button>
    }
  `
})
export class MenuItemMolecule {
  icon = input<string>('');
  label = input<string>('');
  count = input<number>(0);
  active = input(false);
  disabled = input(false);
  routerLink = input<string>('');

  clicked = output<void>();

  onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit();
  }
}
