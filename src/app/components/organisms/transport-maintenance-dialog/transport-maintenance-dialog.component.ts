import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-maintenance-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="p-0 overflow-hidden">
      <header class="bg-amber-500 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Programar Mantenimiento</h2>
          <p class="text-amber-50 text-sm font-medium italic">Define el servicio técnico para el vehículo {{ data.vehicleId }}.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="maintenanceForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Tipo de Mantenimiento</mat-label>
              <mat-select formControlName="type">
                <mat-option value="Preventivo">Preventivo</mat-option>
                <mat-option value="Correctivo">Correctivo</mat-option>
                <mat-option value="Inspección">Inspección</mat-option>
                <mat-option value="Otros">Otros</mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">handyman</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha Programada</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="scheduledDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full md:col-span-2">
              <mat-label>Descripción Detallada</mat-label>
              <textarea matInput formControlName="description" rows="4" 
                        placeholder="Ej: Cambio de aceite, revisión de frenos y alineación..."></textarea>
              <mat-icon matPrefix class="mr-2 text-gray-400">description</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Costo Estimado (Opcional)</mat-label>
              <input matInput type="number" formControlName="cost">
              <span matPrefix class="text-gray-400 mr-1">$</span>
              <mat-icon matSuffix class="text-gray-400">payments</mat-icon>
            </mat-form-field>
          </div>

          <div class="flex gap-4 pt-4">
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="maintenanceForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-amber-600 flex-1 shadow-xl shadow-amber-100 hover:scale-105 transition-all">
              Programar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TransportMaintenanceDialogOrganism {
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  dialogRef = inject(MatDialogRef<TransportMaintenanceDialogOrganism>);
  data = inject(MAT_DIALOG_DATA); // { vehicleId }

  maintenanceForm = this.fb.group({
    type: ['Preventivo', Validators.required],
    scheduledDate: [new Date(), Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    cost: [null]
  });

  onSubmit() {
    if (this.maintenanceForm.valid) {
      const val = this.maintenanceForm.value;
      this.transportService.scheduleMaintenance({
        vehicleId: this.data.vehicleId,
        type: val.type as any,
        description: val.description!,
        scheduledDate: (val.scheduledDate as Date).toISOString(),
        status: 'Scheduled',
        cost: val.cost || undefined
      });
      this.dialogRef.close(true);
    }
  }
}
