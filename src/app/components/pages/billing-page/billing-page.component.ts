import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { BillingService } from '../../../services/billing.service';
import { BillingFiltersMolecule } from '../../molecules/billing-filters/billing-filters.component';
import { BillingTableOrganism } from '../../organisms/billing-table/billing-table.component';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BillingFiltersMolecule,
    BillingTableOrganism,
    ButtonAtom
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div class="animate-in fade-in slide-in-from-left duration-700">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <span class="material-icons">receipt_long</span>
            </div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Módulo de Facturación</h1>
          </div>
          <p class="text-gray-500 font-medium">Gestión de cobros a prestadores, copagos y cartera pediátrica.</p>
        </div>
        
        <div class="flex gap-3 animate-in fade-in slide-in-from-right duration-700">
          <ui-button variant="outline">
            <span class="material-icons mr-2">file_download</span>
            Exportar RIPS
          </ui-button>
          <ui-button 
            variant="primary" 
            (clicked)="openNewInvoiceDialog()"
          >
            <span class="material-icons mr-2">add</span>
            Nueva Factura Manual
          </ui-button>
        </div>
      </header>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div class="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-[32px] w-8 h-8">pending_actions</span>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Por Facturar</p>
            <p class="text-2xl font-black text-gray-900">{{ pendingTotal() | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-[32px] w-8 h-8">outbox</span>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Facturado / Enviado</p>
            <p class="text-2xl font-black text-gray-900">{{ invoicedTotal() | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div class="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-[32px] w-8 h-8">account_balance_wallet</span>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Recaudado (Mes)</p>
            <p class="text-2xl font-black text-gray-900">{{ paidTotal() | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
        </div>
      </div>

      <app-billing-filters 
        [providers]="billingService.providers()"
        [(searchQuery)]="searchQuery"
        [(providerFilter)]="providerFilter"
        [(statusFilter)]="statusFilter"
      />

      <app-billing-table 
        [invoices]="filteredInvoices()"
        (invoiceAction)="handleSingleInvoice($event)"
        (bulkInvoiceAction)="handleBulkInvoice($event)"
        (markAsPaid)="handleMarkAsPaid($event)"
        (markPatientAsPaid)="handleMarkPatientAsPaid($event)"
      />
    </app-dashboard-layout>

    <!-- Inline notification -->
    @if (notification(); as notif) {
      <div
        class="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in fade-in slide-in-from-bottom duration-300"
        [ngClass]="notif.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ notif.message }}
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BillingPageComponent {
  billingService = inject(BillingService);

  notification = signal<{message: string; type: 'success' | 'error'} | null>(null);
  private notifTimeout: ReturnType<typeof setTimeout> | null = null;

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification.set({ message, type });
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    this.notifTimeout = setTimeout(() => this.notification.set(null), 3000);
  }

  // Filter Signals
  searchQuery = signal<string>('');
  providerFilter = signal<string>('all');
  statusFilter = signal<string>('all');

  // Computed Totals
  pendingTotal = computed(() => this.billingService.invoices()
    .filter(i => i.providerStatus === 'Pending')
    .reduce((acc, curr) => acc + curr.providerAmount, 0));
    
  invoicedTotal = computed(() => this.billingService.invoices()
    .filter(i => i.providerStatus === 'Invoiced')
    .reduce((acc, curr) => acc + curr.providerAmount, 0));

  paidTotal = computed(() => this.billingService.invoices()
    .filter(i => i.status === 'Paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0));

  // Filtered List
  filteredInvoices = computed(() => {
    let invoices = this.billingService.invoices();
    const query = this.searchQuery().toLowerCase().trim();
    const provider = this.providerFilter();
    const status = this.statusFilter();

    if (query) {
      invoices = invoices.filter(i => i.patientName.toLowerCase().includes(query) || i.id.toLowerCase().includes(query));
    }
    if (provider !== 'all') {
      invoices = invoices.filter(i => i.provider === provider);
    }
    if (status !== 'all') {
      invoices = invoices.filter(i => i.status === status);
    }

    return invoices;
  });

  openNewInvoiceDialog() {
    // Dialog functionality will be restored when dialog organisms are migrated
  }

  handleSingleInvoice(id: string) {
    this.billingService.invoiceProvider([id]);
    this.showNotification('Cobro generado y enviado al prestador');
  }

  handleBulkInvoice(ids: string[]) {
    this.billingService.invoiceProvider(ids);
    this.showNotification(`${ids.length} cobros generados exitosamente`);
  }

  handleMarkAsPaid(id: string) {
    this.billingService.markProviderAsPaid(id);
    this.showNotification('Factura marcada como pagada por el prestador');
  }

  handleMarkPatientAsPaid(id: string) {
    this.billingService.markPatientAsPaid(id);
    this.showNotification('Copago recaudado exitosamente');
  }
}
