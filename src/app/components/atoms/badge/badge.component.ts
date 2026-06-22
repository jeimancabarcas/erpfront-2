import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './badge.component.scss',
  template: `
    @if (variant() === 'dot') {
      <span
        class="badge badge--dot"
        [class.badge--success]="status() === 'success'"
        [class.badge--warning]="status() === 'warning'"
        [class.badge--error]="status() === 'error'"
        role="status"
        [attr.aria-label]="'Indicator: ' + status()"
      ></span>
    } @else if (variant() === 'counter') {
      <span
        class="badge badge--counter"
        [class.badge--sm]="size() === 'sm'"
        [class.badge--md]="size() === 'md'"
        [attr.aria-label]="count() + ' items'"
      >
        {{ count() }}
      </span>
    } @else {
      <span
        class="badge badge--status"
        [class.badge--success]="status() === 'success'"
        [class.badge--warning]="status() === 'warning'"
        [class.badge--error]="status() === 'error'"
        [class.badge--sm]="size() === 'sm'"
        [class.badge--md]="size() === 'md'"
        role="status"
      >
        <ng-content></ng-content>
      </span>
    }
  `
})
export class BadgeAtom {
  variant = input<'status' | 'counter' | 'dot'>('status');
  status = input<'success' | 'warning' | 'error'>('success');
  count = input<number>(0);
  size = input<'sm' | 'md'>('md');
}
