import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { SupplierService } from '../../../../services/supplier.service';
import { Supplier } from '../../../../models/supplier.model';
import { SupplierDialogOrganism } from '../../../../components/organisms/supplier-dialog/supplier-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';

@Component({
  selector: 'app-inventory-suppliers-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    ButtonAtom,
    SupplierDialogOrganism,
    ConfirmDeleteDialogOrganism
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Configuración', link: '/inventory' },
          { label: 'Proveedores' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Proveedores</h1>
          <p class="text-gray-500 font-medium">Administra tus socios comerciales y fuentes de suministro.</p>
        </div>
        <ui-button 
          variant="primary"
          (clicked)="openSupplierDialog()"
        >
          <span class="material-icons mr-2">add</span>
          Nuevo Proveedor
        </ui-button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">search</span>
            <input 
              (input)="onNameFilterChange($event)" 
              placeholder="Buscar por nombre..." 
              class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
          </div>

          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">fingerprint</span>
            <input 
              (input)="onNitFilterChange($event)" 
              placeholder="Buscar por NIT..." 
              class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">NIT</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Nombre</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Dirección</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Teléfono</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (supplier of suppliers(); track supplier.id) {
              <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td class="px-6 py-5">
                  <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {{ supplier.nit }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="font-bold text-gray-900">{{ supplier.name }}</div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-gray-400 text-sm">location_on</span>
                    <span class="text-xs truncate max-w-[200px]">{{ supplier.address }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-gray-400 text-sm">phone</span>
                    <span class="text-xs font-bold">{{ supplier.phone }}</span>
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <ui-button variant="icon" (clicked)="openSupplierDialog(supplier)">
                    <span class="material-icons">edit</span>
                  </ui-button>
                  <ui-button variant="icon" (clicked)="confirmDelete(supplier)">
                    <span class="material-icons">delete</span>
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-icons text-5xl text-gray-200">business</span>
                    <h3 class="text-lg font-bold text-gray-400">No se encontraron proveedores</h3>
                    <p class="text-sm text-gray-300 max-w-xs">Aún no has registrado proveedores en tu sistema o los filtros aplicados no coinciden.</p>
                    <ui-button variant="primary" (clicked)="openSupplierDialog()">
                      <span class="material-icons mr-2">add</span>
                      Registrar Primer Proveedor
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
    @if (showSupplierDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" (click)="showSupplierDialog.set(false)">
        <div class="bg-white rounded-[40px] p-8 shadow-2xl w-full max-w-[600px]" (click)="$event.stopPropagation()">
          <app-supplier-dialog [data]="{ supplier: supplierDialogData() }" (closed)="onSupplierDialogClosed($event)" />
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
export class InventorySuppliersPageComponent implements OnInit {
  private supplierService = inject(SupplierService);

  suppliers = this.supplierService.suppliers;
  meta = this.supplierService.meta;
  
  nameFilter = signal('');
  nitFilter = signal('');

  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  // Dialog signals
  showSupplierDialog = signal(false);
  supplierDialogData = signal<Supplier | undefined>(undefined);
  showDeleteDialog = signal(false);
  deleteDialogData = signal<ConfirmDeleteData>({} as ConfirmDeleteData);
  pendingDeleteSupplierId = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  onNameFilterChange(event: Event) {
    this.nameFilter.set((event.target as HTMLInputElement).value);
    this.debouncedFilter();
  }

  onNitFilterChange(event: Event) {
    this.nitFilter.set((event.target as HTMLInputElement).value);
    this.debouncedFilter();
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
      nit: this.nitFilter() || ''
    };
    this.supplierService.loadSuppliers(params).subscribe();
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

  openSupplierDialog(supplier?: Supplier) {
    this.supplierDialogData.set(supplier);
    this.showSupplierDialog.set(true);
  }

  onSupplierDialogClosed(result: boolean) {
    this.showSupplierDialog.set(false);
    if (result) this.loadData();
  }

  confirmDelete(supplier: Supplier) {
    this.pendingDeleteSupplierId.set(supplier.id);
    this.deleteDialogData.set({ 
      title: '¿Eliminar proveedor?',
      message: 'Estás a punto de eliminar al proveedor',
      itemName: supplier.name,
      confirmText: 'Sí, eliminar definitivamente'
    } as ConfirmDeleteData);
    this.showDeleteDialog.set(true);
  }

  onDeleteDialogClosed(result: boolean) {
    this.showDeleteDialog.set(false);
    const id = this.pendingDeleteSupplierId();
    this.pendingDeleteSupplierId.set(null);
    if (result && id) {
      this.supplierService.deleteSupplier(id).subscribe(() => this.loadData());
    }
  }
}
