import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
        </h2>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form #productForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre del Producto</mat-label>
            <input matInput [(ngModel)]="product().name" name="name" required placeholder="Ej. MacBook Pro 16">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>SKU</mat-label>
            <input matInput [(ngModel)]="product().sku" name="sku" required placeholder="Ej. LAP-123">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Categoría</mat-label>
            <mat-select [(ngModel)]="product().categoryId" name="categoryId" required>
              @for (cat of categoryList(); track cat.id) {
                <mat-option [value]="cat.id">{{cat.name}}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Stock Actual</mat-label>
            <input matInput type="number" [(ngModel)]="product().currentStock" name="currentStock" required min="0">
            <span matSuffix class="pr-2 text-gray-400 text-sm">unidades</span>
            @if (productForm.controls['currentStock']?.errors?.['min']) {
              <mat-error>El stock no puede ser negativo</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Stock Mínimo</mat-label>
            <input matInput type="number" [(ngModel)]="product().minStock" name="minStock" required min="0">
            @if (productForm.controls['minStock']?.errors?.['min']) {
              <mat-error>El stock mínimo no puede ser negativo</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Stock Máximo</mat-label>
            <input matInput type="number" [(ngModel)]="product().maxStock" name="maxStock" required min="0">
            @if (productForm.controls['maxStock']?.errors?.['min']) {
              <mat-error>El stock máximo no puede ser negativo</mat-error>
            }
          </mat-form-field>

          @if (isEditMode) {
            <mat-form-field appearance="outline" class="w-full animate-in fade-in slide-in-from-top duration-300">
              <mat-label>Precio de Venta</mat-label>
              <input matInput type="number" [(ngModel)]="product().sellingPrice" name="sellingPrice" required min="0" placeholder="Ej. 15000">
              <mat-icon matPrefix class="mr-2 text-indigo-600">payments</mat-icon>
              @if (productForm.controls['sellingPrice']?.errors?.['min']) {
                <mat-error>El precio de venta no puede ser negativo</mat-error>
              }
              <mat-hint class="text-indigo-400 font-bold">P. Sugerido: {{ (product().averagePurchasePrice * 1.3 || 0) | currency }}</mat-hint>
            </mat-form-field>
          }

          @if (isReasonRequired()) {
            <mat-form-field appearance="outline" class="w-full md:col-span-2 animate-in fade-in slide-in-from-top duration-300">
              <mat-label>Motivo del Ajuste de Stock</mat-label>
              <input matInput [(ngModel)]="adjustmentReason" name="adjustmentReason" required placeholder="Ej. Pérdida, Ajuste de auditoría, etc.">
              @if (!adjustmentReason) {
                <mat-error>El motivo del ajuste es obligatorio cuando el stock cambia</mat-error>
              }
            </mat-form-field>
          }
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold text-gray-500">
            Cancelar
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            [disabled]="!productForm.valid"
            (click)="saveProduct()"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Producto' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 40px !important;
      padding: 32px !important;
    }
  `]
})
export class ProductFormMolecule implements OnInit {
  public dialogRef = inject(MatDialogRef<ProductFormMolecule>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  isEditMode = false;
  categoryList = this.categoryService.categories;

  originalStock: number | null = null;
  adjustmentReason = '';

  product = signal<any>({
    name: '',
    sku: '',
    categoryId: null,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    sellingPrice: 0,
    averagePurchasePrice: 0
  });

  ngOnInit() {
    // Cargar categorías si no están cargadas
    if (this.categoryList().length === 0) {
      this.categoryService.loadCategories({ limit: 100 }).subscribe();
    }

    if (this.data && this.data.product) {
      this.isEditMode = true;
      this.product.set({ ...this.data.product });
      this.originalStock = this.data.product.currentStock;
    }
  }

  isReasonRequired(): boolean {
    if (!this.isEditMode || this.originalStock === null) return false;
    return this.product().currentStock !== this.originalStock;
  }

  saveProduct() {
    if (this.isReasonRequired() && !this.adjustmentReason) {
      return;
    }

    const { id, name, sku, categoryId, currentStock, minStock, maxStock, sellingPrice } = this.product();
    const payload: any = { name, sku, categoryId, currentStock, minStock, maxStock };
    
    if (this.isEditMode) {
      payload.sellingPrice = sellingPrice;
      if (this.isReasonRequired()) {
        payload.adjustmentReason = this.adjustmentReason;
      }
    }
    
    const request = this.isEditMode 
      ? this.productService.updateProduct(id, payload)
      : this.productService.createProduct(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error saving product:', err)
    });
  }
}

