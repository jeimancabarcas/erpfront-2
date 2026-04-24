import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-clinical-history',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="pt-8">
      <div class="bg-white rounded-[40px] p-20 border border-gray-100 shadow-sm text-center">
        <div class="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-gray-300">
          <mat-icon class="!w-12 !h-12 !text-[48px]">history_edu</mat-icon>
        </div>
        <h2 class="text-3xl font-black text-gray-900 mb-4 tracking-tight">Historial Clínico</h2>
        <p class="text-gray-500 max-w-md mx-auto text-lg font-medium">
          Próximamente podrás visualizar y registrar todas las consultas y diagnósticos.
        </p>
      </div>
    </div>
  `
})
export class PatientClinicalHistoryOrganism {
  patient = input<Patient | undefined>();
}
