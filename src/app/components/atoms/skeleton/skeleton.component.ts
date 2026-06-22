import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './skeleton.component.scss',
  template: `
    <div
      [class]="'skeleton skeleton--' + variant()"
      role="status"
      aria-busy="true"
      aria-label="Cargando contenido"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `
})
export class SkeletonAtom {
  variant = input<'text' | 'card' | 'table-row' | 'circle'>('text');
  width = input<string>('100%');
  height = input<string>('1rem');
}
