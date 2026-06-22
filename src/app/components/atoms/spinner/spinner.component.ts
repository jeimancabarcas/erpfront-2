import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './spinner.component.scss',
  template: `
    <div
      class="spinner"
      [class.spinner--sm]="size() === 'sm'"
      [class.spinner--md]="size() === 'md'"
      [class.spinner--lg]="size() === 'lg'"
      role="progressbar"
      aria-label="Cargando"
      [attr.aria-valuetext]="'Cargando…'"
    ></div>
  `
})
export class SpinnerAtom {
  size = input<'sm' | 'md' | 'lg'>('md');
}
