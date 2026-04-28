import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
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
                    <mat-icon class="text-blue-500">route</mat-icon>
                    Servicio en Curso
                  </h2>
                  <p class="text-gray-400 text-sm font-medium">Hoja de ruta y detalles del servicio activo.</p>
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

          <!-- Right Column: Service & Financial Summary -->
          <div class="space-y-8">
            <div *ngIf="activeRoute()" class="bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
               <!-- Decorative -->
               <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
               
               <h3 class="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                 <mat-icon>payments</mat-icon>
                 Resumen del Contrato
               </h3>
               
               <div class="space-y-8 relative z-10">
                 <div class="flex justify-between items-center pb-6 border-b border-white/10">
                   <span class="text-indigo-300 text-xs font-bold uppercase tracking-widest">Valor Servicio</span>
                   <span class="text-2xl font-black tabular-nums">{{ activeRoute()?.servicePrice | currency:'USD':'symbol':'1.0-0' }}</span>
                 </div>
                 
                 <div class="space-y-4">
                    <div class="flex justify-between items-center">
                      <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Duración Contratada</span>
                      <span class="text-sm font-black">{{ activeRoute()?.durationDays }} Días</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Horas Standby</span>
                      <span class="text-sm font-black">{{ activeRoute()?.standbyHours }} H</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Total Standby</span>
                      <span class="text-sm font-black text-amber-400">{{ activeRoute()?.standbyTotal | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                 </div>

                 <div class="pt-8 border-t border-white/10">
                    <div class="flex justify-between items-center">
                      <span class="text-indigo-100 text-xs font-bold uppercase tracking-widest">Subtotal Facturable</span>
                      <span class="text-3xl font-black text-emerald-400 tabular-nums">
                        {{ (activeRoute()?.servicePrice || 0) + (activeRoute()?.standbyTotal || 0) | currency:'USD':'symbol':'1.0-0' }}
                      </span>
                    </div>
                 </div>
               </div>
            </div>

            <!-- Operational Expenses if Active -->
             <div *ngIf="activeRoute()" class="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
                <h3 class="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                  <mat-icon class="text-red-400">request_quote</mat-icon>
                  Gastos de Operación
                </h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400 font-medium">Peajes</span>
                    <span class="font-bold text-gray-700">{{ activeRoute()?.expenses?.tolls | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400 font-medium">Combustible</span>
                    <span class="font-bold text-gray-700">{{ activeRoute()?.expenses?.fuel | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400 font-medium">Viáticos</span>
                    <span class="font-bold text-gray-700">{{ activeRoute()?.expenses?.allowances | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span class="text-xs font-black text-gray-400 uppercase">Total Gastos</span>
                    <span class="text-lg font-black text-red-500 tabular-nums">
                      {{ (activeRoute()?.expenses?.tolls || 0) + (activeRoute()?.expenses?.fuel || 0) + (activeRoute()?.expenses?.allowances || 0) | currency:'USD':'symbol':'1.0-0' }}
                    </span>
                  </div>
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

  activeRoute = computed(() => 
    this.transportService.routes().find(r => r.vehicleId === this.vehicleId() && r.status === 'Active')
  );

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
