import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';
import { Router } from '@angular/router';
import { TransportService } from '../../../../services/transport.service';
import { VehicleStatus } from '../../../../models/transport.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { StatusTagAtom } from '../../../../components/atoms/status-tag/status-tag.component';
import { TransportDispatchDialogOrganism } from '../../../../components/organisms/transport-dispatch-dialog/transport-dispatch-dialog.component';
import { TransportCancelDialogOrganism } from '../../../../components/organisms/transport-cancel-dialog/transport-cancel-dialog.component';

@Component({
  selector: 'app-transport-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    ButtonAtom,
    StatusTagAtom
  ],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        @for (stat of transportService.stats(); track stat.label) {
          <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
              <p class="text-3xl font-black text-gray-900">{{ stat.count }}</p>
            </div>
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                 [class.bg-emerald-50]="stat.color === 'emerald'"
                 [class.text-emerald-600]="stat.color === 'emerald'"
                 [class.bg-blue-50]="stat.color === 'blue'"
                 [class.text-blue-600]="stat.color === 'blue'"
                 [class.bg-orange-50]="stat.color === 'orange'"
                 [class.text-orange-600]="stat.color === 'orange'"
                 [class.bg-red-50]="stat.color === 'red'"
                 [class.text-red-600]="stat.color === 'red'">
              <span class="material-icons">{{ getStatIcon(stat.label) }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Vehicle Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (vehicle of transportService.vehicles(); track vehicle.id) {
          <div class="relative overflow-hidden bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 group hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
            <!-- Background Accent -->
            <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-colors duration-500"
                 [class.bg-emerald-500]="vehicle.status === 'Available'"
                 [class.bg-blue-500]="vehicle.status === 'InRoute'"
                 [class.bg-orange-500]="vehicle.status === 'Committed'"
                 [class.bg-red-500]="vehicle.status === 'Workshop'">
            </div>

            <!-- Header -->
            <div class="flex justify-between items-start mb-6 relative z-10">
              <app-status-tag 
                [label]="getStatusLabel(vehicle.status)" 
                [color]="getStatusColor(vehicle.status)"
              />
              
              <div class="relative">
                <ui-button variant="icon" (clicked)="toggleMenu(vehicle.id)">
                  <span class="material-icons">more_horiz</span>
                </ui-button>
                @if (openMenuId() === vehicle.id) {
                  <div class="custom-premium-menu absolute right-0 top-12 z-50 bg-white min-w-[220px] py-2 shadow-xl" (click)="$event.stopPropagation()">
                    <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onViewDetail(vehicle.id); closeMenu()">
                      <span class="material-icons text-indigo-500 text-xl">visibility</span>
                      Ver Detalles
                    </button>
                    
                    @if (vehicle.status === 'Available') {
                      <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onProgramService(vehicle.id); closeMenu()">
                        <span class="material-icons text-indigo-600 text-xl">event_note</span>
                        Programar Servicio
                      </button>
                    }

                    <div class="border-t border-gray-50 my-1"></div>
                    <span class="block px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cambiar Estado</span>
                    <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onUpdateStatus(vehicle.id, 'Available'); closeMenu()">
                      <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Disponible
                    </button>
                    <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onUpdateStatus(vehicle.id, 'Committed'); closeMenu()">
                      <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                      Comprometido
                    </button>
                    <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onUpdateStatus(vehicle.id, 'Workshop'); closeMenu()">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      En Taller
                    </button>

                    @if (vehicle.status === 'Committed') {
                      <div class="border-t border-gray-50 my-1"></div>
                      <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onStartRoute(vehicle.id); closeMenu()">
                        <span class="material-icons text-blue-500 text-xl">play_circle</span>
                        Iniciar Ruta
                      </button>
                      <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onCancelService(vehicle.id); closeMenu()">
                        <span class="material-icons text-red-500 text-xl">event_busy</span>
                        Cancelar Servicio
                      </button>
                    }

                    @if (vehicle.status === 'InRoute') {
                      <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="onSettleVehicle(vehicle.id); closeMenu()">
                        <span class="material-icons text-emerald-500 text-xl">task_alt</span>
                        Liquidar Ruta
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
            
            <!-- Vehicle Info -->
            <div class="space-y-4 relative z-10">
              <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                <span class="material-icons !text-[32px] !w-8 !h-8">local_shipping</span>
              </div>
              <div>
                <h3 class="text-2xl font-black text-gray-900 leading-none mb-1">{{ vehicle.id }}</h3>
                <p class="text-gray-400 text-xs font-medium tracking-tight">{{ vehicle.model }} • {{ vehicle.type }}</p>
              </div>
            </div>

            <!-- Footer Info -->
            <div class="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conductor</span>
                <span class="text-sm font-bold text-gray-700">{{ vehicle.driverName }}</span>
              </div>
              <div class="w-8 h-8 rounded-full bg-gray-50 border border-white shadow-sm flex items-center justify-center">
                <span class="material-icons !text-xs !w-3 !h-3 text-gray-400">person</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .custom-premium-menu {
      border-radius: 20px !important;
      padding: 8px !important;
      border: 1px solid #f1f5f9 !important;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05) !important;
    }
  `]
})
export class TransportDashboardViewComponent {
  transportService = inject(TransportService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  openMenuId = signal<string | null>(null);

  toggleMenu(id: string) {
    this.openMenuId.update(v => v === id ? null : id);
  }

  closeMenu() {
    this.openMenuId.set(null);
  }

  onViewDetail(id: string) {
    this.router.navigate(['/transport/vehicle', id]);
  }

  onProgramService(vehicleId: string) {
    this.dialog.open(TransportDispatchDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      data: { vehicleId },
      panelClass: DIALOG_PANEL_CLASS
    });
  }

  onUpdateStatus(id: string, status: VehicleStatus) {
    this.transportService.updateVehicleStatus(id, status);
  }

  onStartRoute(id: string) {
    this.transportService.startRoute(id);
  }

  onCancelService(vehicleId: string) {
    const route = this.transportService.routes().find(r => r.vehicleId === vehicleId && r.status === 'Planning');
    if (route) {
      this.dialog.open(TransportCancelDialogOrganism, {
        ...DIALOG_DEFAULTS,
        width: DIALOG_WIDTHS.md,
        data: { route },
        panelClass: DIALOG_PANEL_CLASS
      });
    }
  }

  onSettleVehicle(id: string) {
    if (confirm(`¿Deseas liquidar la ruta activa del vehículo ${id}?`)) {
      this.transportService.settleVehicle(id);
    }
  }

  getStatusLabel(status: VehicleStatus): string {
    const labels: Record<VehicleStatus, string> = {
      'Available': 'Disponible',
      'InRoute': 'En Ruta',
      'Committed': 'Comprometido',
      'Workshop': 'Taller'
    };
    return labels[status];
  }

  getStatusColor(status: VehicleStatus): 'green' | 'blue' | 'amber' | 'red' {
    const colors: Record<VehicleStatus, 'green' | 'blue' | 'amber' | 'red'> = {
      'Available': 'green',
      'InRoute': 'blue',
      'Committed': 'amber',
      'Workshop': 'red'
    };
    return colors[status];
  }

  getStatIcon(label: string): string {
    const icons: Record<string, string> = {
      'Disponibles': 'check_circle',
      'En Ruta': 'local_shipping',
      'Comprometidos': 'event_available',
      'En Taller': 'build'
    };
    return icons[label] || 'info';
  }
}
