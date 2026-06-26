import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { ButtonAtom } from '../../../atoms/button/button.component';
import { FinanceService } from '../../../../services/finance.service';
import { AdjustmentTableOrganism } from '../../../organisms/adjustment-table/adjustment-table.component';
import { AdjustmentNote } from '../../../../models/finance.model';

@Component({
  selector: 'app-finance-adjustments-view',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardLayoutComponent, 
    ButtonAtom,
    AdjustmentTableOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Notas Crédito y Débito</h1>
          <p class="text-gray-500 font-medium">Ajustes contables y devoluciones de facturación electrónica.</p>
        </div>
        <div class="flex gap-3">
          <ui-button 
            variant="primary" 
            (clicked)="openAdjustment('Credit')"
            class="rounded-full h-12 px-8 font-black bg-amber-500 text-white shadow-xl shadow-amber-100 hover:scale-105 transition-transform"
          >
            <span class="material-icons mr-2">remove_circle</span>
            Nueva Nota Crédito
          </ui-button>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Notas Crédito</p>
          <p class="text-2xl font-black text-amber-600 tabular-nums">{{ totalCredit() | currency:'USD':'symbol':'1.0-0' }}</p>
        </div>
      </div>

      <app-adjustment-table 
        [adjustments]="financeService.adjustments()"
        (viewNote)="viewAdjustment($event)"
      />
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceAdjustmentsViewComponent implements OnInit {
  public financeService = inject(FinanceService);

  totalCredit = computed(() => {
    return this.financeService.adjustments()
      .filter(a => a.type === 'Credit')
      .reduce((sum, a) => sum + a.amount, 0);
  });

  ngOnInit() {
    this.financeService.loadAdjustments().subscribe();
  }

  openAdjustment(type: 'Credit') {
    // Dialog functionality will be restored when dialog organisms are migrated
    this.financeService.loadAdjustments().subscribe();
  }

  viewAdjustment(note: AdjustmentNote) {
    // Dialog functionality will be restored when dialog organisms are migrated
  }
}
