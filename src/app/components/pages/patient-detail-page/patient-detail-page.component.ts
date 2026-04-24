import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
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
    DashboardLayoutComponent, 
    MatIconModule, 
    MatButtonModule, 
    MatDividerModule,
    MatTabsModule,
    BreadcrumbMolecule,
    PatientSummaryOrganism,
    PatientNeonatalHistoryOrganism,
    PatientClinicalHistoryOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="mb-10">
        <app-breadcrumb 
          [items]="breadcrumbItems" 
          [currentLabel]="(patient()?.firstNames || '') + ' ' + (patient()?.lastNames || '')" 
        />

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <mat-icon class="!w-10 !h-10 !text-[40px]">person</mat-icon>
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
        </div>
      </header>

      <!-- Material Tabs for Sections -->
      <mat-tab-group class="custom-tab-group" dynamicHeight>
        <!-- Resumen Section -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">analytics</mat-icon>
            Resumen
          </ng-template>
          <app-patient-summary [patient]="patient()" />
        </mat-tab>

        <!-- Antecedentes Neonatales Section -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">baby_changing_station</mat-icon>
            Antecedentes Neonatales
          </ng-template>
          <app-patient-neonatal-history [patient]="patient()" />
        </mat-tab>

        <!-- Historial Clínico Section -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">history_edu</mat-icon>
            Historial Clínico
          </ng-template>
          <app-patient-clinical-history [patient]="patient()" />
        </mat-tab>
      </mat-tab-group>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .custom-tab-group .mat-mdc-tab-body-wrapper {
      padding-top: 0;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab-header {
      border-bottom: none;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab-labels {
      gap: 8px;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab {
      height: 56px;
      border-radius: 28px;
      overflow: hidden;
      transition: all 0.3s ease;
      padding: 0 24px;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab.mdc-tab--active {
      background-color: #4f46e5;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: white !important;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab-label-container {
      padding: 4px;
      background: white;
      border-radius: 32px;
      width: fit-content;
      border: 1px solid #f3f4f6;
    }
    ::ng-deep .custom-tab-group .mat-mdc-tab .mdc-tab-indicator__content--underline {
      display: none;
    }
  `]
})
export class PatientDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pediatricsService = inject(PediatricsService);
  
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
}
