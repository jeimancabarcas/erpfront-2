import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../services/pediatrics.service';
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

@Component({
  selector: 'app-consultation-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden min-h-[1100px] flex flex-col print:border-none print:shadow-none print:m-0">
      <!-- Header of the Document -->
      <header class="p-10 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
        <div class="flex gap-4">
          <div class="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
            ERP
          </div>
          <div>
            <h2 class="text-xl font-black text-gray-900 tracking-tight !m-0 uppercase">Resumen de Atención Médica</h2>
            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Historia Clínica Digital</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-black text-gray-900 leading-none mb-1">FOLIO: HC-{{ consultationDate() | date:'yyyyMMdd' }}-{{ patient()?.idNumber?.slice(-3) }}</p>
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{{ consultationDate() | date:'fullDate' }}</p>
        </div>
      </header>

      <!-- Document Content -->
      <main class="p-12 flex-grow space-y-12">
        <!-- Patient Card -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gray-50/80 rounded-[32px] border border-gray-100">
          <div>
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Paciente</label>
            <p class="text-sm font-black text-gray-900">{{ patient()?.firstNames }} {{ patient()?.lastNames }}</p>
          </div>
          <div>
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Identificación</label>
            <p class="text-sm font-black text-gray-900 uppercase">{{ patient()?.idType }} {{ patient()?.idNumber }}</p>
          </div>
          <div>
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Edad / Sexo</label>
            <p class="text-sm font-black text-gray-900">{{ age() }} / {{ patient()?.gender }}</p>
          </div>
        </div>

        <!-- I. Anamnesis -->
        <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">I. ANAMNESIS</h3>
          @if (isAnamnesisComplete()) {
            <div class="space-y-4">
              <div>
                <label class="text-[10px] text-gray-400 font-bold uppercase block mb-1">Motivo de Consulta</label>
                <p class="text-sm text-gray-800 leading-relaxed font-medium bg-gray-50/30 p-4 rounded-2xl border border-gray-50">{{ anamnesis().reason }}</p>
              </div>
              <div>
                <label class="text-[10px] text-gray-400 font-bold uppercase block mb-1">Enfermedad Actual</label>
                <p class="text-sm text-gray-800 leading-relaxed font-medium bg-gray-50/30 p-4 rounded-2xl border border-gray-50">{{ anamnesis().currentIllness }}</p>
              </div>
            </div>
          } @else {
            <div class="py-8 text-center bg-gray-50/30 rounded-[32px] border border-dashed border-gray-200">
              <p class="text-xs text-gray-300 italic font-medium">Información de anamnesis pendiente de registro</p>
            </div>
          }
        </section>

        <!-- II. Examen Físico -->
        <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">II. EXAMEN FÍSICO</h3>
          @if (isPhysicalExamComplete()) {
            <div class="space-y-6">
              <div class="flex gap-4 overflow-x-auto pb-2">
                <div class="px-6 py-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex-1 min-w-[120px] text-center">
                  <label class="text-[9px] text-indigo-400 font-black uppercase block mb-1">Peso</label>
                  <p class="text-lg font-black text-indigo-900">{{ physicalExam().weight }} <span class="text-xs">kg</span></p>
                </div>
                <div class="px-6 py-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex-1 min-w-[120px] text-center">
                  <label class="text-[9px] text-indigo-400 font-black uppercase block mb-1">Talla</label>
                  <p class="text-lg font-black text-indigo-900">{{ physicalExam().height }} <span class="text-xs">cm</span></p>
                </div>
                <div class="px-6 py-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex-1 min-w-[120px] text-center">
                  <label class="text-[9px] text-indigo-400 font-black uppercase block mb-1">Temperatura</label>
                  <p class="text-lg font-black text-indigo-900">{{ physicalExam().temperature }} <span class="text-xs">°C</span></p>
                </div>
              </div>
              <div>
                <label class="text-[10px] text-gray-400 font-bold uppercase block mb-1">Hallazgos Clínicos</label>
                <p class="text-sm text-gray-800 leading-relaxed font-medium bg-gray-50/30 p-4 rounded-2xl border border-gray-50">{{ physicalExam().findings }}</p>
              </div>
            </div>
          } @else {
            <div class="py-8 text-center bg-gray-50/30 rounded-[32px] border border-dashed border-gray-200">
              <p class="text-xs text-gray-300 italic font-medium">Examen físico pendiente</p>
            </div>
          }
        </section>

        <!-- III. Diagnósticos -->
        <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">III. IMPRESIÓN DIAGNÓSTICA</h3>
          @if (isDiagnosticsComplete()) {
            <div class="space-y-4">
              <div class="flex items-start gap-4 bg-indigo-50/20 p-4 rounded-2xl border border-indigo-100/30">
                <span class="px-2 py-1 bg-indigo-600 text-white text-[9px] font-black rounded uppercase mt-0.5">Principal</span>
                <p class="text-sm font-black text-gray-900">{{ diagnostics().principalCode }} - {{ diagnostics().principalDescription }}</p>
              </div>
              @for (diag of secondaryDiagnoses(); track diag.code) {
                <div class="flex items-start gap-4 ml-6 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                  <span class="px-2 py-1 bg-gray-400 text-white text-[9px] font-black rounded uppercase">Secundario</span>
                  <p class="text-sm font-bold text-gray-700">{{ diag.code }} - {{ diag.description }}</p>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-300 italic">Diagnóstico pendiente de confirmación</p>
          }
        </section>

        <!-- IV. Órdenes y Tratamiento -->
        <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">IV. PLAN DE MANEJO</h3>
          @if (isOrdersComplete()) {
            <div class="space-y-6">
              @if (prescriptions().length > 0) {
                <div class="space-y-3">
                  <label class="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Farmacología Prescrita</label>
                  @for (med of prescriptions(); track med.code) {
                    <div class="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div class="flex justify-between">
                        <p class="text-sm font-black text-gray-900">{{ med.code }} - {{ med.name }}</p>
                        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{{ med.route }}</span>
                      </div>
                      <p class="text-xs text-gray-600 mt-1 font-medium">Dosis: {{ med.dose }} | Frecuencia: {{ med.frequency }} | Duración: {{ med.duration }}</p>
                      @if (med.observations) {
                        <p class="text-[10px] text-gray-400 mt-2 font-bold uppercase italic">Nota: {{ med.observations }}</p>
                      }
                    </div>
                  }
                </div>
              }

              @if (procedures().length > 0) {
                <div class="space-y-3">
                  <label class="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Procedimientos y Ayudas</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @for (proc of procedures(); track proc.code) {
                      <div class="p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                        <p class="text-xs font-black text-gray-800">{{ proc.code }} - {{ proc.name }}</p>
                        <p class="text-[10px] text-gray-500 mt-1 font-medium italic">Ind: {{ proc.indications }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-300 italic">No se han emitido órdenes médicas</p>
          }
        </section>

        <!-- V. Incapacidad -->
        @if (isIncapacityComplete()) {
          <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 class="text-xs font-black text-red-600 uppercase tracking-widest border-b border-red-50 pb-2 mb-4">V. INCAPACIDAD MÉDICA</h3>
            <div class="p-6 bg-red-50/20 rounded-3xl border border-red-100/30">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-4">
                <div>
                  <label class="text-[9px] text-red-400 font-black uppercase block mb-1">Días Otorgados</label>
                  <p class="text-lg font-black text-red-900 uppercase">{{ incapacity().days }} Días</p>
                </div>
                <div>
                  <label class="text-[9px] text-red-400 font-black uppercase block mb-1">Tipo de Incapacidad</label>
                  <p class="text-sm font-black text-red-800 uppercase">{{ incapacity().type }}</p>
                </div>
              </div>
              <div>
                <label class="text-[9px] text-red-400 font-black uppercase block mb-1">Recomendaciones Especiales</label>
                <p class="text-sm text-red-800 font-medium leading-relaxed italic bg-white/50 p-4 rounded-xl">"{{ incapacity().recommendations }}"</p>
              </div>
            </div>
          </section>
        }
      </main>

      <!-- Footer for Signature -->
      <footer class="p-12 bg-gray-50/50 border-t border-gray-100 mt-auto">
        <div class="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-10">
          <div class="space-y-1 text-center sm:text-left">
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Firma Profesional</p>
            <p class="text-base font-black text-gray-900 leading-none">Dr. Pedro Pérez</p>
            <p class="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Pediatra Especialista - Reg. 123456</p>
          </div>
          <div class="w-full sm:w-64 border-b-2 border-gray-900 pb-2 text-center">
            <p class="text-[10px] text-gray-300 font-black uppercase tracking-widest">Sello y Firma Electrónica</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ConsultationSummaryOrganism {
  patient = input.required<Patient | undefined>();
  consultationDate = input<Date>(new Date());
  
  anamnesis = input.required<AnamnesisData>();
  physicalExam = input.required<PhysicalExamData>();
  diagnostics = input.required<DiagnosticsData>();
  secondaryDiagnoses = input<DiagnosticItem[]>([]);
  prescriptions = input<PrescriptionData[]>([]);
  procedures = input<ProcedureData[]>([]);
  otherTechnologies = input<OtherTechnologyData[]>([]);
  incapacity = input.required<IncapacityData>();

  // Computed completion flags
  isAnamnesisComplete = computed(() => !!this.anamnesis().reason && !!this.anamnesis().currentIllness);
  isPhysicalExamComplete = computed(() => this.physicalExam().weight !== null && this.physicalExam().height !== null && !!this.physicalExam().findings);
  isDiagnosticsComplete = computed(() => !!this.diagnostics().principalCode && !!this.diagnostics().principalDescription);
  isOrdersComplete = computed(() => this.prescriptions().length > 0 || this.procedures().length > 0 || this.otherTechnologies().length > 0);
  isIncapacityComplete = computed(() => (this.incapacity().days ?? 0) > 0);

  age = computed(() => {
    const birthDate = this.patient()?.birthDate;
    if (!birthDate) return '--';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age === 0 ? 'Menos de 1 año' : `${age} años`;
  });
}
