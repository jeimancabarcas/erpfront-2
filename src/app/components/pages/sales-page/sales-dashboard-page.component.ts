import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { InvoiceService } from '../../../services/invoice.service';
import { FinancialStats, TopProductItem } from '../../../models/stats.model';
import { KpiCardMolecule } from '../../molecules/kpi-card/kpi-card.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sales-dashboard-page',
  standalone: true,
  imports: [CommonModule, KpiCardMolecule, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">

      <!-- Header / Breadcrumb -->
      <div class="flex flex-col gap-1">
        <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          Gestión Comercial / Dashboard de Ventas
        </p>
        <h2 class="text-3xl font-black text-gray-900 tracking-tighter">
          Dashboard de Ventas
        </h2>
        <p class="text-sm text-gray-500 max-w-lg">
          KPIs financieros y análisis de productos en tiempo real.
        </p>
      </div>

      @if (loading()) {
        <!-- Loading Skeleton -->
        <div class="space-y-6">
          <div class="h-[120px] bg-gray-50 rounded-[40px] animate-pulse border border-gray-100"></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="h-[280px] bg-gray-50 rounded-[40px] animate-pulse border border-gray-100"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              @for (i of [1,2,3]; track i) {
                <div class="h-[160px] bg-gray-50 rounded-[32px] animate-pulse border border-gray-100"></div>
              }
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            @for (i of [1,2]; track i) {
              <div class="h-[260px] bg-gray-50 rounded-[40px] animate-pulse border border-gray-100"></div>
            }
          </div>
        </div>
      } @else if (stats(); as s) {
        <!-- SECCIÓN 1: Comparativa Intermensual (full width) -->
        <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
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

        <!-- SECCIÓN 2: KPIs Financieros + Análisis de Costos -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          <!-- Ganancia Neta (Hero Card) -->
          <div class="lg:col-span-6">
            <div class="bg-emerald-600 rounded-[40px] p-10 text-white shadow-2xl shadow-emerald-200 h-full relative overflow-hidden group">
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

          <!-- KPIs Secundarios + Análisis de Costos -->
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
                  Los costos de venta se calculan utilizando el método <strong>FIFO</strong> (Primero en entrar, primero en salir) para asegurar una valoración de inventario precisa y actualizada.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: Top & Bottom Products -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Top 5 Más Vendidos -->
          <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">Top 5</p>
                <h4 class="text-lg font-black text-gray-900 tracking-tight">Productos Más Vendidos</h4>
              </div>
            </div>

            @if (topProducts().length === 0) {
              <div class="text-center py-8 text-gray-400">
                <mat-icon class="!text-[40px] !w-10 !h-10 mb-2 opacity-30">inventory_2</mat-icon>
                <p class="text-sm font-medium">Sin datos de ventas este mes</p>
              </div>
            } @else {
              <div class="space-y-1">
                @for (p of topProducts(); track p.productId; let i = $index) {
                  <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200"
                       [ngClass]="i === 0 ? 'bg-emerald-50/50' : ''">
                    <div class="flex items-center gap-4 min-w-0">
                      <span class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                            [ngClass]="i === 0 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'">
                        {{ i + 1 }}
                      </span>
                      <span class="text-sm font-bold text-gray-900 truncate">{{ p.productName }}</span>
                    </div>
                    <div class="flex items-center gap-6 flex-shrink-0 ml-4">
                      <span class="text-xs text-gray-400 font-medium">{{ p.totalSold | number }} uds.</span>
                      <span class="text-sm font-black text-gray-900 w-24 text-right">{{ p.totalRevenue | currency }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Bottom 5 Menos Vendidos -->
          <div class="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                <mat-icon>trending_down</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-rose-600 font-black uppercase tracking-[0.2em]">Bottom 5</p>
                <h4 class="text-lg font-black text-gray-900 tracking-tight">Productos Menos Vendidos</h4>
              </div>
            </div>

            @if (bottomProducts().length === 0) {
              <div class="text-center py-8 text-gray-400">
                <mat-icon class="!text-[40px] !w-10 !h-10 mb-2 opacity-30">inventory_2</mat-icon>
                <p class="text-sm font-medium">Sin datos de ventas este mes</p>
              </div>
            } @else {
              <div class="space-y-1">
                @for (p of bottomProducts(); track p.productId; let i = $index) {
                  <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                    <div class="flex items-center gap-4 min-w-0">
                      <span class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black bg-gray-100 text-gray-500">
                        {{ i + 1 }}
                      </span>
                      <span class="text-sm font-bold text-gray-900 truncate">{{ p.productName }}</span>
                    </div>
                    <div class="flex items-center gap-6 flex-shrink-0 ml-4">
                      <span class="text-xs text-gray-400 font-medium">{{ p.totalSold | number }} uds.</span>
                      <span class="text-sm font-black text-gray-900 w-24 text-right">{{ p.totalRevenue | currency }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesDashboardPageComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  stats = signal<FinancialStats | null>(null);
  topProducts = signal<TopProductItem[]>([]);
  bottomProducts = signal<TopProductItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    forkJoin({
      financial: this.invoiceService.getFinancialStats(),
      top: this.invoiceService.getTopProducts(5),
      bottom: this.invoiceService.getBottomProducts(5),
    }).subscribe({
      next: (result) => {
        this.stats.set(result.financial);
        this.topProducts.set(result.top);
        this.bottomProducts.set(result.bottom);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
