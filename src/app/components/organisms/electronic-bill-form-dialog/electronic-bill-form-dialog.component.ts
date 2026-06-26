import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom } from '../../atoms/select/select.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SpinnerAtom } from '../../atoms/spinner/spinner.component';
import { FinanceService } from '../../../services/finance.service';
import { InvoiceService } from '../../../services/invoice.service';
import { CreateElectronicBillResponse } from '../../../models/finance.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-electronic-bill-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    SpinnerAtom,
  ],
  template: `
    <div
      class="relative overflow-hidden rounded-[32px] bg-white max-w-3xl flex flex-col max-h-[95vh]">
      <div
        class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50">
      </div>

      <!-- Fixed Header -->
      <header class="flex items-center gap-5 p-8 pb-4 relative z-10">
        <div
          class="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <span class="material-icons !text-[28px]">receipt_long</span>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">
            Nueva Factura Electrónica
          </h2>
          <p
            class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Emisión directa — DIAN / Factus
          </p>
        </div>
        <ui-button
          variant="icon"
          (clicked)="dialogRef.close()"
          ariaLabel="Cerrar diálogo"
          class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <!-- Scrollable Content -->
      <div
        class="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar"
        style="max-height: 65vh">
        <form [formGroup]="billForm" class="space-y-6 pb-4">
          <!-- Manual Bill Toggle -->
          <div class="space-y-3">
            <label
              class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-indigo-200 transition-colors">
              <input
                type="checkbox"
                [formControl]="billForm.controls.loadFromManual"
                class="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-bold text-gray-700"
                >Cargar desde factura manual</span
              >
            </label>

            @if (billForm.controls.loadFromManual.value) {
              <div class="animate-in fade-in slide-in-from-top duration-300">
                <ui-select
                  [searchable]="true"
                  [loading]="searchingManual()"
                  [options]="manualInvoiceOptions()"
                  placeholder="Buscar factura manual por número..."
                  [formControl]="billForm.controls.manualBillNumber"
                  (searchChange)="onManualBillSearch($event)" />
              </div>
            }
          </div>

          <!-- Consistency Warning Banner -->
          @if (isInconsistent()) {
            <div
              class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in duration-300">
              <span class="material-icons text-amber-500 text-xl mt-0.5"
                >warning_amber</span
              >
              <div>
                <p class="text-sm font-bold text-amber-800">
                  {{ warningMessage() }}
                </p>
                <p class="text-xs text-amber-600 mt-1">
                  La factura NO quedará vinculada a la factura manual
                  {{ loadedManualBillNumber() }}.
                </p>
              </div>
            </div>
          }

          <!-- Customer Section -->
          <div class="space-y-4">
            <label
              class="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Datos del Cliente
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ui-text-input
                label="Identificación / NIT"
                placeholder="123456789"
                [formControl]="billForm.controls.identification" />
              <ui-text-input
                label="Nombre / Razón Social"
                placeholder="Cliente S.A.S."
                [formControl]="billForm.controls.customerName" />
              <ui-text-input
                label="Dirección"
                placeholder="calle 1 # 1-1"
                [formControl]="billForm.controls.address" />
              <ui-text-input
                label="Email"
                type="email"
                placeholder="cliente@correo.com"
                [formControl]="billForm.controls.email" />
              <ui-text-input
                label="Teléfono"
                placeholder="1234567890"
                [formControl]="billForm.controls.phone" />
            </div>
          </div>

          <!-- Items Section -->
          <div class="space-y-4">
            <div class="flex justify-between items-center px-1">
              <label
                class="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Productos / Servicios
              </label>
              <ui-button variant="ghost" (clicked)="addItem()">
                <span class="material-icons mr-1">add_circle</span>
                Añadir Ítem
              </ui-button>
            </div>

            <div formArrayName="items" class="space-y-4">
              @for (item of items.controls; track $index) {
                <div
                  [formGroupName]="$index"
                  class="p-6 bg-white border border-gray-100 rounded-[28px] space-y-4 group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all relative animate-in fade-in zoom-in duration-300">
                  <!-- Line 1: Code + Name -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ui-text-input
                      label="Código"
                      placeholder="SKU-001"
                      [formControl]="$any(item).controls.codeReference" />
                    <ui-text-input
                      label="Nombre"
                      placeholder="Producto o servicio"
                      class="sm:col-span-2"
                      [formControl]="$any(item).controls.name" />
                  </div>

                  <!-- Line 2: Quantity + Price + Subtotal -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ui-text-input
                      label="Cantidad"
                      type="number"
                      [formControl]="$any(item).controls.quantity" />
                    <ui-text-input
                      label="Precio Unitario"
                      type="number"
                      icon="attach_money"
                      [formControl]="$any(item).controls.price" />
                    <div
                      class="flex flex-col justify-center items-end bg-indigo-50/30 rounded-2xl px-5 py-2 border border-dashed border-indigo-100/50">
                      <span
                        class="text-[9px] text-indigo-400 font-black uppercase tracking-[0.15em]">
                        Subtotal
                      </span>
                      <span
                        class="text-lg font-black text-indigo-600 tabular-nums">
                        {{
                          (item.get('quantity')?.value ?? 0) *
                            (item.get('price')?.value ?? 0)
                            | currency: 'USD' : 'symbol' : '1.0-0'
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- Remove item button -->
                  @if (items.controls.length > 1) {
                    <ui-button
                      variant="icon"
                      (clicked)="removeItem($index)"
                      class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="material-icons">delete_outline</span>
                    </ui-button>
                  }
                </div>
              }
            </div>
          </div>
        </form>
      </div>

      <!-- Fixed Footer -->
      <div class="p-8 pt-4 border-t border-gray-50 bg-white relative z-20">
        <!-- Loading spinner -->
        @if (submitting()) {
          <div
            class="flex items-center justify-center py-4 mb-4 bg-indigo-50 rounded-2xl">
            <ui-spinner />
            <span class="ml-3 text-sm font-bold text-indigo-600"
              >Emitiendo factura electrónica...</span
            >
          </div>
        }

        <!-- Summary and Totals -->
        <div
          class="p-6 bg-indigo-900 rounded-[28px] text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden mb-6">
          <div
            class="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl">
          </div>

          <div class="flex flex-col gap-1 relative z-10">
            <span
              class="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em]">
              Resumen
            </span>
            <span
              class="text-xs font-bold text-indigo-100/60 uppercase">
              {{ items.controls.length }} ítem(s)
            </span>
          </div>

          <div class="flex flex-col items-center md:items-end relative z-10">
            <span
              class="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-1">
              Total a Facturar
            </span>
            <span
              class="text-4xl font-black tabular-nums tracking-tighter">
              {{ calculateTotal() | currency: 'USD' : 'symbol' : '1.0-0' }}
            </span>
          </div>
        </div>

        <!-- Error -->
        @if (error(); as err) {
          <div
            class="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <span class="material-icons text-red-500 mt-0.5">error</span>
            <p class="text-sm font-medium text-red-700">{{ err }}</p>
          </div>
        }

        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <ui-button variant="outline" (clicked)="onCancel()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            (clicked)="onSubmit()"
            [disabled]="billForm.invalid || submitting()">
            @if (!submitting()) {
              <span class="material-icons mr-2">send</span>
            }
            Emitir
          </ui-button>
        </div>
      </div>
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
export class ElectronicBillFormDialogOrganism {
  private fb = inject(FormBuilder);
  public financeService = inject(FinanceService);
  public invoiceService = inject(InvoiceService);
  public dialogRef = inject(
    MatDialogRef<ElectronicBillFormDialogOrganism, CreateElectronicBillResponse | null>
  );

  submitting = signal(false);
  error = signal<string | null>(null);

  // Manual bill search state
  searchingManual = signal(false);
  manualSearchResults = signal<any[]>([]);
  loadedManualBillNumber = signal<string | null>(null);

  manualBillSearch$ = new Subject<string>();

  // Consistency check
  private originalSnapshot = signal<string | null>(null);
  isInconsistent = signal(false);
  warningMessage = signal('');

  manualInvoiceOptions = computed(() =>
    this.manualSearchResults().map((inv: any) => ({
      value: inv.id,
      label: inv.invoiceNumber,
      subtitle: `${inv.customer?.names || ''} — $${inv.totalAmount}`,
    }))
  );

  billForm = this.fb.group({
    loadFromManual: [false],
    manualBillNumber: [''],
    identification: ['', Validators.required],
    customerName: ['', Validators.required],
    address: [''],
    email: [''],
    phone: [''],
    items: this.fb.array([]),
  });

  get items() {
    return this.billForm.get('items') as FormArray;
  }

  constructor() {
    this.addItem(); // Start with one item row

    // Set up debounced manual bill search
    this.manualBillSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term || term.length < 3) {
            this.manualSearchResults.set([]);
            this.searchingManual.set(false);
            return [];
          }
          this.searchingManual.set(true);
          return this.invoiceService.searchManualBills(term);
        })
      )
      .subscribe({
        next: (results: any) => {
          this.manualSearchResults.set(Array.isArray(results) ? results : []);
          this.searchingManual.set(false);
        },
        error: () => {
          this.searchingManual.set(false);
        },
      });

    // Load manual invoices when the checkbox is enabled
    this.billForm.controls.loadFromManual.valueChanges.subscribe((enabled) => {
      if (enabled) {
        this.searchingManual.set(true);
        this.invoiceService.searchManualBills('').subscribe({
          next: (results: any) => {
            this.manualSearchResults.set(Array.isArray(results) ? results : []);
            this.searchingManual.set(false);
          },
          error: () => {
            this.searchingManual.set(false);
          },
        });
      } else {
        this.manualSearchResults.set([]);
        this.loadedManualBillNumber.set(null);
        this.originalSnapshot.set(null);
        this.isInconsistent.set(false);
        this.billForm.controls.manualBillNumber.setValue('');
      }
    });

    // Watch manual bill number selection to auto-populate
    this.billForm.controls.manualBillNumber.valueChanges.subscribe(
      (invoiceId) => {
        if (invoiceId && typeof invoiceId === 'string') {
          const selected = this.manualSearchResults().find(
            (inv) => inv.id === invoiceId
          );
          if (selected) {
            this.populateFromManualInvoice(selected);
          }
        }
      }
    );

    // Watch form changes for consistency check
    this.billForm.valueChanges.subscribe(() => {
      const snap = this.originalSnapshot();
      if (snap) {
        const current = JSON.stringify(this.captureFormValues());
        this.isInconsistent.set(current !== snap);
        if (this.isInconsistent()) {
          this.warningMessage.set(
            `Los valores han cambiado. La factura NO quedará vinculada a la factura manual ${this.loadedManualBillNumber()}.`
          );
        }
      }
    });
  }

  private captureFormValues() {
    return {
      identification: this.billForm.controls.identification.value,
      customerName: this.billForm.controls.customerName.value,
      address: this.billForm.controls.address.value,
      email: this.billForm.controls.email.value,
      phone: this.billForm.controls.phone.value,
      items: this.items.controls.map((ctrl) => ({
        codeReference: ctrl.get('codeReference')?.value,
        name: ctrl.get('name')?.value,
        quantity: ctrl.get('quantity')?.value,
        price: ctrl.get('price')?.value,
        productId: ctrl.get('productId')?.value,
      })),
    };
  }

  private populateFromManualInvoice(invoice: any) {
    // Clear existing items first
    while (this.items.length > 0) {
      this.items.removeAt(0);
    }

    // Set customer data
    const customer = invoice.customer || {};
    this.billForm.patchValue({
      identification: customer.identification || '',
      customerName: customer.names || '',
      address: customer.address || '',
      email: customer.email || '',
      phone: customer.phone || '',
    });

    // Set items
    const invItems = invoice.items || [];
    for (const item of invItems) {
      const itemGroup = this.fb.group({
        codeReference: [item.codeReference || '', Validators.required],
        name: [item.name || '', Validators.required],
        quantity: [item.quantity || 1, [Validators.required, Validators.min(1)]],
        price: [item.price || 0, [Validators.required, Validators.min(0)]],
        productId: [item.productId || ''],
      });
      this.items.push(itemGroup);
    }

    this.loadedManualBillNumber.set(invoice.invoiceNumber || '');
    // Store snapshot for consistency checking
    this.originalSnapshot.set(JSON.stringify(this.captureFormValues()));
    this.isInconsistent.set(false);
  }

  onManualBillSearch(query: string): void {
    this.manualBillSearch$.next(query);
  }

  addItem() {
    const itemGroup = this.fb.group({
      codeReference: ['', Validators.required],
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      productId: [''],
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  calculateTotal(): number {
    return this.items.controls.reduce((acc, ctrl) => {
      const q = ctrl.get('quantity')?.value || 0;
      const p = ctrl.get('price')?.value || 0;
      return acc + q * p;
    }, 0);
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  onSubmit() {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const payload = {
      manualInvoiceId: this.isInconsistent()
        ? undefined
        : (this.billForm.controls.manualBillNumber.value || undefined),
      customer: {
        identification: this.billForm.controls.identification.value || '',
        names: this.billForm.controls.customerName.value || '',
        address: this.billForm.controls.address.value || undefined,
        email: this.billForm.controls.email.value || undefined,
        phone: this.billForm.controls.phone.value || undefined,
      },
      items: this.items.controls.map((ctrl) => ({
        codeReference: ctrl.get('codeReference')?.value || '',
        name: ctrl.get('name')?.value || '',
        quantity: ctrl.get('quantity')?.value || 1,
        price: ctrl.get('price')?.value || 0,
        productId: ctrl.get('productId')?.value || undefined,
      })),
    };

    this.financeService.createElectronicBill(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.dialogRef.close(response);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(
          err?.error?.message ||
            err?.message ||
            'Error al emitir factura electrónica'
        );
      },
    });
  }
}
