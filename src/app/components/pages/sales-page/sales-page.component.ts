import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../molecules/breadcrumb/breadcrumb.component';
import { InvoiceService } from '../../../services/invoice.service';
import { CustomerService } from '../../../services/customer.service';
import { Invoice } from '../../../models/invoice.model';
import { QueryParams } from '../../../models/pagination.model';
import { SaleFormMolecule } from '../../molecules/sale-form/sale-form.component';
import { InvoiceDetailDialogOrganism } from '../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../shared/constants/dialog.config';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Ventas' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Historial de Ventas</h1>
          <p class="text-gray-500 font-medium">Gestiona y consulta las facturas generadas por el sistema.</p>
        </div>
        <ui-button 
          variant="primary"
          (clicked)="openSaleForm()"
        >
          <span class="material-icons mr-2">add_shopping_cart</span>
          Nueva Venta
        </ui-button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ui-text-input icon="search" placeholder="Ej: FAC-0001" [value]="invoiceNumberFilter()" (valueChange)="invoiceNumberFilter.set($event); debouncedFilter()" />

          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">person</span>
            <select (change)="onCustomerFilterChange($event)" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
              <option value="">Todos los clientes</option>
              @for (customer of customers(); track customer.id) {
                <option [value]="customer.id">{{ customer.name }}</option>
              }
            </select>
          </div>

          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">filter_list</span>
            <select (change)="onStatusFilterChange($event)" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
              <option value="">Todos los estados</option>
              @for (status of statuses; track status.value) {
                <option [value]="status.value">{{ status.label }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">No. Factura</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Cliente</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Fecha</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total Neto</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Estado</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (inv of invoices(); track inv.id) {
              <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg text-xs tracking-tight border border-indigo-100/50">
                      {{ inv.invoiceNumber }}
                    </span>
                    @if (inv.isElectronic === false) {
                      <span data-testid="manual-badge" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                        MANUAL
                      </span>
                    }
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="font-bold text-gray-900">{{ inv.customer?.name }}</div>
                  <div class="text-[10px] text-gray-400 font-medium tracking-wide">{{ inv.customer?.documentNumber }}</div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-gray-500 text-xs font-medium">{{ inv.date | date:'dd MMM, yyyy' }}</span>
                </td>
                <td class="px-6 py-5 text-right">
                  <span class="font-black text-gray-900">{{ (inv.netTotal ?? inv.totalAmount) | currency }}</span>
                </td>
                <td class="px-6 py-5">
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-600': inv.status === 'PAID',
                      'bg-amber-50 text-amber-600': inv.status === 'DRAFT',
                      'bg-gray-100 text-gray-400': inv.status === 'CANCELLED'
                    }"
                  >
                    {{ statusLabels[inv.status] }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <ui-button variant="icon" (clicked)="viewDetail(inv)">
                    <span class="material-icons">visibility</span>
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-icons text-5xl text-gray-200">receipt_long</span>
                    <h3 class="text-lg font-bold text-gray-400">No se encontraron facturas</h3>
                    <p class="text-sm text-gray-300 max-w-xs">No hay registros que coincidan con los filtros seleccionados.</p>
                    <ui-button variant="primary" (clicked)="openSaleForm()">
                      <span class="material-icons mr-2">add</span>
                      Registrar Primera Venta
                    </ui-button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-50">
          <div class="flex items-center gap-2">
            <ui-button variant="ghost" size="sm" [disabled]="pageIndex() <= 1" (clicked)="onPageChange({pageIndex: pageIndex() - 2, pageSize: pageSize(), length: meta()?.total || 0})">
              Anterior
            </ui-button>
            <span class="text-xs font-bold text-gray-400">
              Página {{ pageIndex() }} de {{ totalPages() }}
            </span>
            <ui-button variant="ghost" size="sm" [disabled]="pageIndex() >= totalPages()" (clicked)="onPageChange({pageIndex: pageIndex(), pageSize: pageSize(), length: meta()?.total || 0})">
              Siguiente
            </ui-button>
          </div>
          <select (change)="onPageSizeChange($event)" class="text-xs font-bold text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
            <option value="5">5 / pág</option>
            <option value="10" selected>10 / pág</option>
            <option value="25">25 / pág</option>
            <option value="100">100 / pág</option>
          </select>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  // Señales
  invoices = this.invoiceService.invoices;
  meta = this.invoiceService.meta;
  customers = this.customerService.customers;
  
  // Filtros
  invoiceNumberFilter = signal('');
  customerFilter = signal('');
  statusFilter = signal('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('createdAt');
  order = signal<'ASC' | 'DESC'>('DESC');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  statuses = [
    { label: 'Pagada', value: 'PAID' },
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Anulada', value: 'CANCELLED' }
  ];

  statusLabels: any = {
    'PAID': 'Pagada',
    'DRAFT': 'Borrador',
    'CANCELLED': 'Anulada'
  };

  ngOnInit() {
    this.loadData();

    if (this.customers().length === 0) {
      this.customerService.loadCustomers({ limit: 100 }).subscribe();
    }
  }

  onCustomerFilterChange(event: Event) {
    this.customerFilter.set((event.target as HTMLSelectElement).value);
    this.pageIndex.set(1);
    this.loadData();
  }

  onStatusFilterChange(event: Event) {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.pageIndex.set(1);
    this.loadData();
  }

  private debouncedFilter() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.pageIndex.set(1);
      this.loadData();
    }, 400);
  }

  loadData() {
    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.order(),
      invoiceNumber: this.invoiceNumberFilter() || '',
      customerId: this.customerFilter() || '',
      status: this.statusFilter() || ''
    };
    this.invoiceService.loadInvoices(params).subscribe();
  }

  onPageChange(event: any) {
    if (event.pageSize) this.pageSize.set(event.pageSize);
    if (event.pageIndex !== undefined) this.pageIndex.set(event.pageIndex + 1);
    this.loadData();
  }

  onPageSizeChange(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.pageSize.set(parseInt(size));
    this.pageIndex.set(1);
    this.loadData();
  }

  onSortChange(sort: { column: string; order: 'ASC' | 'DESC' }) {
    this.sortBy.set(sort.column);
    this.order.set(sort.order);
    this.loadData();
  }

  openSaleForm() {
    const ref = this.dialog.open(SaleFormMolecule, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  viewDetail(invoice: Invoice) {
    const ref = this.dialog.open(InvoiceDetailDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.xl,
      panelClass: DIALOG_PANEL_CLASS,
      data: { invoiceId: invoice.id },
    });
    ref.afterClosed().subscribe(() => {
      this.loadData();
    });
  }

}

