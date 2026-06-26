import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { CustomerService } from '../../../../services/customer.service';
import { Customer } from '../../../../models/customer.model';
import { CustomerDialogOrganism } from '../../../../components/organisms/customer-dialog/customer-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { RouterModule } from '@angular/router';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { TextInputComponent } from '../../../../components/atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../../../components/atoms/select/select.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';
import { TableComponent, TableColumn } from '../../../../components/atoms/table/table.component';
import { TableCellDirective } from '../../../../components/atoms/table/table-cell.directive';

@Component({
  selector: 'app-sales-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    RouterModule,
    TableComponent,
    TableCellDirective
  ],
  template: `
      <app-breadcrumb 
        [items]="[
          { label: 'Ventas', link: '/comercial/sales' },
          { label: 'Clientes' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Gestión de Clientes</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Administra la base de datos de tus clientes y su información de contacto.</p>
        </div>
        <ui-button 
          variant="primary"
          (clicked)="openCustomerDialog()"
        >
          <span class="material-icons mr-2">person_add</span>
          Nuevo Cliente
        </ui-button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ui-text-input icon="search" placeholder="Buscar por nombre..." [value]="nameFilter()" (valueChange)="nameFilter.set($event); debouncedFilter()" />

          <ui-text-input icon="badge" placeholder="Buscar por documento..." [value]="documentFilter()" (valueChange)="documentFilter.set($event); debouncedFilter()" />

          <ui-select placeholder="Todos los estados" [options]="statusOptions" [value]="statusFilter()" (valueChange)="onStatusFilterChange($event)" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <ui-table
          [columns]="tableColumns"
          [data]="customers()"
          [loading]="false"
          [clickable]="false"
          emptyMessage="No se encontraron clientes"
          emptyIcon="people"
        >
          <!-- Document -->
          <ng-template uiTableCell="document" let-item>
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{{ item.documentType }}</span>
              <span class="font-bold text-gray-900 dark:text-gray-100">{{ item.documentNumber }}</span>
            </div>
          </ng-template>

          <!-- Name -->
          <ng-template uiTableCell="name" let-item>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-gray-700">
                <span class="material-icons">person</span>
              </div>
              <div>
                <div class="font-bold text-gray-900 dark:text-gray-100">{{ item.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500 font-medium">{{ item.email }}</div>
              </div>
            </div>
          </ng-template>

          <!-- Contact -->
          <ng-template uiTableCell="contact" let-item>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span class="material-icons !text-sm text-gray-400 dark:text-gray-500">phone</span>
                {{ item.phone || 'Sin teléfono' }}
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span class="material-icons !text-sm text-gray-400 dark:text-gray-500">location_on</span>
                <span class="line-clamp-1">{{ item.address || 'Sin dirección' }}</span>
              </div>
            </div>
          </ng-template>

          <!-- Status -->
          <ng-template uiTableCell="status" let-item>
            <span 
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              [ngClass]="item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'"
            >
              {{ item.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
            </span>
          </ng-template>

          <!-- Actions -->
          <ng-template uiTableCell="actions" let-item>
            <div class="flex justify-end" (click)="$event.stopPropagation()">
              <a [routerLink]="['/comercial/customers', item.id]">
                <ui-button variant="icon">
                  <span class="material-icons">visibility</span>
                </ui-button>
              </a>
              <ui-button variant="icon" (clicked)="openCustomerDialog(item)">
                <span class="material-icons">edit</span>
              </ui-button>
              <ui-button variant="icon" (clicked)="confirmDelete(item)">
                <span class="material-icons">delete</span>
              </ui-button>
            </div>
          </ng-template>

          <!-- Empty state -->
          <ng-container empty>
            <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">Aún no tienes clientes registrados o los filtros no coinciden con ninguna búsqueda.</p>
            <ui-button variant="primary" (clicked)="openCustomerDialog()">
              <span class="material-icons mr-2">person_add</span>
              Registrar Primer Cliente
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
export class SalesCustomersPageComponent implements OnInit {
  protected readonly tableColumns: TableColumn[] = [
    { key: 'document', header: 'Identificación' },
    { key: 'name', header: 'Nombre / Razón Social' },
    { key: 'contact', header: 'Contacto' },
    { key: 'status', header: 'Estado' },
    { key: 'actions', header: '', width: '140px' },
  ];

  private dialog = inject(MatDialog);
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  meta = this.customerService.meta;

  // Filtros
  nameFilter = signal('');
  documentFilter = signal('');
  statusFilter = signal('');

  statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  private pendingDeleteCustomerId: string | null = null;

  ngOnInit() {
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
      name: this.nameFilter() || '',
      documentNumber: this.documentFilter() || '',
      status: this.statusFilter() || ''
    };
    this.customerService.loadCustomers(params).subscribe();
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

  openCustomerDialog(customer?: Customer) {
    const ref = this.dialog.open(CustomerDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { customer: customer },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  confirmDelete(customer: Customer) {
    this.pendingDeleteCustomerId = customer.id;
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: { 
        title: '¿Eliminar cliente?',
        message: 'Estás a punto de eliminar el cliente',
        itemName: customer.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((result) => {
      const id = this.pendingDeleteCustomerId;
      this.pendingDeleteCustomerId = null;
      if (result && id) {
        this.customerService.deleteCustomer(id).subscribe(() => this.loadData());
      }
    });
  }
}
