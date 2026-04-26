import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-physical-exam-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <mat-icon>monitor_heart</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Examen Físico</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Peso (kg)</mat-label>
          <input matInput type="number" step="0.1" [(ngModel)]="data.weight">
          <mat-icon matSuffix class="text-gray-300">monitor_weight</mat-icon>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Talla (cm)</mat-label>
          <input matInput type="number" [(ngModel)]="data.height">
          <mat-icon matSuffix class="text-gray-300">straighten</mat-icon>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Temp (°C)</mat-label>
          <input matInput type="number" step="0.1" [(ngModel)]="data.temperature">
          <mat-icon matSuffix class="text-gray-300">thermostat</mat-icon>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Hallazgos Clínicos Detallados</mat-label>
        <textarea matInput rows="6" [(ngModel)]="data.findings" placeholder="Descripción detallada de los hallazgos por sistemas..."></textarea>
      </mat-form-field>

      <div class="flex justify-end mt-10 gap-3">
        <button mat-button class="!rounded-full !px-8" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="true" class="!rounded-full !h-12 !px-10 !bg-indigo-600 !font-black">Guardar Examen</button>
      </div>
    </div>
  `
})
export class PhysicalExamDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
