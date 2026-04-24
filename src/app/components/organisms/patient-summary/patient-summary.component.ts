import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal Info Card -->
          <div class="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <mat-icon class="!w-5 !h-5 !text-lg">badge</mat-icon>
              Información Personal
            </h3>
            <div class="space-y-6">
              <div>
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Fecha de Nacimiento</label>
                <p class="text-gray-900 font-bold text-lg">{{ patient()?.birthDate }}</p>
              </div>
              <div>
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Sexo</label>
                <p class="text-gray-900 font-bold text-lg">
                  {{ patient()?.gender === 'M' ? 'Masculino' : patient()?.gender === 'F' ? 'Femenino' : 'Otro' }}
                </p>
              </div>
              <div>
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">EPS / Régimen</label>
                <p class="text-gray-900 font-bold text-lg">{{ patient()?.eps }} ({{ patient()?.healthRegime }})</p>
              </div>
            </div>
          </div>

          <!-- Location Card -->
          <div class="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <mat-icon class="!w-5 !h-5 !text-lg">location_on</mat-icon>
              Ubicación
            </h3>
            <div class="space-y-6">
              <div>
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Dirección</label>
                <p class="text-gray-900 font-bold text-lg">{{ patient()?.address }}</p>
              </div>
              <div>
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Ciudad / País</label>
                <p class="text-gray-900 font-bold text-lg">{{ patient()?.city }}, {{ patient()?.country }}</p>
              </div>
              <div>
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Zona</label>
                <p class="text-gray-900 font-bold text-lg">{{ patient()?.zone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Family Card -->
        <div class="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <h3 class="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-2">
            <mat-icon class="!w-5 !h-5 !text-lg">groups</mat-icon>
            Núcleo Familiar
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">P</div>
                <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Padre</span>
              </div>
              <p class="text-xl font-black text-gray-900">{{ patient()?.fatherName || 'No registrado' }}</p>
            </div>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center font-black text-xs">M</div>
                <span class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Madre</span>
              </div>
              <p class="text-xl font-black text-gray-900">{{ patient()?.motherName || 'No registrado' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Sidebar -->
      <div class="space-y-8">
        <div class="bg-indigo-900 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
          <h3 class="text-xs font-black text-indigo-300 uppercase tracking-widest mb-8">Estadísticas Rápidas</h3>
          <div class="space-y-8">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-[10px] text-indigo-300 font-black uppercase tracking-widest block mb-1">Peso Nacer</label>
                <p class="text-3xl font-black">{{ patient()?.birthWeight || '--' }} <small class="text-sm font-medium">g</small></p>
              </div>
              <mat-icon class="!w-10 !h-10 !text-[40px] opacity-20">monitor_weight</mat-icon>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-[10px] text-indigo-300 font-black uppercase tracking-widest block mb-1">Talla Nacer</label>
                <p class="text-3xl font-black">{{ patient()?.birthHeight || '--' }} <small class="text-sm font-medium">cm</small></p>
              </div>
              <mat-icon class="!w-10 !h-10 !text-[40px] opacity-20">straighten</mat-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PatientSummaryOrganism {
  patient = input<Patient | undefined>();
}
