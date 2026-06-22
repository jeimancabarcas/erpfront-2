import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { FinanceService } from '../../../services/finance.service';

export interface TransportDispatchDialogData {
  vehicleId: string;
}

export type TransportDispatchResult = boolean | undefined;

@Component({
  selector: 'app-transport-dispatch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="p-0 overflow-auto">
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Programar Servicio</h2>
          <p class="text-indigo-100 text-sm font-medium">Completa los datos para comprometer el vehículo.</p>
        </div>
        <button mat-icon-button (click)="close()" aria-label="Cerrar diálogo">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
        <form [formGroup]="dispatchForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Cliente / Empresa</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">business</mat-icon>
                <select formControlName="customerName" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                  @for (c of financeService.customers(); track c.id) {
                    <option [value]="c.name">{{ c.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Origen</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">location_on</mat-icon>
                <input formControlName="origin" placeholder="Ej: Bogotá, DC" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Destino</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">flag</mat-icon>
                <input formControlName="destination" placeholder="Ej: Medellín, ANT" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Vehículo</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">local_shipping</mat-icon>
                <input [value]="data.vehicleId" readonly class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-black text-indigo-600 bg-gray-50 text-sm">
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Fecha de Inicio</label>
              <input type="date" formControlName="departureDate" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Hora de Inicio</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">schedule</mat-icon>
                <input type="time" formControlName="departureTime" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Precio del Servicio</label>
              <div class="relative">
                <span class="text-gray-400 absolute left-3 top-3.5 text-sm font-medium">$</span>
                <input type="number" formControlName="servicePrice" class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
            </div>
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
            <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="dispatchForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 text-white flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all disabled:opacity-50">
              Confirmar Programación
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `]
})
export class TransportDispatchDialogOrganism implements OnInit {
  readonly data = inject<TransportDispatchDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportDispatchDialogOrganism, TransportDispatchResult>);
  private fb = inject(FormBuilder);
  public transportService = inject(TransportService);
  public financeService = inject(FinanceService);

  dispatchForm = this.fb.group({
    customerName: ['', Validators.required],
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    vehicleId: [''],
    departureDate: [new Date().toISOString().split('T')[0], Validators.required],
    departureTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required],
    servicePrice: [0, [Validators.required, Validators.min(0)]]
  });

  close(result?: TransportDispatchResult) {
    this.dialogRef.close(result);
  }

  ngOnInit() {
    if (this.data.vehicleId) {
      this.dispatchForm.patchValue({ vehicleId: this.data.vehicleId });
    }
  }

  onSubmit() {
    if (this.dispatchForm.valid) {
      const val = this.dispatchForm.value;
      const date = new Date(val.departureDate!);
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
