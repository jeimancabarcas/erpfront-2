import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../../services/transport.service';
import { TransportRoute } from '../../../../models/transport.model';

@Component({
  selector: 'app-transport-settlement-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Summary Table -->
      <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ruta / Cliente</th>
              <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarifa Servicio</th>
              <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Standby (H)</th>
              <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gasto Operativo</th>
              <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Utilidad Bruta</th>
              <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (route of transportService.routes(); track route.id) {
              @if (route.status === 'Active' || route.status === 'Completed') {
                <tr class="hover:bg-gray-50/30 transition-colors group">
                  <td class="p-8">
                    <div class="flex flex-col">
                      <span class="text-sm font-black text-gray-900">{{ route.origin }} → {{ route.destination }}</span>
                      <span class="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{{ route.customerName }} • {{ route.vehicleId }}</span>
                    </div>
                  </td>
                  <td class="p-8">
                    <span class="text-sm font-black text-green-600 tabular-nums">{{ route.servicePrice | currency:'USD':'symbol':'1.0-0' }}</span>
                  </td>
                  <td class="p-8">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-amber-600 tabular-nums">{{ route.standbyTotal | currency:'USD':'symbol':'1.0-0' }}</span>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">{{ route.standbyHours }} HORAS</span>
                    </div>
                  </td>
                  <td class="p-8">
                    <span class="text-sm font-bold text-red-400 tabular-nums">
                      -{{ (route.expenses.tolls + route.expenses.fuel + route.expenses.allowances) | currency:'USD':'symbol':'1.0-0' }}
                    </span>
                  </td>
                  <td class="p-8 text-right">
                    <span class="text-sm font-black text-gray-900 tabular-nums">
                      {{ (route.servicePrice + route.standbyTotal - (route.expenses.tolls + route.expenses.fuel + route.expenses.allowances)) | currency:'USD':'symbol':'1.0-0' }}
                    </span>
                  </td>
                  <td class="p-8 text-right">
                    <button mat-flat-button color="primary" 
                            (click)="onSettle(route)"
                            class="!rounded-full !h-10 !px-6 !font-black !bg-emerald-600 shadow-xl shadow-emerald-100 hover:scale-105 transition-all">
                      Liquidar
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Settled Recently -->
      <div class="space-y-4">
        <h3 class="text-lg font-black text-gray-900 ml-4 tracking-tight">Cierres Recientes</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (route of transportService.routes(); track route.id) {
            @if (route.status === 'Settled') {
              <div class="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <mat-icon>task_alt</mat-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-gray-900">{{ route.id }}</span>
                    <span class="text-[10px] text-gray-400">{{ route.destination }} • Liquidado</span>
                  </div>
                </div>
                <span class="text-xs font-black text-gray-900">{{ (route.expenses.tolls + route.expenses.fuel + route.expenses.allowances) | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            }
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportSettlementViewComponent {
  transportService = inject(TransportService);

  onSettle(route: TransportRoute) {
    if (confirm(`¿Deseas liquidar la ruta ${route.id}? Esto liberará el vehículo ${route.vehicleId}.`)) {
      this.transportService.settleRoute(route.id);
    }
  }
}
