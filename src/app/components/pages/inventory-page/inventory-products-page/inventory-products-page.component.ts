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
import { TableContainerMolecule } from '../../../../components/molecules/table-container/table-container.component';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';
import { InventoryService, StockItem } from '../../../../services/inventory.service';
import { ProductFormMolecule } from '../../../../components/molecules/product-form/product-form.component';

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
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
        >
          <mat-icon class="mr-2">add</mat-icon>
          Nuevo Producto
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Buscar productos</mat-label>
            <input matInput [formControl]="searchFilter" placeholder="Filtrar por nombre o SKU...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <app-table-container [hasData]="true">
        <table mat-table [dataSource]="dataSource" matSort class="w-full">
          <!-- SKU Column -->
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header>SKU</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ product.sku }}
              </span>
            </td>
          </ng-container>

          <!-- Nombre Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header>Nombre</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex flex-col">
                <span class="font-bold text-gray-900">{{ product.name }}</span>
                <span class="text-xs text-gray-400">{{ product.category }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Stock Column -->
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header>Stock Actual</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex items-center gap-2">
                <span class="font-bold" [class]="getStockColor(product)">
                  {{ product.quantity }}
                </span>
                <span class="text-xs text-gray-400 font-medium">{{ product.unit }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Estado Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Estado</th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <span 
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                [ngClass]="{
                  'bg-emerald-50 text-emerald-600': product.status === 'In Stock',
                  'bg-amber-50 text-amber-600': product.status === 'Low Stock',
                  'bg-red-50 text-red-600': product.status === 'Out of Stock'
                }"
              >
                {{ product.status }}
              </span>
            </td>
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let product" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button mat-icon-button class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button class="!text-gray-400 hover:!text-red-600 transition-all hover:bg-red-50">
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
                description="Aún no has registrado productos en tu catálogo o los filtros no coinciden."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openProductDialog()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Registrar Producto
                </button>
              </app-empty-state>
            </td>
          </tr>
        </table>

        <mat-paginator 
          [length]="dataSource.data.length"
          [pageSize]="10"
          [pageSizeOptions]="[5, 10, 25]"
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
  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<StockItem>([]);
  searchFilter = new FormControl('');
  displayedColumns = ['sku', 'name', 'quantity', 'status', 'actions'];
  
  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    effect(() => {
      this.dataSource.data = this.inventoryService.stock();
    });
  }

  ngOnInit() {
    this.searchFilter.valueChanges.subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });
  }

  getStockColor(product: StockItem): string {
    if (product.quantity <= product.minStock) return 'text-red-600';
    if (product.quantity <= product.minStock * 1.5) return 'text-amber-600';
    return 'text-emerald-600';
  }

  openProductDialog() {
    this.dialog.open(ProductFormMolecule, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true
    });
  }
}
