import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { BillingService } from '../../../services/billing.service';
import { Appointment } from '../../../services/pediatrics.service';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-appointment-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white">
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <div class="p-8 relative z-10">
        <header class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <mat-icon>how_to_reg</mat-icon>
          </div>
          <div>
            <h2 class="text-xl font-black text-gray-900 tracking-tight !m-0">Confirmar Llegada</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{{ data.appointment.patientName }}</span>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <div class="flex items-center gap-1">
                <mat-icon class="!w-3 !h-3 !text-[12px] text-indigo-500">medical_services</mat-icon>
                <span class="text-indigo-600 text-[10px] font-black uppercase tracking-widest">{{ data.appointment.type }}</span>
              </div>
            </div>
          </div>
        </header>

        <form [formGroup]="confirmForm" (ngSubmit)="onConfirm()" class="space-y-6">
          <!-- Type Toggle -->
          <div class="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
            <div class="flex items-center gap-3">
              <mat-icon class="text-gray-400">{{ isParticular() ? 'person' : 'account_balance' }}</mat-icon>
              <div>
                <p class="text-xs font-black text-gray-900">Tipo de Pago</p>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {{ isParticular() ? 'Atención Particular' : 'Aseguradora / Prepagada' }}
                </p>
              </div>
            </div>
            <mat-slide-toggle formControlName="isParticular" color="primary"></mat-slide-toggle>
          </div>

          @if (!isParticular()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top duration-300">
              <mat-form-field appearance="outline" class="w-full !m-0">
                <mat-label>Seleccione Prestador</mat-label>
                <mat-select formControlName="provider">
                  @for (p of billingService.providers(); track p.id) {
                    <mat-option [value]="p.name">{{ p.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full !m-0">
                <mat-label>Nº Autorización</mat-label>
                <input matInput formControlName="authorizationNumber" placeholder="Código">
              </mat-form-field>
            </div>
          }

          <!-- Amount Summary Card -->
          <div class="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100/30">
            <div class="flex justify-between items-center mb-4">
              <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Resumen de Cobro</span>
              <span class="px-3 py-1 bg-white rounded-full text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-50">
                {{ data.appointment.type }}
              </span>
            </div>
            
            <div class="flex justify-between items-end">
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-500">Valor a pagar por el paciente:</p>
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-black text-indigo-600 tabular-nums">
                    {{ patientAmount() | currency:'USD':'symbol':'1.0-0' }}
                  </span>
                  <span class="text-[10px] font-bold text-gray-400 line-through" *ngIf="!isParticular()">
                    {{ totalAmount() | currency:'USD':'symbol':'1.0-0' }}
                  </span>
                </div>
              </div>
              
              <div class="flex flex-col items-end gap-2">
                <mat-slide-toggle formControlName="markAsPaid" color="accent" class="scale-90">
                  <span class="text-[10px] font-black uppercase text-gray-500">¿Recaudar ahora?</span>
                </mat-slide-toggle>
              </div>
            </div>

            @if (confirmForm.get('markAsPaid')?.value) {
              <div class="mt-4 pt-4 border-t border-indigo-100/50 flex items-center gap-2 text-green-600 animate-in fade-in duration-300">
                <mat-icon class="!w-4 !h-4 !text-[16px]">check_circle</mat-icon>
                <span class="text-[10px] font-black uppercase tracking-wider">El copago se registrará como PAGADO</span>
              </div>
            }
          </div>

          <div class="flex gap-3 pt-4 border-t border-gray-50">
            <button mat-button type="button" class="!rounded-full flex-1 !h-12 !font-bold" (click)="dialogRef.close()">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" 
              [disabled]="confirmForm.invalid"
              class="!rounded-full flex-[2] !h-12 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100">
              Confirmar y Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class AppointmentConfirmationDialogOrganism {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<AppointmentConfirmationDialogOrganism>);
  public data = inject<{ appointment: Appointment }>(MAT_DIALOG_DATA);
  public billingService = inject(BillingService);

  confirmForm = this.fb.group({
    isParticular: [false],
    provider: ['', Validators.required],
    authorizationNumber: [''],
    markAsPaid: [true]
  });

  isParticular = toSignal(
    this.confirmForm.get('isParticular')!.valueChanges.pipe(startWith(false)),
    { initialValue: false }
  );

  totalAmount = computed(() => {
    return this.data.appointment.type === 'Control' ? 120000 : 180000;
  });

  patientAmount = computed(() => {
    if (this.isParticular()) return this.totalAmount();
    return 35000; // Fixed copay for insurance
  });

  constructor() {
    this.confirmForm.get('isParticular')?.valueChanges.subscribe(isParticular => {
      if (isParticular) {
        this.confirmForm.get('provider')?.clearValidators();
        this.confirmForm.get('provider')?.setValue('Particular');
      } else {
        this.confirmForm.get('provider')?.setValidators([Validators.required]);
        this.confirmForm.get('provider')?.setValue('');
      }
      this.confirmForm.get('provider')?.updateValueAndValidity();
    });
  }

  onConfirm() {
    if (this.confirmForm.valid) {
      this.dialogRef.close({
        ...this.confirmForm.value,
        patientAmount: this.patientAmount(),
        totalAmount: this.totalAmount()
      });
    }
  }
}
