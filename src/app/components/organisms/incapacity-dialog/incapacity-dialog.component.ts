import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

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
    MatButtonModule,
    TextInputComponent,
    ButtonAtom,
    SelectAtom,
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
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">event_busy</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Incapacidad Médica</h2>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo" class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ui-text-input
            label="Días de Incapacidad"
            type="number"
            icon="calendar_today"
            placeholder="Ej: 3"
            [formControl]="form.controls.days"
          />
          
          <ui-select label="Tipo de Incapacidad" [options]="typeOptions" [formControl]="form.controls.type" />
        </div>

        <ui-select label="Licencias Especiales" [options]="specialLicenseOptions" [formControl]="form.controls.specialLicense" />

        <ui-textarea formControlName="recommendations" label="Recomendaciones Médicas" placeholder="Instrucciones para el reposo y cuidados del paciente..." rows="5" />

        <div class="flex justify-end mt-10 gap-3">
          <button type="button" (click)="close()" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Incapacidad</button>
        </div>
      </form>
    </div>
    }
  `
})
export class IncapacityDialogComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<IncapacityDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<IncapacityDialogComponent, IncapacityDialogResult>);
  private fb = inject(FormBuilder);

  typeOptions: SelectOption[] = [
    { value: 'Enfermedad General', label: 'Enfermedad General' },
    { value: 'Accidente de Trabajo', label: 'Accidente de Trabajo' },
    { value: 'Enfermedad Profesional', label: 'Enfermedad Profesional' },
  ];

  specialLicenseOptions: SelectOption[] = [
    { value: 'Ninguna', label: 'Ninguna' },
    { value: 'Maternidad', label: 'Licencia de Maternidad' },
    { value: 'Paternidad', label: 'Licencia de Paternidad' },
    { value: 'Luto', label: 'Licencia por Luto' },
  ];

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
