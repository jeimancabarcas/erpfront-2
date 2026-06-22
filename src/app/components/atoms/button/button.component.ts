import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './button.component.scss',
  template: `
    <button
      [type]="type()"
      [class]="'button button--' + variant() + ' button--' + size()"
      [disabled]="disabled() || loading()"
      [attr.aria-disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [attr.aria-label]="ariaLabel() || tooltip() || null"
      [matTooltip]="tooltip() || ''"
      [matTooltipDisabled]="!tooltip()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <span class="button__spinner" aria-hidden="true"></span>
        <ng-content select="[spinner]"></ng-content>
      }
      <span class="button__content"><ng-content></ng-content></span>
    </button>
  `
})
export class ButtonAtom {
  variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'icon'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit'>('button');
  ariaLabel = input<string>('');
  tooltip = input<string>('');

  clicked = output<void>();

  onClick(event: Event): void {
    if (this.disabled() || this.loading()) return;
    this.clicked.emit();
  }
}
