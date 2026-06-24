import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { InvoiceService } from '../../../services/invoice.service';
import { Product } from '../../../models/product.model';
import { Customer } from '../../../models/customer.model';
import { CreateInvoiceDto } from '../../../models/invoice.model';
import { Subject, debounceTime, Subscription } from 'rxjs';
import { CustomerDialogOrganism } from '../../organisms/customer-dialog/customer-dialog.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import {
  ProductSelectionDialogComponent,
  ProductSelectionDialogResult,
} from '../../organisms/product-selection-dialog/product-selection-dialog.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../shared/constants/dialog.config';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSlideToggleModule,
    CurrencyPipe,
    ButtonAtom,
    TextareaComponent,
    SelectAtom,
  ],
  template: `
    <div
      class="relative overflow-hidden rounded-[32px] bg-white flex flex-col max-h-[95vh] w-full max-w-[900px]"
    >
      <!-- Decorative Background Element -->
      <div
        class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"
      ></div>

      <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
        <header class="flex items-center justify-between mb-10">
          <div class="flex items-center gap-5">
            <div
              class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 animate-in zoom-in duration-500"
            >
              <span class="material-icons !text-[28px] !w-7 !h-7">shopping_cart</span>
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">
                Nueva Factura de Venta
              </h2>
              <p class="text-gray-400 text-sm font-semibold uppercase tracking-widest mt-1">
                Facturación & Inventario
              </p>
            </div>
          </div>
          <ui-button variant="icon" (clicked)="close(false)">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        <form [formGroup]="saleForm" (ngSubmit)="onSubmit()" class="space-y-8">
          <!-- Electronic invoice toggle -->
          <div class="flex items-center justify-between px-1">
            <mat-slide-toggle
              [checked]="isElectronic()"
              (change)="isElectronic.set($event.checked)"
              color="primary"
            >
              <span class="text-sm font-semibold text-gray-700">Factura electrónica</span>
            </mat-slide-toggle>
          </div>

          @if (!isElectronic()) {
            <div class="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <span class="material-icons text-amber-500 mt-0.5 text-[18px]">warning_amber</span>
              <p class="text-xs text-amber-700 leading-relaxed">
                Esta venta <strong>no será enviada a la DIAN</strong>. Se asignará un número
                interno (MAN-XXXXXXXX) y no tendrá validez fiscal electrónica.
              </p>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Selection -->
            <div class="space-y-2">
              <ui-select
                label="Cliente"
                placeholder="Escriba el nombre o documento del cliente..."
                [searchable]="true"
                [loading]="isLoadingCustomers()"
                [options]="customerOptions()"
                [formControl]="customerSearchControl"
                (searchChange)="onCustomerSearch($event)"
                footerLabel="Crear nuevo cliente"
                (footerAction)="openCreateCustomerDialog()"
                emptyText="No se encontraron clientes"
              />
            </div>

            <!-- Notes -->
            <ui-textarea
              label="Notas (Opcional)"
              placeholder="Ej: Pago a 30 días"
              [formControl]="saleForm.controls.notes"
              [rows]="3"
            />
          </div>

          <!-- Add Product Button -->
          <div class="flex justify-start">
            <ui-button variant="outline" (clicked)="openAddProductDialog()">
              <span class="material-icons text-lg mr-2">add</span>
              Añadir Producto
            </ui-button>
          </div>

          <!-- Added Products Table -->
          @if (itemsCount() > 0) {
            <div class="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1"
                >Detalle de Factura</label
              >
              <div class="border border-gray-100 rounded-[24px] overflow-hidden bg-white shadow-sm">
                <table mat-table [dataSource]="controls()" class="w-full">
                  <ng-container matColumnDef="product">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-6 bg-gray-50/50"
                    >
                      Producto
                    </th>
                    <td mat-cell *matCellDef="let control; let i = index" class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-900">{{ control.value.name }}</span>
                        <span class="text-[10px] text-gray-400 font-medium"
                          >Ref: {{ control.value.productId?.split('-')[0] }}</span
                        >
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="price">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-4 bg-gray-50/50 text-right"
                    >
                      Precio Unit.
                    </th>
                    <td mat-cell *matCellDef="let control" class="px-4 text-right">
                      <span class="font-bold text-gray-900">{{
                        control.value.unitPrice | currency
                      }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="qty">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-4 bg-gray-50/50 text-center"
                    >
                      Cant.
                    </th>
                    <td mat-cell *matCellDef="let control" class="px-4 text-center">
                      <span class="text-sm font-black text-gray-900">{{
                        control.value.quantity
                      }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="total">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-[10px] !font-black !uppercase !tracking-widest !py-4 px-6 bg-gray-50/50 text-right"
                    >
                      Subtotal
                    </th>
                    <td mat-cell *matCellDef="let control" class="px-6 text-right">
                      <div class="flex flex-col items-end">
                        <span class="text-sm font-black text-indigo-600">{{
                          toNumber(control.value.unitPrice) * control.value.quantity - getItemTotalTax(control.value) | currency
                        }}</span>
                        @if (control.value.taxItems?.length) {
                          <div class="text-[10px] text-gray-400 mt-0.5 space-y-0.5">
                            @for (tax of control.value.taxItems; track tax.code) {
                              <span>{{ tax.name }}: {{ toNumber(tax.amount) | currency }}</span>
                            }
                          </div>
                        }
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="bg-gray-50/50"></th>
                    <td mat-cell *matCellDef="let control; let i = index" class="text-right px-4">
                      <div class="flex items-center justify-end gap-1">
                        <ui-button variant="ghost" (clicked)="openEditProductDialog(i)" ariaLabel="Editar producto">
                          <span class="material-icons text-[20px]">edit</span>
                        </ui-button>
                        <ui-button variant="ghost" (clicked)="removeItem(i)" ariaLabel="Eliminar producto">
                          <span class="material-icons text-[20px]">delete_outline</span>
                        </ui-button>
                      </div>
                    </td>
                  </ng-container>

                  <tr
                    mat-header-row
                    *matHeaderRowDef="['product', 'price', 'qty', 'total', 'actions']"
                  ></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: ['product', 'price', 'qty', 'total', 'actions']"
                    class="hover:bg-gray-50/5 transition-colors border-b border-gray-50 last:border-0"
                  ></tr>
                </table>
              </div>

              <!-- Total Summary -->
              <div
                class="p-6 bg-indigo-600 rounded-[24px] border border-indigo-700 shadow-xl shadow-indigo-100 animate-in zoom-in duration-300"
              >
                <!-- Total -->
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3 text-white">
                    <div
                      class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"
                    >
                      <span class="material-icons">payments</span>
                    </div>
                    <div>
                      <p class="text-[10px] text-indigo-100 font-black uppercase tracking-widest">
                        Total Facturado
                      </p>
                      <p class="text-xs text-indigo-200 font-medium italic">
                        Venta sujeta a descuento de inventario
                      </p>
                    </div>
                  </div>
                  <span class="text-3xl font-black text-white tabular-nums">{{
                    totalAmount() | currency
                  }}</span>
                </div>
              </div>
            </div>
          } @else {
            <div
              class="p-12 text-center border-2 border-dashed border-gray-100 rounded-[28px] space-y-4"
            >
              <div
                class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto"
              >
                <span class="material-icons !text-gray-300 !text-3xl !w-7 !h-7">receipt</span>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900">No hay ítems en la factura</p>
                <p class="text-xs text-gray-400">
                  Busca productos y agrégalos para generar la venta.
                </p>
              </div>
            </div>
          }

          <!-- Footer Actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            <ui-button
              variant="outline"
              (clicked)="close(false)"
            >
              Descartar
            </ui-button>
            <ui-button variant="primary" type="submit" [disabled]="saleForm.invalid || itemsCount() === 0 || isSubmitting()">
              @if (isSubmitting()) { Procesando... } @else { Generar Factura (PAID) }
            </ui-button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notification -->
    @if (notification(); as notif) {
      <div
        class="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in fade-in slide-in-from-bottom duration-300"
        [ngClass]="notif.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ notif.message }}
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
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
    `,
  ],
})
export class SaleFormMolecule implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<SaleFormMolecule, boolean>);
  private matDialog = inject(MatDialog);
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);
  notification = signal<{message: string; type: 'success' | 'error'} | null>(null);
  private notifTimeout: ReturnType<typeof setTimeout> | null = null;

  // Local state signals for Customer Autocomplete
  customersList = signal<Customer[]>([]);
  isLoadingCustomers = signal(false);
  customerSearchControl = new FormControl<string>('');
  private customerSearch$ = new Subject<string>();
  private searchSub: Subscription | null = null;
  private customerValueSub: Subscription | null = null;

  // Computed options for ui-select
  customerOptions = computed<SelectOption[]>(() =>
    this.customersList().map(c => ({ value: c.id, label: `${c.name} (${c.documentNumber})` }))
  );

  // Local state signals
  customers = this.customerService.customers;
  allProducts = this.productService.products;
  isSubmitting = signal(false);
  isElectronic = signal(false);

  saleForm = this.fb.group({
    customerId: ['', Validators.required],
    notes: [''],
    items: this.fb.array([]),
  });

  // Total Amount — plain signal updated explicitly after FormArray changes
  private _totalAmount = signal(0);
  totalAmount = this._totalAmount.asReadonly();

  // Subtotal (sum of unitPrice * quantity, includes taxes)
  private _subtotal = signal(0);
  subtotalAmount = this._subtotal.asReadonly();

  // Tax breakdown per tax code for display in totals
  private _taxSummaries = signal<{ code: string; name: string; amount: number }[]>([]);
  taxSummaries = this._taxSummaries.asReadonly();

  // Data source for MatTable — new array reference each time to force re-render
  readonly controls = signal<AbstractControl[]>([]);

  // Track items length as a signal for template reactivity
  itemsCount = signal(0);

  private recalcTotal() {
    const currentItems = this.items.value || [];

    const subtotal = currentItems.reduce((acc: number, item: any) => acc + item.unitPrice * item.quantity, 0);
    this._subtotal.set(subtotal);
    this._totalAmount.set(subtotal);

    // Compute tax breakdown from stored tax items per product
    const taxMap = new Map<string, { code: string; name: string; amount: number }>();
    for (const item of currentItems) {
      if (item.taxItems && Array.isArray(item.taxItems)) {
        for (const tax of item.taxItems) {
          const existing = taxMap.get(tax.code);
          if (existing) {
            existing.amount += tax.amount;
          } else {
            taxMap.set(tax.code, { code: tax.code, name: tax.name, amount: tax.amount });
          }
        }
      }
    }
    this._taxSummaries.set(Array.from(taxMap.values()));

    this.controls.set([...this.items.controls]);
    this.itemsCount.set(currentItems.length);
  }

  get items() {
    return this.saleForm.get('items') as FormArray;
  }

  ngOnInit() {
    if (this.allProducts().length === 0) {
      this.productService.loadProducts({ limit: 100 }).subscribe();
    }

    // Initial customer load
    this._fetchCustomers('');

    // Debounced customer search
    this.searchSub = this.customerSearch$.pipe(debounceTime(300)).subscribe(query => {
      this._fetchCustomers(query);
    });

    // Sync customer selection to form
    this.customerValueSub = this.customerSearchControl.valueChanges.subscribe(customerId => {
      if (customerId) {
        this.saleForm.patchValue({ customerId });
      }
    });
  }

  onCustomerSearch(query: string) {
    this.customerSearch$.next(query);
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }

  private _fetchCustomers(searchTerm: string) {
    this.isLoadingCustomers.set(true);
    this.customerService
      .loadCustomers({
        search: searchTerm || undefined,
        limit: 20,
      })
      .subscribe({
        next: (res: any) => {
          this.isLoadingCustomers.set(false);
          const data = res.data || res.items || (Array.isArray(res) ? res : []);
          this.customersList.set(data);
        },
        error: () => {
          this.isLoadingCustomers.set(false);
        },
      });
  }

  openCreateCustomerDialog() {
    const ref = this.matDialog.open(CustomerDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {},
    });
    ref.afterClosed().subscribe((result) => {
      if (result === true) {
        const newCustomer = this.customerService.customers()[0];
        if (newCustomer) {
          this.customersList.update((list) => [newCustomer, ...list]);
        }
      }
    });
  }

  onCustomerSelected(customerId: string) {
    if (customerId) {
      this.saleForm.patchValue({ customerId });
    }
  }

  private computeExistingQuantities(excludeIndex?: number): Record<string, number> {
    const qtys: Record<string, number> = {};
    for (let i = 0; i < this.items.length; i++) {
      if (i === excludeIndex) continue;
      const item = this.items.at(i).value;
      qtys[item.productId] = (qtys[item.productId] || 0) + item.quantity;
    }
    return qtys;
  }

  /** Compute per-item tax amounts from product tax configuration */
  private computeTaxItems(
    unitPrice: number,
    quantity: number,
    productTaxes?: { id: string; name: string; code: string; percentage: number; type: string }[],
  ): { code: string; name: string; rate: number; amount: number }[] {
    if (!productTaxes || productTaxes.length === 0) return [];

    const totalRate = productTaxes.reduce((sum, t) => sum + Number(t.percentage), 0);
    if (totalRate === 0) return [];

    const itemSubtotal = unitPrice * quantity;
    const priceBeforeTax = itemSubtotal / (1 + totalRate / 100);

    return productTaxes.map(tax => ({
      code: tax.code,
      name: tax.name,
      rate: Number(tax.percentage),
      amount: Math.round(priceBeforeTax * (Number(tax.percentage) / 100) * 100) / 100,
    }));
  }

  /** Returns total tax amount for a line item */
  getItemTotalTax(item: any): number {
    if (!item.taxItems?.length) return 0;
    return item.taxItems.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
  }

  toNumber(val: any): number {
    return Number(val) || 0;
  }

  openAddProductDialog() {
    const ref = this.matDialog.open(ProductSelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { mode: 'add', existingQuantities: this.computeExistingQuantities() },
    });

    ref.afterClosed().subscribe((result: ProductSelectionDialogResult | undefined) => {
      if (!result) return;

      const product = this.allProducts().find(p => p.id === result.productId);
      const taxItems = this.computeTaxItems(result.unitPrice, result.quantity, product?.taxes);

      this.items.push(
        this.fb.group({
          productId: [result.productId],
          name: [result.name],
          unitPrice: [result.unitPrice],
          quantity: [result.quantity, [Validators.required]],
          referenceSellingPrice: [result.referenceSellingPrice],
          referenceAveragePrice: [result.referenceAveragePrice],
          referenceStock: [result.referenceStock],
          taxItems: [taxItems],
        }),
      );

      this.recalcTotal();
    });
  }

  openEditProductDialog(index: number) {
    const itemGroup = this.items.at(index);
    const itemValue = itemGroup.value;

    const ref = this.matDialog.open(ProductSelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        mode: 'edit',
        lineItem: itemValue,
        index,
        existingQuantities: this.computeExistingQuantities(index),
      },
    });

    ref.afterClosed().subscribe((result: ProductSelectionDialogResult | undefined) => {
      if (!result) return;

      const product = this.allProducts().find(p => p.id === result.productId);
      const taxItems = this.computeTaxItems(result.unitPrice, result.quantity, product?.taxes);

      itemGroup.patchValue({
        productId: result.productId,
        name: result.name,
        unitPrice: result.unitPrice,
        quantity: result.quantity,
        referenceSellingPrice: result.referenceSellingPrice,
        referenceAveragePrice: result.referenceAveragePrice,
        referenceStock: result.referenceStock,
        taxItems: taxItems,
      });

      this.recalcTotal();
    });
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.recalcTotal();
  }

  onSubmit() {
    if (this.saleForm.valid && this.items.length > 0) {
      this.isSubmitting.set(true);
      const formValue = this.saleForm.value;

      const dto: CreateInvoiceDto = {
        customerId: formValue.customerId!,
        notes: formValue.notes || undefined,
        items: (formValue.items || []).map((item: any) => {
          const itemPayload: any = {
            productId: item.productId,
            quantity: item.quantity,
          };

          // Omitir el envío del precio unitario si no ha sido modificado por el usuario,
          // permitiendo que el backend lo resuelva directamente desde la base de datos.
          if (Number(item.unitPrice) !== Number(item.referenceSellingPrice)) {
            itemPayload.unitPrice = Number(item.unitPrice);
          }

          return itemPayload;
        }),
        isElectronic: this.isElectronic(),
      };

      this.invoiceService.createInvoice(dto).subscribe({
        next: () => {
          this.showNotification('Factura generada exitosamente');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const message = err.error?.message || 'Error al procesar la venta';
          this.showNotification(message);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.customerValueSub?.unsubscribe();
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification.set({ message, type });
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    this.notifTimeout = setTimeout(() => this.notification.set(null), 3000);
  }
}
