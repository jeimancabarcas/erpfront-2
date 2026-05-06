import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../molecules/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableContainerMolecule } from '../../molecules/table-container/table-container.component';
import { EmptyStateAtom } from '../../atoms/empty-state/empty-state.component';
import { InvoiceService } from '../../../services/invoice.service';
import { CustomerService } from '../../../services/customer.service';
import { Invoice, InvoiceStatus } from '../../../models/invoice.model';
import { QueryParams } from '../../../models/pagination.model';
import { SaleFormMolecule } from '../../molecules/sale-form/sale-form.component';
import { InvoiceDetailDialogOrganism } from '../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';

@Component({
  selector: 'app-sales-page',
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
    MatInputModule,
    ReactiveFormsModule,
    TableContainerMolecule,
    EmptyStateAtom,
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
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openSaleForm()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <mat-icon class="mr-2">add_shopping_cart</mat-icon>
          Nueva Venta
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>No. Factura</mat-label>
            <input matInput [formControl]="invoiceNumberFilter" placeholder="Ej: FAC-0001">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Cliente</mat-label>
            <mat-select [formControl]="customerFilter">
              <mat-option [value]="''">Todos los clientes</mat-option>
              @for (customer of customers(); track customer.id) {
                <mat-option [value]="customer.id">{{ customer.name }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix class="!text-indigo-600 mr-2">person</mat-icon>
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
          <ng-container matColumnDef="invoiceNumber">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header>No. Factura</th>
            <td mat-cell *matCellDef="let inv" [class]="cellClass">
              <span class="font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg text-xs tracking-tight border border-indigo-100/50">
                {{ inv.invoiceNumber }}
              </span>
            </td>
          </ng-container>

          <!-- Cliente Column -->
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Cliente</th>
            <td mat-cell *matCellDef="let inv" [class]="cellClass">
              <div class="font-bold text-gray-900">{{ inv.customer?.name }}</div>
              <div class="text-[10px] text-gray-400 font-medium tracking-wide">{{ inv.customer?.documentNumber }}</div>
            </td>
          </ng-container>

          <!-- Fecha Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="date">Fecha</th>
            <td mat-cell *matCellDef="let inv" [class]="cellClass">
              <span class="text-gray-500 text-xs font-medium">{{ inv.date | date:'dd MMM, yyyy' }}</span>
            </td>
          </ng-container>

          <!-- Monto Column -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="totalAmount" class="text-right">Monto Total</th>
            <td mat-cell *matCellDef="let inv" [class]="cellClass" class="text-right">
              <span class="font-black text-gray-900">{{ inv.totalAmount | currency }}</span>
            </td>
          </ng-container>

          <!-- Estado Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header>Estado</th>
            <td mat-cell *matCellDef="let inv" [class]="cellClass">
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
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let inv" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button 
                  mat-icon-button 
                  (click)="viewDetail(inv)"
                  matTooltip="Ver detalle de factura"
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
                icon="receipt_long"
                title="No se encontraron facturas"
                description="No hay registros que coincidan con los filtros seleccionados."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openSaleForm()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Registrar Primera Venta
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
export class SalesPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  // Señales
  invoices = this.invoiceService.invoices;
  meta = this.invoiceService.meta;
  customers = this.customerService.customers;

  dataSource = new MatTableDataSource<Invoice>([]);
  displayedColumns = ['invoiceNumber', 'customer', 'date', 'amount', 'status', 'actions'];
  
  // Filtros
  invoiceNumberFilter = new FormControl('');
  customerFilter = new FormControl('');
  statusFilter = new FormControl('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('createdAt');
  order = signal<'ASC' | 'DESC'>('DESC');

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

  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    effect(() => {
      this.dataSource.data = this.invoices();
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();

    if (this.customers().length === 0) {
      this.customerService.loadCustomers({ limit: 100 }).subscribe();
    }
  }

  setupFilters() {
    const filters = [this.invoiceNumberFilter, this.customerFilter, this.statusFilter];
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
      invoiceNumber: this.invoiceNumberFilter.value || '',
      customerId: this.customerFilter.value || '',
      status: this.statusFilter.value || ''
    };
    this.invoiceService.loadInvoices(params).subscribe();
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex + 1);
    this.loadData();
  }

  onSortChange(sort: Sort) {
    this.sortBy.set(sort.active);
    this.order.set(sort.direction === 'desc' ? 'DESC' : 'ASC');
    this.loadData();
  }

  openSaleForm() {
    const dialogRef = this.dialog.open(SaleFormMolecule, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  viewDetail(invoice: Invoice) {
    this.dialog.open(InvoiceDetailDialogOrganism, {
      width: '950px',
      maxWidth: '95vw',
      data: { invoiceId: invoice.id }
    });
  }
}
