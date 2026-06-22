import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';

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
    MatButtonModule,
    ButtonAtom,
    SelectAtom
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
    <div class="p-8">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">Cambiar Vehículo</h2>
          <p class="text-gray-400 text-sm font-medium italic">Reasignación de unidad para el servicio en curso.</p>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form [formGroup]="changeForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <ui-select label="Nuevo Vehículo" [options]="vehicleOptions()" [formControl]="changeForm.controls.newVehicleId" />

          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block">Motivo del Cambio</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">comment</span>
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
    }
  `
})
export class TransportChangeVehicleDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportChangeVehicleDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportChangeVehicleDialogOrganism, TransportChangeVehicleResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  availableVehicles = this.transportService.vehicles;

  vehicleOptions = computed<SelectOption[]>(() =>
    this.availableVehicles().map(v => ({ value: v.id, label: `${v.id} - ${v.type} - ${v.driverName}` }))
  );

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
