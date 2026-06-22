import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';
import { TransportService } from '../../../../services/transport.service';
import { Vehicle, VehicleMaintenance } from '../../../../models/transport.model';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { StatusTagAtom } from '../../../../components/atoms/status-tag/status-tag.component';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';
import { TransportMaintenanceDialogOrganism } from '../../../../components/organisms/transport-maintenance-dialog/transport-maintenance-dialog.component';

@Component({
  selector: 'app-transport-vehicle-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardLayoutComponent,
    ButtonAtom,
    StatusTagAtom,
    EmptyStateAtom
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div class="flex items-center gap-6">
          <a 
            routerLink="/transport"
            class="inline-flex items-center justify-center w-12 h-12 bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 transition-colors rounded-full"
          >
            <span class="material-icons">arrow_back</span>
          </a>
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">{{ vehicleId() }}</h1>
              <app-status-tag 
                [label]="getStatusLabel(vehicle()?.status || 'Available')" 
                [color]="getStatusColor(vehicle()?.status || 'Available')"
              />
            </div>
            <p class="text-gray-500 font-medium tracking-tight">Detalle técnico y gestión de mantenimiento de flota.</p>
          </div>
        </div>
        
        <div class="flex gap-3">
          <!-- TODO: add variant for amber/action button -->
          <ui-button 
            variant="primary"
            (clicked)="openMaintenanceDialog()"
          >
            <span class="material-icons mr-2">engineering</span>
            Programar Mantenimiento
          </ui-button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <!-- Left Column: Vehicle Info -->
        <div class="space-y-8">
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 overflow-hidden relative">
            <div class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            
            <h2 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 relative z-10">Ficha Técnica</h2>
            
            <div class="space-y-6 relative z-10">
              <div class="flex items-center gap-6">
                <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                  <span class="material-icons !text-2xl">local_shipping</span>
                </div>
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Modelo / Tipo</p>
                  <p class="text-lg font-black text-gray-900 leading-tight">{{ vehicle()?.model }}</p>
                  <p class="text-xs font-bold text-gray-400 leading-tight">{{ vehicle()?.type }}</p>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <span class="material-icons !text-2xl">person</span>
                </div>
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Conductor Asignado</p>
                  <p class="text-lg font-black text-gray-900 leading-tight">{{ vehicle()?.driverName }}</p>
                  <p class="text-xs font-bold text-gray-400 leading-tight">Licencia Vigente</p>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <span class="material-icons !text-2xl">event_repeat</span>
                </div>
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Próximo Servicio</p>
                  <p class="text-lg font-black text-gray-900 leading-tight">{{ vehicle()?.nextService | date:'longDate' }}</p>
                  <p class="text-xs font-bold text-amber-500 leading-tight italic">Revisión periódica</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="bg-indigo-600 rounded-[40px] shadow-xl shadow-indigo-100 p-8 text-white relative overflow-hidden">
             <span class="material-icons absolute -right-4 -bottom-4 !text-[120px] !w-[120px] !h-[120px] opacity-10 rotate-12">construction</span>
             <h3 class="text-lg font-black mb-1">Estado de Flota</h3>
             <p class="text-indigo-100 text-sm mb-8 font-medium opacity-80">Resumen de salud mecánica del vehículo.</p>
             
             <div class="grid grid-cols-2 gap-4">
               <div class="bg-white/10 backdrop-blur-md rounded-3xl p-4">
                 <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Mantenimientos</p>
                 <p class="text-2xl font-black">{{ vehicle()?.maintenanceHistory?.length || 0 }}</p>
               </div>
               <div class="bg-white/10 backdrop-blur-md rounded-3xl p-4">
                 <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Inversión</p>
                 <p class="text-2xl font-black tabular-nums">{{ totalMaintenanceCost() | currency:'USD':'symbol':'1.0-0' }}</p>
               </div>
             </div>
          </div>
        </div>

        <!-- Main Column: Maintenance History -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-10 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-black text-gray-900 mb-1">Historial de Mantenimientos</h2>
                <p class="text-gray-400 text-sm font-medium">Cronograma de servicios preventivos y correctivos.</p>
              </div>
            </div>
            
            <div class="p-10">
              <div class="space-y-6">
                @for (maint of sortedMaintenance(); track maint.id) {
                  <div class="p-8 rounded-[32px] bg-gray-50 border border-gray-100 transition-all hover:border-amber-100 hover:bg-white group">
                    <div class="flex justify-between items-start mb-6">
                      <div class="flex items-center gap-6">
                        <div class="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center transition-colors"
                             [class.text-amber-500]="maint.status === 'Scheduled'"
                             [class.text-blue-500]="maint.status === 'InProcess'"
                             [class.text-emerald-500]="maint.status === 'Completed'"
                             [class.text-red-400]="maint.status === 'Cancelled'">
                          <span class="material-icons !text-2xl">{{ getMaintenanceIcon(maint.type) }}</span>
                        </div>
                        <div>
                          <div class="flex items-center gap-3 mb-1">
                            <h4 class="text-xl font-black text-gray-900">{{ maint.type }}</h4>
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                  [class.bg-amber-100]="maint.status === 'Scheduled'"
                                  [class.text-amber-600]="maint.status === 'Scheduled'"
                                  [class.bg-blue-100]="maint.status === 'InProcess'"
                                  [class.text-blue-600]="maint.status === 'InProcess'"
                                  [class.bg-emerald-100]="maint.status === 'Completed'"
                                  [class.text-emerald-600]="maint.status === 'Completed'"
                                  [class.bg-red-100]="maint.status === 'Cancelled'"
                                  [class.text-red-600]="maint.status === 'Cancelled'">
                              {{ getMaintenanceStatusLabel(maint.status) }}
                            </span>
                          </div>
                          <p class="text-xs font-bold text-gray-400">
                            {{ maint.scheduledDate | date:'fullDate' }}
                            @if (maint.completedDate) {
                              <span class="text-emerald-500 ml-2 italic">• Completado el {{ maint.completedDate | date:'shortDate' }}</span>
                            }
                          </p>
                        </div>
                      </div>

                      <div class="relative">
                        <ui-button variant="icon" (clicked)="toggleMenu(maint.id)">
                          <span class="material-icons">more_vert</span>
                        </ui-button>
                        @if (openMenuId() === maint.id) {
                          <div class="absolute right-0 top-12 z-50 bg-white rounded-2xl min-w-[200px] py-2 shadow-xl border border-gray-100" (click)="$event.stopPropagation()">
                            @if (maint.status !== 'Completed' && maint.status !== 'Cancelled') {
                              <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="updateStatus(maint.id, 'InProcess'); closeMenu()">
                                <span class="material-icons text-blue-500">play_circle</span>
                                <span>Iniciar Trabajo</span>
                              </button>
                              <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="updateStatus(maint.id, 'Completed'); closeMenu()">
                                <span class="material-icons text-emerald-500">check_circle</span>
                                <span>Completar</span>
                              </button>
                              <button class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700" (click)="updateStatus(maint.id, 'Cancelled'); closeMenu()">
                                <span class="material-icons text-red-500">cancel</span>
                                <span>Cancelar</span>
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <p class="text-sm font-medium text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gray-200 pl-4 py-2">
                      {{ maint.description }}
                    </p>

                    <!-- Supports / Attachments -->
                    <div class="space-y-4">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Soportes y Evidencias</p>
                      <div class="flex flex-wrap gap-3">
                        @for (file of maint.attachments; track file) {
                          <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 text-xs font-bold text-gray-500 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 cursor-pointer">
                            <span class="material-icons !text-sm !w-4 !h-4">description</span>
                            {{ file }}
                          </div>
                        }
                        
                        @if (maint.status !== 'Completed' && maint.status !== 'Cancelled') {
                          <button 
                            (click)="addSupport(maint.id)"
                            class="flex items-center gap-2 bg-white text-gray-400 px-4 py-2 rounded-2xl border border-dashed border-gray-200 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all"
                          >
                            <span class="material-icons !text-sm !w-4 !h-4">add</span>
                            Adjuntar Soporte
                          </button>
                        }
                      </div>
                    </div>

                    @if (maint.cost) {
                      <div class="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                        <div class="flex items-center gap-3">
                          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inversión:</span>
                          <span class="text-lg font-black text-indigo-600 tabular-nums">{{ maint.cost | currency:'USD':'symbol':'1.0-0' }}</span>
                        </div>
                      </div>
                    }
                  </div>
                } @empty {
                  <app-empty-state 
                    icon="construction"
                    description="No se registran actividades de mantenimiento para este vehículo."
                  />
                }
              </div>
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
export class TransportVehicleDetailPageComponent {
  private route = inject(ActivatedRoute);
  private transportService = inject(TransportService);
  private dialog = inject(MatDialog);
  
  vehicleId = signal<string | null>(null);
  openMenuId = signal<string | null>(null);

  toggleMenu(id: string) {
    this.openMenuId.update(v => v === id ? null : id);
  }

  closeMenu() {
    this.openMenuId.set(null);
  }

  vehicle = computed(() => {
    const id = this.vehicleId();
    return id ? this.transportService.vehicles().find(v => v.id === id) : null;
  });

  sortedMaintenance = computed(() => {
    const history = this.vehicle()?.maintenanceHistory || [];
    return [...history].sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  });

  totalMaintenanceCost = computed(() => {
    return this.vehicle()?.maintenanceHistory?.reduce((acc, m) => acc + (m.cost || 0), 0) || 0;
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.vehicleId.set(params['id']);
    });
  }

  openMaintenanceDialog() {
    this.dialog.open(TransportMaintenanceDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      data: { vehicleId: this.vehicleId() },
      panelClass: DIALOG_PANEL_CLASS
    });
  }

  updateStatus(maintenanceId: string, status: VehicleMaintenance['status']) {
    this.transportService.updateMaintenanceStatus(this.vehicleId()!, maintenanceId, status);
  }

  addSupport(maintenanceId: string) {
    const filename = prompt('Nombre del archivo de soporte (simulado):', `SOP-${Math.floor(Math.random() * 1000)}.pdf`);
    if (filename) {
      this.transportService.addMaintenanceAttachment(this.vehicleId()!, maintenanceId, filename);
    }
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'Available': 'Disponible',
      'InRoute': 'En Ruta',
      'Committed': 'Comprometido',
      'Workshop': 'En Taller'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): any {
    const colors: any = {
      'Available': 'green',
      'InRoute': 'blue',
      'Committed': 'amber',
      'Workshop': 'red'
    };
    return colors[status] || 'gray';
  }

  getMaintenanceStatusLabel(status: string): string {
    const labels: any = {
      'Scheduled': 'Programado',
      'InProcess': 'En Curso',
      'Completed': 'Completado',
      'Cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getMaintenanceIcon(type: string): string {
    switch(type) {
      case 'Preventivo': return 'event_available';
      case 'Correctivo': return 'build';
      case 'Inspección': return 'fact_check';
      default: return 'engineering';
    }
  }
}
