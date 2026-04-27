import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { FinanceService } from '../../../services/finance.service';
import { FinanceInvoice, InvoiceItem, FinanceCustomer, FinanceProduct } from '../../../models/finance.model';
import { startWith, map } from 'rxjs';

@Component({
  selector: 'app-general-invoice-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSelectModule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white max-w-3xl flex flex-col max-h-[95vh]">
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <!-- Fixed Header -->
      <header class="flex items-center gap-5 p-8 pb-4 relative z-10">
        <div class="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <mat-icon class="!text-[28px]">add_business</mat-icon>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Nueva Factura de Venta</h2>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Servicios y Productos Generales</p>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar" style="max-height: 65vh;">
        <form [formGroup]="invoiceForm" class="space-y-6 pb-4">
          <!-- Customer Selection Area -->
          <div class="space-y-4">
            @if (!selectedCustomer()) {
              <div class="p-6 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top duration-300">
                <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 mb-2 block">Seleccionar Cliente</label>
                <mat-form-field appearance="outline" class="w-full !m-0">
                  <mat-label>Buscar por nombre o identificación...</mat-label>
                  <input matInput [matAutocomplete]="autoCustomer" formControlName="customerSearch">
                  <mat-icon matPrefix class="mr-2 text-gray-400">search</mat-icon>
                  <mat-autocomplete #autoCustomer="matAutocomplete" [displayWith]="displayCustomer" (optionSelected)="onCustomerSelected($event.option.value)">
                    @for (customer of filteredCustomers(); track customer.id) {
                      <mat-option [value]="customer">
                        <div class="flex flex-col py-1">
                          <span class="font-bold text-sm">{{ customer.name }}</span>
                          <span class="text-[10px] text-gray-400 tracking-tighter">NIT: {{ customer.taxId }}</span>
                        </div>
                      </mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
              </div>
            } @else {
              <!-- Selected Customer Premium Card -->
              <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex justify-between items-center animate-in zoom-in duration-300">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                    <mat-icon class="!text-[28px]">business</mat-icon>
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
                <button type="button" mat-stroked-button color="primary" (click)="selectedCustomer.set(null)" class="!rounded-full !h-10 !border-indigo-200 hover:!bg-white">
                  Cambiar
                </button>
              </div>
            }
          </div>

          <!-- Items Section -->
          <div class="space-y-4">
            <div class="flex justify-between items-center px-1">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Detalle de Ítems</label>
              <button type="button" mat-button color="primary" (click)="addItem()" class="!rounded-full !font-bold">
                <mat-icon class="mr-1">add_circle</mat-icon> Añadir Ítem
              </button>
            </div>

            <div formArrayName="items" class="space-y-4">
              @for (item of items.controls; track $index) {
                <div [formGroupName]="$index" class="p-6 bg-white border border-gray-100 rounded-[28px] space-y-4 group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all relative animate-in fade-in zoom-in duration-300">
                  
                  <!-- Line 1: Main Product / Service Search -->
                  <div class="flex gap-3 items-start">
                    <mat-form-field appearance="outline" class="flex-1 !m-0">
                      <mat-label>Descripción del Producto o Servicio</mat-label>
                      <input matInput [matAutocomplete]="autoProd" formControlName="description" placeholder="Ej: Mantenimiento Preventivo">
                      <mat-icon matPrefix class="mr-2 text-gray-400">inventory_2</mat-icon>
                      <mat-autocomplete #autoProd="matAutocomplete" (optionSelected)="onProductSelected($index, $event.option.value)">
                        @for (prod of financeService.catalog(); track prod.id) {
                          <mat-option [value]="prod.name">
                            <div class="flex justify-between items-center w-full">
                              <span class="font-bold text-sm">{{ prod.name }}</span>
                              <span class="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-black text-gray-500 uppercase tracking-tighter">{{ prod.category }}</span>
                            </div>
                          </mat-option>
                        }
                      </mat-autocomplete>
                    </mat-form-field>
                    
                    <button type="button" mat-icon-button color="warn" (click)="removeItem($index)" 
                            class="!w-12 !h-12 !rounded-2xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>

                  <!-- Line 2: Numerical Inputs Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <mat-form-field appearance="outline" class="w-full !m-0">
                      <mat-label>Cantidad</mat-label>
                      <input matInput type="number" formControlName="quantity">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full !m-0">
                      <mat-label>Precio Unitario</mat-label>
                      <input matInput type="number" formControlName="unitPrice" class="font-bold">
                      <span matPrefix class="mr-1 text-gray-400 font-bold">$</span>
                    </mat-form-field>

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
          <button mat-button type="button" (click)="dialogRef.close()" class="!rounded-full !h-12 !px-8 !font-bold text-gray-500">
            Cancelar
          </button>
          <button mat-flat-button color="primary" type="button" (click)="onSubmit()" [disabled]="invoiceForm.invalid || !selectedCustomer()" class="!rounded-full !h-12 !px-12 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform">
            Emitir Factura Electrónica
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class GeneralInvoiceFormDialogOrganism {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<GeneralInvoiceFormDialogOrganism>);
  public financeService = inject(FinanceService);

  selectedCustomer = signal<FinanceCustomer | null>(null);

  invoiceForm = this.fb.group({
    customerSearch: [''],
    items: this.fb.array([])
  });

  // Reactive Customer Filtering
  filteredCustomers = toSignal(
    this.invoiceForm.get('customerSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const val = value as string | FinanceCustomer | null;
        const name = typeof val === 'string' ? val : val?.name;
        return name ? this._filterCustomers(name) : this.financeService.customers();
      })
    ),
    { initialValue: this.financeService.customers() }
  );

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  constructor() {
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
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // Selection Handlers
  onCustomerSelected(customer: FinanceCustomer) {
    this.selectedCustomer.set(customer);
    this.invoiceForm.get('customerSearch')?.setValue('');
  }

  onProductSelected(index: number, productName: string) {
    const product = this.financeService.catalog().find(p => p.name === productName);
    if (product) {
      this.items.at(index).patchValue({
        unitPrice: product.price,
        taxRate: product.taxRate
      });
    }
  }

  displayCustomer(customer: FinanceCustomer): string {
    return customer?.name || '';
  }

  private _filterCustomers(name: string): FinanceCustomer[] {
    const filterValue = name.toLowerCase();
    return this.financeService.customers().filter(c => c.name.toLowerCase().includes(filterValue));
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

  onSubmit() {
    if (this.invoiceForm.valid && this.selectedCustomer()) {
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
    }
  }
}
