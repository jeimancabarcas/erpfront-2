import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../molecules/breadcrumb/breadcrumb.component';
import { InvoiceService } from '../../../services/invoice.service';
import { CustomerService } from '../../../services/customer.service';
import { Invoice } from '../../../models/invoice.model';
import { QueryParams } from '../../../models/pagination.model';
import { SaleFormMolecule } from '../../molecules/sale-form/sale-form.component';
import { InvoiceDetailDialogOrganism } from '../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../shared/constants/dialog.config';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    CurrencyPipe,
    DatePipe,
    TableComponent,
    TableCellDirective
  ],
  template: `
      <app-breadcrumb 
        [items]="[
          { label: 'Gestión Comercial', link: '/comercial' },
          { label: 'Punto de venta (POS)' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Punto de venta (POS)</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Gestiona y consulta las facturas generadas por el sistema.</p>
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
      <div class="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ui-text-input icon="search" placeholder="Ej: FAC-0001" [value]="invoiceNumberFilter()" (valueChange)="invoiceNumberFilter.set($event); debouncedFilter()" />

          <ui-select placeholder="Todos los clientes" [options]="customerOptions()" [value]="customerFilter()" (valueChange)="onCustomerFilterChange($event)" />

          <ui-select placeholder="Todos los estados" [options]="statusOptions" [value]="statusFilter()" (valueChange)="onStatusFilterChange($event)" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <ui-table
          [columns]="tableColumns"
          [data]="invoices()"
          [loading]="false"
          [clickable]="true"
          emptyMessage="No se encontraron facturas"
          emptyIcon="receipt_long"
          (rowClick)="viewDetail($event)"
        >
          <!-- Invoice Number -->
          <ng-template uiTableCell="invoiceNumber" let-item>
            <div class="flex items-center gap-2">
              <span class="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-xs tracking-tight border border-indigo-100/50 dark:border-indigo-800/30">
                {{ item.invoiceNumber }}
              </span>
              @if (!item.emission) {
                <span data-testid="manual-badge" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  MANUAL
                </span>
              } @else {
                <span data-testid="electronic-badge" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  ELECTRÓNICA
                </span>
              }
            </div>
          </ng-template>

          <!-- Customer -->
          <ng-template uiTableCell="customer" let-item>
            <div class="font-bold text-gray-900 dark:text-gray-100">{{ item.customer?.name }}</div>
            <div class="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">{{ item.customer?.documentNumber }}</div>
          </ng-template>

          <!-- Date -->
          <ng-template uiTableCell="date" let-item>
            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">{{ item.date | date:'dd MMM, yyyy' }}</span>
          </ng-template>

          <!-- Due Date -->
          <ng-template uiTableCell="dueDate" let-item>
            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">
              {{ item.dueDate ? (item.dueDate | date:'dd MMM, yyyy') : '-' }}
            </span>
          </ng-template>

          <!-- Total -->
          <ng-template uiTableCell="totalAmount" let-item>
            <span class="font-black text-gray-900 dark:text-gray-100">{{ (item.netTotal ?? item.totalAmount) | currency }}</span>
          </ng-template>

          <!-- Status -->
          <ng-template uiTableCell="status" let-item>
            <span
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              [ngClass]="{
                'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400': item.status === 'PAID',
                'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400': item.status === 'DRAFT',
                'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500': item.status === 'CANCELLED',
                'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400': item.status === 'ON_CREDIT'
              }"
            >
              {{ statusLabels[item.status] }}
            </span>
          </ng-template>

          <!-- Actions -->
          <ng-template uiTableCell="actions" let-item>
            <div class="flex justify-end" (click)="$event.stopPropagation()">
              <ui-button variant="icon" (clicked)="viewDetail(item)">
                <span class="material-icons">visibility</span>
              </ui-button>
            </div>
          </ng-template>

          <!-- Empty state action -->
          <ng-container empty>
            <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">No hay registros que coincidan con los filtros seleccionados.</p>
            <ui-button variant="primary" (clicked)="openSaleForm()">
              <span class="material-icons mr-2">add</span>
              Registrar Primera Venta
            </ui-button>
          </ng-container>
        </ui-table>
        
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <ui-button variant="ghost" size="sm" [disabled]="pageIndex() <= 1" (clicked)="onPageChange({pageIndex: pageIndex() - 2, pageSize: pageSize(), length: meta()?.total || 0})">
              Anterior
            </ui-button>
            <span class="text-xs font-bold text-gray-400 dark:text-gray-500">
              Página {{ pageIndex() }} de {{ totalPages() }}
            </span>
            <ui-button variant="ghost" size="sm" [disabled]="pageIndex() >= totalPages()" (clicked)="onPageChange({pageIndex: pageIndex(), pageSize: pageSize(), length: meta()?.total || 0})">
              Siguiente
            </ui-button>
          </div>
          <select (change)="onPageSizeChange($event)" class="text-xs font-bold text-gray-500 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none">
            <option value="5">5 / pág</option>
            <option value="10" selected>10 / pág</option>
            <option value="25">25 / pág</option>
            <option value="100">100 / pág</option>
          </select>
        </div>
      </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  // ── Table columns ──
  protected readonly tableColumns: TableColumn[] = [
    { key: 'invoiceNumber', header: 'No. Factura' },
    { key: 'customer', header: 'Cliente' },
    { key: 'date', header: 'Fecha' },
    { key: 'dueDate', header: 'Vencimiento' },
    { key: 'totalAmount', header: 'Total Neto', align: 'right' },
    { key: 'status', header: 'Estado' },
    { key: 'actions', header: '', width: '60px' },
  ];

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

  customerOptions = computed<SelectOption[]>(() =>
    this.customers().map(c => ({ value: c.id, label: c.name }))
  );

  statusOptions: SelectOption[] = [
    { value: 'PAID', label: 'Pagada' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'CANCELLED', label: 'Anulada' },
    { value: 'ON_CREDIT', label: 'A Crédito' },
  ];

  statusLabels: any = {
    'PAID': 'Pagada',
    'DRAFT': 'Borrador',
    'CANCELLED': 'Anulada',
    'ON_CREDIT': 'A Crédito'
  };

  ngOnInit() {
    this.loadData();

    if (this.customers().length === 0) {
      this.customerService.loadCustomers({ limit: 100 }).subscribe();
    }
  }

  onCustomerFilterChange(value: string) {
    this.customerFilter.set(value);
    this.pageIndex.set(1);
    this.loadData();
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value);
    this.pageIndex.set(1);
    this.loadData();
  }

  protected debouncedFilter() {
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

