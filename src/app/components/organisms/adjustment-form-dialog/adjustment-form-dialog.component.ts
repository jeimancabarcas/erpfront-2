import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { FinanceService } from '../../../services/finance.service';
import { InvoiceService } from '../../../services/invoice.service';
import { SalesNoteService } from '../../../services/sales-note.service';
import { Invoice } from '../../../models/invoice.model';
import { AdjustmentNote, FinanceInvoice } from '../../../models/finance.model';
import { startWith, map } from 'rxjs';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface AdjustmentFormData {
  type?: 'Credit' | 'Debit';
  invoice?: FinanceInvoice;
}

@Component({
  selector: 'app-adjustment-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatAutocompleteModule,
    MatSnackBarModule,
    ButtonAtom,
    TextInputComponent,
    SelectAtom,
    TextareaComponent
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="dialogRef.close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="relative overflow-hidden rounded-[40px] bg-white flex flex-col max-h-[95vh]">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
      
      <!-- Fixed Header -->
      <header class="flex items-center gap-6 p-10 pb-6 relative z-10">
        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-amber-100">
          <span class="material-icons !text-[32px] !w-8 !h-8">history_edu</span>
        </div>
        <div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Nota de Ajuste</h2>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            Emisión de Documento Electrónico
          </p>
        </div>
        <ui-button variant="icon" (clicked)="dialogRef.close()" ariaLabel="Cerrar diálogo" class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
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

          <!-- Invoice Reference Selection -->
          <div class="space-y-3">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 block">Factura de Referencia</label>
            @if (!selectedInvoice()) {
              <div class="p-1 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top duration-300">
                <mat-form-field appearance="outline" class="w-full !m-0">
                  <mat-label>Buscar factura por número o cliente...</mat-label>
                  <input matInput [matAutocomplete]="autoInvoice" formControlName="invoiceSearch">
                  <span class="material-icons" matPrefix class="mr-2 text-gray-400">search</span>
                  <mat-autocomplete #autoInvoice="matAutocomplete" [displayWith]="displayInvoice" (optionSelected)="onInvoiceSelected($event.option.value)">
                    @for (inv of filteredInvoices(); track inv.id) {
                      <mat-option [value]="inv">
                        <div class="flex flex-col py-1">
                          <span class="font-bold text-sm text-gray-900">{{ inv.id }}</span>
                          <span class="text-[10px] text-gray-500 tracking-tighter">{{ inv.customerName }} • {{ inv.total | currency:'USD':'symbol':'1.0-0' }}</span>
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
                    <span class="material-icons !text-[28px]">receipt</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-lg font-black text-indigo-900 leading-none mb-1">{{ selectedInvoice()?.id }}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{{ selectedInvoice()?.customerName }}</span>
                    </div>
                    <span class="text-[10px] font-bold text-gray-500">{{ selectedInvoice()?.total | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
                <button type="button" mat-stroked-button color="primary" (click)="selectedInvoice.set(null)" class="!rounded-full !h-10 !border-indigo-200 hover:!bg-white">
                  Cambiar
                </button>
              </div>
            }
          </div>

          <!-- DIAN Correction Concept -->
          <ui-select label="Concepto de Corrección (DIAN)" placeholder="Seleccione el concepto" [options]="correctionConceptOptions()" [formControl]="adjustmentForm.controls.correctionConceptCode" />

          <!-- Amount Selection -->
          <div class="space-y-3">
            <ui-text-input label="Valor del Ajuste" type="number" icon="attach_money" placeholder="0.00" [formControl]="adjustmentForm.controls.amount" />
          </div>

          <!-- Technical Reason -->
          <ui-textarea formControlName="reason" label="Justificación Técnica" placeholder="Ej: Devolución por mercancía en mal estado..." rows="4" />
        </form>
      </div>

      <!-- Fixed Footer Actions -->
      <div class="p-10 pt-6 border-t border-gray-50 bg-white relative z-20">
        <div class="flex flex-col gap-4">
          <button mat-flat-button color="primary" type="button" (click)="onSubmit()"
            [disabled]="adjustmentForm.invalid || !selectedInvoice() || isSubmitting()" 
            class="!rounded-full !h-16 !font-black !bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl shadow-amber-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100">
            @if (isSubmitting()) {
              Transmitiendo nota...
            } @else {
              Transmitir Comprobante Electrónico
            }
          </button>
          <button mat-button type="button" (click)="dialogRef.close()" class="!rounded-full !h-12 !font-bold text-gray-400 hover:text-gray-600">
            Cancelar Operación
          </button>
        </div>
      </div>
    </div>
    }
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
export class AdjustmentFormDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<AdjustmentFormDialogOrganism>);
  private readonly data: AdjustmentFormData = inject(MAT_DIALOG_DATA, { optional: true }) || {};
  public financeService = inject(FinanceService);
  private invoiceService = inject(InvoiceService);
  private salesNoteService = inject(SalesNoteService);
  private snackBar = inject(MatSnackBar);

  selectedInvoice = signal<FinanceInvoice | null>(null);
  isSubmitting = signal<boolean>(false);

  adjustmentForm = this.fb.group({
    type: [this.data.type || 'Credit', Validators.required],
    invoiceSearch: [''],
    reason: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    correctionConceptCode: ['', Validators.required]
  });

  // Real invoices from the system mapped to FinanceInvoice structure
  realFinanceInvoices = computed(() => {
    return this.invoiceService.invoices().map(inv => this.mapBackendInvoiceToFinanceInvoice(inv));
  });

  // Reactive Invoice Filtering
  filteredInvoices = toSignal(
    this.adjustmentForm.get('invoiceSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const val = value as string | FinanceInvoice | null;
        const query = typeof val === 'string' ? val : val?.id;
        return query ? this._filterInvoices(query) : this.realFinanceInvoices();
      })
    ),
    { initialValue: [] as FinanceInvoice[] }
  );

  // Dynamic Correction Concepts list based on Type (Credit or Debit)
  correctionConcepts = computed(() => {
    const type = this.adjustmentForm.get('type')?.value;
    if (type === 'Credit') {
      return [
        { code: '1', label: '1 - Devolución parcial de los bienes o no aceptación del servicio' },
        { code: '2', label: '2 - Anulación de factura electrónica' },
        { code: '3', label: '3 - Rebaja o descuento parcial o total' },
        { code: '4', label: '4 - Ajuste de precio' },
        { code: '5', label: '5 - Otros' }
      ];
    } else {
      return [
        { code: '1', label: '1 - Intereses' },
        { code: '2', label: '2 - Gastos por cobrar' },
        { code: '3', label: '3 - Cambio del valor' },
        { code: '4', label: '4 - Otros' }
      ];
    }
  });

  correctionConceptOptions = computed<SelectOption[]>(() =>
    this.correctionConcepts().map(c => ({ value: c.code, label: c.label }))
  );

  constructor() {
    if (this.data.invoice) {
      setTimeout(() => {
        if (this.data.invoice) {
          this.onInvoiceSelected(this.data.invoice);
        }
      });
    }
  }

  ngOnInit() {
    this.invoiceService.loadInvoices({ limit: 100 }).subscribe();

    // Reset correctionConceptCode when type changes to avoid cross-type values
    this.adjustmentForm.get('type')?.valueChanges.subscribe(() => {
      this.adjustmentForm.get('correctionConceptCode')?.setValue('');
    });
  }

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
    return this.realFinanceInvoices().filter(inv =>
      inv.id.toLowerCase().includes(filterValue) ||
      inv.customerName.toLowerCase().includes(filterValue)
    );
  }

  private mapBackendInvoiceToFinanceInvoice(inv: Invoice): FinanceInvoice {
    return {
      id: inv.invoiceNumber || inv.id,
      dbId: inv.id,
      customerName: inv.customer?.name || 'Cliente Desconocido',
      customerTaxId: inv.customer?.documentNumber || 'N/A',
      date: inv.date,
      dueDate: inv.date,
      subtotal: Number(inv.totalAmount || 0),
      tax: 0,
      total: Number(inv.totalAmount || 0),
      status: inv.status === 'PAID' ? 'Paid' : inv.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
      items: (inv.items || []).map((item, idx) => ({
        id: String(idx + 1),
        description: item.product?.name || 'Producto/Servicio',
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        taxRate: 0.19,
        total: Number(item.subtotal || 0),
        codeReference: item.product?.sku || item.productId
      }))
    };
  }

  onSubmit() {
    if (this.adjustmentForm.valid && this.selectedInvoice()) {
      const val = this.adjustmentForm.value;
      const invoice = this.selectedInvoice()!;
      const invoiceId = invoice.dbId!; // Database UUID

      this.isSubmitting.set(true);

      // Construct DTO
      const dto: any = {
        correctionConceptCode: val.correctionConceptCode!,
        observation: val.reason || 'Sin observación'
      };

      // If partial credit note, calculate and scale item prices
      if (val.amount! < invoice.total) {
        const scale = val.amount! / invoice.total;
        dto.items = invoice.items.map(item => ({
          codeReference: item.codeReference || item.id,
          quantity: item.quantity,
          price: Number((item.unitPrice * scale).toFixed(2))
        }));
      }

      const request$ = val.type === 'Credit'
        ? this.salesNoteService.createCreditNote(invoiceId, dto)
        : this.salesNoteService.createDebitNote(invoiceId, dto);

      request$.subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.snackBar.open(
            `Nota de ${val.type === 'Credit' ? 'Crédito' : 'Débito'} emitida con éxito ante la DIAN!`,
            'Cerrar',
            { duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' }
          );
          this.dialogRef.close({ success: true });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error(err);
          const errorMsg = err.error?.message || err.message || 'Error desconocido al emitir comprobante';
          this.error.set(errorMsg);
          setTimeout(() => this.dialogRef.close(), 3000);
          this.snackBar.open(
            `Error: ${errorMsg}`,
            'Cerrar',
            { duration: 8000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['bg-red-600', 'text-white'] }
          );
        }
      });
    }
  }
}
