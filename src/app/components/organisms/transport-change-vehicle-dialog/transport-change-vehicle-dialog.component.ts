import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-change-vehicle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="p-6">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">Cambiar Vehículo</h2>
          <p class="text-gray-400 text-sm font-medium italic">Reasignación de unidad para el servicio en curso.</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="text-gray-400 hover:text-gray-600">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="changeForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nuevo Vehículo</mat-label>
            <mat-select formControlName="newVehicleId">
              @for (v of availableVehicles(); track v.id) {
                <mat-option [value]="v.id">
                  <div class="flex justify-between items-center w-full">
                    <span class="font-bold">{{ v.id }}</span>
                    <span class="text-xs text-gray-400">{{ v.type }} - {{ v.driverName }}</span>
                  </div>
                </mat-option>
              }
            </mat-select>
            <mat-icon matPrefix class="mr-2 text-gray-400">local_shipping</mat-icon>
            <mat-error *ngIf="changeForm.get('newVehicleId')?.hasError('required')">El vehículo es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Motivo del Cambio</mat-label>
            <textarea matInput formControlName="reason" rows="4" placeholder="Ej: Falla mecánica en la unidad anterior, solicitud del cliente..."></textarea>
            <mat-icon matPrefix class="mr-2 text-gray-400">comment</mat-icon>
            <mat-error *ngIf="changeForm.get('reason')?.hasError('required')">El motivo es obligatorio</mat-error>
            <mat-error *ngIf="changeForm.get('reason')?.hasError('minlength')">Debe tener al menos 10 caracteres</mat-error>
          </mat-form-field>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" mat-button (click)="dialogRef.close()" class="!rounded-xl !h-12 !px-6 !font-bold">
            Cancelar
          </button>
          <button type="submit" mat-flat-button color="primary" 
                  [disabled]="changeForm.invalid"
                  class="!rounded-xl !h-12 !px-8 !font-black !bg-indigo-600 shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
            Confirmar Cambio
          </button>
        </div>
      </form>
    </div>
  `
})
export class TransportChangeVehicleDialogOrganism {
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  dialogRef = inject(MatDialogRef<TransportChangeVehicleDialogOrganism>);
  data = inject(MAT_DIALOG_DATA);

  availableVehicles = this.transportService.vehicles;

  changeForm = this.fb.group({
    newVehicleId: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  onSubmit() {
    if (this.changeForm.valid) {
      const { newVehicleId, reason } = this.changeForm.value;
      this.transportService.changeVehicle(this.data.routeId, newVehicleId!, reason!);
      this.dialogRef.close(true);
    }
  }
}
