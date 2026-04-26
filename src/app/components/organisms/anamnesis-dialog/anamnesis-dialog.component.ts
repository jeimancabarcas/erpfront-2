import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-anamnesis-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="p-10 rounded-[32px]">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">psychology</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Anamnesis</h2>
      </div>
      
      <div class="space-y-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Motivo de Consulta</mat-label>
          <textarea matInput rows="3" [(ngModel)]="data.reason" placeholder="Describa el motivo principal de la consulta..."></textarea>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Enfermedad Actual</mat-label>
          <textarea matInput rows="6" [(ngModel)]="data.currentIllness" placeholder="Evolución detallada de los síntomas y signos..."></textarea>
        </mat-form-field>
      </div>
      
      <div class="flex justify-end mt-10 gap-3">
        <button mat-button class="!rounded-full !px-8" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="true" class="!rounded-full !px-10 !bg-indigo-600 !font-black">Guardar Sección</button>
      </div>
    </div>
  `
})
export class AnamnesisDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
