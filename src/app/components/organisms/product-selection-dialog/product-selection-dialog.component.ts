import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Subject, Subscription, distinctUntilChanged, debounceTime } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { computeRecommendedPrice } from '../../../shared/utils/price.utils';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';

// ── Interfaces ──

export interface ProductSelectionDialogData {
  mode: 'add' | 'edit';
  lineItem?: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    referenceSellingPrice: number;
    referenceAveragePrice: number;
    referenceStock: number;
  };
  index?: number;
  /** Quantities of each product already in the invoice, used for stock validation */
  existingQuantities?: Record<string, number>;
}

export interface ProductSelectionDialogResult {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  referenceSellingPrice: number;
  referenceAveragePrice: number;
  referenceStock: number;
}

// ── Helpers ──

/**
 * Validates that quantity does not exceed available stock (currentStock minus already-added quantities).
 */
function stockLimitValidator(
  productSignal: () => Product | null,
  existingQtySignal: () => number,
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    const product = productSignal();
    if (!product) return null;
    const qty = control.value;
    const alreadyAdded = existingQtySignal();
    const available = product.currentStock - alreadyAdded;
    if (qty != null && qty > available) {
      return { stockExceeded: { max: available, actual: qty } };
    }
    return null;
  };
}

@Component({
  selector: 'app-product-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ButtonAtom,
    SelectAtom,
    TextInputComponent,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] p-8 bg-white dark:bg-gray-900">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
            <span class="material-icons !text-3xl">inventory_2</span>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0">
              {{ isEditMode() ? 'Editar Producto' : 'Añadir Producto' }}
            </h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">
              {{ isEditMode() ? 'Modificar línea de factura' : 'Seleccionar producto para la venta' }}
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="onCancel()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
            ></div>
          </div>
        } @else {
          <form [formGroup]="form" class="space-y-6">
            <!-- Product Selector -->
            @if (isEditMode()) {
              <!-- Read-only display in edit mode -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Producto <span class="text-red-500">*</span>
                </label>
                <div
                  class="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center"
                >
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{
                    selectedProduct()?.name ?? dialogData?.lineItem?.name ?? ''
                  }}</span>
                </div>
              </div>
            } @else {
              <ui-select
                label="Producto"
                placeholder="Seleccionar producto..."
                [options]="productOptions()"
                [formControl]="$any(productIdCtrl)"
                [searchable]="true"
                [loading]="isLoadingProducts()"
                [required]="true"
                emptyText="No se encontraron productos"
                (searchChange)="onProductSearch($event)"
              />
            }

            <!-- Price Reference Panel -->
            @if (selectedProduct()) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Costo Promedio PMP -->
                <div
                  class="price-card rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-4"
                >
                  <p
                    class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1"
                  >
                    Costo Promedio PMP
                  </p>
                  <p class="text-lg font-black text-emerald-800 dark:text-emerald-300">
                    {{ selectedProduct()!.averagePurchasePrice | currency }}
                  </p>
                </div>

                <!-- Precio Recomendado -->
                <div
                  class="price-card rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-4"
                >
                  <p
                    class="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest mb-1"
                  >
                    Precio Recomendado
                  </p>
                  <p class="text-lg font-black text-amber-800 dark:text-amber-300">
                    {{ recommendedPrice() | currency }}
                  </p>
                </div>

                <!-- Precio Configurado -->
                <div
                  class="price-card rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 p-4"
                >
                  <p
                    class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1"
                  >
                    Precio Configurado
                  </p>
                  <p class="text-lg font-black text-indigo-800 dark:text-indigo-300">
                    @if (selectedProduct()!.sellingPrice > 0) {
                      {{ selectedProduct()!.sellingPrice | currency }}
                    } @else {
                      <span class="text-indigo-400 dark:text-indigo-300">—</span>
                    }
                  </p>
                </div>
              </div>
            }

            <!-- Quantity Input -->
            <div>
              <ui-text-input
                type="number"
                label="Cantidad"
                [formControl]="$any(quantityCtrl)"
                [required]="true"
                [error]="quantityError()"
              />
              @if (quantityError()) {
                <p data-testid="stock-error" class="text-xs text-red-500 dark:text-red-400 font-medium mt-1">
                  {{ quantityError() }}
                </p>
              }
            </div>

            <!-- Unit Price Input -->
            <div>
              <ui-text-input
                type="number"
                label="Precio Unitario"
                [formControl]="$any(unitPriceCtrl)"
                [required]="true"
                [error]="unitPriceError()"
              />
              @if (isPriceOverridden()) {
                <p
                  class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1"
                >
                  <span class="material-icons text-sm">edit</span>
                  Precio modificado manualmente
                </p>
              }
            </div>
          </form>
        }
      </div>

      <!-- Footer -->
      <footer
        class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <ui-button variant="outline" (clicked)="onCancel()">Cancelar</ui-button>
        <ui-button variant="primary" data-testid="save-btn" [disabled]="form.invalid || loading()" (clicked)="onSave()">{{ isEditMode() ? 'Guardar Cambios' : 'Añadir Producto' }}</ui-button>
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
        background: #f8fafc;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }
    `,
  ],
})
export class ProductSelectionDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<ProductSelectionDialogComponent, ProductSelectionDialogResult | undefined>);
  protected dialogData = inject<ProductSelectionDialogData>(MAT_DIALOG_DATA, { optional: true });
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  // State signals
  loading = signal(false);
  isLoadingProducts = signal(false);
  selectedProduct = signal<Product | null>(null);
  private productSearch$ = new Subject<string>();

  // Computed: product options for ui-select (reads from service reactive signal)
  productOptions = computed<SelectOption[]>(() =>
    this.productService.products().map((p) => ({
      value: p.id,
      label: `${p.name} — Stock: ${p.currentStock}`,
    })),
  );

  // Computed: recommended price using centralized utility
  recommendedPrice = computed(() => {
    const product = this.selectedProduct();
    return product ? computeRecommendedPrice(product.averagePurchasePrice) : 0;
  });

  // Computed: is the user's price different from the default?
  isPriceOverridden = computed(() => {
    const unitPrice = this.form?.controls['unitPrice'].value;
    const defaultPrice = this.defaultPrice();
    return unitPrice != null && defaultPrice != null && unitPrice !== defaultPrice;
  });

  // Computed: default unit price (sellingPrice or recommended)
  defaultPrice = computed(() => {
    const product = this.selectedProduct();
    if (!product) return 0;
    return product.sellingPrice > 0
      ? product.sellingPrice
      : computeRecommendedPrice(product.averagePurchasePrice);
  });

  // Computed: quantity of this product already added to the invoice (excluding current line in edit mode)
  existingQtyForSelected = computed(() => {
    const product = this.selectedProduct();
    if (!product || !this.dialogData?.existingQuantities) return 0;
    return this.dialogData.existingQuantities[product.id] || 0;
  });

  // Computed: validation error messages for ui-text-input
  quantityError = computed(() => {
    // Depend on trigger to force recomputation when validity changes
    this.quantityErrorTrigger();
    const errors = this.form?.controls['quantity'].errors;
    if (!errors) return '';
    if (errors['stockExceeded']) return `Stock insuficiente (disponible: ${errors['stockExceeded'].max})`;
    if (errors['min']) return 'La cantidad debe ser al menos 1';
    if (errors['required']) return 'La cantidad es requerida';
    return '';
  });

  unitPriceError = computed(() => {
    this.unitPriceErrorTrigger();
    const errors = this.form?.controls['unitPrice'].errors;
    if (!errors) return '';
    if (errors['min']) return 'El precio debe ser mayor o igual a 0';
    if (errors['required']) return 'El precio es requerido';
    return '';
  });

  isEditMode = signal(false);

  // Subscriptions
  private productSearchSub: Subscription | null = null;
  private productIdSub: Subscription | null = null;
  private quantityErrorTrigger = signal(0);
  private unitPriceErrorTrigger = signal(0);

  // ── Form ──
  form: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1), stockLimitValidator(() => this.selectedProduct(), () => this.existingQtyForSelected())]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
  });

  // Typed form control accessors for strict template checking
  get productIdCtrl() { return this.form.get('productId')!; }
  get quantityCtrl() { return this.form.get('quantity')!; }
  get unitPriceCtrl() { return this.form.get('unitPrice')!; }

  ngOnInit() {
    // Product search with debounce
    this.productSearchSub = this.productSearch$.pipe(debounceTime(300)).subscribe(query => {
      this.isLoadingProducts.set(true);
      this.productService.loadProducts({ name: query || undefined, limit: 50 }).subscribe({
        next: () => this.isLoadingProducts.set(false),
        error: () => this.isLoadingProducts.set(false),
      });
    });

    // Initial load — always fetch fresh products
    this.loading.set(true);
    this.productService.loadProducts({ limit: 100 }).subscribe({
      next: () => {
        this.loading.set(false);
        this.applyDialogData();
      },
      error: () => {
        this.loading.set(false);
      },
    });

    // Subscribe to product selection changes (ui-select updates the form control)
    this.productIdSub = this.form.controls['productId'].valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((productId: string) => {
        if (productId && !this.isEditMode()) {
          this.selectProduct(productId);
        }
      });

    // Trigger error recomputation when quantity validity changes
    this.form.controls['quantity'].statusChanges.subscribe(() => {
      this.quantityErrorTrigger.update((v) => v + 1);
    });
    this.form.controls['unitPrice'].statusChanges.subscribe(() => {
      this.unitPriceErrorTrigger.update((v) => v + 1);
    });
    // Also trigger on value changes (for stockExceeded validator which depends on selectedProduct)
    this.form.controls['quantity'].valueChanges.subscribe(() => {
      this.quantityErrorTrigger.update((v) => v + 1);
    });
  }

  ngOnDestroy() {
    this.productSearchSub?.unsubscribe();
    this.productIdSub?.unsubscribe();
  }

  private applyDialogData() {
    const data = this.dialogData;
    if (!data) return;

    if (data.mode === 'edit' && data.lineItem) {
      this.isEditMode.set(true);
      this.form.patchValue({
        productId: data.lineItem.productId,
        quantity: data.lineItem.quantity,
        unitPrice: data.lineItem.unitPrice,
      });

      // Find and lock the product
      const product = this.productService.products().find((p) => p.id === data.lineItem!.productId) ?? null;
      this.selectedProduct.set(product);

      // Disable productId in edit mode
      this.form.controls['productId'].disable();
    }
  }

  selectProduct(productId: string) {
    const product = this.productService.products().find((p) => p.id === productId) ?? null;
    this.selectedProduct.set(product);
    this.form.controls['productId'].setValue(productId);

    if (product) {
      // Set default unit price
      const defaultPrice = product.sellingPrice > 0
        ? product.sellingPrice
        : computeRecommendedPrice(product.averagePurchasePrice);
      this.form.controls['unitPrice'].setValue(defaultPrice);

      // Reset quantity to 1
      this.form.controls['quantity'].setValue(1);
    }

    // Re-evaluate validators that depend on selectedProduct (e.g. stock limit)
    this.form.controls['quantity'].updateValueAndValidity();
  }

  onProductSearch(query: string) {
    this.productSearch$.next(query);
  }

  onSave() {
    if (this.form.invalid) return;

    // Ensure productId is enabled to read its value (was disabled in edit mode)
    const productIdControl = this.form.controls['productId'];
    const productId = this.isEditMode() ? this.dialogData?.lineItem?.productId ?? '' : productIdControl.value;

    const product = this.selectedProduct();
    const result: ProductSelectionDialogResult = {
      productId: productId ?? '',
      name: product?.name ?? this.dialogData?.lineItem?.name ?? '',
      quantity: this.form.controls['quantity'].value,
      unitPrice: this.form.controls['unitPrice'].value,
      referenceSellingPrice: product?.sellingPrice ?? this.dialogData?.lineItem?.referenceSellingPrice ?? 0,
      referenceAveragePrice: product?.averagePurchasePrice ?? this.dialogData?.lineItem?.referenceAveragePrice ?? 0,
      referenceStock: product?.currentStock ?? this.dialogData?.lineItem?.referenceStock ?? 0,
    };
    this.dialogRef.close(result);
  }

  onCancel() {
    this.dialogRef.close(undefined);
  }
}
