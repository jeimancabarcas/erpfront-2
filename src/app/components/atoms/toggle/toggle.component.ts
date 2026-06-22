import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './toggle.component.scss',
  template: `
    <button
      type="button"
      class="toggle"
      role="switch"
      [attr.aria-checked]="checked()"
      [disabled]="disabled()"
      [class.is-checked]="checked()"
      (click)="toggle($event)"
      (keydown)="onKeydown($event)"
    >
      <span class="toggle__knob"></span>
    </button>
  `
})
export class ToggleAtom {
  checked = input(false);
  disabled = input(false);

  checkedChange = output<boolean>();

  toggle(event: Event): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.checkedChange.emit(!this.checked());
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
      this.toggle(event);
    }
  }
}
