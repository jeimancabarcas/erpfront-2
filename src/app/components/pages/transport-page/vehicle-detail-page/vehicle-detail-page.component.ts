import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TransportService } from '../../../../services/transport.service';
import { BreadcrumbMolecule, BreadcrumbItem } from '../../../molecules/breadcrumb/breadcrumb.component';
import { StatusTagAtom } from '../../../atoms/status-tag/status-tag.component';
import { VehicleStatus } from '../../../../models/transport.model';

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    BreadcrumbMolecule,
    StatusTagAtom
  ],
  template: `
    <app-dashboard-layout>
      <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        <!-- Breadcrumb -->
        <app-breadcrumb [items]="breadcrumbItems" />

        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <mat-icon class="!text-[40px] !w-10 !h-10">local_shipping</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-4xl font-black text-gray-900 tracking-tight leading-none">{{ vehicle()?.id }}</h1>
                <app-status-tag 
                  *ngIf="vehicle()"
                  [label]="getStatusLabel(vehicle()!.status)" 
                  [color]="getStatusColor(vehicle()!.status)"
                />
              </div>
              <p class="text-gray-500 font-medium tracking-tight">{{ vehicle()?.model }} • {{ vehicle()?.type }}</p>
            </div>
          </div>
          <div class="flex gap-3">
             <button 
              mat-stroked-button 
              class="!rounded-full !h-12 !px-8 !font-bold !border-gray-200 hover:!bg-gray-50"
            >
              <mat-icon class="mr-2">edit</mat-icon>
              Editar Vehículo
            </button>
            <button 
              mat-flat-button 
              color="primary" 
              class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
            >
              <mat-icon class="mr-2">print</mat-icon>
              Imprimir Ficha
            </button>
          </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Vehicle & Driver Info -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Information Grid -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <h2 class="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <mat-icon class="text-indigo-500">info</mat-icon>
                Información General
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conductor Asignado</p>
                  <p class="text-lg font-bold text-gray-800">{{ vehicle()?.driverName }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarifa Standby (Hora)</p>
                  <p class="text-lg font-black text-amber-600">{{ vehicle()?.standbyRate | currency:'USD':'symbol':'1.0-0' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Último Mantenimiento</p>
                  <p class="text-lg font-bold text-gray-800">{{ vehicle()?.lastService | date:'longDate' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Próximo Mantenimiento</p>
                  <p class="text-lg font-bold text-red-500">{{ vehicle()?.nextService | date:'longDate' }}</p>
                </div>
              </div>
            </div>

            <!-- Route Sheet / Active Service -->
            <div *ngIf="activeRoute()" class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <div class="p-10 border-b border-gray-50">
                  <h2 class="text-xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <mat-icon [class.text-blue-500]="activeRoute()?.status === 'Active'" [class.text-amber-500]="activeRoute()?.status === 'Planning'">
                      {{ activeRoute()?.status === 'Active' ? 'route' : 'event_available' }}
                    </mat-icon>
                    {{ activeRoute()?.status === 'Active' ? 'Servicio en Curso' : 'Servicio Programado' }}
                  </h2>
                  <p class="text-gray-400 text-sm font-medium">
                    {{ activeRoute()?.status === 'Active' ? 'Hoja de ruta y detalles del servicio activo.' : 'Detalles del servicio próximo a iniciar.' }}
                  </p>
               </div>
               
               <div class="p-10 space-y-10">
                  <div class="flex flex-col md:flex-row justify-between gap-8">
                    <div class="space-y-1">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</p>
                      <p class="text-xl font-black text-indigo-600">{{ activeRoute()?.customerName }}</p>
                    </div>
                    <div class="space-y-1 md:text-right">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ruta</p>
                      <p class="text-xl font-black text-gray-900">{{ activeRoute()?.origin }} → {{ activeRoute()?.destination }}</p>
                    </div>
                  </div>

                  <div class="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Línea de Tiempo / Hitos</p>
                    <div class="space-y-6">
                      @for (milestone of activeRoute()?.milestones; track milestone.id; let last = $last) {
                        <div class="flex gap-4 relative">
                          <div *ngIf="!last" class="absolute left-4 top-8 w-0.5 h-10 bg-gray-200"></div>
                          <div class="w-8 h-8 rounded-full flex items-center justify-center relative z-10 shadow-sm"
                               [class.bg-emerald-500]="milestone.status === 'Completed'"
                               [class.text-white]="milestone.status === 'Completed'"
                               [class.bg-white]="milestone.status === 'Pending'"
                               [class.text-gray-300]="milestone.status === 'Pending'"
                               [class.border]="milestone.status === 'Pending'"
                               [class.border-gray-200]="milestone.status === 'Pending'">
                            <mat-icon class="!text-sm !w-4 !h-4">{{ milestone.status === 'Completed' ? 'check' : 'radio_button_unchecked' }}</mat-icon>
                          </div>
                          <div>
                            <p class="text-sm font-bold" [class.text-gray-900]="milestone.status === 'Completed'" [class.text-gray-400]="milestone.status === 'Pending'">
                              {{ milestone.name }}
                            </p>
                            <p *ngIf="milestone.timestamp" class="text-[10px] font-medium text-gray-400">{{ milestone.timestamp | date:'short' }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
               </div>
            </div>

            <!-- Empty State for Service -->
             <div *ngIf="!activeRoute()" class="p-20 bg-gray-50/50 rounded-[40px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-200 mb-6 shadow-sm">
                  <mat-icon class="!text-[32px] !w-8 !h-8">event_busy</mat-icon>
                </div>
                <h4 class="text-lg font-black text-gray-900 mb-1">Sin Servicios Activos</h4>
                <p class="text-gray-400 text-sm">Este vehículo no tiene una ruta o servicio asignado actualmente.</p>
             </div>
          </div>

          <!-- Right Column: Operational History -->
          <div class="space-y-8">
            <!-- Historical Summary Card -->
            <div class="bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
               <!-- Decorative -->
               <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
               
               <h3 class="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                 <mat-icon>analytics</mat-icon>
                 Resumen Operativo
               </h3>
               
               <div class="space-y-8 relative z-10">
                 <div class="flex justify-between items-center pb-6 border-b border-white/10">
                   <span class="text-indigo-300 text-xs font-bold uppercase tracking-widest">Total Facturado</span>
                   <span class="text-3xl font-black tabular-nums text-emerald-400">{{ historicalStats().totalBilled | currency:'USD':'symbol':'1.0-0' }}</span>
                 </div>
                 
                 <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Servicios Realizados</span>
                      <span class="text-lg font-black">{{ historicalStats().totalServices }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Total Gastos</span>
                      <span class="text-lg font-black text-red-400">{{ historicalStats().totalExpenses | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-white/10">
                      <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Utilidad Bruta</span>
                      <span class="text-xl font-black text-white tabular-nums">
                        {{ historicalStats().totalBilled - historicalStats().totalExpenses | currency:'USD':'symbol':'1.0-0' }}
                      </span>
                    </div>
                 </div>
               </div>
            </div>

            <!-- List of performed services -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <h3 class="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                <mat-icon class="text-indigo-500">history</mat-icon>
                Últimos Servicios
              </h3>
              <div class="space-y-6">
                @for (route of vehicleRoutes(); track route.id) {
                  @if (route.status === 'Settled') {
                    <div class="p-5 rounded-3xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
                      <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-black text-indigo-600 uppercase">{{ route.id }}</span>
                        <span class="text-[10px] font-bold text-gray-400">{{ route.departureDate | date:'shortDate' }}</span>
                      </div>
                      <p class="text-xs font-black text-gray-800 mb-1">{{ route.customerName }}</p>
                      <div class="flex justify-between items-center">
                        <span class="text-[10px] font-medium text-gray-400">{{ route.origin }} → {{ route.destination }}</span>
                        <span class="text-xs font-black text-gray-900">{{ (route.servicePrice + route.standbyTotal) | currency:'USD':'symbol':'1.0-0' }}</span>
                      </div>
                    </div>
                  }
                } @empty {
                  <div class="py-10 text-center">
                    <p class="text-gray-400 text-sm font-medium">No hay servicios registrados.</p>
                  </div>
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
  public transportService = inject(TransportService);

  vehicleId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  vehicle = computed(() => 
    this.transportService.vehicles().find(v => v.id === this.vehicleId())
  );

  vehicleRoutes = computed(() => 
    this.transportService.routes().filter(r => r.vehicleId === this.vehicleId())
  );

  activeRoute = computed(() => 
    this.vehicleRoutes().find(r => r.status === 'Active' || r.status === 'Planning')
  );

  historicalStats = computed(() => {
    // Only consider settled routes for billing and finished services
    const finishedRoutes = this.vehicleRoutes().filter(r => r.status === 'Settled');
    return {
      totalBilled: finishedRoutes.reduce((sum, r) => sum + (r.servicePrice + r.standbyTotal), 0),
      totalServices: finishedRoutes.length,
      totalExpenses: finishedRoutes.reduce((sum, r) => {
        const e = r.expenses || { tolls: 0, fuel: 0, allowances: 0 };
        return sum + (e.tolls + e.fuel + e.allowances);
      }, 0)
    };
  });

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', link: '/dashboard' },
    { label: 'Transporte', link: '/transport' },
    { label: 'Detalle de Vehículo', link: '' }
  ];

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
}
