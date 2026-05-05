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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { InventoryCategoryDialogOrganism } from '../../../../components/organisms/inventory-category-dialog/inventory-category-dialog.component';
import { CategoryService, InventoryCategory } from '../../../../services/category.service';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { TableContainerMolecule } from '../../../../components/molecules/table-container/table-container.component';
import { QueryParams } from '../../../../models/pagination.model';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';


@Component({
  selector: 'app-inventory-categories-page',
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
          { label: 'Categorías' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Categorías de Productos</h1>
          <p class="text-gray-500 font-medium">Gestiona y organiza tu inventario con filtros y paginación dinámica.</p>
        </div>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openCategoryDialog()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
        >
          <mat-icon class="mr-2">add</mat-icon>
          Nueva Categoría
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Buscar categorías</mat-label>
            <input matInput [formControl]="nameFilter" placeholder="Filtrar por nombre...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <app-table-container [hasData]="true">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)" class="w-full">
          <!-- Nombre Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="name">Nombre</th>
            <td mat-cell *matCellDef="let category" [class]="cellClass">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <mat-icon class="!text-indigo-600">category</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-gray-900">{{ category.name }}</div>
                  <div class="text-xs text-gray-400 font-medium line-clamp-1">{{ category.description || 'Sin descripción' }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Productos Column -->
          <ng-container matColumnDef="productsCount">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="productsCount">Productos</th>
            <td mat-cell *matCellDef="let category" [class]="cellClass">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                {{ category.productsCount || 0 }} productos
              </span>
            </td>
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let category" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button 
                  mat-icon-button 
                  (click)="openCategoryDialog(category)"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  (click)="confirmDelete(category)"
                  class="!text-gray-400 hover:!text-red-600 transition-all hover:bg-red-50"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors"></tr>

          <!-- Fila de Sin Datos -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-12 text-center" [attr.colspan]="displayedColumns.length">
              <app-empty-state 
                icon="category"
                title="No se encontraron categorías"
                description="Aún no has creado categorías para tus productos o los filtros aplicados no coinciden con ningún registro."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openCategoryDialog()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Crear Primera Categoría
                </button>
              </app-empty-state>
            </td>
          </tr>
        </table>

        <!-- Paginador -->
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
    .mat-mdc-table { background: transparent; }
    ::ng-deep .filter-field .mat-mdc-form-field-wrapper {
      padding-bottom: 0 !important;
    }
    ::ng-deep .filter-field .mat-mdc-text-field-wrapper {
      height: 32px !important;
      padding: 0 8px !important;
      background-color: #f9fafb !important;
    }
    ::ng-deep .filter-field .mat-mdc-form-field-flex {
      height: 32px !important;
      align-items: center !important;
    }
    ::ng-deep .filter-field input {
      font-size: 11px !important;
    }
    ::ng-deep .filter-field .mat-mdc-form-field-infix {
      padding-top: 4px !important;
      padding-bottom: 4px !important;
      min-height: 32px !important;
    }
  `]
})
export class InventoryCategoriesPageComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  
  // Señales de datos y meta
  categories = this.categoryService.categories;
  meta = this.categoryService.meta;

  // DataSource para la tabla
  dataSource = new MatTableDataSource<InventoryCategory>([]);

  // Señales de estado local para la consulta
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal<string>('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  // Controles para filtros
  nameFilter = new FormControl('');

  displayedColumns = ['name', 'productsCount', 'actions'];
  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    // Sincronizar el dataSource con la señal de categorías
    // Usamos effect para mantener la compatibilidad con MatTableDataSource
    effect(() => {
      const data = this.categories();
      if (data) {
        this.dataSource.data = data;
      }
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();
  }

  setupFilters() {
    this.nameFilter.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex.set(1); // Reset a primera página al filtrar
      this.loadData();
    });
  }

  loadData() {
    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.order(),
      name: this.nameFilter.value || ''
    };
    this.categoryService.loadCategories(params).subscribe();
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

  openCategoryDialog(category?: InventoryCategory) {
    const dialogRef = this.dialog.open(InventoryCategoryDialogOrganism, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      data: { category }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  confirmDelete(category: InventoryCategory) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogOrganism, {
      width: '400px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      data: { 
        title: '¿Eliminar categoría?',
        message: 'Estás a punto de eliminar la categoría',
        itemName: category.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(category.id).subscribe(() => this.loadData());
      }
    });
  }
}
