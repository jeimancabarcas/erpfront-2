import { Component, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { FinanceService } from '../../../services/finance.service';
import { FinanceInvoice, InvoiceItem, FinanceCustomer, FinanceProduct } from '../../../models/finance.model';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface GeneralInvoiceFormResult {
  invoice: FinanceInvoice | null;
}

@Component({
  selector: 'app-general-invoice-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white max-w-3xl flex flex-col max-h-[95vh]">
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <!-- Fixed Header -->
      <header class="flex items-center gap-5 p-8 pb-4 relative z-10">
        <div class="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <span class="material-icons !text-[28px]">add_business</span>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Nueva Factura de Venta</h2>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Servicios y Productos Generales</p>
        </div>
        <ui-button variant="icon" (clicked)="dialogRef.close()" ariaLabel="Cerrar diálogo" class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar" style="max-height: 65vh;">
        <form [formGroup]="invoiceForm" class="space-y-6 pb-4">
          <!-- Customer Selection Area -->
          <div class="space-y-4">
            @if (!selectedCustomer()) {
              <div class="relative p-6 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top duration-300">
                <ui-select
                  [searchable]="true"
                  [loading]="loadingCustomers()"
                  [options]="customerOptions()"
                  placeholder="Buscar cliente..."
                  [formControl]="invoiceForm.controls.customerSearch"
                  (searchChange)="onCustomerSearch($event)"
                  footerLabel="+ Crear nuevo cliente"
                  (footerAction)="openNewCustomerDialog()"
                  [showSubtitle]="true"
                />
              </div>
            } @else {
              <!-- Selected Customer Premium Card -->
              <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex justify-between items-center animate-in zoom-in duration-300">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                    <span class="material-icons !text-[28px]">business</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-lg font-black text-indigo-900 leading-none mb-1">{{ selectedCustomer()?.name }}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">NIT: {{ selectedCustomer()?.taxId }}</span>
                      <span class="w-1 h-1 bg-indigo-200 rounded-full"></span>
                      <span class="text-[10px] font-bold text-gray-400">{{ selectedCustomer()?.email }}</span>
                    </div>
                  </div>
                </div>
                <ui-button variant="outline" (clicked)="selectedCustomer.set(null)"><!-- TODO: add variant for custom border color -->
                  Cambiar
                </ui-button>
              </div>
            }
          </div>

          <!-- Items Section -->
          <div class="space-y-4">
            <div class="flex justify-between items-center px-1">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Detalle de Ítems</label>
              <ui-button variant="ghost" (clicked)="addItem()">
                <span class="material-icons mr-1">add_circle</span> Añadir Ítem
              </ui-button>
            </div>

            <div formArrayName="items" class="space-y-4">
              @for (item of items.controls; track $index) {
                <div [formGroupName]="$index" class="p-6 bg-white border border-gray-100 rounded-[28px] space-y-4 group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all relative animate-in fade-in zoom-in duration-300">
                  
                  <!-- Line 1: Main Product / Service Search -->
                  <div class="flex gap-3 items-start">
                    <div class="flex-1">
                      <ui-select
                        [searchable]="true"
                        [options]="catalogOptions()"
                        placeholder="Buscar producto o servicio..."
                        [formControl]="$any(item).controls.description"
                        (searchChange)="onProductSearch($event)"
                      />
                    </div>
                    
                    <ui-button variant="icon" (clicked)="removeItem($index)" class="opacity-0 group-hover:opacity-100 transition-opacity"><!-- TODO: add variant for colored icon button -->
                      <span class="material-icons">delete_outline</span>
                    </ui-button>
                  </div>

                  <!-- Line 2: Numerical Inputs Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ui-text-input
                      label="Cantidad"
                      type="number"
                      [formControl]="$any(item).controls.quantity"
                    />

                    <ui-text-input
                      label="Precio Unitario"
                      type="number"
                      icon="attach_money"
                      [formControl]="$any(item).controls.unitPrice"
                    />

                    <div class="flex flex-col justify-center items-end bg-indigo-50/30 rounded-2xl px-5 py-2 border border-dashed border-indigo-100/50">
                      <span class="text-[9px] text-indigo-400 font-black uppercase tracking-[0.15em]">Subtotal Ítem</span>
                      <span class="text-lg font-black text-indigo-600 tabular-nums">
                        {{ (item.get('quantity')?.value * item.get('unitPrice')?.value) | currency:'USD':'symbol':'1.0-0' }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </form>
      </div>

      <!-- Fixed Footer -->
      <div class="p-8 pt-4 border-t border-gray-50 bg-white relative z-20">
        <!-- Summary and Totals -->
        <div class="p-6 bg-indigo-900 rounded-[28px] text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden mb-6">
          <div class="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <div class="flex flex-col gap-1 relative z-10">
            <span class="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em]">Resumen de Cobro</span>
            <div class="flex gap-4 text-xs font-bold text-indigo-100/60 uppercase">
              <span>Subtotal: {{ calculateSubtotal() | currency:'USD':'symbol':'1.0-0' }}</span>
              <span>•</span>
              <span>IVA (19%): {{ calculateTax() | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <div class="flex flex-col items-center md:items-end relative z-10">
            <span class="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-1">Total a Facturar</span>
            <span class="text-4xl font-black tabular-nums tracking-tighter">{{ calculateTotal() | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <ui-button variant="outline" (clicked)="onCancel()">
            Cancelar
          </ui-button>
          <ui-button variant="primary" (clicked)="onSubmit()" [disabled]="invoiceForm.invalid || !selectedCustomer()">
            Emitir Factura Electrónica
          </ui-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class GeneralInvoiceFormDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  private fb = inject(FormBuilder);
  public financeService = inject(FinanceService);
  public dialogRef = inject(MatDialogRef<GeneralInvoiceFormDialogOrganism, GeneralInvoiceFormResult>);

  selectedCustomer = signal<FinanceCustomer | null>(null);

  invoiceForm = this.fb.group({
    customerSearch: [''],
    items: this.fb.array([])
  });

  // ── Customer search state ──
  customerSearchTerm = signal('');
  loadingCustomers = signal(false);

  customerOptions = computed<SelectOption[]>(() => {
    const term = this.customerSearchTerm().toLowerCase();
    const customers = this.financeService.customers();
    if (!term) {
      return customers.map(c => ({
        value: c.id,
        label: c.name,
        subtitle: `NIT: ${c.taxId}`
      }));
    }
    return customers
      .filter(c => c.name.toLowerCase().includes(term) || c.taxId.includes(term))
      .map(c => ({
        value: c.id,
        label: c.name,
        subtitle: `NIT: ${c.taxId}`
      }));
  });

  // ── Product search state ──
  productSearchTerm = signal('');

  catalogOptions = computed<SelectOption[]>(() => {
    const term = this.productSearchTerm().toLowerCase();
    const catalog = this.financeService.catalog();
    if (!term) {
      return catalog.map(p => ({
        value: p.name,
        label: p.name,
        subtitle: p.category
      }));
    }
    return catalog
      .filter(p => p.name.toLowerCase().includes(term))
      .map(p => ({
        value: p.name,
        label: p.name,
        subtitle: p.category
      }));
  });

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  // Output to replace MatDialogRef
  closed = output<FinanceInvoice | null>();

  constructor() {
    // Watch customer selection from ui-select
    this.invoiceForm.get('customerSearch')?.valueChanges.subscribe((id) => {
      if (id && typeof id === 'string') {
        const customer = this.financeService.customers().find(c => c.id === id);
        if (customer) {
          this.selectedCustomer.set(customer);
        }
      }
    });
    this.addItem(); // Initial item
  }

  addItem() {
    const itemGroup = this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0.19]
    });
    this.items.push(itemGroup);

    // Watch product selection to auto-fill price and tax
    itemGroup.get('description')?.valueChanges.subscribe((productName) => {
      if (productName && typeof productName === 'string') {
        const product = this.financeService.catalog().find(p => p.name === productName);
        if (product) {
          itemGroup.patchValue({
            unitPrice: product.price,
            taxRate: product.taxRate
          }, { emitEvent: false });
        }
      }
    });
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // ── Search handlers ──
  onCustomerSearch(query: string): void {
    this.customerSearchTerm.set(query);
  }

  onProductSearch(query: string): void {
    this.productSearchTerm.set(query);
  }

  openNewCustomerDialog(): void {
    // Placeholder — wire up to customer creation dialog as needed
    console.log('Open new customer dialog');
  }

  // Totals
  calculateSubtotal(): number {
    return this.items.controls.reduce((acc, ctrl) => {
      const q = ctrl.get('quantity')?.value || 0;
      const p = ctrl.get('unitPrice')?.value || 0;
      return acc + (q * p);
    }, 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.19;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  onCancel() {
    this.dialogRef.close(null);
    this.closed.emit(null);
  }

  onSubmit() {
    if (this.invoiceForm.valid && this.selectedCustomer()) {
      this.error.set(null);
      const customer = this.selectedCustomer()!;
      const val = this.invoiceForm.value;

      const newInvoice: FinanceInvoice = {
        id: `FE-${Math.floor(Math.random() * 9000 + 1000)}`,
        customerName: customer.name,
        customerTaxId: customer.taxId,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Sent',
        subtotal: this.calculateSubtotal(),
        tax: this.calculateTax(),
        total: this.calculateTotal(),
        items: this.items.value.map((it: any, idx: number) => ({
          ...it,
          id: (idx + 1).toString(),
          total: it.quantity * it.unitPrice * (1 + it.taxRate)
        })),
        electronicId: `cufe-${Math.random().toString(36).substring(2, 10)}`
      };

      this.financeService.addInvoice(newInvoice);
      this.dialogRef.close(newInvoice);
      this.closed.emit(newInvoice);
    }
  }
}
