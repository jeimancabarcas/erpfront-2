import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableContainerMolecule } from '../../../../components/molecules/table-container/table-container.component';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';
import { PurchaseOrderDialogOrganism } from '../../../../components/organisms/purchase-order-dialog/purchase-order-dialog.component';
import { PurchaseOrderService } from '../../../../services/purchase-order.service';
import { SupplierService } from '../../../../services/supplier.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../../models/purchase-order.model';
import { QueryParams } from '../../../../models/pagination.model';

@Component({
  selector: 'app-inventory-purchases-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TableContainerMolecule,
    EmptyStateAtom
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
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openPurchaseOrderDialog()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <mat-icon class="mr-2">add_shopping_cart</mat-icon>
          Nueva Orden de Compra
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Proveedor</mat-label>
            <mat-select [formControl]="supplierFilter">
              <mat-option [value]="''">Todos los proveedores</mat-option>
              @for (supplier of suppliers(); track supplier.id) {
                <mat-option [value]="supplier.id">{{ supplier.name }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix class="!text-indigo-600 mr-2">business</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Estado</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option [value]="''">Todos los estados</mat-option>
              @for (status of statuses; track status.value) {
                <mat-option [value]="status.value">{{ status.label }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix class="!text-indigo-600 mr-2">filter_list</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <app-table-container [hasData]="true">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)" class="w-full">
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="orderNumber">No. Orden</th>
            <td mat-cell *matCellDef="let order" [class]="cellClass">
              <span class="font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg text-xs tracking-tight border border-indigo-100/50">
                {{ order.orderNumber }}
              </span>
            </td>
          </ng-container>

          <!-- Proveedor Column -->
          <ng-container matColumnDef="supplier">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Proveedor</th>
            <td mat-cell *matCellDef="let order" [class]="cellClass">
              <div class="font-bold text-gray-900">{{ order.supplier?.name }}</div>
              <div class="text-[10px] text-gray-400 font-medium tracking-wide">{{ order.supplier?.nit }}</div>
            </td>
          </ng-container>

          <!-- Fecha Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="orderDate">Fecha</th>
            <td mat-cell *matCellDef="let order" [class]="cellClass">
              <span class="text-gray-500 text-xs font-medium">{{ order.orderDate | date:'dd MMM, yyyy' }}</span>
            </td>
          </ng-container>

          <!-- Items Column -->
          <ng-container matColumnDef="items">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Items</th>
            <td mat-cell *matCellDef="let order" [class]="cellClass">
              <span class="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black">
                {{ order.items?.length || 0 }} productos
              </span>
            </td>
          </ng-container>

          <!-- Estado Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="status">Estado</th>
            <td mat-cell *matCellDef="let order" [class]="cellClass">
              <span 
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                [ngClass]="{
                  'bg-amber-50 text-amber-600': order.status === 'DRAFT',
                  'bg-indigo-50 text-indigo-600': order.status === 'SENT',
                  'bg-emerald-50 text-emerald-600': order.status === 'IN_TRANSIT',
                  'bg-gray-50 text-gray-600': order.status === 'CANCELLED'
                }"
              >
                {{ statusLabels[order.status] }}
              </span>
            </td>
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let order" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button 
                  mat-icon-button 
                  (click)="openPurchaseOrderDialog(order)"
                  matTooltip="Editar orden"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  matTooltip="Ver detalles"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>visibility</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-12 text-center" [attr.colspan]="displayedColumns.length">
              <app-empty-state 
                icon="shopping_cart"
                title="No se encontraron ordenes"
                description="No hay registros que coincidan con los filtros seleccionados."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openPurchaseOrderDialog()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">add_shopping_cart</mat-icon>
                  Crear Nueva Orden
                </button>
              </app-empty-state>
            </td>
          </tr>
        </table>

        <mat-paginator 
          [length]="meta()?.total || 0"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex() - 1"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)"
          aria-label="Seleccionar página"
          class="!bg-transparent !border-t !border-gray-50"
        ></mat-paginator>
      </app-table-container>
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

  dataSource = new MatTableDataSource<PurchaseOrder>([]);
  displayedColumns = ['id', 'supplier', 'date', 'items', 'status', 'actions'];
  
  // Filtros
  supplierFilter = new FormControl('');
  statusFilter = new FormControl('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('createdAt');
  order = signal<'ASC' | 'DESC'>('DESC');

  statuses = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Enviado', value: 'SENT' },
    { label: 'En Tránsito', value: 'IN_TRANSIT' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

  statusLabels: any = {
    'DRAFT': 'Borrador',
    'SENT': 'Enviado',
    'IN_TRANSIT': 'En Tránsito',
    'CANCELLED': 'Cancelado'
  };

  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    effect(() => {
      this.dataSource.data = this.orders();
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();

    if (this.suppliers().length === 0) {
      this.supplierService.loadSuppliers({ limit: 100 }).subscribe();
    }
  }

  setupFilters() {
    const filters = [this.supplierFilter, this.statusFilter];
    filters.forEach(control => {
      control.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(() => {
        this.pageIndex.set(1);
        this.loadData();
      });
    });
  }

  loadData() {
    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.order(),
      supplierId: this.supplierFilter.value || '',
      status: this.statusFilter.value || ''
    };
    this.purchaseOrderService.loadOrders(params).subscribe();
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex + 1);
    this.loadData();
  }

  onSortChange(sort: Sort) {
    this.sortBy.set(sort.active === 'date' ? 'orderDate' : sort.active);
    this.order.set(sort.direction === 'desc' ? 'DESC' : 'ASC');
    this.loadData();
  }

  openPurchaseOrderDialog(order?: PurchaseOrder) {
    const dialogRef = this.dialog.open(PurchaseOrderDialogOrganism, {
      width: '900px',
      maxWidth: '95vw',
      data: { order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }
}


