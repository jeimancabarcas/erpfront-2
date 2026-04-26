import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-incapacity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <mat-icon>event_busy</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Incapacidad Médica</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Días de Incapacidad</mat-label>
          <input matInput type="number" [(ngModel)]="data.days" placeholder="Ej: 3">
          <mat-icon matSuffix class="text-gray-300">calendar_today</mat-icon>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Tipo de Incapacidad</mat-label>
          <mat-select [(ngModel)]="data.type">
            <mat-option value="Enfermedad General">Enfermedad General</mat-option>
            <mat-option value="Accidente de Trabajo">Accidente de Trabajo</mat-option>
            <mat-option value="Enfermedad Profesional">Enfermedad Profesional</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="w-full mb-6">
        <mat-label>Licencias Especiales</mat-label>
        <mat-select [(ngModel)]="data.specialLicense">
          <mat-option value="Ninguna">Ninguna</mat-option>
          <mat-option value="Maternidad">Licencia de Maternidad</mat-option>
          <mat-option value="Paternidad">Licencia de Paternidad</mat-option>
          <mat-option value="Luto">Licencia por Luto</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Recomendaciones Médicas</mat-label>
        <textarea matInput rows="5" [(ngModel)]="data.recommendations" placeholder="Instrucciones para el reposo y cuidados del paciente..."></textarea>
      </mat-form-field>

      <div class="flex justify-end mt-10 gap-3">
        <button mat-button class="!rounded-full !px-8" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="true" class="!rounded-full !h-12 !px-10 !bg-indigo-600 !font-black">Guardar Incapacidad</button>
      </div>
    </div>
  `
})
export class IncapacityDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
