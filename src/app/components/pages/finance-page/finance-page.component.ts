import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FinanceService } from '../../../services/finance.service';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, MatCardModule, MatIconModule],
  template: `
    <app-dashboard-layout>
      <header class="mb-10 animate-in fade-in slide-in-from-top duration-500">
        <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Finanzas Generales</h1>
        <p class="text-gray-500 font-medium">Resumen financiero de productos y servicios no médicos.</p>
      </header>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        @for (metric of financeService.metrics(); track metric.label) {
          <mat-card class="!rounded-[28px] !border-none !shadow-xl !shadow-gray-100/50 group overflow-hidden relative">
            <!-- Decorative Gradient -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                 [ngClass]="{
                   'from-indigo-600 to-purple-600': metric.color === 'indigo',
                   'from-amber-500 to-orange-500': metric.color === 'amber',
                   'from-emerald-500 to-teal-500': metric.color === 'emerald'
                 }">
            </div>

            <div class="p-8 relative z-10">
              <div class="flex justify-between items-start mb-6">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                     [ngClass]="{
                       'bg-indigo-50 text-indigo-600 shadow-indigo-100': metric.color === 'indigo',
                       'bg-amber-50 text-amber-600 shadow-amber-100': metric.color === 'amber',
                       'bg-emerald-50 text-emerald-600 shadow-emerald-100': metric.color === 'emerald'
                     }">
                  <mat-icon class="!text-[28px] !w-7 !h-7">{{ metric.icon }}</mat-icon>
                </div>
                <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black tracking-wider"
                     [ngClass]="metric.trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                  <mat-icon class="!text-sm !w-3.5 !h-3.5">{{ metric.trend > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
                </div>
              </div>

              <p class="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{{ metric.label }}</p>
              <h3 class="text-3xl font-black text-gray-900 tabular-nums">
                {{ metric.value | currency:'USD':'symbol':'1.0-0' }}
              </h3>
            </div>
          </mat-card>
        }
      </div>

      <!-- Quick Actions / Placeholder for charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <mat-icon>bolt</mat-icon>
            </div>
            <h4 class="text-lg font-black text-gray-900">Accesos Rápidos</h4>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <button class="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 group">
              <mat-icon class="!w-8 !h-8 !text-[32px] text-gray-400 group-hover:text-indigo-600">add_business</mat-icon>
              <span class="text-xs font-black uppercase tracking-widest text-gray-600 group-hover:text-indigo-600">Nueva Factura</span>
            </button>
            <button class="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-100 group">
              <mat-icon class="!w-8 !h-8 !text-[32px] text-gray-400 group-hover:text-amber-600">history_edu</mat-icon>
              <span class="text-xs font-black uppercase tracking-widest text-gray-600 group-hover:text-amber-600">Generar Nota</span>
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div class="relative z-10">
            <h4 class="text-xl font-black mb-2">Facturación Electrónica</h4>
            <p class="text-indigo-200 text-sm font-medium mb-6 leading-relaxed">
              Sistema integrado con la DIAN para el envío automático de comprobantes fiscales, notas crédito y débito.
            </p>
            <div class="flex items-center gap-3 py-3 px-4 bg-white/10 rounded-2xl border border-white/10 w-fit">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-xs font-bold tracking-widest uppercase">Servidor DIAN: Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinancePageComponent {
  financeService = inject(FinanceService);
}
