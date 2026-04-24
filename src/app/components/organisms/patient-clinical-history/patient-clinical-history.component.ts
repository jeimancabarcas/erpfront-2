import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { PediatricsService, Patient, Consultation } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-clinical-history',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatChipsModule],
  template: `
    <div class="pt-8">
      <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm animate-in fade-in duration-500">
        <!-- Header with Action -->
        <header class="mb-10">
          <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Historial Clínico</h2>
          <p class="text-gray-500 font-medium text-sm mt-1">Registro cronológico de consultas y diagnósticos realizados.</p>
        </header>

        @if (patientConsultations().length > 0) {
          <div class="overflow-hidden rounded-[24px] border border-gray-50">
            <table mat-table [dataSource]="patientConsultations()" class="w-full">
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef class="!font-black !text-[10px] !text-gray-400 !uppercase !tracking-widest !py-6">Fecha</th>
                <td mat-cell *matCellDef="let c" class="!py-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <mat-icon class="!text-sm">event</mat-icon>
                    </div>
                    <span class="font-bold text-gray-900">{{ c.date }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Reason Column -->
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef class="!font-black !text-[10px] !text-gray-400 !uppercase !tracking-widest">Motivo de Consulta</th>
                <td mat-cell *matCellDef="let c" class="text-gray-700 font-medium">{{ c.reason }}</td>
              </ng-container>

              <!-- Diagnosis Column -->
              <ng-container matColumnDef="diagnosis">
                <th mat-header-cell *matHeaderCellDef class="!font-black !text-[10px] !text-gray-400 !uppercase !tracking-widest">Diagnóstico</th>
                <td mat-cell *matCellDef="let c">
                  <span class="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-100">
                    {{ c.diagnosis }}
                  </span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="!font-black !text-[10px] !text-gray-400 !uppercase !tracking-widest text-right px-6">Estado</th>
                <td mat-cell *matCellDef="let c" class="text-right px-6">
                  <span class="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    {{ c.status }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-gray-50/50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors cursor-pointer"></tr>
            </table>
          </div>
        } @else {
          <div class="p-20 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <mat-icon class="!text-gray-300">history_edu</mat-icon>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Sin historial de consultas</h3>
            <p class="text-gray-500 font-medium max-w-xs mx-auto text-sm">Aún no se han registrado consultas médicas para este paciente.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mat-mdc-header-cell { border-bottom: none; }
    .mat-mdc-cell { border-bottom: 1px solid #f9fafb; }
  `]
})
export class PatientClinicalHistoryOrganism {
  patient = input<Patient | undefined>();
  private pediatricsService = inject(PediatricsService);

  displayedColumns: string[] = ['date', 'reason', 'diagnosis', 'status'];

  patientConsultations = computed(() => {
    const currentPatient = this.patient();
    if (!currentPatient) return [];
    return this.pediatricsService.consultations()
      .filter(c => c.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
}
