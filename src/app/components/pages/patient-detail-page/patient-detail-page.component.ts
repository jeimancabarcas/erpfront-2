import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonAtom } from '../../atoms/button/button.component';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';
import { BreadcrumbMolecule, BreadcrumbItem } from '../../molecules/breadcrumb/breadcrumb.component';
import { PatientSummaryOrganism } from '../../organisms/patient-summary/patient-summary.component';
import { PatientNeonatalHistoryOrganism } from '../../organisms/patient-neonatal-history/patient-neonatal-history.component';
import { PatientClinicalHistoryOrganism } from '../../organisms/patient-clinical-history/patient-clinical-history.component';

@Component({
  selector: 'app-patient-detail-page',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonAtom,
    BreadcrumbMolecule,
    PatientSummaryOrganism,
    PatientNeonatalHistoryOrganism,
    PatientClinicalHistoryOrganism
  ],
  template: `
      <header class="mb-10">
        <app-breadcrumb 
          [items]="breadcrumbItems" 
          [currentLabel]="(patient()?.firstNames || '') + ' ' + (patient()?.lastNames || '')" 
        />

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <span class="material-icons w-10 h-10 text-[40px]">person</span>
            </div>
            <div>
              <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-1">
                {{ patient()?.firstNames }} {{ patient()?.lastNames }}
              </h1>
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  ID: {{ patient()?.id }}
                </span>
                <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ patient()?.idType }}: {{ patient()?.idNumber }}
                </span>
              </div>
            </div>
          </div>

          <ui-button 
            variant="primary"
            (clicked)="goToNewConsultation()"
          >
            <span class="material-icons mr-2 w-6 h-6 text-[24px]">add_circle</span>
            Nueva Consulta
          </ui-button>
        </div>
      </header>

      <!-- Custom Tab Navigation -->
      <div class="flex gap-2 p-1 bg-white border border-gray-100 rounded-[32px] w-fit mb-8">
        <ui-button
          [variant]="activeTab() === 0 ? 'primary' : 'ghost'"
          (clicked)="activeTab.set(0)"
        >
          <span class="material-icons mr-2">analytics</span>
          Resumen
        </ui-button>
        <ui-button
          [variant]="activeTab() === 1 ? 'primary' : 'ghost'"
          (clicked)="activeTab.set(1)"
        >
          <span class="material-icons mr-2">baby_changing_station</span>
          Antecedentes Neonatales
        </ui-button>
        <ui-button
          [variant]="activeTab() === 2 ? 'primary' : 'ghost'"
          (clicked)="activeTab.set(2)"
        >
          <span class="material-icons mr-2">history_edu</span>
          Historial Clínico
        </ui-button>
      </div>

      <!-- Tab Content -->
      @switch (activeTab()) {
        @case (0) {
          <app-patient-summary [patient]="patient()" />
        }
        @case (1) {
          <app-patient-neonatal-history [patient]="patient()" />
        }
        @case (2) {
          <app-patient-clinical-history [patient]="patient()" />
        }
      }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PatientDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pediatricsService = inject(PediatricsService);
  
  activeTab = signal(0);
  patient = signal<Patient | undefined>(undefined);

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Pediatría' },
    { label: 'Pacientes', link: '/pediatrics/patients' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.pediatricsService.patients().find(p => p.id === id);
      this.patient.set(found);
    }
  }

  goToNewConsultation(): void {
    const id = this.patient()?.id;
    if (id) {
      this.router.navigate(['/pediatrics/patients', id, 'consultation', 'new']);
    }
  }
}
