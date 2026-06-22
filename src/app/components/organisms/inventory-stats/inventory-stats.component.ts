import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../services/invoice.service';
import { InventoryService, ValuationStats } from '../../../services/inventory.service';
import { FinancialStats } from '../../../models/stats.model';
import { KpiCardMolecule } from '../../molecules/kpi-card/kpi-card.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventory-stats-organism',
  standalone: true,
  imports: [CommonModule, KpiCardMolecule, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      
      <!-- Inventory Valuation Card -->
      @if (valuation(); as v) {
        <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="flex items-center gap-5 md:col-span-1">
              <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                <mat-icon class="!text-[28px] !w-7 !h-7">inventory_2</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Valor del Inventario</p>
                <h4 class="text-3xl font-black text-gray-900 tracking-tighter">{{ v.totalValue | currency }}</h4>
              </div>
            </div>
            <div class="hidden md:block w-px bg-gray-100"></div>
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <mat-icon class="!text-[28px] !w-7 !h-7">category</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Productos en Stock</p>
                <h4 class="text-2xl font-black text-gray-900 tracking-tighter">{{ v.productCount }}</h4>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <mat-icon class="!text-[28px] !w-7 !h-7">inventory</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Unidades Totales</p>
                <h4 class="text-2xl font-black text-gray-900 tracking-tighter">{{ v.totalStock | number }}</h4>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <mat-icon class="!text-[28px] !w-7 !h-7">trending_up</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Costo Promedio</p>
                <h4 class="text-2xl font-black text-gray-900 tracking-tighter">{{ v.averageCostPerUnit | currency }}</h4>
              </div>
            </div>
          </div>
        </div>
      } @else if (!valuation() && !valuationLoading()) {
        <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
              <mat-icon class="!text-[28px] !w-7 !h-7">inventory_2</mat-icon>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Valor del Inventario</p>
              <p class="text-sm text-gray-400">Cargando datos de valuación...</p>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-[200px] bg-gray-50 rounded-[32px] animate-pulse border border-gray-100 flex flex-col p-6 space-y-4">
              <div class="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else if (stats(); as s) {
        <!-- Comparison Summary (Full Width) -->
        <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 animate-in fade-in slide-in-from-top-4 duration-700">
          <div class="flex items-center gap-6 text-center md:text-left">
            <div class="w-16 h-16 bg-indigo-50 rounded-3xl shadow-inner flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <mat-icon class="!text-[32px] !w-8 !h-8">analytics</mat-icon>
            </div>
            <div>
              <p class="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mb-2">Análisis de Desempeño</p>
              <h4 class="text-3xl font-black text-gray-900 leading-none tracking-tighter">Comparativa Intermensual</h4>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row items-center gap-10">
            <div class="text-center md:text-right">
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Variación Neta</p>
              <p class="text-3xl font-black tracking-tighter" [ngClass]="s.comparison.trend === 'UP' ? 'text-emerald-600' : 'text-rose-600'">
                {{ s.comparison.trend === 'UP' ? '+' : '' }}{{ s.comparison.difference | currency }}
              </p>
            </div>
            <div class="hidden md:block h-12 w-px bg-gray-100"></div>
            <div 
              class="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-2xl flex items-center gap-3"
              [ngClass]="s.comparison.trend === 'UP' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-rose-600 shadow-rose-200'"
            >
              <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">{{ s.comparison.trend === 'UP' ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ s.comparison.trend === 'UP' ? 'Crecimiento Positivo' : 'Tendencia a la Baja' }}
              <span class="ml-2 bg-white/20 px-2 py-0.5 rounded-lg border border-white/10">{{ s.comparison.percentage | number:'1.0-1' }}%</span>
            </div>
          </div>
        </div>

        <!-- KPI Breakdown Section -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <!-- Profit Card (Primary) -->
          <div class="lg:col-span-6">
            <div class="bg-emerald-600 rounded-[40px] p-10 text-white shadow-2xl shadow-emerald-200 h-full relative overflow-hidden group">
              <!-- Animated Background Patterns -->
              <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
              <div class="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl -ml-10 -mb-10 group-hover:scale-150 transition-transform duration-700"></div>

              <div class="relative z-10 flex flex-col h-full">
                <div class="flex justify-between items-start mb-12">
                  <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
                    <mat-icon class="!text-[32px] !w-8 !h-8">payments</mat-icon>
                  </div>
                  <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 px-4 py-2 bg-black/10 rounded-xl">Indicador Principal</div>
                </div>

                <div class="mt-auto">
                  <p class="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">Ganancia Neta del Mes</p>
                  <div class="flex items-baseline gap-4">
                    <h3 class="text-6xl font-black tracking-tighter">{{ s.currentMonth.profit | currency }}</h3>
                    <div class="text-emerald-200 text-sm font-bold opacity-60">NET PROFIT</div>
                  </div>
                  <p class="text-emerald-100/60 text-sm font-medium mt-6 max-w-xs leading-relaxed">
                    Beneficio real consolidado tras costos operativos de inventario.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Secondary Breakdown (Sales & Cost) -->
          <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <app-kpi-card-molecule 
              label="Ingresos Totales" 
              [value]="s.currentMonth.totalSales" 
              icon="shopping_cart"
              subtitle="Ventas brutas del periodo"
              iconBgClass="bg-indigo-50"
              iconColorClass="text-indigo-600"
            />

            <app-kpi-card-molecule 
              label="Costo de Ventas" 
              [value]="s.currentMonth.totalCost" 
              icon="inventory_2"
              subtitle="Valor del stock vendido"
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
            />

            <div class="sm:col-span-2 bg-indigo-50/50 rounded-[32px] p-8 border border-indigo-100/30 flex items-center gap-6">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <mat-icon>info</mat-icon>
              </div>
              <div>
                <p class="text-xs text-indigo-900 font-bold tracking-tight">Análisis de Costos</p>
                <p class="text-[10px] text-indigo-400 font-medium leading-relaxed mt-1">
                  Los costos de venta se calculan utilizando el método **FIFO** (Primero en entrar, primero en salir) para asegurar una valoración de inventario precisa y actualizada.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InventoryStatsOrganism implements OnInit {
  private invoiceService = inject(InvoiceService);
  private inventoryService = inject(InventoryService);
  
  stats = signal<FinancialStats | null>(null);
  loading = signal(true);
  valuation = signal<ValuationStats | null>(null);
  valuationLoading = signal(true);

  ngOnInit() {
    this.loadStats();
    this.loadValuation();
  }

  loadStats() {
    this.loading.set(true);
    this.invoiceService.getFinancialStats().subscribe({
      next: (res) => {
        this.stats.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadValuation() {
    this.valuationLoading.set(true);
    this.inventoryService.getValuation().subscribe({
      next: (res) => {
        this.valuation.set(res);
        this.valuationLoading.set(false);
      },
      error: () => this.valuationLoading.set(false)
    });
  }
}
