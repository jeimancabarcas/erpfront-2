import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './avatar.component.scss',
  template: `
    <div
      class="avatar"
      [class.avatar--sm]="size() === 'sm'"
      [class.avatar--md]="size() === 'md'"
      [class.avatar--lg]="size() === 'lg'"
    >
      @if (src() && !imgError()) {
        <img
          class="avatar__img"
          [src]="src()"
          [alt]="alt()"
          (error)="imgError.set(true)"
          loading="lazy"
        />
      } @else if (initials()) {
        <span class="avatar__initials" role="img" [attr.aria-label]="alt() || initials()">
          {{ initials() }}
        </span>
      }
    </div>
  `
})
export class AvatarAtom {
  src = input<string>('');
  alt = input<string>('');
  initials = input<string>('');
  size = input<'sm' | 'md' | 'lg'>('md');

  imgError = signal(false);
}
