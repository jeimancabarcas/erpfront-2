import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface PhysicalExamDialogData {
  weight: number | null;
  height: number | null;
  temperature: number | null;
  findings: string;
}

export interface PhysicalExamDialogResult {
  weight: number | null;
  height: number | null;
  temperature: number | null;
  findings: string;
}

@Component({
  selector: 'app-physical-exam-dialog',
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
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <mat-icon>monitor_heart</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Examen Físico</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="weight">Peso (kg)</label>
            <div class="relative">
              <input type="number" step="0.1" formControlName="weight" id="weight" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
              <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">monitor_weight</mat-icon>
            </div>
          </div>
          
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="height">Talla (cm)</label>
            <div class="relative">
              <input type="number" formControlName="height" id="height" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
              <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">straighten</mat-icon>
            </div>
          </div>
          
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="temperature">Temp (°C)</label>
            <div class="relative">
              <input type="number" step="0.1" formControlName="temperature" id="temperature" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
              <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">thermostat</mat-icon>
            </div>
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="findings">Hallazgos Clínicos Detallados</label>
          <textarea formControlName="findings" id="findings" rows="6" placeholder="Descripción detallada de los hallazgos por sistemas..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
        </div>

        <div class="flex justify-end mt-10 gap-3">
          <button type="button" (click)="close()" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Examen</button>
        </div>
      </form>
    </div>
  `
})
export class PhysicalExamDialogComponent implements OnInit {
  readonly data = inject<PhysicalExamDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PhysicalExamDialogComponent, PhysicalExamDialogResult>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    weight: [null as number | null, Validators.required],
    height: [null as number | null, Validators.required],
    temperature: [null as number | null],
    findings: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as PhysicalExamDialogResult);
    }
  }
}
