import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TransportService } from '../../../services/transport.service';
import { FinanceService } from '../../../services/finance.service';
import { TransportRoute } from '../../../models/transport.model';

@Component({
  selector: 'app-transport-dispatch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule
  ],
  template: `
    <div class="p-0 overflow-auto">
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Programar Servicio</h2>
          <p class="text-indigo-100 text-sm font-medium">Completa los datos para comprometer el vehículo.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
        <form [formGroup]="dispatchForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Cliente / Empresa</mat-label>
              <mat-select formControlName="customerName">
                @for (c of financeService.customers(); track c.id) {
                  <mat-option [value]="c.name">{{ c.name }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">business</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Origen</mat-label>
              <input matInput formControlName="origin" placeholder="Ej: Bogotá, DC">
              <mat-icon matPrefix class="mr-2 text-gray-400">location_on</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Destino</mat-label>
              <input matInput formControlName="destination" placeholder="Ej: Medellín, ANT">
              <mat-icon matPrefix class="mr-2 text-gray-400">flag</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Vehículo</mat-label>
              <input matInput [value]="data.vehicleId" readonly class="font-black text-indigo-600">
              <mat-icon matPrefix class="mr-2 text-gray-400">local_shipping</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha de Inicio</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="departureDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Hora de Inicio</mat-label>
              <input matInput type="time" formControlName="departureTime">
              <mat-icon matPrefix class="mr-2 text-gray-400">schedule</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Precio del Servicio</mat-label>
              <input matInput type="number" formControlName="servicePrice">
              <span matPrefix class="text-gray-400 mr-1">$</span>
            </mat-form-field>
          </div>

          <div class="p-6 bg-indigo-50 rounded-3xl space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Resumen Financiero</span>
              <span class="text-xs font-black text-indigo-900 tabular-nums">
                {{ (dispatchForm.value.servicePrice || 0) | currency:'USD':'symbol':'1.0-0' }} TOTAL
              </span>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="dispatchForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
              Confirmar Programación
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `]
})
export class TransportDispatchDialogOrganism implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportDispatchDialogOrganism>);
  public data = inject(MAT_DIALOG_DATA);
  public transportService = inject(TransportService);
  public financeService = inject(FinanceService);

  dispatchForm = this.fb.group({
    customerName: ['', Validators.required],
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    vehicleId: [''],
    departureDate: [new Date(), Validators.required],
    departureTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required],
    servicePrice: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    if (this.data.vehicleId) {
      this.dispatchForm.patchValue({ vehicleId: this.data.vehicleId });
    }
  }

  onServiceChange(serviceId: string) {
    // Removed
  }

  onSubmit() {
    if (this.dispatchForm.valid) {
      const val = this.dispatchForm.value;
      const date = val.departureDate as Date;
      const [hours, minutes] = (val.departureTime as string).split(':');
      date.setHours(parseInt(hours), parseInt(minutes));

      const vehicle = this.transportService.vehicles().find(v => v.id === val.vehicleId);
      
      this.transportService.addRoute({
        id: `RT-${Math.floor(Math.random() * 10000)}`,
        origin: val.origin!,
        destination: val.destination!,
        customerName: val.customerName!,
        vehicleId: val.vehicleId || '',
        driverName: vehicle?.driverName || '',
        departureDate: date.toISOString(),
        servicePrice: val.servicePrice!,
        standbyHours: 0,
        standbyTotal: 0,
        status: 'Planning',
        milestones: [],
        operations: [],
        detailedExpenses: [],
        incidents: []
      });
      this.dialogRef.close(true);
    }
  }
}
