import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InventoryCategoryDialogOrganism } from '../../../../components/organisms/inventory-category-dialog/inventory-category-dialog.component';
import { CategoryService, InventoryCategory } from '../../../../services/category.service';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';

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
    BreadcrumbMolecule
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

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Categorías de Productos</h1>
          <p class="text-gray-500 font-medium">Configura las categorías para organizar tu inventario.</p>
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

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table mat-table [dataSource]="categories()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Nombre</th>
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

          <ng-container matColumnDef="productCount">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Productos</th>
            <td mat-cell *matCellDef="let category" [class]="cellClass">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                {{ category.productCount || 0 }} productos
              </span>
            </td>
          </ng-container>

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
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    .mat-mdc-table { background: transparent; }
  `]
})
export class InventoryCategoriesPageComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  
  categories = this.categoryService.categories;

  displayedColumns = ['name', 'productCount', 'actions'];
  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  ngOnInit() {
    this.categoryService.loadCategories().subscribe();
  }

  openCategoryDialog(category?: InventoryCategory) {
    this.dialog.open(InventoryCategoryDialogOrganism, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
      data: { category }
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
        this.categoryService.deleteCategory(category.id).subscribe();
      }
    });
  }
}
