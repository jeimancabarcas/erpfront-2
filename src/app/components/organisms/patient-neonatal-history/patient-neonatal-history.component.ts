import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-neonatal-history',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="pt-8">
      <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
        <header class="mb-10 border-b border-gray-50 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Antecedentes Neonatales</h2>
            <p class="text-gray-500 font-medium text-sm mt-1">Información detallada del nacimiento y periodo perinatal.</p>
          </div>
          <button mat-flat-button color="primary" class="!rounded-full !h-12 !px-8 !font-black">
            <mat-icon class="mr-2">save</mat-icon>
            Guardar Cambios
          </button>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <!-- Left Column: Measurements -->
          <div class="lg:col-span-4 space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Peso al Nacer (kg)</mat-label>
              <input matInput type="number" [value]="(patient()?.birthWeight || 0) / 1000" step="0.01">
              <mat-icon matPrefix class="mr-2 text-indigo-400">monitor_weight</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Talla al Nacer (cm)</mat-label>
              <input matInput type="number" [value]="patient()?.birthHeight">
              <mat-icon matPrefix class="mr-2 text-indigo-400">straighten</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>C. Cefálica (cm)</mat-label>
              <input matInput type="number" [value]="patient()?.cephalicPerimeter || 0">
              <mat-icon matPrefix class="mr-2 text-indigo-400">face</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>C. del Tórax (cm)</mat-label>
              <input matInput type="number" [value]="patient()?.thoracicPerimeter || 0">
              <mat-icon matPrefix class="mr-2 text-indigo-400">accessibility_new</mat-icon>
            </mat-form-field>
          </div>

          <!-- Right Column: Text Backgrounds -->
          <div class="lg:col-span-8 space-y-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Detalles Adicionales de ant. Neonatales</mat-label>
              <textarea matInput rows="4" placeholder="Escriba los detalles aquí..." [value]="patient()?.neonatalNotes"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Antecedentes Personales</mat-label>
              <textarea matInput rows="3" placeholder="Escribe aquí los detalles..." [value]="patient()?.personalBackground"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Antecedentes Familiares</mat-label>
              <textarea matInput rows="3" placeholder="Escriba aquí los antecedentes familiares..." [value]="patient()?.familyBackground"></textarea>
            </mat-form-field>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PatientNeonatalHistoryOrganism {
  patient = input<Patient | undefined>();
}
