import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InventoryService, StockItem } from '../../../services/inventory.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
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
            <mat-select [(ngModel)]="product().category" name="category" required>
              @for (cat of categories; track cat) {
                <mat-option [value]="cat">{{cat}}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Stock Actual</mat-label>
            <input matInput type="number" [(ngModel)]="product().quantity" name="quantity" required>
            <span matSuffix class="pr-2 text-gray-400 text-sm">unidades</span>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Stock Mínimo</mat-label>
            <input matInput type="number" [(ngModel)]="product().minStock" name="minStock" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Stock Máximo</mat-label>
            <input matInput type="number" [(ngModel)]="product().maxStock" name="maxStock" required>
          </mat-form-field>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold">
            Cancelar
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            [disabled]="!productForm.valid"
            (click)="saveProduct()"
            class="!h-12 !px-8 !rounded-full !font-bold"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Producto' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 28px !important;
      padding: 24px !important;
    }
  `]
})
export class ProductFormMolecule implements OnInit {
  public dialogRef = inject(MatDialogRef<ProductFormMolecule>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private inventoryService = inject(InventoryService);

  isEditMode = false;
  categories = ['Electrónica', 'Accesorios', 'Muebles', 'Herramientas', 'Otros'];

  product = signal<Partial<StockItem>>({
    name: '',
    sku: '',
    category: 'Electrónica',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    unit: 'unidades',
    status: 'In Stock'
  });

  ngOnInit() {
    if (this.data && this.data.product) {
      this.isEditMode = true;
      this.product.set({ ...this.data.product });
    }
  }

  saveProduct() {
    const qty = this.product().quantity || 0;
    const min = this.product().minStock || 0;
    const status = qty === 0 ? 'Out of Stock' : (qty <= min ? 'Low Stock' : 'In Stock');
    
    if (this.isEditMode) {
      this.inventoryService.updateProduct({
        ...this.product() as StockItem,
        status
      });
    } else {
      const newProduct: StockItem = {
        ...this.product() as StockItem,
        id: Math.random().toString(36).substring(2, 9),
        status
      };
      this.inventoryService.addProduct(newProduct);
    }
    
    this.dialogRef.close(true);
  }
}
