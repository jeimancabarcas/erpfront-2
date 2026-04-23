import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { SalesService, Invoice, InvoiceProduct, Customer } from '../../../services/sales.service';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    FormsModule,
    CurrencyPipe
  ],
  template: `
    <div class="flex flex-col h-full max-h-[85vh]">
      <header class="flex justify-between items-center mb-8 px-2">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">Nueva Venta</h2>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <mat-dialog-content class="!m-0 !p-2 flex-1 scrollbar-hide">
        <div class="space-y-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Seleccionar Cliente</mat-label>
            <mat-select [(ngModel)]="selectedCustomer" required>
              @for (c of salesService.customers(); track c.id) {
                <mat-option [value]="c">{{c.name}} ({{c.company}})</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Añadir Productos</h3>
            <div class="flex flex-col md:flex-row gap-4 items-start">
              <mat-form-field appearance="outline" class="flex-1 !mb-0">
                <mat-label>Producto</mat-label>
                <mat-select [(ngModel)]="selectedProduct">
                  @for (item of inventoryService.stock(); track item.id) {
                    <mat-option [value]="item">{{item.name}} (Stock: {{item.quantity}})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full md:w-32 !mb-0" [hintLabel]="selectedProduct ? 'Stock: ' + selectedProduct.quantity : ''">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" [(ngModel)]="quantity" min="1" [max]="selectedProduct?.quantity || 9999">
              </mat-form-field>

              <button 
                mat-flat-button 
                color="primary" 
                class="!h-[56px] !rounded-2xl !px-8"
                [disabled]="!selectedProduct || quantity < 1 || quantity > selectedProduct.quantity"
                (click)="addProduct()"
              >
                <mat-icon class="mr-2">add</mat-icon>
                Añadir
              </button>
            </div>
          </div>

          @if (addedProducts().length > 0) {
            <div class="border border-gray-100 rounded-3xl overflow-hidden">
              <table mat-table [dataSource]="addedProducts()" class="w-full">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase px-4">Producto</th>
                  <td mat-cell *matCellDef="let p" class="px-4">
                    <div class="font-bold text-gray-900">{{p.name}}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="qty">
                  <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase text-center">Cant.</th>
                  <td mat-cell *matCellDef="let p" class="text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button mat-icon-button class="!bg-gray-100" (click)="updateQty(p, -1)" [disabled]="p.quantity <= 1">
                        <mat-icon class="">remove</mat-icon>
                      </button>
                      <span class="font-bold">{{p.quantity}}</span>
                      <button mat-icon-button class="!bg-gray-100" (click)="updateQty(p, 1)" [disabled]="isMaxStockReached(p)">
                        <mat-icon class="">add</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase text-right">Precio</th>
                  <td mat-cell *matCellDef="let p" class="text-right text-gray-500">{{p.price | currency}}</td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase text-right">Total</th>
                  <td mat-cell *matCellDef="let p" class="text-right font-black text-indigo-600">{{p.quantity * p.price | currency}}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let p" class="text-right px-4">
                    <button mat-icon-button (click)="removeProduct(p)" class="!text-red-400 hover:!bg-red-50">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['name', 'qty', 'price', 'total', 'actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['name', 'qty', 'price', 'total', 'actions']" class="hover:bg-gray-50/50"></tr>
              </table>
            </div>

            <div class="flex justify-between items-center p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <span class="text-indigo-900 font-bold uppercase tracking-widest text-xs">Total de la Venta</span>
              <span class="text-2xl font-black text-indigo-600">{{ calculateTotal() | currency }}</span>
            </div>
          }
        </div>
      </mat-dialog-content>

      <footer class="flex justify-end gap-3 pt-8 px-2">
        <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold">
          Cancelar
        </button>
        <button 
          mat-flat-button 
          color="primary" 
          [disabled]="!selectedCustomer || addedProducts().length === 0"
          (click)="saveSale()"
          class="!h-12 !px-12 !rounded-full !font-bold"
        >
          Confirmar Venta
        </button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 32px !important;
      padding: 24px !important;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .mat-mdc-table {
      background: transparent;
    }
  `]
})
export class SaleFormMolecule {
  public dialogRef = inject(MatDialogRef<SaleFormMolecule>);
  public inventoryService = inject(InventoryService);
  public salesService = inject(SalesService);

  selectedCustomer: Customer | null = null;
  selectedProduct: any = null;
  quantity = 1;
  addedProducts = signal<InvoiceProduct[]>([]);

  addProduct() {
    if (!this.selectedProduct) return;

    const currentProducts = this.addedProducts();
    const existingIndex = currentProducts.findIndex(p => p.id === this.selectedProduct.id);

    if (existingIndex !== -1) {
      const updated = [...currentProducts];
      const newTotalQty = updated[existingIndex].quantity + this.quantity;
      if (newTotalQty > this.selectedProduct.quantity) return;
      updated[existingIndex] = { ...updated[existingIndex], quantity: newTotalQty };
      this.addedProducts.set(updated);
    } else {
      if (this.quantity > this.selectedProduct.quantity) return;
      const newProduct: InvoiceProduct = {
        id: this.selectedProduct.id,
        name: this.selectedProduct.name,
        quantity: this.quantity,
        price: 1200
      };
      this.addedProducts.update(products => [...products, newProduct]);
    }
    this.selectedProduct = null;
    this.quantity = 1;
  }

  isMaxStockReached(product: InvoiceProduct): boolean {
    const stockItem = this.inventoryService.stock().find(item => item.id === product.id);
    return stockItem ? product.quantity >= stockItem.quantity : false;
  }

  updateQty(product: InvoiceProduct, delta: number) {
    this.addedProducts.update(products => products.map(p => {
      if (p.id === product.id) {
        const newQty = p.quantity + delta;
        const stockItem = this.inventoryService.stock().find(item => item.id === product.id);
        const maxQty = stockItem ? stockItem.quantity : 9999;
        if (newQty > maxQty) return p;
        return { ...p, quantity: newQty > 0 ? newQty : 1 };
      }
      return p;
    }));
  }

  removeProduct(product: InvoiceProduct) {
    this.addedProducts.update(products => products.filter(p => p.id !== product.id));
  }

  calculateTotal() {
    return this.addedProducts().reduce((acc, p) => acc + (p.quantity * p.price), 0);
  }

  saveSale() {
    if (!this.selectedCustomer) return;
    const newInvoice: Invoice = {
      id: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customer: this.selectedCustomer.name,
      date: new Date().toISOString().split('T')[0],
      amount: this.calculateTotal(),
      status: 'Pending',
      products: this.addedProducts()
    };
    this.salesService.addInvoice(newInvoice);
    this.dialogRef.close(true);
  }
}
