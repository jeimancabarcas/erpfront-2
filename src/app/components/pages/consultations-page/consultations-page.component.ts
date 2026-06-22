import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { PediatricsService } from '../../../services/pediatrics.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';

@Component({
  selector: 'app-consultations-page',
  standalone: true,
  imports: [DashboardLayoutComponent, ButtonAtom, StatusTagAtom],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Consultas Médicas</h1>
          <p class="text-gray-500 font-medium">Gestión de atención y triaje pediátrico.</p>
        </div>
        <ui-button variant="primary" class="rounded-full h-12 px-6 font-bold">
          <span class="material-icons mr-2">medical_services</span>
          Nueva Consulta
        </ui-button>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Fecha</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Paciente</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Estado</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (c of pediatricsService.consultations(); track c.id) {
              <tr class="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50">
                <td class="px-6 py-5 text-sm text-gray-500">{{c.date}}</td>
                <td class="px-6 py-5 text-sm font-bold text-gray-900">{{c.patientName}}</td>
                <td class="px-6 py-5">
                  <app-status-tag [label]="c.status" [color]="c.status === 'Completed' ? 'green' : 'amber'" />
                </td>
                <td class="px-6 py-5 text-right">
                  <ui-button variant="primary" class="rounded-xl text-xs font-bold">Atender</ui-button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ConsultationsPageComponent {
  pediatricsService = inject(PediatricsService);
}
