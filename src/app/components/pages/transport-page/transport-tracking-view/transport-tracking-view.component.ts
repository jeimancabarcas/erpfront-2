import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../../services/transport.service';

@Component({
  selector: 'app-transport-tracking-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Tracking List -->
      <div class="grid grid-cols-1 gap-6">
        @for (route of transportService.routes(); track route.id) {
          @if (route.status === 'Active') {
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-blue-100 transition-all duration-500">
              
              <!-- Map Indicator (Mock) -->
              <div class="w-full md:w-64 bg-slate-50 flex items-center justify-center p-8 relative overflow-hidden">
                <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div class="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-blue-600 relative z-10">
                  <mat-icon class="!text-[32px] !w-8 !h-8">my_location</mat-icon>
                </div>
              </div>

              <!-- Route Details -->
              <div class="flex-1 p-8 md:p-10 flex flex-col justify-between border-x border-gray-50">
                <div class="flex justify-between items-start mb-6">
                  <div>
                    <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">En Tránsito</span>
                    <h3 class="text-2xl font-black text-gray-900 mt-2 tracking-tight">{{ route.origin }} → {{ route.destination }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <mat-icon class="!text-xs !w-3 !h-3 text-gray-400">business</mat-icon>
                      <span class="text-sm font-bold text-indigo-600">{{ route.customerName }}</span>
                    </div>
                    <p class="text-gray-400 text-xs font-medium mt-1">
                      {{ route.id }} • {{ route.durationDays }} días • Llegada: {{ route.expectedArrival | date:'shortDate' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehículo / Placa</p>
                    <p class="text-lg font-black text-gray-900">{{ route.vehicleId }}</p>
                  </div>
                </div>

                <!-- Last Milestone -->
                <div class="p-5 bg-blue-50/30 rounded-3xl border border-blue-100/50 flex items-center gap-4">
                  <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <mat-icon>place</mat-icon>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Último Hito Completado</p>
                    <p class="text-sm font-black text-gray-800">{{ route.currentMilestone || 'Iniciando Ruta' }}</p>
                  </div>
                </div>
              </div>

              <!-- Actions / Milestone Stepper (Simplified) -->
              <div class="p-8 md:p-10 bg-gray-50/50 flex flex-col justify-center items-center gap-4 min-w-[240px]">
                <button mat-flat-button color="primary" 
                        class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all w-full">
                  Ver Detalles
                </button>
                <button mat-stroked-button 
                        class="!rounded-full !h-12 !px-8 !font-bold !border-gray-200 hover:!bg-white transition-all w-full">
                  Reportar Hito
                </button>
              </div>
            </div>
          }
        } @empty {
          <div class="p-20 bg-white rounded-[40px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
            <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
              <mat-icon class="!text-[40px] !w-10 !h-10">sensors_off</mat-icon>
            </div>
            <h4 class="text-xl font-black text-gray-900 mb-2">No hay rutas activas</h4>
            <p class="text-gray-400 text-sm max-w-xs mx-auto">Cuando inicies un despacho, podrás realizar el seguimiento en vivo desde aquí.</p>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportTrackingViewComponent {
  transportService = inject(TransportService);
}
