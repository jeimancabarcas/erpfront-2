import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FinanceService } from '../../../services/finance.service';
import { AdjustmentNote, FinanceInvoice } from '../../../models/finance.model';
import { startWith, map } from 'rxjs';

@Component({
  selector: 'app-adjustment-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[40px] bg-white flex flex-col max-h-[95vh]">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
      
      <!-- Fixed Header -->
      <header class="flex items-center gap-6 p-10 pb-6 relative z-10">
        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-amber-100">
          <mat-icon class="!text-[32px] !w-8 !h-8">history_edu</mat-icon>
        </div>
        <div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Nota de Ajuste</h2>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            Emisión de Documento Electrónico
          </p>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-10 py-2 custom-scrollbar" style="max-height: 60vh;">
        <form [formGroup]="adjustmentForm" class="space-y-4 pb-6">
          
          <!-- Type Selection Group -->
          <div class="space-y-3">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 block">Clase de Documento</label>
            <div class="flex gap-3 p-1.5 bg-gray-50/80 rounded-[22px] border border-gray-100/50 backdrop-blur-sm">
              <button 
                type="button" 
                class="flex-1 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all duration-300"
                [class.bg-white]="adjustmentForm.get('type')?.value === 'Credit'"
                [class.text-amber-600]="adjustmentForm.get('type')?.value === 'Credit'"
                [class.shadow-md]="adjustmentForm.get('type')?.value === 'Credit'"
                [class.text-gray-400]="adjustmentForm.get('type')?.value !== 'Credit'"
                (click)="adjustmentForm.get('type')?.setValue('Credit')"
              >
                Nota Crédito
              </button>
              <button 
                type="button" 
                class="flex-1 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all duration-300"
                [class.bg-white]="adjustmentForm.get('type')?.value === 'Debit'"
                [class.text-amber-600]="adjustmentForm.get('type')?.value === 'Debit'"
                [class.shadow-md]="adjustmentForm.get('type')?.value === 'Debit'"
                [class.text-gray-400]="adjustmentForm.get('type')?.value !== 'Debit'"
                (click)="adjustmentForm.get('type')?.setValue('Debit')"
              >
                Nota Débito
              </button>
            </div>
          </div>

          <!-- Invoice Selection (Same format as Customers) -->
          <div class="space-y-3">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 block">Factura de Referencia</label>
            @if (!selectedInvoice()) {
              <div class="p-1 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top duration-300">
                <mat-form-field appearance="outline" class="w-full !m-0">
                  <mat-label>Buscar factura por número o cliente...</mat-label>
                  <input matInput [matAutocomplete]="autoInvoice" formControlName="invoiceSearch">
                  <mat-icon matPrefix class="mr-2 text-gray-400">search</mat-icon>
                  <mat-autocomplete #autoInvoice="matAutocomplete" [displayWith]="displayInvoice" (optionSelected)="onInvoiceSelected($event.option.value)">
                    @for (inv of filteredInvoices(); track inv.id) {
                      <mat-option [value]="inv">
                        <div class="flex flex-col py-1">
                          <span class="font-bold text-sm">{{ inv.id }}</span>
                          <span class="text-[10px] text-gray-400 tracking-tighter">{{ inv.customerName }} • {{ inv.total | currency:'USD':'symbol':'1.0-0' }}</span>
                        </div>
                      </mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
              </div>
            } @else {
              <!-- Selected Invoice Premium Card -->
              <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex justify-between items-center animate-in zoom-in duration-300">
                <div class="flex items-center gap-5">
                  <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                    <mat-icon class="!text-[28px]">receipt</mat-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-lg font-black text-indigo-900 leading-none mb-1">{{ selectedInvoice()?.id }}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{{ selectedInvoice()?.customerName }}</span>
                    </div>
                    <span class="text-[10px] font-bold text-gray-400">{{ selectedInvoice()?.total | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
                <button type="button" mat-stroked-button color="primary" (click)="selectedInvoice.set(null)" class="!rounded-full !h-10 !border-indigo-200 hover:!bg-white">
                  Cambiar
                </button>
              </div>
            }
          </div>

          <!-- Amount Selection -->
          <div class="space-y-3">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 block">Valor del Ajuste</label>
            <mat-form-field appearance="outline" class="w-full !m-0">
              <mat-label>Ingrese el monto total del ajuste</mat-label>
              <input matInput type="number" formControlName="amount" placeholder="0.00" class="font-black">
              <mat-icon matPrefix class="mr-2 text-gray-400">attach_money</mat-icon>
            </mat-form-field>
          </div>

          <!-- Technical Reason -->
          <div class="space-y-3">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 block">Justificación Técnica</label>
            <mat-form-field appearance="outline" class="w-full !m-0">
              <mat-label>Motivo detallado del ajuste contable</mat-label>
              <textarea matInput formControlName="reason" rows="4" placeholder="Ej: Devolución por mercancía en mal estado..."></textarea>
              <mat-icon matPrefix class="mr-2 text-gray-400">subject</mat-icon>
            </mat-form-field>
          </div>
        </form>
      </div>

      <!-- Fixed Footer Actions -->
      <div class="p-10 pt-6 border-t border-gray-50 bg-white relative z-20">
        <div class="flex flex-col gap-4">
          <button mat-flat-button color="primary" type="button" (click)="onSubmit()"
            [disabled]="adjustmentForm.invalid || !selectedInvoice()" 
            class="!rounded-full !h-16 !font-black !bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl shadow-amber-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Transmitir Comprobante Electrónico
          </button>
          <button mat-button type="button" (click)="dialogRef.close()" class="!rounded-full !h-12 !font-bold text-gray-400 hover:text-gray-600">
            Cancelar Operación
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    ::ng-deep .mat-mdc-select-value { font-weight: 700; color: #1e1b4b; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class AdjustmentFormDialogOrganism {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<AdjustmentFormDialogOrganism>);
  public data = inject(MAT_DIALOG_DATA, { optional: true });
  public financeService = inject(FinanceService);

  selectedInvoice = signal<FinanceInvoice | null>(null);

  adjustmentForm = this.fb.group({
    type: [this.data?.type || 'Credit', Validators.required],
    invoiceSearch: [''],
    reason: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    if (this.data?.invoice) {
      // Need to handle this after component initialization or use an effect/hook
      // Since it's a simple assignment to signal, doing it in constructor is fine
      // but onInvoiceSelected also patches the form.
      setTimeout(() => {
        if (this.data?.invoice) {
          this.onInvoiceSelected(this.data.invoice);
        }
      });
    }
  }

  // Reactive Invoice Filtering
  filteredInvoices = toSignal(
    this.adjustmentForm.get('invoiceSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const val = value as string | FinanceInvoice | null;
        const query = typeof val === 'string' ? val : val?.id;
        return query ? this._filterInvoices(query) : this.financeService.invoices();
      })
    ),
    { initialValue: this.financeService.invoices() }
  );

  onInvoiceSelected(invoice: FinanceInvoice) {
    this.selectedInvoice.set(invoice);
    this.adjustmentForm.get('invoiceSearch')?.setValue('');
    this.adjustmentForm.patchValue({ amount: invoice.total });
  }

  displayInvoice(invoice: FinanceInvoice): string {
    return invoice?.id || '';
  }

  private _filterInvoices(query: string): FinanceInvoice[] {
    const filterValue = query.toLowerCase();
    return this.financeService.invoices().filter(inv =>
      inv.id.toLowerCase().includes(filterValue) ||
      inv.customerName.toLowerCase().includes(filterValue)
    );
  }

  onSubmit() {
    if (this.adjustmentForm.valid && this.selectedInvoice()) {
      const val = this.adjustmentForm.value;
      const newAdjustment: AdjustmentNote = {
        id: `${val.type === 'Credit' ? 'NC' : 'ND'}-${Math.floor(Math.random() * 900 + 100)}`,
        type: val.type as any,
        invoiceId: this.selectedInvoice()!.id,
        date: new Date().toISOString().split('T')[0],
        reason: val.reason!,
        amount: val.amount!,
        status: 'Electronic_Sent',
        electronicId: `cude-${Math.random().toString(36).substring(2, 10)}`
      };

      this.financeService.addAdjustment(newAdjustment);
      this.dialogRef.close(newAdjustment);
    }
  }
}
