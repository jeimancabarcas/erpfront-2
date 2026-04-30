import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../../services/transport.service';
import { TransportRoute } from '../../../../models/transport.model';
import { BreadcrumbItem, BreadcrumbMolecule } from '../../../molecules/breadcrumb/breadcrumb.component';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TransportOperationDialogOrganism } from '../../../organisms/transport-operation-dialog/transport-operation-dialog.component';
import { TransportExpenseDialogOrganism } from '../../../organisms/transport-expense-dialog/transport-expense-dialog.component';
import { EmptyStateAtom } from '../../../atoms/empty-state/empty-state.component';
import { TransportChangeVehicleDialogOrganism } from '../../../organisms/transport-change-vehicle-dialog/transport-change-vehicle-dialog.component';
import { TransportIncidentDialogOrganism } from '../../../organisms/transport-incident-dialog/transport-incident-dialog.component';
import { TransportOperationClosureDialogOrganism } from '../../../organisms/transport-operation-closure-dialog/transport-operation-closure-dialog.component';

@Component({
  selector: 'app-transport-service-detail-page',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterModule, 
    BreadcrumbMolecule,
    DashboardLayoutComponent,
    MatDialogModule,
    EmptyStateAtom
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
              <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm relative group">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vehículo en Operación</p>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <mat-icon>minor_crash</mat-icon>
                  </div>
                  <div>
                    <p class="text-lg font-black text-gray-900">{{ activeOperation()?.vehicleId || 'Pendiente' }}</p>
                    <p class="text-[10px] font-bold text-gray-400">
                      @if (activeOperation() && vehicle()) {
                        {{ vehicle()?.type }} • {{ vehicle()?.model }}
                      } @else {
                        Esperando inicio de operación
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Conductor Activo</p>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div>
                    <p class="text-lg font-black text-gray-900">{{ vehicle()?.driverName || 'Pendiente' }}</p>
                    <p class="text-[10px] font-bold text-gray-400">Responsable actual</p>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha / Hora Inicio</p>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <mat-icon>calendar_today</mat-icon>
                  </div>
                  <div>
                    <p class="text-lg font-black text-gray-900">
                      {{ (activeOperation()?.timestamp || routeData()?.departureDate) | date:'shortTime' }}
                    </p>
                    <p class="text-[10px] font-bold text-gray-400">
                      {{ (activeOperation()?.timestamp || routeData()?.departureDate) | date:'mediumDate' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Operations Timeline (Replacing Milestones) -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-10 border-b border-gray-50 flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-black text-gray-900 mb-1">Seguimiento de Operaciones</h2>
                  <p class="text-gray-400 text-sm font-medium">Registro cronológico de cargues, descargues y maniobras logísticas.</p>
                </div>
                <div class="flex items-center gap-4">
                  <button 
                    mat-stroked-button 
                    (click)="openOperationDialog()"
                    [disabled]="hasActiveOperation()"
                    class="!rounded-2xl !h-12 !px-6 !font-bold !border-indigo-100 !text-indigo-600 hover:!bg-indigo-50 transition-all disabled:!opacity-50 disabled:!bg-gray-50 disabled:!text-gray-400 disabled:!border-gray-100"
                  >
                    <mat-icon class="mr-2">{{ hasActiveOperation() ? 'block' : 'add_circle' }}</mat-icon>
                    {{ hasActiveOperation() ? 'Operación en Curso' : 'Registrar Operación' }}
                  </button>
                  <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400">
                    <mat-icon>settings_suggest</mat-icon>
                  </div>
                </div>
              </div>
              
              <div class="p-10">
                <div class="space-y-10 relative">
                  <div class="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                  
                  @for (op of sortedOperations(); track op.id) {
                    <div class="flex gap-10 relative z-10 animate-in fade-in slide-in-from-left-4 duration-500">
                      <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 bg-indigo-600 text-white">
                        <mat-icon class="!text-xl">{{ getOperationIcon(op.type) }}</mat-icon>
                      </div>
                      <div class="flex-1 p-6 rounded-[32px] border border-gray-50 bg-gray-50/30 transition-all hover:border-indigo-100 hover:bg-white group">
                        <div class="flex justify-between items-start mb-2">
                          <div class="flex items-center gap-3">
                            <h4 class="text-lg font-black text-gray-900">
                              {{ op.type }}
                              <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                   [class.bg-emerald-100]="op.status === 'Completed'"
                                   [class.text-emerald-600]="op.status === 'Completed'"
                                   [class.bg-blue-100]="op.status === 'InProcess'"
                                   [class.text-blue-600]="op.status === 'InProcess'"
                                   [class.bg-red-100]="op.status === 'Cancelled'"
                                   [class.text-red-600]="op.status === 'Cancelled'">
                               {{ op.status === 'InProcess' ? 'En Curso' : op.status === 'Completed' ? 'Completado' : 'Cancelada' }}
                             </span>
                            </h4>
                          </div>
                          <div class="text-right">
                            <span class="block text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm mb-1">
                              {{ op.timestamp | date:'shortTime' }}
                            </span>
                            <span class="block text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                              {{ op.timestamp | date:'longDate' }}
                            </span>
                          </div>
                        </div>
                        
                        <p class="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
                          {{ op.description }}
                        </p>

                        <div class="flex flex-wrap items-center justify-between gap-4">
                          <div class="flex flex-wrap items-center gap-4">
                            @if (op.vehicleId) {
                              <div class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-indigo-50 shadow-sm"
                                   [class.border-blue-200]="op.status === 'InProcess'"
                                   [class.bg-blue-50]="op.status === 'InProcess'">
                                <mat-icon class="!text-[14px] !w-3.5 !h-3.5 text-indigo-400" [class.text-blue-600]="op.status === 'InProcess'">local_shipping</mat-icon>
                                <span class="text-[10px] font-black text-indigo-600" [class.text-blue-700]="op.status === 'InProcess'">
                                  Vehículo: {{ op.vehicleId }}
                                  @if (op.status === 'InProcess') { (ACTIVO) }
                                </span>
                              </div>
                            }
                            
                            @if (op.attachments && op.attachments.length > 0) {
                              <div class="flex flex-wrap gap-2">
                                @for (file of op.attachments; track file) {
                                  <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-black text-gray-400 shadow-sm cursor-pointer hover:text-indigo-600 hover:border-indigo-100 transition-colors">
                                    <mat-icon class="!text-[14px] !w-3.5 !h-3.5">attach_file</mat-icon>
                                    {{ file }}
                                  </div>
                                }
                              </div>
                            }
                          </div>

                          @if (op.status === 'InProcess') {
                            <div class="flex gap-2">
                              <button 
                                (click)="cancelOperation(op.id)"
                                class="!rounded-2xl !h-10 !px-4 !text-xs !font-black !text-red-500 hover:!bg-red-50 transition-all"
                                mat-button
                              >
                                Cancelar
                              </button>
                              <button 
                                (click)="finishOperation(op.id)"
                                class="!rounded-2xl !h-10 !px-5 !text-xs !font-black !bg-emerald-600 !text-white shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                mat-flat-button
                              >
                                <mat-icon class="!text-sm !w-4 !h-4">check_circle</mat-icon>
                                Finalizar
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <app-empty-state 
                      icon="inventory_2"
                      description="No se han registrado operaciones logísticas para este servicio."
                    />
                  }
                </div>
              </div>
            </div>

            <!-- Detailed Expenses History -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-10 border-b border-gray-50 flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-black text-gray-900 mb-1">Historial de Gastos</h2>
                  <p class="text-gray-400 text-sm font-medium">Registro detallado de costos operativos reportados.</p>
                </div>
                <div class="flex items-center gap-4">
                  <button 
                    mat-stroked-button 
                    (click)="openExpenseDialog()"
                    class="!rounded-2xl !h-12 !px-6 !font-bold !border-emerald-100 !text-emerald-600 hover:!bg-emerald-50 transition-all"
                  >
                    <mat-icon class="mr-2">add_circle</mat-icon>
                    Registrar Gasto
                  </button>
                  <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <mat-icon>receipt_long</mat-icon>
                  </div>
                </div>
              </div>
              
              <div class="p-10">
                <div class="space-y-6">
                  @for (exp of routeData()?.detailedExpenses; track exp.id) {
                    <div class="p-6 rounded-[32px] bg-gray-50 border border-gray-100 flex justify-between items-center transition-all hover:border-emerald-100">
                      <div class="flex items-center gap-6">
                        <div class="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                          <mat-icon>{{ getExpenseIcon(exp.type) }}</mat-icon>
                        </div>
                        <div>
                          <div class="flex items-center gap-3 mb-1">
                            <h4 class="text-lg font-black text-gray-900">{{ exp.type }}</h4>
                            <span class="text-sm font-black text-emerald-600 tabular-nums">
                              {{ exp.amount | currency:'USD':'symbol':'1.0-0' }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-500">{{ exp.description }}</p>
                          <div class="flex items-center gap-4 mt-2">
                             <span class="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                               <mat-icon class="!text-[14px] !w-[14px] !h-[14px]">schedule</mat-icon>
                               {{ exp.timestamp | date:'shortTime' }}
                             </span>
                          </div>
                          @if (exp.attachments && exp.attachments.length > 0) {
                            <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100/50">
                              @for (file of exp.attachments; track file) {
                                <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-black text-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors">
                                  <mat-icon class="!text-[14px] !w-3.5 !h-3.5">receipt_long</mat-icon>
                                  {{ file }}
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <app-empty-state 
                      icon="receipt_long"
                      description="No se han registrado gastos detallados aún para este servicio."
                    />
                  }
                </div>
              </div>
            </div>

            <!-- Incidents Section (Novedades) -->
            <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-10 border-b border-gray-50 flex justify-between items-center">
                <div>
                  <h2 class="text-2xl font-black text-gray-900 mb-1">Novedades en Ruta</h2>
                  <p class="text-gray-400 text-sm font-medium">Registro de incidencias, cambios de vehículo y eventos relevantes.</p>
                </div>
                <div class="flex items-center gap-4">
                  <button 
                    mat-stroked-button 
                    (click)="openIncidentDialog()"
                    class="!rounded-2xl !h-12 !px-6 !font-bold !border-orange-100 !text-orange-600 hover:!bg-orange-50 transition-all"
                  >
                    <mat-icon class="mr-2">report_problem</mat-icon>
                    Reportar Novedad
                  </button>
                </div>
              </div>
              
              <div class="p-10">
                <div class="space-y-6">
                  @for (inc of routeData()?.incidents; track inc.id) {
                    <div class="p-6 rounded-[32px] border border-l-4 transition-all"
                         [class.bg-orange-50]="inc.type !== 'Cambio de Vehículo'"
                         [class.border-orange-200]="inc.type !== 'Cambio de Vehículo'"
                         [class.bg-indigo-50]="inc.type === 'Cambio de Vehículo'"
                         [class.border-indigo-200]="inc.type === 'Cambio de Vehículo'">
                      <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"
                               [class.text-orange-600]="inc.type !== 'Cambio de Vehículo'"
                               [class.text-indigo-600]="inc.type === 'Cambio de Vehículo'">
                            <mat-icon>{{ inc.type === 'Cambio de Vehículo' ? 'sync' : 'warning' }}</mat-icon>
                          </div>
                          <div>
                            <h4 class="font-black text-gray-900">{{ inc.type }}</h4>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ inc.timestamp | date:'medium' }}</p>
                          </div>
                        </div>
                        <span class="text-[10px] font-black px-3 py-1 rounded-full bg-white shadow-sm text-gray-500 uppercase tracking-widest">
                          Por: {{ inc.reportedBy }}
                        </span>
                      </div>
                      
                      <p class="text-sm font-medium text-gray-700 leading-relaxed mb-4">
                        {{ inc.description }}
                      </p>

                      @if (inc.type === 'Cambio de Vehículo') {
                        <div class="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-indigo-100/50">
                          <div class="text-center flex-1">
                            <p class="text-[9px] font-black text-gray-400 uppercase mb-1">Anterior</p>
                            <p class="text-sm font-black text-gray-600">{{ inc.previousVehicleId }}</p>
                          </div>
                          <mat-icon class="text-indigo-300">arrow_forward</mat-icon>
                          <div class="text-center flex-1">
                            <p class="text-[9px] font-black text-indigo-400 uppercase mb-1">Nuevo</p>
                            <p class="text-sm font-black text-indigo-600">{{ inc.newVehicleId }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  } @empty {
                    <app-empty-state 
                      icon="notification_important"
                      description="No se han reportado novedades para este servicio."
                    />
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
                <div class="flex justify-between items-center text-red-500">
                  <span class="text-sm font-bold opacity-80">Total Gastos Reportados</span>
                  <span class="text-lg font-black tabular-nums">- {{ totalExpenses() | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Resultado Final</span>
                    <span class="text-sm font-black text-gray-900 uppercase">UTILIDAD BRUTA</span>
                  </div>
                  <span class="text-3xl font-black tabular-nums"
                        [class.text-emerald-600]="grossProfit() >= 0"
                        [class.text-red-600]="grossProfit() < 0">
                    {{ grossProfit() | currency:'USD':'symbol':'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Operational Expenses Summary -->
            <div *ngIf="routeData()?.status !== 'Cancelled' && routeData()?.status !== 'Planning'" 
                 class="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div class="p-8 border-b border-gray-50">
                <h2 class="text-xl font-black text-gray-900 mb-1">Gastos Operativos</h2>
                <p class="text-gray-400 text-xs font-medium">Resumen consolidado.</p>
              </div>
              <div class="p-8 space-y-6">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                      <mat-icon class="!text-sm">toll</mat-icon>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Peajes</span>
                  </div>
                  <span class="text-lg font-black text-gray-900">{{ expenseTotals().tolls | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <mat-icon class="!text-sm">local_gas_station</mat-icon>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Combustible</span>
                  </div>
                  <span class="text-lg font-black text-gray-900">{{ expenseTotals().fuel | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <mat-icon class="!text-sm">restaurant</mat-icon>
                    </div>
                    <span class="text-sm font-bold text-gray-500">Viáticos</span>
                  </div>
                  <span class="text-lg font-black text-gray-900">{{ expenseTotals().allowances | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span class="text-sm font-black text-gray-900">UTILIDAD BRUTA</span>
                  <span class="text-2xl font-black text-emerald-600">
                    {{ grossProfit() | currency:'USD':'symbol':'1.0-0' }}
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
  private dialog = inject(MatDialog);

  routeId = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  routeData = computed(() => 
    this.transportService.routes().find(r => r.id === this.routeId())
  );

  sortedOperations = computed(() => {
    const data = this.routeData();
    if (!data || !data.operations) return [];
    return [...data.operations].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  activeOperation = computed(() => {
    return this.routeData()?.operations.find(op => op.status === 'InProcess') || null;
  });

  vehicle = computed(() => {
    const activeOp = this.activeOperation();
    if (activeOp && activeOp.vehicleId) {
      return this.transportService.vehicles().find(v => v.id === activeOp.vehicleId) || null;
    }
    return null;
  });

  hasActiveOperation = computed(() => {
    return this.routeData()?.operations.some(op => op.status === 'InProcess') || false;
  });

  totalExpenses = computed(() => {
    const data = this.routeData();
    if (!data || !data.detailedExpenses) return 0;
    return data.detailedExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  });

  totalBilled = computed(() => {
    const data = this.routeData();
    if (!data) return 0;
    return (data.servicePrice || 0) + (data.standbyTotal || 0);
  });

  grossProfit = computed(() => {
    return this.totalBilled() - this.totalExpenses();
  });

  expenseTotals = computed(() => {
    const data = this.routeData();
    const summary = { tolls: 0, fuel: 0, allowances: 0, maintenance: 0, others: 0 };
    if (!data || !data.detailedExpenses) return summary;
    
    data.detailedExpenses.forEach(exp => {
      if (exp.type === 'Peaje') summary.tolls += exp.amount;
      if (exp.type === 'Combustible') summary.fuel += exp.amount;
      if (exp.type === 'Viáticos') summary.allowances += exp.amount;
      if (exp.type === 'Mantenimiento') summary.maintenance += exp.amount;
      if (exp.type === 'Otros') summary.others += exp.amount;
    });
    return summary;
  });

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Transporte', link: '/transport' }
  ];

  openOperationDialog() {
    this.dialog.open(TransportOperationDialogOrganism, {
      width: '600px',
      data: { 
        routeId: this.routeId(),
        vehicleId: this.routeData()?.vehicleId 
      },
      panelClass: 'custom-dialog-container'
    });
  }

  openExpenseDialog() {
    this.dialog.open(TransportExpenseDialogOrganism, {
      width: '600px',
      data: { routeId: this.routeId() },
      panelClass: 'custom-dialog-container'
    });
  }

  openChangeVehicleDialog() {
    this.dialog.open(TransportChangeVehicleDialogOrganism, {
      width: '600px',
      data: { routeId: this.routeId() },
      panelClass: 'custom-dialog-container'
    });
  }

  openIncidentDialog() {
    this.dialog.open(TransportIncidentDialogOrganism, {
      width: '600px',
      data: { routeId: this.routeId() },
      panelClass: 'custom-dialog-container'
    });
  }

  finishOperation(operationId: string) {
    this.dialog.open(TransportOperationClosureDialogOrganism, {
      width: '500px',
      data: { routeId: this.routeId(), operationId, status: 'Completed' },
      panelClass: 'custom-dialog-container'
    });
  }

  cancelOperation(operationId: string) {
    this.dialog.open(TransportOperationClosureDialogOrganism, {
      width: '500px',
      data: { routeId: this.routeId(), operationId, status: 'Cancelled' },
      panelClass: 'custom-dialog-container'
    });
  }

  getOperationIcon(type: string): string {
    switch(type) {
      case 'Cargue': return 'file_upload';
      case 'Descargue': return 'file_download';
      case 'Consolidacion': return 'view_module';
      case 'Desconsolidacion': return 'view_agenda';
      default: return 'settings_suggest';
    }
  }

  getExpenseIcon(type: string): string {
    switch(type) {
      case 'Peaje': return 'toll';
      case 'Combustible': return 'local_gas_station';
      case 'Viáticos': return 'restaurant';
      case 'Mantenimiento': return 'build';
      default: return 'receipt_long';
    }
  }

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

}
