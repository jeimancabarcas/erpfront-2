import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { CustomerService } from '../../../../services/customer.service';
import { Customer } from '../../../../models/customer.model';
import { CustomerDialogOrganism } from '../../../../components/organisms/customer-dialog/customer-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { RouterModule } from '@angular/router';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';

@Component({
  selector: 'app-sales-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    ButtonAtom,
    RouterModule,
    CustomerDialogOrganism,
    ConfirmDeleteDialogOrganism
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Ventas', link: '/sales' },
          { label: 'Clientes' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Gestión de Clientes</h1>
          <p class="text-gray-500 font-medium">Administra la base de datos de tus clientes y su información de contacto.</p>
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
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">search</span>
            <input 
              (input)="onNameFilterChange($event)" 
              placeholder="Buscar por nombre..."
              class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
          </div>

          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">badge</span>
            <input 
              (input)="onDocumentFilterChange($event)" 
              placeholder="Buscar por documento..."
              class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
          </div>

          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">filter_list</span>
            <select (change)="onStatusFilterChange($event)" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Identificación</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Nombre / Razón Social</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Contacto</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Estado</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (customer of customers(); track customer.id) {
              <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{{ customer.documentType }}</span>
                    <span class="font-bold text-gray-900">{{ customer.documentNumber }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 border border-gray-100">
                      <span class="material-icons">person</span>
                    </div>
                    <div>
                      <div class="font-bold text-gray-900">{{ customer.name }}</div>
                      <div class="text-xs text-gray-400 font-medium">{{ customer.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 text-xs text-gray-600">
                      <span class="material-icons !text-sm text-gray-400">phone</span>
                      {{ customer.phone || 'Sin teléfono' }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-600">
                      <span class="material-icons !text-sm text-gray-400">location_on</span>
                      <span class="line-clamp-1">{{ customer.address || 'Sin dirección' }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="customer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'"
                  >
                    {{ customer.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <a [routerLink]="['/sales/customers', customer.id]">
                    <ui-button variant="icon"><!-- TODO: add variant for colored icon button -->
                      <span class="material-icons">visibility</span>
                    </ui-button>
                  </a>
                  <ui-button variant="icon" (clicked)="openCustomerDialog(customer)">
                    <span class="material-icons">edit</span>
                  </ui-button>
                  <ui-button variant="icon" (clicked)="confirmDelete(customer)">
                    <span class="material-icons">delete</span>
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-icons text-5xl text-gray-200">people</span>
                    <h3 class="text-lg font-bold text-gray-400">No se encontraron clientes</h3>
                    <p class="text-sm text-gray-300 max-w-xs">Aún no tienes clientes registrados o los filtros no coinciden con ninguna búsqueda.</p>
                    <ui-button variant="primary" (clicked)="openCustomerDialog()">
                      <span class="material-icons mr-2">person_add</span>
                      Registrar Primer Cliente
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

    <!-- Inline Dialogs -->
    @if (showCustomerDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" (click)="showCustomerDialog.set(false)">
        <div class="bg-white rounded-[40px] p-8 shadow-2xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <app-customer-dialog [data]="{ customer: customerDialogData() }" (closed)="onCustomerDialogClosed($event)" />
        </div>
      </div>
    }

    @if (showDeleteDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" (click)="showDeleteDialog.set(false)">
        <div class="bg-white rounded-[40px] p-8 shadow-2xl w-full max-w-[400px]" (click)="$event.stopPropagation()">
          <app-confirm-delete-dialog [data]="deleteDialogData()" (closed)="onDeleteDialogClosed($event)" />
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesCustomersPageComponent implements OnInit {
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  meta = this.customerService.meta;

  // Filtros
  nameFilter = signal('');
  documentFilter = signal('');
  statusFilter = signal('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  // Dialog signals
  showCustomerDialog = signal(false);
  customerDialogData = signal<Customer | undefined>(undefined);
  showDeleteDialog = signal(false);
  deleteDialogData = signal<ConfirmDeleteData>({} as ConfirmDeleteData);
  pendingDeleteCustomerId = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  onNameFilterChange(event: Event) {
    this.nameFilter.set((event.target as HTMLInputElement).value);
    this.debouncedFilter();
  }

  onDocumentFilterChange(event: Event) {
    this.documentFilter.set((event.target as HTMLInputElement).value);
    this.debouncedFilter();
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
    this.customerDialogData.set(customer);
    this.showCustomerDialog.set(true);
  }

  onCustomerDialogClosed(result: boolean) {
    this.showCustomerDialog.set(false);
    if (result) this.loadData();
  }

  confirmDelete(customer: Customer) {
    this.pendingDeleteCustomerId.set(customer.id);
    this.deleteDialogData.set({ 
      title: '¿Eliminar cliente?',
      message: 'Estás a punto de eliminar el cliente',
      itemName: customer.name,
      confirmText: 'Sí, eliminar definitivamente'
    } as ConfirmDeleteData);
    this.showDeleteDialog.set(true);
  }

  onDeleteDialogClosed(result: boolean) {
    this.showDeleteDialog.set(false);
    const id = this.pendingDeleteCustomerId();
    this.pendingDeleteCustomerId.set(null);
    if (result && id) {
      this.customerService.deleteCustomer(id).subscribe(() => this.loadData());
    }
  }
}
