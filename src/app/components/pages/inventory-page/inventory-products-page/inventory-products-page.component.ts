import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableContainerMolecule } from '../../../../components/molecules/table-container/table-container.component';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../models/product.model';
import { ProductFormMolecule } from '../../../../components/molecules/product-form/product-form.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { InventoryBatchDialogOrganism } from '../../../../components/organisms/inventory-batch-dialog/inventory-batch-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';

@Component({
  selector: 'app-inventory-products-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    BreadcrumbMolecule,
    TableContainerMolecule,
    EmptyStateAtom
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
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openProductDialog()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <mat-icon class="mr-2">add</mat-icon>
          Nuevo Producto
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Nombre del Producto</mat-label>
            <input matInput [formControl]="nameFilter" placeholder="Buscar por nombre...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>SKU</mat-label>
            <input matInput [formControl]="skuFilter" placeholder="Buscar por SKU...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">fingerprint</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Categoría</mat-label>
            <mat-select [formControl]="categoryFilter">
              <mat-option [value]="''">Todas las categorías</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{cat.name}}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix class="!text-indigo-600 mr-2">category</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <app-table-container [hasData]="true">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)" class="w-full">
          <!-- SKU Column -->
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="sku">SKU</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ product.sku }}
              </span>
            </td>
          </ng-container>

          <!-- Nombre Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="name">Nombre</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="font-bold text-gray-900">{{ product.name }}</div>
            </td>
          </ng-container>

          <!-- Categoría Column -->
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Categoría</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-indigo-400"></div>
                <span class="font-medium">{{ product.category?.name || 'Sin categoría' }}</span>
              </div>
            </td>
          </ng-container>

          <!-- PMP Column -->
          <ng-container matColumnDef="averagePurchasePrice">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="averagePurchasePrice">PMP (Costo)</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex flex-col">
                <span class="font-bold text-gray-900">
                  {{ product.averagePurchasePrice | currency }}
                </span>
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  Precio Medio Ponderado
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Stock Column -->
          <ng-container matColumnDef="currentStock">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="currentStock">Stock</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex flex-col">
                <span class="font-black text-base" [class]="getStockColor(product)">
                  {{ product.currentStock }}
                </span>
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  Mín: {{ product.minStock }} | Máx: {{ product.maxStock }}
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button 
                  mat-icon-button 
                  (click)="openBatchesDialog(product)"
                  matTooltip="Trazabilidad por lotes"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>history</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  (click)="openProductDialog(product)"
                  matTooltip="Editar producto"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  (click)="confirmDelete(product)"
                  class="!text-gray-400 hover:!text-red-600 transition-all hover:bg-red-50"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-12 text-center" [attr.colspan]="displayedColumns.length">
              <app-empty-state 
                icon="inventory_2"
                title="No se encontraron productos"
                description="Aún no has registrado productos en tu catálogo o los filtros aplicados no coinciden."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openProductDialog()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Registrar Primer Producto
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
export class InventoryProductsPageComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  // Señales de datos
  products = this.productService.products;
  meta = this.productService.meta;
  categories = this.categoryService.categories;

  dataSource = new MatTableDataSource<Product>([]);
  
  // Filtros
  nameFilter = new FormControl('');
  skuFilter = new FormControl('');
  categoryFilter = new FormControl('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  displayedColumns = ['sku', 'name', 'category', 'averagePurchasePrice', 'currentStock', 'actions'];
  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    effect(() => {
      this.dataSource.data = this.products();
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();
    
    // Cargar categorías si no están cargadas
    if (this.categories().length === 0) {
      this.categoryService.loadCategories({ limit: 100 }).subscribe();
    }
  }

  setupFilters() {
    const filters = [this.nameFilter, this.skuFilter, this.categoryFilter];
    
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
      name: this.nameFilter.value || '',
      sku: this.skuFilter.value || '',
      categoryId: this.categoryFilter.value || ''
    };
    this.productService.loadProducts(params).subscribe();
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

  getStockColor(product: Product): string {
    if (product.currentStock <= product.minStock) return 'text-red-600';
    if (product.currentStock <= product.minStock * 1.5) return 'text-amber-600';
    return 'text-emerald-600';
  }

  openProductDialog(product?: Product) {
    const dialogRef = this.dialog.open(ProductFormMolecule, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  openBatchesDialog(product: Product) {
    this.dialog.open(InventoryBatchDialogOrganism, {
      width: '800px',
      maxWidth: '95vw',
      data: { product }
    });
  }

  confirmDelete(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogOrganism, {
      width: '400px',
      maxWidth: '95vw',
      data: { 
        title: '¿Eliminar producto?',
        message: 'Estás a punto de eliminar el producto',
        itemName: product.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProduct(product.id).subscribe(() => this.loadData());
      }
    });
  }
}

