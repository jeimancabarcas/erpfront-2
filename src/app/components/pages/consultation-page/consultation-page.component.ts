import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';
import { BreadcrumbMolecule, BreadcrumbItem } from '../../molecules/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-consultation-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSelectModule,
    BreadcrumbMolecule
  ],
  template: `
    <app-dashboard-layout>
      <header class="mb-10">
        <app-breadcrumb 
          [items]="breadcrumbItems" 
          currentLabel="Nueva Consulta" 
        />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center">
              <mat-icon class="!w-8 !h-8 !text-[32px]">clinical_notes</mat-icon>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Atención Médica</h1>
              <p class="text-gray-500 font-medium">Paciente: {{ patient()?.firstNames }} {{ patient()?.lastNames }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button mat-stroked-button class="!rounded-full !h-12 !px-8" (click)="cancel()">
              Cancelar
            </button>
            <button mat-flat-button color="primary" class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600" (click)="save()">
              Finalizar Consulta
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Main Form Column -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Motivo de Consulta -->
          <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
            <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-2">
              <mat-icon class="!w-5 !h-5 !text-lg">psychology</mat-icon>
              Anamnesis
            </h3>
            
            <div class="space-y-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Motivo de la Consulta</mat-label>
                <textarea matInput rows="3" placeholder="Ej: El paciente presenta fiebre desde hace 2 días..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Enfermedad Actual</mat-label>
                <textarea matInput rows="4" placeholder="Descripción detallada de la evolución de los síntomas..."></textarea>
              </mat-form-field>
            </div>
          </div>

          <!-- Examen Físico -->
          <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
            <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-2">
              <mat-icon class="!w-5 !h-5 !text-lg">monitor_heart</mat-icon>
              Examen Físico
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Peso (kg)</mat-label>
                <input matInput type="number" step="0.1">
                <mat-icon matSuffix class="text-gray-300">monitor_weight</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Talla (cm)</mat-label>
                <input matInput type="number">
                <mat-icon matSuffix class="text-gray-300">straighten</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Temperatura (°C)</mat-label>
                <input matInput type="number" step="0.1">
                <mat-icon matSuffix class="text-gray-300">thermostat</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Hallazgos del Examen Físico</mat-label>
              <textarea matInput rows="6" placeholder="Descripción de los hallazgos por sistemas..."></textarea>
            </mat-form-field>
          </div>

          <!-- Diagnóstico y Plan -->
          <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
            <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-2">
              <mat-icon class="!w-5 !h-5 !text-lg">assignment</mat-icon>
              Conducta Médica
            </h3>
            
            <div class="space-y-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Impresión Diagnóstica (CIE-10)</mat-label>
                <input matInput placeholder="Busque o digite el diagnóstico...">
                <mat-icon matSuffix class="text-gray-300">search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Plan de Manejo / Tratamiento</mat-label>
                <textarea matInput rows="6" placeholder="Medicamentos, dosis, recomendaciones y paraclínicos solicitados..."></textarea>
              </mat-form-field>
            </div>
          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Patient Summary Stick Card -->
          <div class="bg-gray-900 rounded-[40px] p-8 text-white sticky top-10 shadow-2xl shadow-gray-200">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Resumen del Paciente</h3>
            
            <div class="space-y-8">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-400">
                  <mat-icon>person</mat-icon>
                </div>
                <div>
                  <p class="text-sm text-gray-400 font-bold mb-0 leading-none">Edad</p>
                  <p class="text-xl font-black">{{ calculateAge(patient()?.birthDate) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-pink-400">
                  <mat-icon>medical_information</mat-icon>
                </div>
                <div>
                  <p class="text-sm text-gray-400 font-bold mb-0 leading-none">Último Peso</p>
                  <p class="text-xl font-black">12.5 <small class="text-xs font-medium text-gray-500 uppercase">kg</small></p>
                </div>
              </div>

              <mat-divider class="!border-gray-800"></mat-divider>

              <div>
                <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Antecedentes Relevantes</p>
                <div class="space-y-4">
                  <div class="p-4 bg-gray-800/50 rounded-2xl border border-gray-800">
                    <p class="text-xs text-gray-300 font-medium italic">"{{ patient()?.personalBackground || 'Sin antecedentes personales registrados' }}"</p>
                  </div>
                  <div class="p-4 bg-gray-800/50 rounded-2xl border border-gray-800">
                    <p class="text-xs text-gray-300 font-medium italic">"{{ patient()?.neonatalNotes || 'Sin notas neonatales' }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    mat-form-field { margin-bottom: 0; }
  `]
})
export class ConsultationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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
      
      if (found) {
        this.breadcrumbItems.push({ 
          label: `${found.firstNames} ${found.lastNames}`, 
          link: `/pediatrics/patients/${found.id}` 
        });
      }
    }
  }

  calculateAge(birthDate?: string): string {
    if (!birthDate) return '--';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age === 0 ? 'Menos de 1 año' : `${age} años`;
  }

  cancel(): void {
    const id = this.patient()?.id;
    if (id) {
      this.router.navigate(['/pediatrics/patients', id]);
    } else {
      this.router.navigate(['/pediatrics/patients']);
    }
  }

  save(): void {
    // Logic to save the consultation will go here
    this.cancel();
  }
}
