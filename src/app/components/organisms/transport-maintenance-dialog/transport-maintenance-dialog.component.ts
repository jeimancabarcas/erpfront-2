import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface TransportMaintenanceDialogData {
  vehicleId: string;
}

export type TransportMaintenanceResult = boolean | undefined;

@Component({
  selector: 'app-transport-maintenance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    ButtonAtom
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="p-0 overflow-hidden">
      <header class="bg-amber-500 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Programar Mantenimiento</h2>
          <p class="text-amber-50 text-sm font-medium italic">Define el servicio técnico para el vehículo {{ data.vehicleId }}.</p>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="maintenanceForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Tipo de Mantenimiento</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">handyman</span>
                <select formControlName="type" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Inspección">Inspección</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Fecha Programada</label>
              <input type="date" formControlName="scheduledDate" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm">
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Descripción Detallada</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">description</span>
                <textarea formControlName="description" rows="4" 
                          placeholder="Ej: Cambio de aceite, revisión de frenos y alineación..."
                          class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Costo Estimado (Opcional)</label>
              <div class="relative">
                <span class="text-gray-400 absolute left-3 top-3.5 text-sm font-medium">$</span>
                <input type="number" formControlName="cost" class="w-full pl-8 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm">
                <span class="material-icons absolute right-3 top-3.5 text-gray-400 text-sm">payments</span>
              </div>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="maintenanceForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-amber-600 text-white flex-1 shadow-xl shadow-amber-100 hover:scale-105 transition-all disabled:opacity-50">
              Programar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
    }
  `
})
export class TransportMaintenanceDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportMaintenanceDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportMaintenanceDialogOrganism, TransportMaintenanceResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  maintenanceForm = this.fb.group({
    type: ['Preventivo', Validators.required],
    scheduledDate: [new Date().toISOString().split('T')[0], Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    cost: [null as number | null]
  });

  close(result?: TransportMaintenanceResult) {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.maintenanceForm.valid) {
      const val = this.maintenanceForm.value;
      this.transportService.scheduleMaintenance({
        vehicleId: this.data.vehicleId,
        type: val.type as any,
        description: val.description!,
        scheduledDate: new Date(val.scheduledDate!).toISOString(),
        status: 'Scheduled',
        cost: val.cost || undefined
      });
      this.dialogRef.close(true);
    }
  }
}
