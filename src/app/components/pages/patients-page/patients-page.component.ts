import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { PediatricsService } from '../../../services/pediatrics.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent, 
    ButtonAtom,
    RouterLink
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Pacientes</h1>
          <p class="text-gray-500 font-medium">Registro y gestión de pacientes pediátricos.</p>
        </div>
        <ui-button 
          variant="primary" 
          (clicked)="openRegistrationWizard()"
          class="rounded-full h-12 px-6 font-bold"
        >
          <span class="material-icons mr-2">person_add</span>
          Nuevo Paciente
        </ui-button>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">ID</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Nombre</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">F. Nacimiento</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Identificación</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (p of pediatricsService.patients(); track p.id) {
              <tr class="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50">
                <td class="px-6 py-5 text-sm font-mono text-gray-400">{{p.id}}</td>
                <td class="px-6 py-5 text-sm font-bold text-gray-900">{{p.firstNames}} {{p.lastNames}}</td>
                <td class="px-6 py-5 text-sm text-gray-500">{{p.birthDate}}</td>
                <td class="px-6 py-5 text-sm text-gray-700">{{p.idType}} {{p.idNumber}}</td>
                <td class="px-6 py-5 text-right">
                  <a [routerLink]="['/pediatrics/patients', p.id]">
                    <ui-button variant="icon" class="text-indigo-600 bg-indigo-50 rounded-xl mr-2">
                      <span class="material-icons">visibility</span>
                    </ui-button>
                  </a>
                  <ui-button variant="icon" (clicked)="openRegistrationWizard(p)" class="text-gray-400">
                    <span class="material-icons">edit</span>
                  </ui-button>
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
export class PatientsPageComponent {
  pediatricsService = inject(PediatricsService);

  openRegistrationWizard(patient?: any) {
    // Dialog functionality will be restored when dialog organism is migrated
  }
}
