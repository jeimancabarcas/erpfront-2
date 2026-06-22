import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../models/product.model';
import { ProductFormMolecule } from '../../../../components/molecules/product-form/product-form.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { InventoryBatchDialogOrganism } from '../../../../components/organisms/inventory-batch-dialog/inventory-batch-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-inventory-products-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    ButtonAtom,
    CurrencyPipe
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Configuración', link: '/inventory' },
          { label: 'Productos' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Catálogo de Productos</h1>
          <p class="text-gray-500 font-medium">Gestiona la definición de tus productos, SKUs y categorías base.</p>
        </div>
        <ui-button 
          variant="primary"
          (clicked)="openProductDialog()"
        >
          <span class="material-icons mr-2">add</span>
          Nuevo Producto
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
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">fingerprint</span>
            <input 
              (input)="onSkuFilterChange($event)" 
              placeholder="Buscar por SKU..."
              class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            >
          </div>

          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">category</span>
            <select (change)="onCategoryFilterChange($event)" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
              <option value="">Todas las categorías</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{cat.name}}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">SKU</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Nombre</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Categoría</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Precios (Costo / Venta)</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">Stock</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td class="px-6 py-5">
                  <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {{ product.sku }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="font-bold text-gray-900">{{ product.name }}</div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span class="font-medium">{{ product.category?.name || 'Sin categoría' }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1">
                      <span class="text-[10px] text-gray-400 font-bold uppercase">Costo:</span>
                      <span class="font-bold text-gray-600 italic text-xs">{{ product.averagePurchasePrice | currency }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-[10px] text-indigo-400 font-black uppercase">Venta:</span>
                      <span class="font-black text-indigo-600">{{ product.sellingPrice | currency }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <span class="font-black text-base" [class]="getStockColor(product)">
                      {{ product.currentStock }}
                    </span>
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      Mín: {{ product.minStock }} | Máx: {{ product.maxStock }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5 text-right">
                  <ui-button variant="icon" (clicked)="openBatchesDialog(product)">
                    <span class="material-icons">history</span>
                  </ui-button>
                  <ui-button variant="icon" (clicked)="openProductDialog(product)">
                    <span class="material-icons">edit</span>
                  </ui-button>
                  <ui-button variant="icon" (clicked)="confirmDelete(product)">
                    <span class="material-icons">delete</span>
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-icons text-5xl text-gray-200">inventory_2</span>
                    <h3 class="text-lg font-bold text-gray-400">No se encontraron productos</h3>
                    <p class="text-sm text-gray-300 max-w-xs">Aún no has registrado productos en tu catálogo o los filtros aplicados no coinciden.</p>
                    <ui-button variant="primary" (clicked)="openProductDialog()">
                      <span class="material-icons mr-2">add</span>
                      Registrar Primer Producto
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
export class InventoryProductsPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  // Señales de datos
  products = this.productService.products;
  meta = this.productService.meta;
  categories = this.categoryService.categories;
  
  // Filtros
  nameFilter = signal('');
  skuFilter = signal('');
  categoryFilter = signal('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  private pendingDeleteProductId: string | null = null;

  ngOnInit() {
    this.loadData();
    
    // Cargar categorías si no están cargadas
    if (this.categories().length === 0) {
      this.categoryService.loadCategories({ limit: 100 }).subscribe();
    }
  }

  onNameFilterChange(event: Event) {
    this.nameFilter.set((event.target as HTMLInputElement).value);
    this.debouncedFilter();
  }

  onSkuFilterChange(event: Event) {
    this.skuFilter.set((event.target as HTMLInputElement).value);
    this.debouncedFilter();
  }

  onCategoryFilterChange(event: Event) {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
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
      sku: this.skuFilter() || '',
      categoryId: this.categoryFilter() || ''
    };
    this.productService.loadProducts(params).subscribe();
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

  getStockColor(product: Product): string {
    if (product.currentStock <= product.minStock) return 'text-red-600';
    if (product.currentStock <= product.minStock * 1.5) return 'text-amber-600';
    return 'text-emerald-600';
  }

  openProductDialog(product?: Product) {
    const ref = this.dialog.open(ProductFormMolecule, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { product },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  openBatchesDialog(product: Product) {
    this.dialog.open(InventoryBatchDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
      data: { product },
    });
  }

  confirmDelete(product: Product) {
    this.pendingDeleteProductId = product.id;
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: '¿Eliminar producto?',
        message: 'Estás a punto de eliminar el producto',
        itemName: product.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((result) => {
      const id = this.pendingDeleteProductId;
      this.pendingDeleteProductId = null;
      if (result && id) {
        this.productService.deleteProduct(id).subscribe(() => this.loadData());
      }
    });
  }
}

