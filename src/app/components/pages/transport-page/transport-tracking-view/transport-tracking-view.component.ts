import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TransportService } from '../../../../services/transport.service';
import { TransportCancelDialogOrganism } from '../../../../components/organisms/transport-cancel-dialog/transport-cancel-dialog.component';
import { TransportRoute } from '../../../../models/transport.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';

@Component({
  selector: 'app-transport-tracking-view',
  standalone: true,
  imports: [CommonModule, ButtonAtom],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Filters -->
      <div class="flex items-center gap-2 bg-white p-2 rounded-[32px] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
        @for (opt of filterOptions; track opt.value) {
          <button
            class="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            [class.bg-gray-900]="statusFilter() === opt.value"
            [class.text-white]="statusFilter() === opt.value"
            [class.bg-gray-50]="statusFilter() !== opt.value"
            [class.text-gray-600]="statusFilter() !== opt.value"
            [class.hover:bg-gray-100]="statusFilter() !== opt.value"
            (click)="statusFilter.set(opt.value)"
          >{{ opt.label }}</button>
        }
      </div>

      <!-- Tracking List -->
      <div class="grid grid-cols-1 gap-6">
        @for (route of filteredRoutes(); track route.id) {
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch group transition-all duration-500"
               [class.hover:border-indigo-100]="route.status !== 'Cancelled'"
               [class.hover:border-red-100]="route.status === 'Cancelled'"
               [class.opacity-75]="route.status === 'Cancelled'">
            
            <!-- Left Accent / Map Indicator -->
            <div class="w-full md:w-64 flex items-center justify-center p-8 relative overflow-hidden"
                 [class.bg-slate-50]="route.status !== 'Cancelled'"
                 [class.bg-red-50/30]="route.status === 'Cancelled'">
              <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
              <div class="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center relative z-10"
                   [class.text-blue-600]="route.status === 'Active'"
                   [class.text-amber-500]="route.status === 'Planning'"
                   [class.text-red-500]="route.status === 'Cancelled'">
                <span class="material-icons !text-[32px] !w-8 !h-8">
                  {{ route.status === 'Active' ? 'my_location' : (route.status === 'Cancelled' ? 'event_busy' : 'event_available') }}
                </span>
              </div>
            </div>

            <!-- Route Details -->
            <div class="flex-1 p-8 md:p-10 flex flex-col justify-between border-x border-gray-50">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                        [class.bg-blue-50]="route.status === 'Active'"
                        [class.text-blue-600]="route.status === 'Active'"
                        [class.border-blue-100]="route.status === 'Active'"
                        [class.bg-amber-50]="route.status === 'Planning'"
                        [class.text-amber-600]="route.status === 'Planning'"
                        [class.border-amber-100]="route.status === 'Planning'"
                        [class.bg-red-50]="route.status === 'Cancelled'"
                        [class.text-red-600]="route.status === 'Cancelled'"
                        [class.border-red-100]="route.status === 'Cancelled'">
                    {{ getStatusLabel(route.status) }}
                  </span>
                  <h3 class="text-2xl font-black text-gray-900 mt-2 tracking-tight">{{ route.origin }} → {{ route.destination }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="material-icons !text-xs !w-3 !h-3 text-gray-400">business</span>
                    <span class="text-sm font-bold text-indigo-600">{{ route.customerName }}</span>
                  </div>
                  <p class="text-gray-400 text-xs font-medium mt-1">
                    {{ route.id }} • Inicio: {{ route.departureDate | date:'short' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehículo / Placa</p>
                  <p class="text-lg font-black text-gray-900">{{ route.vehicleId }}</p>
                </div>
              </div>

              <!-- Last Milestone / Status Text -->
              <div class="p-5 rounded-3xl border flex items-center gap-4"
                   [class.bg-blue-50/30]="route.status === 'Active'"
                   [class.border-blue-100/50]="route.status === 'Active'"
                   [class.bg-amber-50/30]="route.status === 'Planning'"
                   [class.border-amber-100/50]="route.status === 'Planning'"
                   [class.bg-red-50/20]="route.status === 'Cancelled'"
                   [class.border-red-100/30]="route.status === 'Cancelled'">
                <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm"
                     [class.text-blue-600]="route.status === 'Active'"
                     [class.text-amber-500]="route.status === 'Planning'"
                     [class.text-red-500]="route.status === 'Cancelled'">
                  <span class="material-icons">{{ route.status === 'Active' ? 'place' : (route.status === 'Cancelled' ? 'error_outline' : 'pending_actions') }}</span>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest mb-0.5"
                     [class.text-blue-400]="route.status === 'Active'"
                     [class.text-amber-400]="route.status === 'Planning'"
                     [class.text-red-400]="route.status === 'Cancelled'">
                    {{ getMilestoneHeader(route.status) }}
                  </p>
                  <p class="text-sm font-black text-gray-800">
                    {{ getMilestoneText(route) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="p-8 md:p-10 bg-gray-50/50 flex flex-col justify-center items-center gap-4 min-w-[240px]">
              <ui-button variant="primary" (clicked)="onViewDetail(route.id)"
                      class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all w-full">
                Ver Detalles
              </ui-button>
              @if (route.status === 'Active') {
                <ui-button variant="outline"
                        class="!rounded-full !h-12 !px-8 !font-bold !border-gray-200 hover:!bg-white transition-all w-full">
                  Reportar Hito
                </ui-button>
              } @else if (route.status === 'Planning') {
                <ui-button variant="primary" (clicked)="onStartRoute(route.vehicleId)"
                        class="!rounded-full !h-12 !px-8 !font-bold !bg-amber-500 !text-white hover:scale-105 transition-all w-full shadow-lg shadow-amber-100">
                  Iniciar Ruta
                </ui-button>
                <ui-button variant="outline" (clicked)="onCancelService(route)"
                        class="!rounded-full !h-10 !px-8 !font-bold !border-red-100 !text-red-400 hover:!bg-red-50 transition-all w-full !text-xs">
                  Cancelar Servicio
                </ui-button>
              } @else if (route.status === 'Cancelled') {
                <span class="text-[10px] font-black text-red-300 uppercase tracking-tighter">Servicio Finalizado</span>
              }
            </div>
          </div>
        } @empty {
          <div class="p-20 bg-white rounded-[40px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
            <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
              <span class="material-icons !text-[40px] !w-10 !h-10">sensors_off</span>
            </div>
            <h4 class="text-xl font-black text-gray-900 mb-2">No se encontraron rutas</h4>
            <p class="text-gray-400 text-sm max-w-xs mx-auto">Ajusta los filtros para ver otros estados o programa un nuevo servicio.</p>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class TransportTrackingViewComponent {
  transportService = inject(TransportService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  statusFilter = signal<string>('all');

  filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'Active', label: 'En Tránsito' },
    { value: 'Planning', label: 'Programados' },
    { value: 'Cancelled', label: 'Cancelados' }
  ];

  filteredRoutes = computed(() => {
    const routes = this.transportService.routes();
    const filter = this.statusFilter();
    
    return routes.filter(r => {
      if (filter === 'all') return r.status === 'Active' || r.status === 'Planning' || r.status === 'Cancelled';
      return r.status === filter;
    });
  });

  getStatusLabel(status: string): string {
    switch(status) {
      case 'Active': return 'En Tránsito';
      case 'Planning': return 'Programado';
      case 'Cancelled': return 'Cancelado';
      default: return status;
    }
  }

  getMilestoneHeader(status: string): string {
    switch(status) {
      case 'Active': return 'Último Hito Completado';
      case 'Planning': return 'Estado de Salida';
      case 'Cancelled': return 'Motivo de Cancelación';
      default: return 'Detalles';
    }
  }

  getMilestoneText(route: TransportRoute): string {
    if (route.status === 'Cancelled') return route.cancellationNotes || 'Sin notas';
    if (route.status === 'Planning') return 'Esperando Inicio de Viaje';
    return route.currentMilestone || 'Iniciando Ruta';
  }

  onViewDetail(id: string) {
    this.router.navigate(['/transport/service', id]);
  }

  onStartRoute(vehicleId: string) {
    this.transportService.startRoute(vehicleId);
  }

  onCancelService(route: TransportRoute) {
    this.dialog.open(TransportCancelDialogOrganism, {
      data: { route },
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-premium-dialog'
    });
  }
}
