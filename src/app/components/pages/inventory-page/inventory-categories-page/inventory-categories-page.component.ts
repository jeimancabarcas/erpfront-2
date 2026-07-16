import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { InventoryCategoryDialogOrganism } from '../../../../components/organisms/inventory-category-dialog/inventory-category-dialog.component';
import { CategoryService, InventoryCategory } from '../../../../services/category.service';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { TextInputComponent } from '../../../../components/atoms/text-input/text-input.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-inventory-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TextInputComponent
  ],
  template: `
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Configuración', link: '/inventory' },
          { label: 'Categorías' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Categorías de Productos</h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Gestiona y organiza tu inventario con filtros y paginación dinámica.</p>
        </div>
        <ui-button 
          variant="primary"
          (clicked)="openCategoryDialog()"
        >
          <span class="material-icons mr-2">add</span>
          Nueva Categoría
        </ui-button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white dark:bg-gray-900 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <ui-text-input icon="search" placeholder="Buscar categorías..." [value]="nameFilter()" (valueChange)="nameFilter.set($event); debouncedFilter()" />
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left cursor-pointer">Nombre</th>
              <th class="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left cursor-pointer">Productos</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (category of categories(); track category.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <span class="material-icons text-indigo-600 dark:text-indigo-400">category</span>
                    </div>
                    <div>
                      <div class="font-bold text-gray-900 dark:text-gray-100">{{ category.name }}</div>
                      <div class="text-xs text-gray-400 dark:text-gray-500 font-medium line-clamp-1">{{ category.description || 'Sin descripción' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold">
                    {{ category.productsCount || 0 }} productos
                  </span>
                </td>
                <td class="px-6 py-5 text-right">
                  <ui-button variant="icon" (clicked)="openCategoryDialog(category)">
                    <span class="material-icons">edit</span>
                  </ui-button>
                  <ui-button variant="icon" (clicked)="confirmDelete(category)">
                    <span class="material-icons">delete</span>
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <span class="material-icons text-5xl text-gray-200 dark:text-gray-600">category</span>
                    <h3 class="text-lg font-bold text-gray-400 dark:text-gray-500">No se encontraron categorías</h3>
                    <p class="text-sm text-gray-300 dark:text-gray-600 max-w-xs">Aún no has creado categorías para tus productos o los filtros aplicados no coinciden con ningún registro.</p>
                    <ui-button variant="primary" (clicked)="openCategoryDialog()">
                      <span class="material-icons mr-2">add</span>
                      Crear Primera Categoría
                    </ui-button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Paginador -->
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
          <select
            [value]="pageSize()"
            (change)="onPageSizeChange($event)"
            class="text-xs font-bold text-gray-500 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="5">5 / pág</option>
            <option value="10">10 / pág</option>
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
export class InventoryCategoriesPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private categoryService = inject(CategoryService);
  
  // Señales de datos y meta
  categories = this.categoryService.categories;
  meta = this.categoryService.meta;

  // Señales de estado local para la consulta
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal<string>('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  // Controles para filtros
  nameFilter = signal('');

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  private pendingDeleteCategoryId: string | null = null;

  ngOnInit() {
    this.loadData();
  }

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

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
      name: this.nameFilter() || ''
    };
    this.categoryService.loadCategories(params).subscribe();
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

  openCategoryDialog(category?: InventoryCategory) {
    const ref = this.dialog.open(InventoryCategoryDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: { category },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  confirmDelete(category: InventoryCategory) {
    this.pendingDeleteCategoryId = category.id;
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: '¿Eliminar categoría?',
        message: 'Estás a punto de eliminar la categoría',
        itemName: category.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((result) => {
      const id = this.pendingDeleteCategoryId;
      this.pendingDeleteCategoryId = null;
      if (result && id) {
        this.categoryService.deleteCategory(id).subscribe(() => this.loadData());
      }
    });
  }
}
