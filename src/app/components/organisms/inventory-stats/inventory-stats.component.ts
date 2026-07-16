import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, ValuationStats } from '../../../services/inventory.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventory-stats-organism',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      
      <!-- Inventory Valuation Card -->
      @if (valuation(); as v) {
        <div class="bg-white dark:bg-gray-900 rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none group hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-900/10 transition-all duration-500">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="flex items-center gap-5 md:col-span-1">
              <div class="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                <mat-icon class="!text-[28px] !w-7 !h-7">inventory_2</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Valor del Inventario</p>
                <h4 class="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{{ v.totalValue | currency }}</h4>
              </div>
            </div>
            <div class="hidden md:block w-px bg-gray-100 dark:bg-gray-800"></div>
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <mat-icon class="!text-[28px] !w-7 !h-7">category</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Productos en Stock</p>
                <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{{ v.productCount }}</h4>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <mat-icon class="!text-[28px] !w-7 !h-7">inventory</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Unidades Totales</p>
                <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{{ v.totalStock | number }}</h4>
              </div>
            </div>
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <mat-icon class="!text-[28px] !w-7 !h-7">trending_up</mat-icon>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Costo Promedio</p>
                <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{{ v.averageCostPerUnit | currency }}</h4>
              </div>
            </div>
          </div>
        </div>
      } @else if (!valuation() && !valuationLoading()) {
        <div class="bg-white dark:bg-gray-900 rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500">
              <mat-icon class="!text-[28px] !w-7 !h-7">inventory_2</mat-icon>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">Valor del Inventario</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">Cargando datos de valuación...</p>
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
  private inventoryService = inject(InventoryService);
  
  valuation = signal<ValuationStats | null>(null);
  valuationLoading = signal(true);

  ngOnInit() {
    this.loadValuation();
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
