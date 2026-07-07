import { Component, inject, signal, type OnInit, computed } from '@angular/core';
import { CommonModule, formatDate, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime } from 'rxjs';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, type SelectOption } from '../../atoms/select/select.component';
import { DatepickerComponent } from '../../atoms/datepicker/datepicker.component';
import { SupplierService } from '../../../services/supplier.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from '../../../models/purchase-order.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import {
  ProductSelectionDialogComponent,
  type ProductSelectionDialogResult,
} from '../product-selection-dialog/product-selection-dialog.component';
import { SupplierDialogOrganism } from '../supplier-dialog/supplier-dialog.component';
import {
  DIALOG_WIDTHS,
  DIALOG_PANEL_CLASS,
  DIALOG_DEFAULTS,
} from '../../../shared/constants/dialog.config';

export interface PurchaseOrderDialogData {
  order?: PurchaseOrder;
}

export interface PurchaseItemDisplay {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  referenceStock: number;
  referenceAveragePrice: number;
}

@Component({
  selector: 'app-purchase-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    TextareaComponent,
    DatepickerComponent,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] bg-white dark:bg-gray-900 p-8">
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
            <span class="material-icons text-3xl">shopping_cart</span>
          </div>
          <div>
            <h2
              class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0"
            >
              {{ isEditMode() ? 'Editar Orden' : 'Nueva Orden de Compra' }}
            </h2>
            <p
              class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1"
            >
              {{ isEditMode() ? 'Orden ' + orderNumber() : 'Registro de pedido' }}
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="close(null)" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      @if (error()) {
        <div
          class="mx-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-red-700 dark:text-red-300"
        >
          <div class="flex items-center gap-3">
            <span class="material-icons text-red-500">error_outline</span>
            <p class="text-xs font-bold uppercase tracking-wide">{{ error() }}</p>
          </div>
          <ui-button variant="icon" (clicked)="error.set(null)" ariaLabel="Cerrar error">
            <span class="material-icons">close</span>
          </ui-button>
        </div>
      }

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <form [formGroup]="form" class="space-y-8 pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ui-select
              label="Proveedor"
              [options]="supplierOptions()"
              [formControl]="$any(form.controls['supplierId'])"
              [searchable]="true"
              [loading]="isLoadingSuppliers()"
              [disabled]="isEditMode()"
              (searchChange)="onSupplierSearch($event)"
              footerLabel="Crear nuevo proveedor"
              (footerAction)="openCreateSupplierDialog()"
            />

            <ui-datepicker
              label="Fecha de Pedido"
              [formControl]="$any(form.controls['orderDate'])"
            />

            <ui-textarea
              formControlName="observations"
              label="Observaciones / Notas"
              placeholder="Detalles adicionales sobre el pedido..."
              [rows]="3"
              class="md:col-span-2"
            />
          </div>

          <div
            class="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <div class="flex justify-between items-center mb-6">
              <h3
                class="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest flex items-center gap-2"
              >
                <span class="material-icons text-indigo-600 dark:text-indigo-400">list</span>
                Productos del Pedido
              </h3>
              @if (!isEditMode()) {
                <ui-button variant="primary" (clicked)="openAddProductDialog()">
                  <span class="material-icons mr-2">add</span>
                  Añadir Producto
                </ui-button>
              }
            </div>

            @if (items().length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                      <th
                        class="text-left py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                      >
                        Producto
                      </th>
                      <th
                        class="text-center py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                      >
                        Cantidad
                      </th>
                      <th
                        class="text-right py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                      >
                        Precio Unit.
                      </th>
                      <th
                        class="text-right py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                      >
                        Subtotal
                      </th>
                      @if (!isEditMode()) {
                        <th
                          class="text-center py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                        >
                          Acciones
                        </th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of items(); track item.productId; let i = $index) {
                      <tr
                        class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-700/20"
                      >
                        <td class="py-3 px-2">
                          <span class="font-bold text-gray-900 dark:text-gray-100">{{
                            item.name
                          }}</span>
                        </td>
                        <td class="text-center py-3 px-2">
                          <span
                            class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-black"
                            >{{ item.quantity }}</span
                          >
                        </td>
                        <td class="text-right py-3 px-2">
                          <span class="text-gray-700 dark:text-gray-300 font-medium">{{
                            item.unitPrice | currency
                          }}</span>
                        </td>
                        <td class="text-right py-3 px-2">
                          <span class="font-black text-gray-900 dark:text-gray-100">{{
                            item.quantity * item.unitPrice | currency
                          }}</span>
                        </td>
                        @if (!isEditMode()) {
                          <td class="text-center py-3 px-2">
                            <div class="flex justify-center gap-1">
                              <ui-button
                                variant="icon"
                                (clicked)="openEditProductDialog(i)"
                                ariaLabel="Editar producto"
                              >
                                <span class="material-icons text-sm">edit</span>
                              </ui-button>
                              <ui-button
                                variant="icon"
                                (clicked)="removeItem(i)"
                                ariaLabel="Eliminar producto"
                              >
                                <span class="material-icons text-sm">delete</span>
                              </ui-button>
                            </div>
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="text-right">
                  <p
                    class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1"
                  >
                    Total de la Orden
                  </p>
                  <p class="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                    {{ orderTotal() | currency }}
                  </p>
                </div>
              </div>
            } @else {
              <div
                class="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-white/50 dark:bg-gray-900/50"
              >
                <span class="material-icons text-gray-200 dark:text-gray-600 text-5xl mb-2"
                  >inventory_2</span
                >
                <p class="text-gray-400 dark:text-gray-500 text-sm font-bold">
                  No hay productos agregados
                </p>
                @if (!isEditMode()) {
                  <ui-button variant="ghost" (clicked)="openAddProductDialog()" class="mt-2">
                    Añadir Producto
                  </ui-button>
                }
              </div>
            }
          </div>
        </form>
      </div>

      <footer
        class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <ui-button variant="ghost" (clicked)="close(null)"> Cancelar </ui-button>

        @if (!isEditMode()) {
          <ui-button
            variant="primary"
            [disabled]="form.invalid || items().length === 0"
            (clicked)="saveOrder()"
          >
            Crear Orden
          </ui-button>
        }
        @if (isEditMode()) {
          <ui-button variant="primary" [disabled]="form.pristine" (clicked)="saveOrder()">
            Guardar Cambios
          </ui-button>
        }
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 10px;
      }
    `,
  ],
})
export class PurchaseOrderDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);

  private dialogRef = inject(MatDialogRef<PurchaseOrderDialogOrganism, boolean>);
  private dialogData = inject<PurchaseOrderDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private matDialog = inject(MatDialog);
  private supplierService = inject(SupplierService);
  private purchaseOrderService = inject(PurchaseOrderService);

  isEditMode = signal(false);
  orderId = signal<string | null>(null);
  orderNumber = signal<string | null>(null);

  // Supplier search
  private supplierSearch$ = new Subject<string>();
  supplierList = signal<{ value: string; label: string }[]>([]);
  isLoadingSuppliers = signal(false);

  // Items
  items = signal<PurchaseItemDisplay[]>([]);

  // Existing quantities for stock validation (productId → sum of quantities)
  existingQuantities = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const item of this.items()) {
      map[item.productId] = (map[item.productId] || 0) + item.quantity;
    }
    return map;
  });

  supplierOptions = computed<SelectOption[]>(() => this.supplierList());

  orderTotal = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
  );

  form: FormGroup = this.fb.group({
    supplierId: ['', Validators.required],
    orderDate: [new Date(), Validators.required],
    observations: [''],
  });

  constructor() {
    // Supplier search with debounce
    this.supplierSearch$.pipe(debounceTime(300)).subscribe((query) => {
      this.isLoadingSuppliers.set(true);
      this.supplierService.loadSuppliers({ name: query || undefined, limit: 20 }).subscribe({
        next: () => {
          this.supplierList.set(
            this.supplierService.suppliers().map((s) => ({ value: s.id, label: s.name })),
          );
          this.isLoadingSuppliers.set(false);
        },
        error: () => this.isLoadingSuppliers.set(false),
      });
    });
  }

  ngOnInit() {
    // Load initial supplier list
    this.supplierService.loadSuppliers({ limit: 20 }).subscribe(() => {
      this.supplierList.set(
        this.supplierService.suppliers().map((s) => ({ value: s.id, label: s.name })),
      );
    });

    if (this.dialogData?.order) {
      this.isEditMode.set(true);
      const { id, orderNumber, supplierId, orderDate, observations, items } = this.dialogData.order;

      this.orderId.set(id);
      this.orderNumber.set(orderNumber);

      this.form.patchValue({
        supplierId,
        orderDate: new Date(orderDate),
        observations: observations ?? '',
      });

      // Map existing items to display format
      if (items) {
        this.items.set(
          items.map((item) => ({
            productId: item.productId,
            name: item.product?.name ?? '',
            quantity: item.quantity,
            unitPrice: item.price,
            referenceStock: item.product?.currentStock ?? 0,
            referenceAveragePrice: item.product?.averagePurchasePrice ?? 0,
          })),
        );
      }
    }
  }

  onSupplierSearch(query: string) {
    this.supplierSearch$.next(query);
  }

  openCreateSupplierDialog() {
    const ref = this.matDialog.open(SupplierDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {},
    });

    ref.afterClosed().subscribe(() => {
      // Reload supplier list to include the new supplier
      this.supplierService.loadSuppliers({ limit: 20 }).subscribe(() => {
        this.supplierList.set(
          this.supplierService.suppliers().map((s) => ({ value: s.id, label: s.name })),
        );
      });
    });
  }

  openAddProductDialog() {
    const ref = this.matDialog.open(ProductSelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        mode: 'add',
        existingQuantities: this.existingQuantities(),
        context: 'purchase',
      },
    });

    ref.afterClosed().subscribe((result: ProductSelectionDialogResult | undefined) => {
      if (!result) return;

      this.items.update((current) => [
        ...current,
        {
          productId: result.productId,
          name: result.name,
          quantity: result.quantity,
          unitPrice: result.unitPrice,
          referenceStock: result.referenceStock,
          referenceAveragePrice: result.referenceAveragePrice,
        },
      ]);
    });
  }

  openEditProductDialog(index: number) {
    const item = this.items()[index];

    const ref = this.matDialog.open(ProductSelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        mode: 'edit',
        lineItem: {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          referenceSellingPrice: 0,
          referenceAveragePrice: item.referenceAveragePrice,
          referenceStock: item.referenceStock,
        },
        index,
        existingQuantities: {
          ...this.existingQuantities(),
          [item.productId]: this.existingQuantities()[item.productId] - item.quantity,
        },
        context: 'purchase',
      },
    });

    ref.afterClosed().subscribe((result: ProductSelectionDialogResult | undefined) => {
      if (!result) return;

      this.items.update((current) => {
        const updated = [...current];
        updated[index] = {
          productId: result.productId,
          name: result.name,
          quantity: result.quantity,
          unitPrice: result.unitPrice,
          referenceStock: result.referenceStock,
          referenceAveragePrice: result.referenceAveragePrice,
        };
        return updated;
      });
    });
  }

  removeItem(index: number) {
    this.items.update((current) => current.filter((_, i) => i !== index));
  }

  saveOrder() {
    this.error.set(null);

    if (this.isEditMode()) {
      // Guard: only allow editing CREATED orders
      if (this.dialogData?.order && this.dialogData.order.status !== 'CREATED') {
        this.error.set('Solo se pueden editar órdenes en estado CREATED');
        return;
      }

      // Edit mode: only send date and notes
      const raw = this.form.getRawValue();
      const payload: UpdatePurchaseOrderDto = {
        orderDate: raw.orderDate ? formatDate(raw.orderDate, 'yyyy-MM-dd', 'en-US') : undefined,
        observations: raw.observations || undefined,
      };

      this.loading.set(true);
      this.purchaseOrderService.updateOrder(this.orderId()!, payload).subscribe({
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
    } else {
      // Create mode
      const raw = this.form.getRawValue();

      if (!raw.supplierId) {
        this.error.set('Debe seleccionar un proveedor.');
        return;
      }

      const payload: CreatePurchaseOrderDto = {
        supplierId: raw.supplierId,
        orderDate: formatDate(raw.orderDate ?? new Date(), 'yyyy-MM-dd', 'en-US'),
        observations: raw.observations ?? '',
        items: this.items().map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.unitPrice),
        })),
      };

      this.loading.set(true);
      this.purchaseOrderService.createOrder(payload).subscribe({
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
  }

  close(result: boolean | null) {
    this.dialogRef.close(result);
  }
}
