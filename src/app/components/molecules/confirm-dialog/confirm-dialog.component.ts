import {
  Component,
  input,
  output,
  signal,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardAtom } from '../../atoms/card/card.component';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule, CardAtom, ButtonAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './confirm-dialog.component.scss',
  template: `
    @if (open()) {
      <div class="dialog-backdrop" (click)="onCancel()">
        <div class="dialog-container" (click)="$event.stopPropagation()">
          <ui-card
            class="dialog-card"
            role="alertdialog"
            aria-modal="true"
            padding="2rem"
            [attr.aria-labelledby]="'dialog-title'"
            [attr.aria-describedby]="'dialog-message'"
          >
            <div header>
              <h2 id="dialog-title" class="dialog-title">{{ title() }}</h2>
            </div>
            <p id="dialog-message" class="dialog-message">{{ message() }}</p>
            <div footer class="dialog-actions">
              <ui-button variant="secondary" (clicked)="onCancel()">
                {{ cancelLabel() }}
              </ui-button>
              <ui-button
                #confirmBtn
                [variant]="variant() === 'danger' ? 'primary' : 'primary'"
                [class.btn--danger]="variant() === 'danger'"
                (clicked)="onConfirm()"
              >
                {{ confirmLabel() }}
              </ui-button>
            </div>
          </ui-card>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogMolecule {
  open = input(false);
  title = input<string>('Confirmar');
  message = input<string>('');
  confirmLabel = input<string>('Confirmar');
  cancelLabel = input<string>('Cancelar');
  variant = input<'default' | 'danger'>('default');

  confirm = output<void>();
  cancel = output<void>();

  confirmBtn = viewChild<ElementRef<HTMLElement>>('confirmBtn');

  protected animationState = signal<'entering' | 'visible'>('visible');

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.onCancel();
    }
  }

  @HostListener('document:keydown.enter')
  onEnter(): void {
    if (this.open()) {
      this.onConfirm();
    }
  }
}
