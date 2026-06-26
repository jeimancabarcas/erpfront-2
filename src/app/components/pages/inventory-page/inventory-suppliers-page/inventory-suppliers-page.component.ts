import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { SupplierService } from '../../../../services/supplier.service';
import { Supplier } from '../../../../models/supplier.model';
import { SupplierDialogOrganism } from '../../../../components/organisms/supplier-dialog/supplier-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { TextInputComponent } from '../../../../components/atoms/text-input/text-input.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';
import { TableComponent, TableColumn } from '../../../../components/atoms/table/table.component';
import { TableCellDirective } from '../../../../components/atoms/table/table-cell.directive';

@Component({
  selector: 'app-inventory-suppliers-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent,
    TableComponent,
    TableCellDirective
  ],
  template: `
      <app-breadcrumb 
        [items]="[
          { label: 'Abastecimiento', link: '/abastecimiento' },
          { label: 'Proveedores' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Proveedores</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Administra tus socios comerciales y fuentes de suministro.</p>
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
      <div class="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ui-text-input icon="search" placeholder="Buscar por nombre..." [value]="nameFilter()" (valueChange)="nameFilter.set($event); debouncedFilter()" />

          <ui-text-input icon="fingerprint" placeholder="Buscar por NIT..." [value]="nitFilter()" (valueChange)="nitFilter.set($event); debouncedFilter()" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <ui-table
          [columns]="tableColumns"
          [data]="suppliers()"
          [loading]="false"
          [clickable]="false"
          emptyMessage="No se encontraron proveedores"
          emptyIcon="business"
        >
          <!-- NIT -->
          <ng-template uiTableCell="nit" let-item>
            <span class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {{ item.nit }}
            </span>
          </ng-template>

          <!-- Name -->
          <ng-template uiTableCell="name" let-item>
            <div class="font-bold text-gray-900 dark:text-gray-100">{{ item.name }}</div>
          </ng-template>

          <!-- Address -->
          <ng-template uiTableCell="address" let-item>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-400 dark:text-gray-500 text-sm">location_on</span>
              <span class="text-xs text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{{ item.address }}</span>
            </div>
          </ng-template>

          <!-- Phone -->
          <ng-template uiTableCell="phone" let-item>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-400 dark:text-gray-500 text-sm">phone</span>
              <span class="text-xs font-bold text-gray-900 dark:text-gray-100">{{ item.phone }}</span>
            </div>
          </ng-template>

          <!-- Actions -->
          <ng-template uiTableCell="actions" let-item>
            <div class="flex justify-end" (click)="$event.stopPropagation()">
              <ui-button variant="icon" (clicked)="openSupplierDialog(item)">
                <span class="material-icons">edit</span>
              </ui-button>
              <ui-button variant="icon" (clicked)="confirmDelete(item)">
                <span class="material-icons">delete</span>
              </ui-button>
            </div>
          </ng-template>

          <!-- Empty state -->
          <ng-container empty>
            <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">Aún no has registrado proveedores en tu sistema o los filtros aplicados no coinciden.</p>
            <ui-button variant="primary" (clicked)="openSupplierDialog()">
              <span class="material-icons mr-2">add</span>
              Registrar Primer Proveedor
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
export class InventorySuppliersPageComponent implements OnInit {
  protected readonly tableColumns: TableColumn[] = [
    { key: 'nit', header: 'NIT' },
    { key: 'name', header: 'Nombre' },
    { key: 'address', header: 'Dirección' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'actions', header: '', width: '100px' },
  ];

  private dialog = inject(MatDialog);
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

  private pendingDeleteSupplierId: string | null = null;

  ngOnInit() {
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
    const ref = this.dialog.open(SupplierDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { supplier },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  confirmDelete(supplier: Supplier) {
    this.pendingDeleteSupplierId = supplier.id;
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: '¿Eliminar proveedor?',
        message: 'Estás a punto de eliminar al proveedor',
        itemName: supplier.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((result) => {
      const id = this.pendingDeleteSupplierId;
      this.pendingDeleteSupplierId = null;
      if (result && id) {
        this.supplierService.deleteSupplier(id).subscribe(() => this.loadData());
      }
    });
  }
}
