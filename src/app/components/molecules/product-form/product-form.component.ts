import { Component, inject, signal, computed, input, output, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';

export interface ProductFormDialogData {
  product?: Product;
}

export type ProductFormResult = boolean | undefined;

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatButtonModule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="onClose()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="p-8">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
        </h2>
        <button (click)="onClose()" aria-label="Cerrar diálogo" class="!text-gray-400 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-2xl transition-colors">
          <span class="material-icons">close</span>
        </button>
      </header>

      <form #productForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ui-text-input label="Nombre del Producto" icon="inventory_2" [(value)]="product().name" name="name" [required]="true" placeholder="Ej. MacBook Pro 16" />

          <ui-text-input label="SKU" icon="qr_code_2" [(value)]="product().sku" name="sku" [required]="true" placeholder="Ej. LAP-123" />

          <ui-select label="Categoría" placeholder="Seleccionar categoría" [options]="categoryOptions()" [(value)]="product().categoryId" [required]="true" />

          <ui-text-input type="number" label="Stock Actual" icon="inventory" [(value)]="product().currentStock" name="currentStock" [required]="true" placeholder="0" />

          <ui-text-input type="number" label="Stock Mínimo" icon="warning" [(value)]="product().minStock" name="minStock" [required]="true" placeholder="0" />

          <ui-text-input type="number" label="Stock Máximo" icon="inventory_2" [(value)]="product().maxStock" name="maxStock" [required]="true" placeholder="0" />

          @if (isEditMode) {
            <div class="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top duration-300">
              <ui-text-input type="number" label="Precio de Venta" icon="payments" [(value)]="product().sellingPrice" name="sellingPrice" [required]="true" placeholder="Ej. 15000" />
              <span class="text-xs text-indigo-400 font-bold">P. Sugerido: {{ (product().averagePurchasePrice * 1.3 || 0) | currency }}</span>
            </div>
          }

          @if (isReasonRequired()) {
            <div class="flex flex-col gap-1.5 md:col-span-2 animate-in fade-in slide-in-from-top duration-300">
              <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Motivo del Ajuste de Stock</label>
              <input [(ngModel)]="adjustmentReason" name="adjustmentReason" required placeholder="Ej. Pérdida, Ajuste de auditoría, etc."
                class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            </div>
          }
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!productForm.valid"
            (clicked)="saveProduct()"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Producto' }}
          </ui-button>
        </div>
      </form>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProductFormMolecule implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  /** Input for inline usage via template binding */
  data = input<{ product?: Product }>({});
  /** Output for inline usage */
  closed = output<boolean>();
  /** MAT_DIALOG_DATA for MatDialog.open path */
  private dialogData = inject<ProductFormDialogData>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject(MatDialogRef<ProductFormMolecule, ProductFormResult>, { optional: true });

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  isEditMode = false;
  categoryList = this.categoryService.categories;

  categoryOptions = computed<SelectOption[]>(() =>
    this.categoryList().map(cat => ({ value: cat.id, label: cat.name }))
  );

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
    if (this.categoryList().length === 0) {
      this.categoryService.loadCategories({ limit: 100 }).subscribe();
    }

    // Use MAT_DIALOG_DATA if available (MatDialog path), otherwise input() (inline path)
    const incoming = this.dialogData ?? this.data();
    if (incoming.product) {
      this.isEditMode = true;
      this.product.set({ ...incoming.product });
      this.originalStock = incoming.product.currentStock;
    }
  }

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.closed.emit(false);
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
      next: () => {
        if (this.dialogRef) {
          this.dialogRef.close(true);
        }
        this.closed.emit(true);
      },
      error: (err) => console.error('Error saving product:', err)
    });
  }
}
