import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, formatDate, CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder, CreatePurchaseOrderDto, PurchaseOrderStatus } from '../../../models/purchase-order.model';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface PurchaseOrderDialogData {
  order?: PurchaseOrder;
}

interface PurchaseOrderItemForm {
  productId: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
}

@Component({
  selector: 'app-purchase-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ButtonAtom,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] p-8">
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span class="material-icons text-3xl">shopping_cart</span>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
              {{ isEditMode() ? 'Editar Orden' : 'Nueva Orden de Compra' }}
            </h2>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {{ isEditMode() ? 'Orden ' + orderNumber() : 'Registro de pedido' }}
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="close(null)" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      @if (isReadonly()) {
        <div class="mx-2 mb-4 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
          <span class="material-icons">warning</span>
          <p class="text-xs font-bold uppercase tracking-wide">Esta orden ya no se puede editar porque está finalizada o anulada.</p>
        </div>
      }

      @if (error()) {
        <div class="mx-2 mb-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between gap-3 text-red-700">
          <div class="flex items-center gap-3">
            <span class="material-icons text-red-500">error_outline</span>
            <p class="text-xs font-bold uppercase tracking-wide">{{ error() }}</p>
          </div>
          <button (click)="error.set(null)" class="!text-red-400 hover:!text-red-600 transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>
      }

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <fieldset [disabled]="isReadonly()" class="contents">
          <form [formGroup]="form" class="space-y-8 pb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Proveedor</mat-label>
                <mat-select formControlName="supplierId">
                  @for (supplier of suppliers(); track supplier.id) {
                    <mat-option [value]="supplier.id">{{ supplier.name }}</mat-option>
                  }
                </mat-select>
                <span matPrefix class="material-icons text-gray-400 mr-2">business</span>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Fecha de Pedido</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="orderDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Observaciones / Notas</mat-label>
                <textarea matInput formControlName="observations" rows="3" placeholder="Detalles adicionales sobre el pedido..."></textarea>
              </mat-form-field>
            </div>

            <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <span class="material-icons text-indigo-600">list</span>
                  Productos del Pedido
                </h3>
                <button type="button" mat-flat-button color="primary" (click)="addItem()" class="!rounded-full !h-10 !text-xs !font-bold !bg-indigo-600">
                  <span class="material-icons mr-2">add</span>
                  Agregar Item
                </button>
              </div>

              @if (itemsArray.length > 0) {
                <div class="space-y-6 pr-1">
                  @for (itemGroup of itemsArray.controls; track $index; let i = $index) {
                    <div [formGroup]="itemGroup" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md group relative">
                      <button
                        type="button"
                        mat-icon-button
                        (click)="removeItem(i)"
                        class="!absolute -top-2 -right-2 !bg-white !shadow-sm !text-red-300 hover:!text-red-600 !border !border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span class="material-icons">close</span>
                      </button>

                      <div class="flex flex-col gap-6">
                        <div class="w-full">
                          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
                            <mat-label>Producto</mat-label>
                            <mat-select formControlName="productId">
                              @for (prod of products(); track prod.id) {
                                <mat-option [value]="prod.id" [disabled]="isProductSelected(prod.id, i)">
                                  {{ prod.name }} ({{ prod.sku }})
                                </mat-option>
                              }
                            </mat-select>
                            <span matPrefix class="material-icons text-gray-400 mr-2">inventory_2</span>
                          </mat-form-field>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div class="md:col-span-3">
                            <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
                              <mat-label>Cantidad</mat-label>
                              <input matInput type="number" formControlName="quantity" min="1">
                              <span matPrefix class="material-icons text-gray-400 mr-2">numbers</span>
                            </mat-form-field>
                          </div>

                          <div class="md:col-span-4">
                            <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
                              <mat-label>Precio Unitario</mat-label>
                              <input matInput type="number" formControlName="unitPrice" min="0">
                              <span matPrefix class="material-icons text-gray-400 mr-2">payments</span>
                            </mat-form-field>
                          </div>

                          <div class="md:col-span-5 flex flex-col items-end">
                            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subtotal de línea</div>
                            <div class="text-xl font-black text-indigo-600 tracking-tight">
                              {{ getItemTotal(i) | currency }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <div class="text-right">
                    <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total de la Orden</p>
                    <p class="text-3xl font-black text-gray-900 tracking-tighter">{{ orderTotal() | currency }}</p>
                  </div>
                </div>
              } @else {
                <div class="py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
                  <span class="material-icons text-gray-200 text-5xl mb-2">inventory_2</span>
                  <p class="text-gray-400 text-sm font-bold">No hay productos agregados a esta orden</p>
                  <button type="button" mat-button color="primary" (click)="addItem()" class="mt-2 !font-bold">
                    Comenzar a agregar
                  </button>
                </div>
              }
            </div>
          </form>
        </fieldset>
      </div>

      <footer class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
        <button mat-button (click)="close(null)" class="!rounded-full !h-12 !px-6 !font-bold">
          Cancelar
        </button>

        @if (!isReadonly()) {
          <button
            mat-flat-button
            color="primary"
            [disabled]="form.invalid || itemsArray.length === 0"
            (click)="saveOrder()"
            class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
          >
            {{ isEditMode() ? 'Guardar Cambios' : 'Crear Orden' }}
          </button>
        }
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
  `],
})
export class PurchaseOrderDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);

  private dialogRef = inject(MatDialogRef<PurchaseOrderDialogOrganism, boolean>);
  private dialogData = inject<PurchaseOrderDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private purchaseOrderService = inject(PurchaseOrderService);

  isEditMode = signal(false);
  orderId = signal<string | null>(null);
  orderNumber = signal<string | null>(null);
  orderStatus = signal<PurchaseOrderStatus>('DRAFT');

  suppliers = this.supplierService.suppliers;
  products = this.productService.products;

  form = this.fb.group({
    supplierId: ['', Validators.required],
    orderDate: [new Date(), Validators.required],
    observations: [''],
    items: this.fb.array<FormGroup<PurchaseOrderItemForm>>([]),
  });

  get itemsArray(): FormArray<FormGroup<PurchaseOrderItemForm>> {
    return this.form.get('items') as FormArray<FormGroup<PurchaseOrderItemForm>>;
  }

  isReadonly = computed(() =>
    this.isEditMode() && (['COMPLETED', 'CANCELLED'] as PurchaseOrderStatus[]).includes(this.orderStatus())
  );

  orderTotal = signal(0);

  constructor() {
    this.form.valueChanges.subscribe(() => {
      const total = this.itemsArray.controls.reduce((acc, group) => {
        const qty = group.get('quantity')?.value ?? 0;
        const price = group.get('unitPrice')?.value ?? 0;
        return acc + (qty * price);
      }, 0);
      this.orderTotal.set(total);
    });
  }

  ngOnInit() {
    if (this.suppliers().length === 0) {
      this.supplierService.loadSuppliers({ limit: 100 }).subscribe();
    }
    if (this.products().length === 0) {
      this.productService.loadProducts({ limit: 100 }).subscribe();
    }

    if (this.dialogData?.order) {
      this.isEditMode.set(true);
      const { id, orderNumber, status, supplierId, orderDate, observations, items } = this.dialogData.order;

      this.orderId.set(id);
      this.orderNumber.set(orderNumber);
      this.orderStatus.set(status);

      this.form.patchValue({
        supplierId,
        orderDate: new Date(orderDate),
        observations: observations ?? '',
      });

      items?.forEach((item) => {
        this.itemsArray.push(this.createItemGroup(item.productId, item.quantity, item.price));
      });
    }
  }

  private createItemGroup(productId = '', quantity = 1, unitPrice = 0): FormGroup<PurchaseOrderItemForm> {
    return this.fb.group({
      productId: [productId, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
    }) as FormGroup<PurchaseOrderItemForm>;
  }

  addItem() {
    this.itemsArray.push(this.createItemGroup());
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  getItemTotal(index: number): number {
    const group = this.itemsArray.at(index);
    const qty = group.get('quantity')?.value ?? 0;
    const price = group.get('unitPrice')?.value ?? 0;
    return qty * price;
  }

  isProductSelected(productId: string, index: number): boolean {
    return this.itemsArray.controls.some(
      (group, i) => group.get('productId')?.value === productId && i !== index
    );
  }

  saveOrder() {
    this.error.set(null);

    const { supplierId, orderDate, observations, items } = this.form.getRawValue();

    if (!supplierId) {
      this.error.set('Debe seleccionar un proveedor.');
      return;
    }

    const productIds = items.map((i: any) => i.productId).filter((id: string) => !!id);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      this.error.set('Existen productos duplicados en la orden. Por favor revisa los items.');
      return;
    }

    const payload: CreatePurchaseOrderDto = {
      supplierId: supplierId!,
      orderDate: formatDate(orderDate ?? new Date(), 'yyyy-MM-dd', 'en-US'),
      observations: observations ?? '',
      items: items.map((i: any) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        price: Number(i.unitPrice),
      })),
    };

    const request = this.isEditMode()
      ? this.purchaseOrderService.updateOrder(this.orderId()!, payload)
      : this.purchaseOrderService.createOrder(payload);

    this.loading.set(true);
    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al guardar la orden. Intente nuevamente.');
        console.error('Error saving order:', err);
      },
    });
  }

  close(result: boolean | null) {
    this.dialogRef.close(result);
  }
}
