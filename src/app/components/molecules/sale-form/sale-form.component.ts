import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { InvoiceService } from '../../../services/invoice.service';
import { Product } from '../../../models/product.model';
import { Customer } from '../../../models/customer.model';
import { CreateInvoiceDto } from '../../../models/invoice.model';
import { startWith, map } from 'rxjs';
import { ProductPriceInfoMolecule } from '../product-price-info/product-price-info.component';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    CurrencyPipe,
    ProductPriceInfoMolecule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white flex flex-col max-h-[95vh] w-full max-w-[900px]">
      <!-- Decorative Background Element -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
        <header class="flex items-center justify-between mb-10">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 animate-in zoom-in duration-500">
              <mat-icon class="!text-[28px] !w-7 !h-7">shopping_cart</mat-icon>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">Nueva Factura de Venta</h2>
              <p class="text-gray-400 text-sm font-semibold uppercase tracking-widest mt-1">Facturación & Inventario</p>
            </div>
          </div>
          <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
            <mat-icon>close</mat-icon>
          </button>
        </header>

        <form [formGroup]="saleForm" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Selection -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Cliente</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <mat-label>Seleccione un cliente</mat-label>
                <mat-select formControlName="customerId" required>
                  @for (customer of customers(); track customer.id) {
                    <mat-option [value]="customer.id">{{ customer.name }} ({{ customer.documentNumber }})</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">person</mat-icon>
              </mat-form-field>
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Notas (Opcional)</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <input matInput formControlName="notes" placeholder="Ej: Pago a 30 días">
                <mat-icon matPrefix class="mr-2 text-gray-400">description</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Product Selection Area -->
          <div class="bg-gray-50/50 rounded-[28px] p-6 border border-gray-100 space-y-4">
            <div class="flex items-center gap-2 mb-2">
              <mat-icon class="text-indigo-600 scale-75">add_circle</mat-icon>
              <h3 class="text-xs font-black text-gray-900 uppercase tracking-widest">Añadir Productos</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <mat-form-field appearance="outline" class="md:col-span-7 !mb-0">
                <mat-label>Buscar Producto</mat-label>
                <input type="text" matInput [formControl]="productSearchControl" [matAutocomplete]="auto" placeholder="Escriba el nombre del producto...">
                <mat-icon matPrefix class="mr-2 text-gray-400">search</mat-icon>
                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onProductSelected($event.option.value)">
                  @for (product of filteredProducts(); track product.id) {
                    <mat-option [value]="product">
                      <div class="flex justify-between items-center w-full">
                        <span class="font-bold">{{ product.name }}</span>
                        <span class="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase">Stock: {{ product.currentStock }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              <mat-form-field appearance="outline" class="md:col-span-3 !mb-0">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" [formControl]="quantityControl" min="1" [max]="selectedProduct()?.currentStock || 999">
                <mat-icon matPrefix class="mr-2 text-gray-400">inventory_2</mat-icon>
              </mat-form-field>

              <button 
                type="button"
                mat-flat-button 
                color="primary" 
                class="md:col-span-2 !h-[56px] !rounded-2xl !bg-indigo-600 shadow-lg shadow-indigo-100"
                [disabled]="!selectedProduct() || quantityControl.invalid || quantityControl.value! > selectedProduct()!.currentStock"
                (click)="addProduct()"
              >
                <mat-icon>add</mat-icon>
              </button>
            </div>

            @if (selectedProduct(); as product) {
              <div class="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-left duration-300">
                <app-product-price-info 
                  [sellingPrice]="product.sellingPrice" 
                  [averagePurchasePrice]="product.averagePurchasePrice"
                  [currentStock]="product.currentStock"
                />
              </div>
            }
          </div>

          <!-- Added Products Table -->
          @if (items.length > 0) {
            <div class="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Detalle de Factura</label>
              <div class="border border-gray-100 rounded-[24px] overflow-hidden bg-white shadow-sm">
                <table mat-table [dataSource]="items.controls" class="w-full">
                  <ng-container matColumnDef="product">
                    <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-6 bg-gray-50/50">Producto</th>
                    <td mat-cell *matCellDef="let control; let i = index" class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-900">{{ control.value.name }}</span>
                        <span class="text-[10px] text-gray-400 font-medium">Ref: {{ control.value.productId.split('-')[0] }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-4 bg-gray-50/50 text-right">Precio Unit.</th>
                    <td mat-cell *matCellDef="let control" class="px-4 text-right">
                      <div class="flex items-center gap-2">
                        <mat-icon 
                          class="!text-indigo-400 !text-[18px] !w-[18px] !h-[18px] cursor-help" 
                          [matTooltip]="'• Precio Config: ' + (control.value.referenceSellingPrice | currency) + '\n• Sugerido (30%): ' + (control.value.referenceAveragePrice * 1.3 | currency) + '\n• Promedio (PMP): ' + (control.value.referenceAveragePrice | currency) + '\n• Stock Total: ' + control.value.referenceStock + ' unidades'"
                          matTooltipPosition="above"
                          matTooltipClass="pre-line-tooltip"
                        >info_outline</mat-icon>
                        <mat-icon class="!text-gray-300 scale-75">edit</mat-icon>
                        <input 
                          type="number" 
                          [value]="control.value.unitPrice" 
                          (change)="updatePrice(control, $event)"
                          class="text-right bg-transparent border-b border-dashed border-gray-200 focus:border-indigo-500 outline-none font-bold"
                        >
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="qty">
                    <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-4 bg-gray-50/50 text-center">Cant.</th>
                    <td mat-cell *matCellDef="let control; let i = index" class="!p-2 text-center">
                      <div class="flex items-center gap-3">
                        <button type="button" mat-icon-button class="!bg-gray-100" (click)="updateQty(i, -1)" [disabled]="control.value.quantity <= 1">
                          <mat-icon>remove</mat-icon>
                        </button>
                        <span class="text-sm font-black text-gray-900">{{ control.value.quantity }}</span>
                        <button type="button" mat-icon-button class="!bg-gray-100" (click)="updateQty(i, 1)">
                          <mat-icon>add</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="total">
                    <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-6 bg-gray-50/50 text-right">Subtotal</th>
                    <td mat-cell *matCellDef="let control" class="px-6 text-right">
                      <span class="text-sm font-black text-indigo-600">{{ control.value.unitPrice * control.value.quantity | currency }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="bg-gray-50/50"></th>
                    <td mat-cell *matCellDef="let control; let i = index" class="text-right px-4">
                      <button type="button" mat-icon-button (click)="removeItem(i)" class="!text-red-400 hover:!bg-red-50 transition-colors">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['product', 'price', 'qty', 'total', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['product', 'price', 'qty', 'total', 'actions']" class="hover:bg-gray-50/5 transition-colors border-b border-gray-50 last:border-0"></tr>
                </table>
              </div>

              <!-- Total Summary -->
              <div class="p-6 bg-indigo-600 rounded-[24px] border border-indigo-700 flex justify-between items-center shadow-xl shadow-indigo-100 animate-in zoom-in duration-300">
                <div class="flex items-center gap-3 text-white">
                  <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <mat-icon>payments</mat-icon>
                  </div>
                  <div>
                    <p class="text-[10px] text-indigo-100 font-black uppercase tracking-widest">Total Facturado</p>
                    <p class="text-xs text-indigo-200 font-medium italic">Venta sujeta a descuento de inventario</p>
                  </div>
                </div>
                <span class="text-3xl font-black text-white tabular-nums">{{ totalAmount() | currency }}</span>
              </div>
            </div>
          } @else {
             <div class="p-12 text-center border-2 border-dashed border-gray-100 rounded-[28px] space-y-4">
               <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                 <mat-icon class="!text-gray-300 !text-3xl !w-7 !h-7">receipt</mat-icon>
               </div>
               <div>
                 <p class="text-sm font-bold text-gray-900">No hay ítems en la factura</p>
                 <p class="text-xs text-gray-400">Busca productos y agrégalos para generar la venta.</p>
               </div>
             </div>
          }

          <!-- Footer Actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            <button mat-button type="button" class="!rounded-full !px-8 !h-12 !font-bold text-gray-500" (click)="dialogRef.close()">
              Descartar
            </button>
            <button mat-flat-button color="primary" type="submit" 
              [disabled]="saleForm.invalid || items.length === 0 || isSubmitting()"
              class="!rounded-full !px-12 !h-12 !bg-indigo-600 !font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {{ isSubmitting() ? 'Procesando...' : 'Generar Factura (PAID)' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    button:disabled {
      background-color: #f3f4f6 !important;
      color: #9ca3af !important;
      cursor: not-allowed;
    }
    mat-icon { font-size: 24px; }
    ::ng-deep .pre-line-tooltip {
      white-space: pre-line !important;
      line-height: 1.6 !important;
      padding: 12px !important;
      font-size: 11px !important;
    }
  `]
})
export class SaleFormMolecule implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<SaleFormMolecule>);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);
  private snackBar = inject(MatSnackBar);

  // Local state signals
  customers = this.customerService.customers;
  allProducts = this.productService.products;
  selectedProduct = signal<Product | null>(null);
  isSubmitting = signal(false);

  productSearchControl = new FormControl('');
  quantityControl = new FormControl(1, [Validators.required, Validators.min(1)]);

  saleForm = this.fb.group({
    customerId: ['', Validators.required],
    notes: [''],
    items: this.fb.array([])
  });

  // Reactive Autocomplete Search results
  filteredProducts = signal<Product[]>([]);

  // Trigger for total computation
  private itemsTrigger = signal(0);

  // Total Amount Computation
  totalAmount = computed(() => {
    this.itemsTrigger();
    const currentItems = this.items.value || [];
    return currentItems.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0);
  });

  get items() {
    return this.saleForm.get('items') as FormArray;
  }

  ngOnInit() {
    // Load data if not available
    if (this.customers().length === 0) {
      this.customerService.loadCustomers({ limit: 100 }).subscribe();
    }
    if (this.allProducts().length === 0) {
      this.productService.loadProducts({ limit: 100 }).subscribe();
    }

    // Setup autocomplete search
    this.productSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : (value as any)?.name || '';
        return this._filterProducts(name);
      })
    ).subscribe(products => this.filteredProducts.set(products));
  }

  private _filterProducts(filterValue: string): Product[] {
    return this.allProducts().filter(product =>
      product.name.toLowerCase().includes(filterValue.toLowerCase()) && product.currentStock > 0
    );
  }

  displayFn(product: Product): string {
    return product ? product.name : '';
  }

  onProductSelected(product: Product) {
    this.selectedProduct.set(product);
    this.quantityControl.setValue(1);
  }

  addProduct() {
    const product = this.selectedProduct();
    const qty = this.quantityControl.value || 0;

    if (product && qty > 0) {
      const existingIndex = this.items.controls.findIndex(c => c.value.productId === product.id);

      if (existingIndex !== -1) {
        const currentQty = this.items.at(existingIndex).get('quantity')?.value || 0;
        const newQty = currentQty + qty;
        if (newQty > product.currentStock) {
          this.snackBar.open(`Stock insuficiente para ${product.name}`, 'Cerrar', { duration: 3000 });
          return;
        }
        this.items.at(existingIndex).get('quantity')?.setValue(newQty);
      } else {
        this.items.push(this.fb.group({
          productId: [product.id],
          name: [product.name],
          unitPrice: [product.sellingPrice || product.averagePurchasePrice * 1.3],
          quantity: [qty, [Validators.required, Validators.max(product.currentStock)]],
          referenceSellingPrice: [product.sellingPrice],
          referenceAveragePrice: [product.averagePurchasePrice],
          referenceStock: [product.currentStock]
        }));
      }

      this.selectedProduct.set(null);
      this.productSearchControl.setValue('');
      this.quantityControl.setValue(1);
      this.itemsTrigger.update(v => v + 1);
    }
  }

  updateQty(index: number, delta: number) {
    const control = this.items.at(index).get('quantity');
    const productId = this.items.at(index).get('productId')?.value;
    const product = this.allProducts().find(p => p.id === productId);
    const newQty = (control?.value || 0) + delta;

    if (newQty > 0 && (!product || newQty <= product.currentStock)) {
      control?.setValue(newQty);
      this.itemsTrigger.update(v => v + 1);
    } else if (product && newQty > product.currentStock) {
      this.snackBar.open(`No puedes exceder el stock disponible (${product.currentStock})`, 'Cerrar', { duration: 2000 });
    }
  }

  updatePrice(control: any, event: any) {
    const newPrice = parseFloat(event.target.value);
    if (!isNaN(newPrice) && newPrice >= 0) {
      control.patchValue({ unitPrice: newPrice });
      this.itemsTrigger.update(v => v + 1);
    }
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.itemsTrigger.update(v => v + 1);
  }

  onSubmit() {
    if (this.saleForm.valid && this.items.length > 0) {
      this.isSubmitting.set(true);
      const formValue = this.saleForm.value;

      const dto: CreateInvoiceDto = {
        customerId: formValue.customerId!,
        notes: formValue.notes || undefined,
        items: (formValue.items || []).map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      this.invoiceService.createInvoice(dto).subscribe({
        next: () => {
          this.snackBar.open('Factura generada exitosamente', 'Aceptar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const message = err.error?.message || 'Error al procesar la venta';
          this.snackBar.open(message, 'Cerrar', { duration: 5000, panelClass: ['bg-red-500', 'text-white'] });
        }
      });
    }
  }
}
