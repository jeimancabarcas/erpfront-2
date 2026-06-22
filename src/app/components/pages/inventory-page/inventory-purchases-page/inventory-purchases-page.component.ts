import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { PurchaseOrderDialogOrganism } from '../../../../components/organisms/purchase-order-dialog/purchase-order-dialog.component';
import { PurchaseOrderDetailDialogOrganism } from '../../../../components/organisms/purchase-order-detail-dialog/purchase-order-detail-dialog.component';
import { PurchaseOrderService } from '../../../../services/purchase-order.service';
import { SupplierService } from '../../../../services/supplier.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../../models/purchase-order.model';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-inventory-purchases-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    ButtonAtom,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Compras' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Ordenes de Compra</h1>
          <p class="text-gray-500 font-medium">Gestiona y realiza seguimiento a tus pedidos a proveedores.</p>
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
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Proveedor</label>
            <div class="relative">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">business</span>
              <select (change)="onSupplierFilterChange($event)" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
                <option value="">Todos los proveedores</option>
                @for (supplier of suppliers(); track supplier.id) {
                  <option [value]="supplier.id">{{ supplier.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Estado</label>
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
      </div>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">No. Orden</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Proveedor</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Fecha</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Items</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Estado</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td class="px-6 py-5">
                  <span class="font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg text-xs tracking-tight border border-indigo-100/50">
                    {{ order.orderNumber }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="font-bold text-gray-900">{{ order.supplier?.name }}</div>
                  <div class="text-[10px] text-gray-400 font-medium tracking-wide">{{ order.supplier?.nit }}</div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-gray-500 text-xs font-medium">{{ order.orderDate | date:'dd MMM, yyyy' }}</span>
                </td>
                <td class="px-6 py-5">
                  <span class="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black">
                    {{ order.items?.length || 0 }} productos
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="{
                      'bg-amber-50 text-amber-600': order.status === 'DRAFT',
                      'bg-indigo-50 text-indigo-600': order.status === 'SENT',
                      'bg-amber-100 text-amber-700': order.status === 'IN_TRANSIT',
                      'bg-emerald-50 text-emerald-600': order.status === 'COMPLETED',
                      'bg-gray-50 text-gray-600': order.status === 'CANCELLED'
                    }"
                  >
                    {{ statusLabels[order.status] }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <ui-button variant="icon" (clicked)="openPurchaseOrderDialog(order)">
                    <span class="material-icons">edit</span>
                  </ui-button>
                  <ui-button variant="icon" (clicked)="openOrderDetailDialog(order)">
                    <span class="material-icons">visibility</span>
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-icons text-5xl text-gray-200">shopping_cart</span>
                    <h3 class="text-lg font-bold text-gray-400">No se encontraron ordenes</h3>
                    <p class="text-sm text-gray-300 max-w-xs">No hay registros que coincidan con los filtros seleccionados.</p>
                    <ui-button variant="primary" (clicked)="openPurchaseOrderDialog()">
                      <span class="material-icons mr-2">add_shopping_cart</span>
                      Crear Nueva Orden
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
export class InventoryPurchasesPageComponent implements OnInit {
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

  statuses = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Enviado', value: 'SENT' },
    { label: 'En Tránsito', value: 'IN_TRANSIT' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

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

  onSupplierFilterChange(event: Event) {
    this.supplierFilter.set((event.target as HTMLSelectElement).value);
    this.pageIndex.set(1);
    this.loadData();
  }

  onStatusFilterChange(event: Event) {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
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


