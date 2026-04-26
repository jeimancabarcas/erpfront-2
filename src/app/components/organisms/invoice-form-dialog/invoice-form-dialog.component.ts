import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';
import { BillingService } from '../../../services/billing.service';
import { Invoice } from '../../../models/billing.model';
import { startWith } from 'rxjs';
import { PatientSearchMolecule } from '../../molecules/patient-search/patient-search.component';

@Component({
  selector: 'app-invoice-form-dialog',
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
    MatAutocompleteModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    PatientSearchMolecule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white">
      <!-- Decorative Background Element -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <div class="p-10 relative z-10">
        <header class="flex items-center gap-5 mb-10">
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 animate-in zoom-in duration-500">
            <mat-icon class="!text-[28px] !w-7 !h-7">receipt_long</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">Nueva Factura Manual</h2>
            <p class="text-gray-400 text-sm font-semibold uppercase tracking-widest mt-1">Gestión Financiera</p>
          </div>
        </header>

        <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Service Type Toggle -->
            <div class="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 [background:white] rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                  <mat-icon>{{ isParticular() ? 'person' : 'account_balance' }}</mat-icon>
                </div>
                <div>
                  <p class="text-xs font-black text-gray-900">Tipo de Servicio</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase">{{ isParticular() ? 'Atención Particular' : 'Aseguradora / Prepagada' }}</p>
                </div>
              </div>
              <mat-slide-toggle formControlName="isParticular" color="primary"></mat-slide-toggle>
            </div>

            <!-- Appointment Type Selection -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Tipo de Consulta / Cita</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <mat-select formControlName="appointmentType">
                  <mat-option value="Control">Consulta de Control</mat-option>
                  <mat-option value="Urgency">Urgencia</mat-option>
                  <mat-option value="Specialist">Especialista</mat-option>
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">category</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Patient Selection -->
          <div class="space-y-2">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Información del Paciente</label>
            <app-patient-search 
              (selectedPatientChange)="onPatientSelected($event)"
            />
          </div>

          @if (!isParticular()) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top duration-300">
              <!-- Provider Selection -->
              <div class="space-y-2">
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Responsable de Pago</label>
                <mat-form-field appearance="outline" class="w-full !m-0">
                  <mat-label>Seleccione Prestador</mat-label>
                  <mat-select formControlName="provider">
                    @for (provider of billingService.providers(); track provider.id) {
                      <mat-option [value]="provider.name">{{provider.name}}</mat-option>
                    }
                  </mat-select>
                  <mat-icon matPrefix class="mr-2 text-gray-400">account_balance</mat-icon>
                </mat-form-field>
              </div>

              <!-- Authorization Number -->
              <div class="space-y-2">
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Nº de Autorización</label>
                <mat-form-field appearance="outline" class="w-full !m-0">
                  <mat-label>Código de autorización</mat-label>
                  <input matInput formControlName="authorizationNumber" placeholder="Ej: AUT-12345">
                  <mat-icon matPrefix class="mr-2 text-gray-400">verified</mat-icon>
                </mat-form-field>
              </div>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Total Amount -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Valor Total</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <input matInput type="number" formControlName="totalAmount" placeholder="0.00" class="!font-black text-lg">
                <span matPrefix class="mr-1 font-black text-gray-400">$</span>
              </mat-form-field>
            </div>

            <!-- Patient Amount (Copay) -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">
                {{ isParticular() ? 'Valor Pagado por Paciente' : 'Valor Copago' }}
              </label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <input matInput type="number" formControlName="patientAmount" placeholder="0.00" class="!font-black text-lg text-green-600">
                <span matPrefix class="mr-1 font-black text-gray-400">$</span>
              </mat-form-field>
            </div>
          </div>

          <!-- Provider Amount (Calculated Summary) -->
          @if (!isParticular()) {
            <div class="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100/50 flex justify-between items-center group transition-all hover:bg-indigo-50 animate-in zoom-in duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <mat-icon>account_balance_wallet</mat-icon>
                </div>
                <div>
                  <p class="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Saldo a Prestador</p>
                  <p class="text-xs text-gray-500 font-medium italic">Valor pendiente por cobrar</p>
                </div>
              </div>
              <span class="text-2xl font-black text-indigo-600 tabular-nums">{{ providerAmount() | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          } @else {
            <div class="p-6 bg-green-50/50 rounded-[24px] border border-green-100/50 flex justify-between items-center animate-in zoom-in duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                  <mat-icon>check_circle</mat-icon>
                </div>
                <div>
                  <p class="text-[10px] text-green-400 font-black uppercase tracking-widest">Saldo Prestador</p>
                  <p class="text-xs text-gray-500 font-medium italic">Atención particular (Sin cobro EPS)</p>
                </div>
              </div>
              <span class="text-2xl font-black text-green-600">$0</span>
            </div>
          }

          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            <button mat-button type="button" class="!rounded-full !px-8 !h-12 !font-bold text-gray-500" (click)="dialogRef.close()">
              Descartar
            </button>
            <button mat-flat-button color="primary" type="submit" 
              [disabled]="invoiceForm.invalid"
              class="!rounded-full !px-12 !h-12 !bg-indigo-600 !font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Generar Factura
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
export class InvoiceFormDialogOrganism {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<InvoiceFormDialogOrganism>);
  public billingService = inject(BillingService);

  invoiceForm = this.fb.group({
    patient: [null as Patient | null, Validators.required],
    provider: [''],
    appointmentType: ['Control', Validators.required],
    authorizationNumber: [''],
    totalAmount: [120000, [Validators.required, Validators.min(0)]],
    patientAmount: [35000, [Validators.required, Validators.min(0)]],
    isParticular: [false]
  });

  // Reactive Signals for form values
  isParticular = toSignal(
    this.invoiceForm.get('isParticular')!.valueChanges.pipe(startWith(false)),
    { initialValue: false }
  );

  private totalValue = toSignal(
    this.invoiceForm.get('totalAmount')!.valueChanges.pipe(startWith(120000)),
    { initialValue: 120000 }
  );

  private copayValue = toSignal(
    this.invoiceForm.get('patientAmount')!.valueChanges.pipe(startWith(35000)),
    { initialValue: 35000 }
  );

  constructor() {
    // Logic for Particular vs Provider
    this.invoiceForm.get('isParticular')?.valueChanges.subscribe(particular => {
      if (particular) {
        this.invoiceForm.get('provider')?.clearValidators();
        this.invoiceForm.get('provider')?.setValue('Particular');
        this.invoiceForm.get('authorizationNumber')?.setValue('');
        this.invoiceForm.get('authorizationNumber')?.disable();
        // Adjust patient amount to total if particular
        this.invoiceForm.get('patientAmount')?.setValue(this.invoiceForm.get('totalAmount')?.value ?? 0);
      } else {
        this.invoiceForm.get('provider')?.setValidators([Validators.required]);
        this.invoiceForm.get('provider')?.setValue('');
        this.invoiceForm.get('authorizationNumber')?.enable();
        // Reset copay to default
        this.invoiceForm.get('patientAmount')?.setValue(35000);
      }
      this.invoiceForm.get('provider')?.updateValueAndValidity();
    });

    // Logic for Appointment Type Prices
    this.invoiceForm.get('appointmentType')?.valueChanges.subscribe(type => {
      const price = type === 'Control' ? 120000 : 180000;
      this.invoiceForm.get('totalAmount')?.setValue(price);
      if (this.isParticular()) {
        this.invoiceForm.get('patientAmount')?.setValue(price);
      }
    });
  }

  // Computed Balance Calculation
  providerAmount = computed(() => {
    if (this.isParticular()) return 0;
    const total = this.totalValue() ?? 0;
    const patient = this.copayValue() ?? 0;
    return Math.max(0, total - patient);
  });

  onPatientSelected(patient: Patient | null) {
    this.invoiceForm.patchValue({ patient });
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;
      const patient = formValue.patient as Patient;

      const newInvoice: Invoice = {
        id: `FAC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        appointmentId: 'MANUAL',
        patientId: patient.id,
        patientName: `${patient.firstNames} ${patient.lastNames}`,
        provider: formValue.provider ?? 'Particular',
        authorizationNumber: formValue.authorizationNumber ?? undefined,
        isParticular: formValue.isParticular ?? false,
        date: new Date().toISOString().split('T')[0],
        totalAmount: formValue.totalAmount ?? 0,
        patientAmount: formValue.patientAmount ?? 0,
        patientStatus: 'Pending',
        providerAmount: this.providerAmount(),
        providerStatus: formValue.isParticular ? 'Paid' : 'Pending',
        status: 'Pending'
      };
      
      this.dialogRef.close(newInvoice);
    }
  }
}
