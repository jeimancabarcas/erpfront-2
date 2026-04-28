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
              <mat-label>Servicio Configurado</mat-label>
              <mat-select formControlName="serviceId" (selectionChange)="onServiceChange($event.value)">
                @for (s of transportService.catalog(); track s.id) {
                  <mat-option [value]="s.id">{{ s.name }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">map</mat-icon>
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
              <mat-label>Duración (Días)</mat-label>
              <input matInput type="number" formControlName="durationDays">
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
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-gray-400 font-bold">TARIFA DIARIA ESTIMADA</span>
              <span class="text-sm font-black text-indigo-600 tabular-nums">
                {{ (dispatchForm.value.servicePrice || 0) / (dispatchForm.value.durationDays || 1) | currency:'USD':'symbol':'1.0-0' }}
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
    serviceId: ['', Validators.required],
    vehicleId: ['', Validators.required],
    departureDate: [new Date(), Validators.required],
    durationDays: [1, [Validators.required, Validators.min(1)]],
    servicePrice: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    if (this.data.vehicleId) {
      this.dispatchForm.patchValue({ vehicleId: this.data.vehicleId });
    }
  }

  onServiceChange(serviceId: string) {
    const service = this.transportService.catalog().find(s => s.id === serviceId);
    if (service) {
      this.dispatchForm.patchValue({
        durationDays: service.expectedDays,
        servicePrice: service.basePrice
      });
    }
  }

  onSubmit() {
    if (this.dispatchForm.valid) {
      const val = this.dispatchForm.value;
      const vehicle = this.transportService.vehicles().find(v => v.id === val.vehicleId);
      const service = this.transportService.catalog().find(s => s.id === val.serviceId);

      const newRoute: TransportRoute = {
        id: `RT-${Math.floor(Math.random() * 900 + 100)}`,
        serviceId: val.serviceId!,
        origin: service?.name.split(' ').pop() || 'Origen',
        destination: service?.name.split(' ').pop() || 'Destino',
        vehicleId: val.vehicleId!,
        driverName: vehicle?.driverName || 'N/A',
        customerName: val.customerName!,
        durationDays: val.durationDays!,
        servicePrice: val.servicePrice!,
        standbyHours: 0,
        standbyTotal: 0,
        departureDate: val.departureDate!.toISOString(),
        expectedArrival: new Date(val.departureDate!.getTime() + (val.durationDays! * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'Planning',
        milestones: [
          { id: '1', name: 'Salida de Patio', timestamp: new Date().toISOString(), status: 'Completed' as const },
          { id: '2', name: 'En Tránsito', timestamp: '', status: 'Pending' as const },
          { id: '3', name: 'Entrega Final', timestamp: '', status: 'Pending' as const }
        ],
        currentMilestone: 'Salida de Patio',
        expenses: { tolls: 0, fuel: 0, allowances: 0 }
      };

      this.transportService.addRoute(newRoute);
      this.dialogRef.close(true);
    }
  }
}
