import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../../services/transport.service';
import { TransportRoute } from '../../../../models/transport.model';
import { BreadcrumbItem, BreadcrumbMolecule } from '../../../molecules/breadcrumb/breadcrumb.component';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-transport-service-detail-page',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterModule, 
    BreadcrumbMolecule,
    DashboardLayoutComponent
  ],
  template: `
    <app-dashboard-layout>
      <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        
        <!-- Breadcrumb -->
        <app-breadcrumb [items]="breadcrumbItems" [currentLabel]="'Detalles del Servicio'" />

        <!-- Header Section -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 border border-gray-50">
              <mat-icon class="!text-[40px] !w-10 !h-10">local_shipping</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-3 mb-1">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                      [class.bg-blue-50]="routeData()?.status === 'Active'"
                      [class.text-blue-600]="routeData()?.status === 'Active'"
                      [class.border-blue-100]="routeData()?.status === 'Active'"
                      [class.bg-amber-50]="routeData()?.status === 'Planning'"
                      [class.text-amber-600]="routeData()?.status === 'Planning'"
                      [class.border-amber-100]="routeData()?.status === 'Planning'"
                      [class.bg-emerald-50]="routeData()?.status === 'Settled'"
                      [class.text-emerald-600]="routeData()?.status === 'Settled'"
                      [class.border-emerald-100]="routeData()?.status === 'Settled'"
                      [class.bg-red-50]="routeData()?.status === 'Cancelled'"
                      [class.text-red-600]="routeData()?.status === 'Cancelled'"
                      [class.border-red-100]="routeData()?.status === 'Cancelled'">
                  {{ getStatusLabel(routeData()?.status) }}
                </span>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {{ routeData()?.id }}</span>
              </div>
              <h1 class="text-4xl font-black text-gray-900 tracking-tight">
                {{ routeData()?.origin }} → {{ routeData()?.destination }}
              </h1>
              <p class="text-gray-400 font-medium mt-1">Servicio prestado para <span class="text-indigo-600 font-bold">{{ routeData()?.customerName }}</span></p>
            </div>
          </div>
          
          <div class="flex gap-4">
            <button mat-stroked-button class="!rounded-full !h-12 !px-8 !font-bold !border-gray-200 hover:!bg-white transition-all">
              Descargar Hoja de Ruta
            </button>
            <button mat-flat-button color="primary" class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
              Imprimir Factura
            </button>
          </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column: Service & Vehicle Info -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vehículo Asignado</p>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <mat-icon>minor_crash</mat-icon>
                  </div>
                  <div>
                    <p class="text-lg font-black text-gray-900">{{ routeData()?.vehicleId }}</p>
                    <p class="text-[10px] font-bold text-gray-400">{{ vehicle()?.type }} • {{ vehicle()?.model }}</p>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Conductor</p>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div>
                    <p class="text-lg font-black text-gray-900">{{ routeData()?.driverName }}</p>
                    <p class="text-[10px] font-bold text-gray-400">Licencia Vigente</p>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha de Inicio</p>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <mat-icon>calendar_today</mat-icon>
                  </div>
                  <div>
                    <p class="text-lg font-black text-gray-900">{{ routeData()?.departureDate | date:'shortDate' }}</p>
                    <p class="text-[10px] font-bold text-gray-400">Salida Programada</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Milestones / Timeline -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-10 border-b border-gray-50 flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-black text-gray-900 mb-1">Seguimiento de Hitos</h2>
                  <p class="text-gray-400 text-sm font-medium">Registro detallado de los eventos reportados durante el servicio.</p>
                </div>
                <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                  <mat-icon>history</mat-icon>
                </div>
              </div>
              
              <div class="p-10">
                <div class="space-y-10 relative">
                  <div class="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                  
                  @for (milestone of routeData()?.milestones; track milestone.id) {
                    <div class="flex gap-10 relative z-10">
                      <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                           [class.bg-emerald-500]="milestone.status === 'Completed'"
                           [class.text-white]="milestone.status === 'Completed'"
                           [class.bg-white]="milestone.status === 'Pending'"
                           [class.text-gray-300]="milestone.status === 'Pending'"
                           [class.border]="milestone.status === 'Pending'"
                           [class.border-gray-100]="milestone.status === 'Pending'">
                        <mat-icon class="!text-xl">{{ milestone.status === 'Completed' ? 'check' : 'radio_button_unchecked' }}</mat-icon>
                      </div>
                      <div class="flex-1 p-6 rounded-[32px] border transition-all"
                           [class.bg-emerald-50/30]="milestone.status === 'Completed'"
                           [class.border-emerald-100/50]="milestone.status === 'Completed'"
                           [class.bg-white]="milestone.status === 'Pending'"
                           [class.border-gray-50]="milestone.status === 'Pending'">
                        <div class="flex justify-between items-start mb-2">
                          <h4 class="text-lg font-black" [class.text-gray-900]="milestone.status === 'Completed'" [class.text-gray-400]="milestone.status === 'Pending'">
                            {{ milestone.name }}
                          </h4>
                          <span *ngIf="milestone.timestamp" class="text-[10px] font-bold text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm">
                            {{ milestone.timestamp | date:'shortTime' }}
                          </span>
                        </div>
                        <p class="text-sm font-medium" [class.text-gray-500]="milestone.status === 'Completed'" [class.text-gray-300]="milestone.status === 'Pending'">
                          {{ milestone.status === 'Completed' ? 'Reportado satisfactoriamente por el conductor.' : 'Esperando reporte de hito.' }}
                        </p>
                        <p *ngIf="milestone.timestamp" class="text-[10px] font-medium text-gray-400 mt-2">
                          Fecha: {{ milestone.timestamp | date:'longDate' }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Cancellation Notes if applicable -->
            <div *ngIf="routeData()?.status === 'Cancelled'" class="p-10 bg-red-50 rounded-[40px] border border-red-100 shadow-sm">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                  <mat-icon>report_problem</mat-icon>
                </div>
                <div>
                  <h3 class="text-xl font-black text-red-900">Motivo de Cancelación</h3>
                  <p class="text-red-600 text-sm font-medium">El servicio fue abortado y el vehículo liberado.</p>
                </div>
              </div>
              <div class="p-6 bg-white/50 rounded-3xl border border-red-100/50">
                <p class="text-gray-700 font-bold leading-relaxed italic">
                  "{{ routeData()?.cancellationNotes || 'No se registraron notas adicionales.' }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Financials & Extras -->
          <div class="space-y-8">
            
            <!-- Financial Details -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-8 bg-indigo-600 text-white">
                <h2 class="text-xl font-black mb-1">Resumen Financiero</h2>
                <p class="text-indigo-100 text-xs font-medium">Desglose de costos y facturación.</p>
              </div>
              <div class="p-8 space-y-6">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-gray-500">Valor Base Servicio</span>
                  <span class="text-lg font-black text-gray-900">{{ routeData()?.servicePrice | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-gray-500">Standby ({{ routeData()?.standbyHours }}h)</span>
                  <span class="text-lg font-black text-gray-900">{{ routeData()?.standbyTotal | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span class="text-sm font-black text-gray-900">TOTAL FACTURABLE</span>
                  <span class="text-2xl font-black text-indigo-600">
                    {{ (routeData()?.servicePrice || 0) + (routeData()?.standbyTotal || 0) | currency:'USD':'symbol':'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Operational Expenses (Only if Settled or Active) -->
            <div *ngIf="routeData()?.status !== 'Cancelled' && routeData()?.status !== 'Planning'" 
                 class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-8 border-b border-gray-50">
                <h2 class="text-xl font-black text-gray-900 mb-1">Gastos Operativos</h2>
                <p class="text-gray-400 text-xs font-medium">Costos reportados durante la ruta.</p>
              </div>
              <div class="p-8 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                      <mat-icon class="!text-sm">toll</mat-icon>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Peajes</span>
                  </div>
                  <span class="text-lg font-black text-gray-900">{{ routeData()?.expenses?.tolls | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <mat-icon class="!text-sm">local_gas_station</mat-icon>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Combustible</span>
                  </div>
                  <span class="text-lg font-black text-gray-900">{{ routeData()?.expenses?.fuel | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <mat-icon class="!text-sm">restaurant</mat-icon>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Viáticos</span>
                  </div>
                  <span class="text-lg font-black text-gray-900">{{ routeData()?.expenses?.allowances | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span class="text-sm font-black text-gray-900">UTILIDAD BRUTA</span>
                  <span class="text-2xl font-black text-emerald-600">
                    {{ calculateProfit() | currency:'USD':'symbol':'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="p-8 bg-gray-900 rounded-[40px] text-white space-y-6 shadow-xl shadow-gray-200">
              <h3 class="text-lg font-black">Asistencia en Ruta</h3>
              <div class="space-y-4">
                <button mat-flat-button class="!w-full !rounded-2xl !h-14 !bg-white/10 !text-white !font-bold hover:!bg-white/20 transition-all">
                  <mat-icon matPrefix class="mr-2">call</mat-icon>
                  Llamar a Conductor
                </button>
                <button mat-flat-button class="!w-full !rounded-2xl !h-14 !bg-white/10 !text-white !font-bold hover:!bg-white/20 transition-all">
                  <mat-icon matPrefix class="mr-2">map</mat-icon>
                  Ver en Mapa Real
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class TransportServiceDetailPageComponent {
  private route = inject(ActivatedRoute);
  private transportService = inject(TransportService);

  routeId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  routeData = computed(() => 
    this.transportService.routes().find(r => r.id === this.routeId())
  );

  vehicle = computed(() => {
    const data = this.routeData();
    if (!data) return null;
    return this.transportService.vehicles().find(v => v.id === data.vehicleId);
  });

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Transporte', link: '/transport' }
  ];

  getStatusLabel(status: string | undefined): string {
    switch(status) {
      case 'Active': return 'En Tránsito';
      case 'Planning': return 'Programado';
      case 'Settled': return 'Liquidado';
      case 'Cancelled': return 'Cancelado';
      case 'Completed': return 'Completado';
      default: return status || 'N/A';
    }
  }

  calculateProfit(): number {
    const data = this.routeData();
    if (!data) return 0;
    const billed = data.servicePrice + data.standbyTotal;
    const expenses = (data.expenses?.tolls || 0) + (data.expenses?.fuel || 0) + (data.expenses?.allowances || 0);
    return billed - expenses;
  }
}
