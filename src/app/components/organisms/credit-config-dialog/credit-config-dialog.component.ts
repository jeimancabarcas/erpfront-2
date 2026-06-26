import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../../services/customer.service';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';

export interface CreditConfigData {
  customerId: string;
  creditLimit?: number | null;
  paymentTermsDays?: number;
}

export type CreditConfigResult = { success: true } | undefined;

@Component({
  selector: 'app-credit-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] p-8">
      <header class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <span class="material-icons !text-[24px]">credit_score</span>
            </div>
            <div>
              <h2 class="text-xl font-black text-gray-900 tracking-tight !m-0">
                {{ isEdit() ? 'Editar Límite de Crédito' : 'Configurar Crédito' }}
              </h2>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                Límite y condiciones
              </p>
            </div>
          </div>
          <ui-button variant="icon" (clicked)="close()">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        @if (error()) {
          <div class="p-4 bg-red-50 border border-red-200 rounded-[20px] mb-6 flex items-start gap-3">
            <span class="material-icons text-red-500 text-sm mt-0.5">error_outline</span>
            <p class="text-xs text-red-700 font-medium">{{ error() }}</p>
          </div>
        }

        @if (success()) {
          <div class="p-6 flex flex-col items-center text-center space-y-3">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <span class="material-icons !text-[32px]">check_circle</span>
            </div>
            <p class="font-black text-gray-900 text-lg">Crédito {{ isEdit() ? 'Actualizado' : 'Configurado' }}</p>
            <p class="text-sm text-gray-500">
              El límite de crédito se ha {{ isEdit() ? 'actualizado' : 'configurado' }} exitosamente.
            </p>
            <ui-button variant="primary" (clicked)="close(true)">Cerrar</ui-button>
          </div>
        } @else {
          <div class="space-y-6">
            <ui-text-input
              label="Límite de Crédito"
              type="number"
              placeholder="0.00"
              [value]="creditLimit()"
              (valueChange)="onCreditLimitChange($event)"
            />

            <ui-select
              label="Días de Plazo"
              placeholder="Seleccione los días de plazo"
              [options]="paymentTermsOptions"
              [value]="paymentTermsDays()"
              (valueChange)="onPaymentTermsChange($event)"
            />

            <div class="flex justify-end gap-3 pt-4">
              <ui-button variant="ghost" (clicked)="close()">Cancelar</ui-button>
              <ui-button
                variant="primary"
                [disabled]="!isFormValid() || loading()"
                [loading]="loading()"
                (clicked)="submit()"
              >
                {{ isEdit() ? 'Actualizar' : 'Guardar' }}
              </ui-button>
            </div>
          </div>
        }
      </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CreditConfigDialogOrganism {
  private dialogRef = inject(MatDialogRef<CreditConfigDialogOrganism, CreditConfigResult>);
  private customerService = inject(CustomerService);
  data = inject<CreditConfigData>(MAT_DIALOG_DATA);

  isEdit = computed(() => this.data.creditLimit != null);

  // Form state
  creditLimit = signal<string>(this.data.creditLimit != null ? String(this.data.creditLimit) : '');
  paymentTermsDays = signal<string>(String(this.data.paymentTermsDays ?? 30));

  paymentTermsOptions: SelectOption[] = [
    { value: '15', label: '15 días' },
    { value: '30', label: '30 días' },
    { value: '45', label: '45 días' },
    { value: '60', label: '60 días' },
    { value: '90', label: '90 días' },
  ];

  isFormValid = computed(() => {
    const limit = parseFloat(this.creditLimit());
    return !isNaN(limit) && limit > 0;
  });

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  onCreditLimitChange(val: string) {
    this.creditLimit.set(val);
  }

  onPaymentTermsChange(val: string) {
    this.paymentTermsDays.set(val);
  }

  close(result: boolean = false) {
    this.dialogRef.close(result ? { success: true } : undefined);
  }

  submit() {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.error.set(null);

    const limit = parseFloat(this.creditLimit());

    this.customerService.setCustomerCredit(this.data.customerId, {
      creditLimit: limit,
      paymentTermsDays: parseInt(this.paymentTermsDays(), 10),
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al configurar el crédito');
        this.loading.set(false);
      },
    });
  }
}
