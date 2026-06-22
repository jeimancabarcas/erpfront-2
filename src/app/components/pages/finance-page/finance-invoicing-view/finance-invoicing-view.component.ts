import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { ButtonAtom } from '../../../atoms/button/button.component';
import { FinanceService } from '../../../../services/finance.service';
import { GeneralInvoiceTableOrganism } from '../../../organisms/general-invoice-table/general-invoice-table.component';
import { FinanceInvoice } from '../../../../models/finance.model';

@Component({
  selector: 'app-finance-invoicing-view',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    ButtonAtom,
    GeneralInvoiceTableOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Facturación Electrónica</h1>
          <p class="text-gray-500 font-medium">Gestión de facturas de venta para servicios generales.</p>
        </div>
        <div class="flex gap-3">
          <ui-button variant="outline" class="rounded-full h-12 px-6 font-bold border-gray-200 hover:bg-gray-50">
            <span class="material-icons mr-2">cloud_upload</span>
            Importar DIAN
          </ui-button>
          <ui-button 
            variant="primary" 
            (clicked)="openNewInvoice()"
            class="rounded-full h-12 px-8 font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
          >
            <span class="material-icons mr-2">add</span>
            Nueva Factura
          </ui-button>
        </div>
      </header>

      <!-- Filter Bar -->
      <div class="flex gap-4 mb-8">
        <div class="flex-1 relative">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Buscar por cliente o factura..." 
            class="w-full h-[56px] pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <ui-button variant="outline" class="rounded-2xl h-[56px] px-6 border-gray-200 hover:bg-gray-50 font-bold">
          <span class="material-icons mr-2 text-gray-400">filter_list</span>
          Filtros Avanzados
        </ui-button>
      </div>

      <app-general-invoice-table 
        [invoices]="financeService.invoices()"
        (onAction)="handleAction($event)"
      />
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceInvoicingViewComponent {
  public financeService = inject(FinanceService);

  openNewInvoice() {
    // Dialog functionality will be restored when dialog organisms are migrated
  }

  handleAction(event: { invoice: FinanceInvoice, action: string }) {
    // Dialog functionality will be restored when dialog organisms are migrated
  }
}
