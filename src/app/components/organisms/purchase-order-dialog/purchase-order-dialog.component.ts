import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { CreatePurchaseOrderDto } from '../../../models/purchase-order.model';
import { FormsModule } from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-purchase-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh]">
      <header class="flex justify-between items-center mb-8 px-2">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <mat-icon class="!text-3xl">shopping_cart</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
              {{ isEditMode ? 'Editar Orden' : 'Nueva Orden de Compra' }}
            </h2>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {{ isEditMode ? 'Orden ' + form().orderNumber : 'Registro de pedido' }}
            </p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div *ngIf="isEditMode && form().status !== 'DRAFT'" class="mx-2 mb-4 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
        <mat-icon>warning</mat-icon>
        <p class="text-xs font-bold uppercase tracking-wide">Esta orden ya no se puede editar porque no está en estado BORRADOR.</p>
      </div>

      <mat-dialog-content class="flex-1 !px-2 custom-scrollbar">
        <fieldset [disabled]="isEditMode && form().status !== 'DRAFT'" class="contents">
          <form #orderForm="ngForm" class="space-y-8 pb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Proveedor -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Proveedor</mat-label>
              <mat-select [(ngModel)]="form().supplierId" name="supplierId" required>
                @for (supplier of suppliers(); track supplier.id) {
                  <mat-option [value]="supplier.id">{{ supplier.name }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix class="!text-gray-400 mr-2">business</mat-icon>
            </mat-form-field>

            <!-- Fecha -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha de Pedido</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="form().orderDate" name="orderDate" required>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>


          <!-- Observaciones -->
          <mat-form-field appearance="outline" class="w-full md:col-span-2">
            <mat-label>Observaciones / Notas</mat-label>
            <textarea matInput [(ngModel)]="form().observations" name="observations" rows="3" placeholder="Detalles adicionales sobre el pedido..."></textarea>
          </mat-form-field>
          </div>

          <!-- Sección de Items -->
          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <mat-icon class="!text-indigo-600">list</mat-icon>
                Productos del Pedido
              </h3>
              <button type="button" mat-flat-button color="primary" (click)="addItem()" class="!rounded-full !h-10 !text-xs !font-bold !bg-indigo-600">
                <mat-icon class="mr-2">add</mat-icon>
                Agregar Item
              </button>
            </div>

            @if (form().items.length > 0) {
              <div class="space-y-6 pr-1">
                @for (item of form().items; track $index) {
                  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md group relative">
                    <!-- Botón Eliminar -->
                    <button 
                      mat-icon-button 
                      (click)="removeItem($index)" 
                      class="!absolute -top-2 -right-2 !bg-white !shadow-sm !text-red-300 hover:!text-red-600 !border !border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <mat-icon>close</mat-icon>
                    </button>

                    <div class="flex flex-col gap-6">
                      <!-- Fila 1: Producto -->
                      <div class="w-full">
                        <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
                          <mat-label>Producto</mat-label>
                          <mat-select [(ngModel)]="item.productId" [name]="'product_'+$index" required (selectionChange)="onItemChange($index)">
                            @for (prod of products(); track prod.id) {
                              <mat-option [value]="prod.id">{{ prod.name }} ({{ prod.sku }})</mat-option>
                            }
                          </mat-select>
                          <mat-icon matPrefix class="!text-gray-400 mr-2">inventory_2</mat-icon>
                        </mat-form-field>
                      </div>

                      <!-- Fila 2: Cantidad, Precio y Subtotal -->
                      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div class="md:col-span-3">
                          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
                            <mat-label>Cantidad</mat-label>
                            <input matInput type="number" [(ngModel)]="item.quantity" [name]="'qty_'+$index" min="1" (change)="onItemChange($index)">
                            <mat-icon matPrefix class="!text-gray-400 mr-2">numbers</mat-icon>
                          </mat-form-field>
                        </div>

                        <div class="md:col-span-4">
                          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
                            <mat-label>Precio Unitario</mat-label>
                            <input matInput type="number" [(ngModel)]="item.unitPrice" [name]="'price_'+$index" min="0" (change)="onItemChange($index)">
                            <mat-icon matPrefix class="!text-gray-400 mr-2">payments</mat-icon>
                          </mat-form-field>
                        </div>

                        <div class="md:col-span-5 flex flex-col items-end">
                          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subtotal de línea</div>
                          <div class="text-xl font-black text-indigo-600 tracking-tight">{{ item.total | currency }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
              
              <!-- Resumen Total -->
              <div class="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <div class="text-right">
                  <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total de la Orden</p>
                  <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ form().total | currency }}</p>
                </div>
              </div>
            } @else {
              <div class="py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
                <mat-icon class="!text-gray-200 !text-5xl mb-2">inventory_2</mat-icon>
                <p class="text-gray-400 text-sm font-bold">No hay productos agregados a esta orden</p>
                <button type="button" mat-button color="primary" (click)="addItem()" class="mt-2 !font-bold">
                  Comenzar a agregar
                </button>
              </div>
            }
          </div>
        </form>
      </fieldset>
    </mat-dialog-content>

      <mat-dialog-actions class="!justify-end !gap-3 !pt-6 !px-2 !min-h-0">
        <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold text-gray-500">
          Cancelar
        </button>
        <button 
          mat-flat-button 
          color="primary" 
          [disabled]="!orderForm.valid"
          (click)="saveOrder()"
          class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
        >
          {{ isEditMode ? 'Guardar Cambios' : 'Generar Orden de Compra' }}
        </button>
      </mat-dialog-actions>
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
export class PurchaseOrderDialogOrganism implements OnInit {
  public dialogRef = inject(MatDialogRef<PurchaseOrderDialogOrganism>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private purchaseOrderService = inject(PurchaseOrderService);

  isEditMode = false;
  suppliers = this.supplierService.suppliers;
  products = this.productService.products;

  form = signal<any>({
    id: null,
    supplierId: '',
    orderDate: new Date(),
    status: 'DRAFT',
    observations: '',
    total: 0,
    items: []
  });

  ngOnInit() {
    // Cargar proveedores y productos si no están cargados
    if (this.suppliers().length === 0) {
      this.supplierService.loadSuppliers({ limit: 100 }).subscribe();
    }
    if (this.products().length === 0) {
      this.productService.loadProducts({ limit: 100 }).subscribe();
    }

    if (this.data && this.data.order) {
      this.isEditMode = true;
      this.form.set({ 
        ...this.data.order, 
        orderDate: new Date(this.data.order.orderDate),
        items: this.data.order.items?.map((i: any) => ({ ...i, unitPrice: i.price })) || [] 
      });
      this.calculateTotal();
    }
  }

  addItem() {
    const currentItems = this.form().items;
    this.form.update(f => ({
      ...f,
      items: [...currentItems, { productId: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  }

  removeItem(index: number) {
    const currentItems = [...this.form().items];
    currentItems.splice(index, 1);
    this.form.update(f => ({ ...f, items: currentItems }));
    this.calculateTotal();
  }

  onItemChange(index: number) {
    const items = [...this.form().items];
    const item = items[index];
    item.total = item.quantity * item.unitPrice;
    this.form.update(f => ({ ...f, items }));
    this.calculateTotal();
  }

  calculateTotal() {
    const total = this.form().items.reduce((acc: number, item: any) => acc + (item.total || 0), 0);
    this.form.update(f => ({ ...f, total }));
  }

  saveOrder() {
    const f = this.form();
    const payload: CreatePurchaseOrderDto = {
      supplierId: f.supplierId,
      orderDate: formatDate(f.orderDate, 'yyyy-MM-dd', 'en-US'),
      observations: f.observations,
      items: f.items.map((i: any) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        price: Number(i.unitPrice)
      }))
    };
    
    const request = this.isEditMode 
      ? this.purchaseOrderService.updateOrder(f.id, payload)
      : this.purchaseOrderService.createOrder(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error saving order:', err)
    });
  }
}
