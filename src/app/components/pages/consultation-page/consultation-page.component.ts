import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';
import { BreadcrumbMolecule, BreadcrumbItem } from '../../molecules/breadcrumb/breadcrumb.component';
import { 
  AnamnesisData, 
  PhysicalExamData, 
  DiagnosticsData, 
  DiagnosticItem, 
  PrescriptionData, 
  ProcedureData, 
  OtherTechnologyData, 
  IncapacityData 
} from '../../../models/consultation.model';

// Import Modular Dialogs
import { AnamnesisDialogComponent } from '../../organisms/anamnesis-dialog/anamnesis-dialog.component';
import { PhysicalExamDialogComponent } from '../../organisms/physical-exam-dialog/physical-exam-dialog.component';
import { DiagnosticsDialogComponent } from '../../organisms/diagnostics-dialog/diagnostics-dialog.component';
import { OrdersDialogComponent } from '../../organisms/orders-dialog/orders-dialog.component';
import { IncapacityDialogComponent } from '../../organisms/incapacity-dialog/incapacity-dialog.component';

import { ConsultationActionMolecule } from '../../molecules/consultation-action/consultation-action.component';
import { ConsultationSummaryOrganism } from '../../organisms/consultation-summary/consultation-summary.component';

@Component({
  selector: 'app-consultation-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatSelectModule,
    MatTooltipModule,
    BreadcrumbMolecule,
    ConsultationActionMolecule,
    ConsultationSummaryOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="mb-10 print:hidden">
        <app-breadcrumb 
          [items]="breadcrumbItems" 
          currentLabel="Atención Médica" 
        />

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100">
              <mat-icon class="!w-8 !h-8 !text-[32px]">clinical_notes</mat-icon>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Consulta Externa</h1>
              <p class="text-gray-500 font-medium">Atención pediátrica integral</p>
            </div>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button mat-stroked-button class="flex-1 sm:flex-initial !rounded-full !h-12 !px-8" (click)="cancel()">
              Cancelar
            </button>
            <button mat-flat-button color="primary" class="flex-1 sm:flex-initial !rounded-full !h-12 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100" (click)="save()">
              Finalizar y Guardar
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Sidebar: Action Panel -->
        <div class="lg:col-span-4 space-y-6 print:hidden">
          <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm sticky top-10">
            <h3 class="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Secciones de Consulta</h3>
            
            <!-- Load Last Consultation Meta-Action -->
            <button 
              mat-stroked-button 
              class="w-full !rounded-2xl !h-12 !mb-6 !border-indigo-100 !text-indigo-600 !bg-indigo-50/30 hover:!bg-indigo-50 transition-all font-black"
              (click)="loadLastConsultation()"
            >
              <mat-icon class="mr-2">history</mat-icon>
              Cargar última consulta
            </button>

            <div class="grid grid-cols-1 gap-4">
              <app-consultation-action 
                icon="psychology" 
                label="Anamnesis" 
                [statusLabel]="isAnamnesisComplete() ? 'Completado' : 'Pendiente'" 
                [isComplete]="isAnamnesisComplete()"
                (action)="openAnamnesis()" />

              <app-consultation-action 
                icon="monitor_heart" 
                label="Examen Físico" 
                [statusLabel]="isPhysicalExamComplete() ? 'Completado' : 'Pendiente'" 
                [isComplete]="isPhysicalExamComplete()"
                (action)="openPhysicalExam()" />

              <app-consultation-action 
                icon="fact_check" 
                label="Diagnósticos" 
                [statusLabel]="isDiagnosticsComplete() ? 'Completado' : 'Pendiente'" 
                [isComplete]="isDiagnosticsComplete()"
                (action)="openDiagnostics()" />

              <app-consultation-action 
                icon="assignment" 
                label="Órdenes Médicas" 
                [statusLabel]="isOrdersComplete() ? 'Generadas' : 'Sin órdenes'" 
                [isComplete]="isOrdersComplete()"
                (action)="openOrders()" />

              <app-consultation-action 
                icon="event_busy" 
                label="Incapacidad" 
                [statusLabel]="isIncapacityComplete() ? 'Generada' : 'No requerida'" 
                [isComplete]="isIncapacityComplete()"
                (action)="openIncapacity()" />
            </div>

            <!-- Print Button -->
            <button mat-flat-button class="w-full !rounded-2xl !h-14 !mt-10 !bg-gray-900 !text-white !font-black shadow-2xl shadow-gray-200" (click)="printSummary()">
              <mat-icon class="mr-2">print</mat-icon>
              Imprimir Resumen Médico
            </button>
          </div>
        </div>

        <!-- Main Panel: Medical Summary Preview -->
        <div class="lg:col-span-8">
          <app-consultation-summary
            [patient]="patient()"
            [consultationDate]="consultationDate"
            [anamnesis]="anamnesis()"
            [physicalExam]="physicalExam()"
            [diagnostics]="diagnostics()"
            [secondaryDiagnoses]="secondaryDiagnoses()"
            [prescriptions]="prescriptions()"
            [procedures]="procedures()"
            [otherTechnologies]="otherTechnologies()"
            [incapacity]="incapacity()"
          />
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    @media print {
      .print\\:hidden { display: none !important; }
      .lg\\:col-span-12 { width: 100% !important; margin: 0 !important; padding: 0 !important; }
      .lg\\:col-span-8 { width: 100% !important; margin: 0 !important; padding: 0 !important; }
      .bg-white { box-shadow: none !important; border: none !important; }
      body { background: white !important; }
      app-dashboard-layout { padding: 0 !important; margin: 0 !important; }
    }
  `]
})
export class ConsultationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pediatricsService = inject(PediatricsService);
  private dialog = inject(MatDialog);

  patient = signal<Patient | undefined>(undefined);
  consultationDate = new Date();

  // Data State using Signals for better reactivity and logic separation
  anamnesis = signal<AnamnesisData>({ reason: '', currentIllness: '' });
  physicalExam = signal<PhysicalExamData>({ weight: null, height: null, temperature: null, findings: '' });
  diagnostics = signal<DiagnosticsData>({ principalCode: '', principalDescription: '' });
  secondaryDiagnoses = signal<DiagnosticItem[]>([]);
  prescriptions = signal<PrescriptionData[]>([]);
  procedures = signal<ProcedureData[]>([]);
  otherTechnologies = signal<OtherTechnologyData[]>([]);
  incapacity = signal<IncapacityData>({ days: null, type: 'Enfermedad General', specialLicense: 'Ninguna', recommendations: '' });

  // Status Indicators computed from signals
  isAnamnesisComplete = computed(() => !!this.anamnesis().reason && !!this.anamnesis().currentIllness);
  isPhysicalExamComplete = computed(() => this.physicalExam().weight !== null && this.physicalExam().height !== null && !!this.physicalExam().findings);
  isDiagnosticsComplete = computed(() => !!this.diagnostics().principalCode && !!this.diagnostics().principalDescription);
  isOrdersComplete = computed(() => this.prescriptions().length > 0 || this.procedures().length > 0 || this.otherTechnologies().length > 0);
  isIncapacityComplete = computed(() => (this.incapacity().days ?? 0) > 0);

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
        this.breadcrumbItems.push({ label: `${found.firstNames} ${found.lastNames}`, link: `/pediatrics/patients/${found.id}` });
      }
    }
  }

  // Action Panel Methods
  openAnamnesis() {
    const dialogRef = this.dialog.open(AnamnesisDialogComponent, { data: { ...this.anamnesis() }, width: '600px', panelClass: 'premium-modal' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.anamnesis.set(result);
    });
  }

  openPhysicalExam() {
    const dialogRef = this.dialog.open(PhysicalExamDialogComponent, { data: { ...this.physicalExam() }, width: '700px', panelClass: 'premium-modal' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.physicalExam.set(result);
    });
  }

  openDiagnostics() {
    const dialogRef = this.dialog.open(DiagnosticsDialogComponent, { 
      data: { main: { ...this.diagnostics() }, secondary: this.secondaryDiagnoses }, 
      width: '850px', 
      panelClass: 'premium-modal' 
    });
    // Note: DiagnosticsDialogComponent likely handles the signal update directly since we pass the signal 'secondary'
    // but for 'main' we might need to handle the result
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.main) this.diagnostics.set(result.main);
    });
  }

  openOrders() {
    this.dialog.open(OrdersDialogComponent, { 
      data: { prescriptions: this.prescriptions, procedures: this.procedures, techs: this.otherTechnologies }, 
      width: '950px', 
      panelClass: 'premium-modal' 
    });
  }

  openIncapacity() {
    const dialogRef = this.dialog.open(IncapacityDialogComponent, { data: { ...this.incapacity() }, width: '600px', panelClass: 'premium-modal' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.incapacity.set(result);
    });
  }

  loadLastConsultation() {
    const pId = this.patient()?.id;
    if (!pId) return;

    // Find the most recent consultation for this patient
    const last = this.pediatricsService.consultations()
      .filter(c => c.patientId === pId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (last) {
      this.anamnesis.set({ ...last.anamnesis });
      this.physicalExam.set({ ...last.physicalExam });
      this.diagnostics.set({ ...last.diagnostics });
      this.secondaryDiagnoses.set([...last.secondaryDiagnoses]);
      this.prescriptions.set([...last.prescriptions]);
      this.procedures.set([...last.procedures]);
      this.otherTechnologies.set([...last.otherTechnologies]);
      this.incapacity.set({ ...last.incapacity });
    }
  }

  printSummary() { window.print(); }

  cancel() {
    const id = this.patient()?.id;
    this.router.navigate(id ? ['/pediatrics/patients', id] : ['/pediatrics/patients']);
  }

  save() {
    // Logic to persist in PediatricsService will go here
    this.cancel();
  }
}
