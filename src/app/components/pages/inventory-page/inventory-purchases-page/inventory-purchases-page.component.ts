import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { PurchaseOrderDialogOrganism } from '../../../../components/organisms/purchase-order-dialog/purchase-order-dialog.component';
import { PurchaseOrderDetailDialogOrganism } from '../../../../components/organisms/purchase-order-detail-dialog/purchase-order-detail-dialog.component';
import { PurchaseOrderService } from '../../../../services/purchase-order.service';
import { SupplierService } from '../../../../services/supplier.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../../models/purchase-order.model';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../../../components/atoms/select/select.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';
import { TableComponent, TableColumn } from '../../../../components/atoms/table/table.component';
import { TableCellDirective } from '../../../../components/atoms/table/table-cell.directive';

@Component({
  selector: 'app-inventory-purchases-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    SelectAtom,
    CurrencyPipe,
    DatePipe,
    TableComponent,
    TableCellDirective
  ],
  template: `
      <app-breadcrumb 
        [items]="[
          { label: 'Abastecimiento', link: '/abastecimiento' },
          { label: 'Compras' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Ordenes de Compra</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Gestiona y realiza seguimiento a tus pedidos a proveedores.</p>
        </div>
        <ui-button 
          variant="primary"
          (clicked)="openPurchaseOrderDialog()"
        >
          <span class="material-icons mr-2">add_shopping_cart</span>
          Nueva Orden de Compra
        </ui-button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ui-select label="Proveedor" placeholder="Todos los proveedores" [options]="supplierOptions()" [value]="supplierFilter()" (valueChange)="onSupplierFilterChange($event)" />

          <ui-select label="Estado" placeholder="Todos los estados" [options]="statusOptions" [value]="statusFilter()" (valueChange)="onStatusFilterChange($event)" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <ui-table
          [columns]="tableColumns"
          [data]="orders()"
          [loading]="false"
          [clickable]="false"
          emptyMessage="No se encontraron ordenes"
          emptyIcon="shopping_cart"
        >
          <!-- Order Number -->
          <ng-template uiTableCell="orderNumber" let-item>
            <span class="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-xs tracking-tight border border-indigo-100/50 dark:border-indigo-800/30">
              {{ item.orderNumber }}
            </span>
          </ng-template>

          <!-- Supplier -->
          <ng-template uiTableCell="supplier" let-item>
            <div class="font-bold text-gray-900 dark:text-gray-100">{{ item.supplier?.name }}</div>
            <div class="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">{{ item.supplier?.nit }}</div>
          </ng-template>

          <!-- Date -->
          <ng-template uiTableCell="date" let-item>
            <span class="text-gray-500 dark:text-gray-400 text-xs font-medium">{{ item.orderDate | date:'dd MMM, yyyy' }}</span>
          </ng-template>

          <!-- Items -->
          <ng-template uiTableCell="items" let-item>
            <span class="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-black">
              {{ item.items?.length || 0 }} productos
            </span>
          </ng-template>

          <!-- Status -->
          <ng-template uiTableCell="status" let-item>
            <span 
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              [ngClass]="{
                'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400': item.status === 'DRAFT',
                'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400': item.status === 'SENT',
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': item.status === 'IN_TRANSIT',
                'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400': item.status === 'COMPLETED',
                'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-500': item.status === 'CANCELLED'
              }"
            >
              {{ statusLabels[item.status] }}
            </span>
          </ng-template>

          <!-- Actions -->
          <ng-template uiTableCell="actions" let-item>
            <div class="flex justify-end" (click)="$event.stopPropagation()">
              <ui-button variant="icon" (clicked)="openPurchaseOrderDialog(item)">
                <span class="material-icons">edit</span>
              </ui-button>
              <ui-button variant="icon" (clicked)="openOrderDetailDialog(item)">
                <span class="material-icons">visibility</span>
              </ui-button>
            </div>
          </ng-template>

          <!-- Empty state -->
          <ng-container empty>
            <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">No hay registros que coincidan con los filtros seleccionados.</p>
            <ui-button variant="primary" (clicked)="openPurchaseOrderDialog()">
              <span class="material-icons mr-2">add_shopping_cart</span>
              Crear Nueva Orden
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
export class InventoryPurchasesPageComponent implements OnInit {
  protected readonly tableColumns: TableColumn[] = [
    { key: 'orderNumber', header: 'No. Orden' },
    { key: 'supplier', header: 'Proveedor' },
    { key: 'date', header: 'Fecha' },
    { key: 'items', header: 'Items' },
    { key: 'status', header: 'Estado' },
    { key: 'actions', header: '', width: '100px' },
  ];

  private dialog = inject(MatDialog);
  private purchaseOrderService = inject(PurchaseOrderService);
  private supplierService = inject(SupplierService);

  // Señales
  orders = this.purchaseOrderService.orders;
  meta = this.purchaseOrderService.meta;
  suppliers = this.supplierService.suppliers;
  
  // Filtros
  supplierFilter = signal('');
  statusFilter = signal('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('createdAt');
  order = signal<'ASC' | 'DESC'>('DESC');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  statusLabels: any = {
    'DRAFT': 'Borrador',
    'SENT': 'Enviado',
    'IN_TRANSIT': 'En Tránsito',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado'
  };

  ngOnInit() {
    this.loadData();

    if (this.suppliers().length === 0) {
      this.supplierService.loadSuppliers({ limit: 100 }).subscribe();
    }
  }

  supplierOptions = computed<SelectOption[]>(() =>
    this.suppliers().map(s => ({ value: s.id, label: s.name }))
  );

  statusOptions: SelectOption[] = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'SENT', label: 'Enviado' },
    { value: 'IN_TRANSIT', label: 'En Tránsito' },
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  onSupplierFilterChange(value: string) {
    this.supplierFilter.set(value);
    this.pageIndex.set(1);
    this.loadData();
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value);
    this.pageIndex.set(1);
    this.loadData();
  }

  loadData() {
    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.order(),
      supplierId: this.supplierFilter() || '',
      status: this.statusFilter() || ''
    };
    this.purchaseOrderService.loadOrders(params).subscribe();
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
    this.sortBy.set(sort.column === 'date' ? 'orderDate' : sort.column);
    this.order.set(sort.order);
    this.loadData();
  }

  openPurchaseOrderDialog(order?: PurchaseOrder) {
    const ref = this.dialog.open(PurchaseOrderDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
      data: { order },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  openOrderDetailDialog(order: PurchaseOrder) {
    const ref = this.dialog.open(PurchaseOrderDetailDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.xl,
      panelClass: DIALOG_PANEL_CLASS,
      data: { order },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }
}


