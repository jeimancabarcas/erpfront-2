import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';

export interface TransportChangeVehicleDialogData {
  routeId: string;
}

export type TransportChangeVehicleResult = boolean | undefined;

@Component({
  selector: 'app-transport-change-vehicle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="p-6">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">Cambiar Vehículo</h2>
          <p class="text-gray-400 text-sm font-medium italic">Reasignación de unidad para el servicio en curso.</p>
        </div>
        <button mat-icon-button (click)="close()" aria-label="Cerrar diálogo">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="changeForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block">Nuevo Vehículo</label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">local_shipping</mat-icon>
              <select formControlName="newVehicleId" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                @for (v of availableVehicles(); track v.id) {
                  <option [value]="v.id">
                    {{ v.id }} - {{ v.type }} - {{ v.driverName }}
                  </option>
                }
              </select>
            </div>
            @if (changeForm.get('newVehicleId')?.hasError('required') && changeForm.get('newVehicleId')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">El vehículo es obligatorio</p>
            }
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block">Motivo del Cambio</label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-4 text-gray-400 text-sm">comment</mat-icon>
              <textarea formControlName="reason" rows="4" placeholder="Ej: Falla mecánica en la unidad anterior, solicitud del cliente..." class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
            </div>
            @if (changeForm.get('reason')?.hasError('required') && changeForm.get('reason')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">El motivo es obligatorio</p>
            }
            @if (changeForm.get('reason')?.hasError('minlength') && changeForm.get('reason')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">Debe tener al menos 10 caracteres</p>
            }
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="close()" class="!rounded-xl !h-12 !px-6 !font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" 
                  [disabled]="changeForm.invalid"
                  class="!rounded-xl !h-12 !px-8 !font-black !bg-indigo-600 text-white shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
            Confirmar Cambio
          </button>
        </div>
      </form>
    </div>
  `
})
export class TransportChangeVehicleDialogOrganism {
  readonly data = inject<TransportChangeVehicleDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportChangeVehicleDialogOrganism, TransportChangeVehicleResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  availableVehicles = this.transportService.vehicles;

  changeForm = this.fb.group({
    newVehicleId: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  close(result?: TransportChangeVehicleResult) {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.changeForm.valid) {
      const { newVehicleId, reason } = this.changeForm.value;
      this.transportService.changeVehicle(this.data.routeId, newVehicleId!, reason!);
      this.dialogRef.close(true);
    }
  }
}
