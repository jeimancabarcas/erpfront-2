import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface IncapacityDialogData {
  days: number | null;
  type: string;
  specialLicense: string;
  recommendations: string;
}

export interface IncapacityDialogResult {
  days: number | null;
  type: string;
  specialLicense: string;
  recommendations: string;
}

@Component({
  selector: 'app-incapacity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <mat-icon>event_busy</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Incapacidad Médica</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="days">Días de Incapacidad</label>
            <div class="relative">
              <input type="number" formControlName="days" id="days" placeholder="Ej: 3" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
              <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">calendar_today</mat-icon>
            </div>
          </div>
          
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="type">Tipo de Incapacidad</label>
            <select formControlName="type" id="type" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
              <option value="Enfermedad General">Enfermedad General</option>
              <option value="Accidente de Trabajo">Accidente de Trabajo</option>
              <option value="Enfermedad Profesional">Enfermedad Profesional</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="specialLicense">Licencias Especiales</label>
          <select formControlName="specialLicense" id="specialLicense" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
            <option value="Ninguna">Ninguna</option>
            <option value="Maternidad">Licencia de Maternidad</option>
            <option value="Paternidad">Licencia de Paternidad</option>
            <option value="Luto">Licencia por Luto</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="recommendations">Recomendaciones Médicas</label>
          <textarea formControlName="recommendations" id="recommendations" rows="5" placeholder="Instrucciones para el reposo y cuidados del paciente..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
        </div>

        <div class="flex justify-end mt-10 gap-3">
          <button type="button" (click)="close()" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Incapacidad</button>
        </div>
      </form>
    </div>
  `
})
export class IncapacityDialogComponent implements OnInit {
  readonly data = inject<IncapacityDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<IncapacityDialogComponent, IncapacityDialogResult>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    days: [null as number | null, Validators.required],
    type: ['Enfermedad General'],
    specialLicense: ['Ninguna'],
    recommendations: ['']
  });

  ngOnInit() {
    this.form.patchValue(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as IncapacityDialogResult);
    }
  }
}
