import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../models/product.model';
import { ProductFormMolecule } from '../../../../components/molecules/product-form/product-form.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { InventoryBatchDialogOrganism } from '../../../../components/organisms/inventory-batch-dialog/inventory-batch-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { TextInputComponent } from '../../../../components/atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../../../components/atoms/select/select.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-inventory-products-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    CurrencyPipe
  ],
  template: `
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Configuración', link: '/inventory' },
          { label: 'Productos' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Catálogo de Productos</h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Gestiona la definición de tus productos, SKUs y categorías base.</p>
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
      <div class="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ui-text-input icon="search" placeholder="Buscar por nombre..." [value]="nameFilter()" (valueChange)="nameFilter.set($event); debouncedFilter()" />

          <ui-text-input icon="fingerprint" placeholder="Buscar por SKU..." [value]="skuFilter()" (valueChange)="skuFilter.set($event); debouncedFilter()" />

          <ui-select placeholder="Todas las categorías" [options]="categoryOptions()" [value]="categoryFilter()" (valueChange)="onCategoryFilterChange($event)" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">SKU</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">Nombre</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">Categoría</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">Precios (Costo / Venta)</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">Stock</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800">
                <td class="px-6 py-5">
                  <span class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {{ product.sku }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="font-bold text-gray-900 dark:text-gray-100">{{ product.name }}</div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"></div>
                    <span class="font-medium text-gray-600 dark:text-gray-400">{{ product.category?.name || 'Sin categoría' }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1">
                      <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Costo:</span>
                      <span class="font-bold text-gray-600 dark:text-gray-400 italic text-xs">{{ product.averagePurchasePrice | currency }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-[10px] text-indigo-400 dark:text-indigo-500 font-black uppercase">Venta:</span>
                      <span class="font-black text-indigo-600 dark:text-indigo-400">{{ product.sellingPrice | currency }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <span class="font-black text-base" [class]="getStockColor(product)">
                      {{ product.currentStock }}
                    </span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">
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
                    <span class="material-icons text-5xl text-gray-200 dark:text-gray-600">inventory_2</span>
                    <h3 class="text-lg font-bold text-gray-400 dark:text-gray-500">No se encontraron productos</h3>
                    <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">Aún no has registrado productos en tu catálogo o los filtros aplicados no coinciden.</p>
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

  categoryOptions = computed<SelectOption[]>(() =>
    this.categories().map(cat => ({ value: cat.id, label: cat.name }))
  );

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

  onCategoryFilterChange(value: string) {
    this.categoryFilter.set(value);
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
    if (product.currentStock <= product.minStock) return 'text-red-600 dark:text-red-400';
    if (product.currentStock <= product.minStock * 1.5) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
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

