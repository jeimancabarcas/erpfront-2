import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransportService } from '../../../services/transport.service';
import { OperationType } from '../../../models/transport.model';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-transport-operation-dialog',
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
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Operación</h2>
          <p class="text-indigo-100 text-sm font-medium">Define la actividad logística realizada.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="operationForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Tipo de Operación</mat-label>
              <mat-select formControlName="type" (selectionChange)="onTypeChange($event.value)">
                @for (type of operationTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">settings_suggest</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha de Operación</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="timestamp">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Hora de Operación</mat-label>
              <input matInput type="time" formControlName="operationTime">
              <mat-icon matPrefix class="mr-2 text-gray-400">schedule</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full md:col-span-2">
              <mat-label>Vehículo Responsable</mat-label>
              <mat-select formControlName="vehicleId">
                @for (v of transportService.vehicles(); track v.id) {
                  <mat-option [value]="v.id">{{ v.id }} - {{ v.driverName }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">local_shipping</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full md:col-span-2">
              <mat-label>Descripción / Observaciones</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Ej: Cargue de contenedor de 40 pies..."></textarea>
              <mat-icon matPrefix class="mr-2 text-gray-400">description</mat-icon>
            </mat-form-field>

            <div class="md:col-span-2 space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archivos Adjuntos (Evidencia)</p>
              <div class="flex flex-wrap gap-3">
                @for (file of selectedFiles; track $index) {
                  <div class="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl border border-indigo-100 text-xs font-bold animate-in zoom-in-95">
                    <mat-icon class="!text-sm !w-4 !h-4">attach_file</mat-icon>
                    {{ file }}
                    <button type="button" (click)="removeFile($index)" class="hover:text-red-500 transition-colors">
                      <mat-icon class="!text-sm !w-4 !h-4">close</mat-icon>
                    </button>
                  </div>
                }
                <button type="button" (click)="fileInput.click()" 
                        class="flex items-center gap-2 bg-white text-gray-400 px-4 py-2 rounded-2xl border border-dashed border-gray-200 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all">
                  <mat-icon class="!text-sm !w-4 !h-4">add</mat-icon>
                  Adjuntar Archivo
                </button>
                <input #fileInput type="file" (change)="onFileSelected($event)" multiple class="hidden">
              </div>
            </div>

          </div>

          <div class="flex gap-4 pt-4">
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="operationForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
              Registrar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { margin-bottom: 4px; }
  `]
})
export class TransportOperationDialogOrganism implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportOperationDialogOrganism>);
  public data = inject(MAT_DIALOG_DATA);
  public transportService = inject(TransportService);

  operationTypes: OperationType[] = ['Cargue', 'Descargue', 'Consolidacion', 'Desconsolidacion'];
  showVehicleSelect = false;
  selectedFiles: string[] = [];

  operationForm = this.fb.group({
    type: ['', Validators.required],
    vehicleId: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    timestamp: [new Date(), Validators.required],
    operationTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required],
    status: ['InProcess']
  });

  ngOnInit() {
    // If we have a vehicleId from context, pre-select it
    if (this.data.vehicleId) {
      this.operationForm.patchValue({ vehicleId: this.data.vehicleId });
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i].name);
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  onTypeChange(type: string) {
    // No longer needed to show/hide, always shown
  }

  onSubmit() {
    if (this.operationForm.valid) {
      const val = this.operationForm.value;
      
      // Combine date and time
      const date = new Date(val.timestamp as Date);
      const [hours, minutes] = (val.operationTime as string).split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      this.transportService.addOperation(this.data.routeId, {
        type: val.type as OperationType,
        vehicleId: val.vehicleId!,
        description: val.description!,
        status: val.status as any,
        timestamp: date.toISOString(),
        attachments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      });
      this.dialogRef.close(true);
    }
  }
}
