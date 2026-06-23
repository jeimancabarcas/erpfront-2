import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

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
    MatButtonModule,
    TextInputComponent,
    ButtonAtom,
    TextareaComponent
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
    <div class="p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">monitor_heart</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Examen Físico</h2>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo" class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ui-text-input
            label="Peso (kg)"
            type="number"
            icon="monitor_weight"
            [formControl]="form.controls.weight"
          />
          
          <ui-text-input
            label="Talla (cm)"
            type="number"
            icon="straighten"
            [formControl]="form.controls.height"
          />
          
          <ui-text-input
            label="Temp (°C)"
            type="number"
            icon="thermostat"
            [formControl]="form.controls.temperature"
          />
        </div>

        <ui-textarea formControlName="findings" label="Hallazgos Clínicos Detallados" placeholder="Descripción detallada de los hallazgos por sistemas..." rows="6" />

        <div class="flex justify-end mt-10 gap-3">
          <button type="button" (click)="close()" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Examen</button>
        </div>
      </form>
    </div>
    }
  `
})
export class PhysicalExamDialogComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
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
