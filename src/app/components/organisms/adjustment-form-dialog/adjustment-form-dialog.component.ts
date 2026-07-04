import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { FinanceService } from '../../../services/finance.service';
import { InvoiceService } from '../../../services/invoice.service';
import { SalesNoteService } from '../../../services/sales-note.service';
import { Invoice } from '../../../models/invoice.model';
import { AdjustmentNote, FinanceInvoice } from '../../../models/finance.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface AdjustmentFormData {
  type?: 'Credit';
  invoice?: FinanceInvoice;
  /** When true, the electronic toggle is forced ON and disabled (e.g., from Factus documents) */
  forceElectronic?: boolean;
}

@Component({
  selector: 'app-adjustment-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule,
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
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-100">
          <span class="material-icons !text-[32px] !w-8 !h-8">history_edu</span>
        </div>
        <div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">Nota de Ajuste</h2>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
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
                [class.text-indigo-600]="adjustmentForm.get('type')?.value === 'Credit'"
                [class.shadow-md]="adjustmentForm.get('type')?.value === 'Credit'"
                [class.text-gray-400]="adjustmentForm.get('type')?.value !== 'Credit'"
                (click)="adjustmentForm.get('type')?.setValue('Credit')"
              >
                Nota Crédito
              </button>
            </div>
          </div>

          <!-- Invoice Reference Selection -->
          <div class="space-y-3">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 block">Factura de Referencia</label>
            @if (!selectedInvoice()) {
              <div class="relative p-1 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top duration-300">
                <ui-select
                  [searchable]="true"
                  [loading]="loadingInvoices()"
                  [options]="invoiceOptions()"
                  placeholder="Buscar factura por número o cliente..."
                  [formControl]="adjustmentForm.controls.invoiceSearch"
                  (searchChange)="onInvoiceSearch($event)"
                  [showSubtitle]="true"
                />
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
                <ui-button variant="outline" (clicked)="selectedInvoice.set(null)">
                  Cambiar
                </ui-button>
              </div>
            }
          </div>

          <!-- DIAN Correction Concept -->
          <ui-select label="Concepto de Corrección (DIAN)" placeholder="Seleccione el concepto" [options]="correctionConceptOptions" [formControl]="adjustmentForm.controls.correctionConceptCode" />

          <!-- Amount Selection -->
          <div class="space-y-3">
            <ui-text-input label="Valor del Ajuste" type="number" icon="attach_money" placeholder="0.00" [formControl]="adjustmentForm.controls.amount" />
          </div>

          <!-- Technical Reason -->
          <ui-textarea formControlName="reason" label="Justificación Técnica" placeholder="Ej: Devolución por mercancía en mal estado..." [rows]="4" />
        </form>
      </div>

      <!-- Fixed Footer Actions -->
      <div class="p-10 pt-6 border-t border-gray-50 bg-white relative z-20">
        <div class="flex justify-end gap-3">
          <ui-button variant="ghost" (clicked)="dialogRef.close()">
            Cancelar Operación
          </ui-button>
          <ui-button variant="primary" (clicked)="onSubmit()"
            [disabled]="adjustmentForm.invalid || !selectedInvoice() || isSubmitting()"
            [loading]="isSubmitting()">
            Transmitir Comprobante Electrónico
          </ui-button>
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

  // Invoice search state
  invoiceSearchTerm = signal('');
  loadingInvoices = signal(false);

  invoiceOptions = computed<SelectOption[]>(() => {
    const term = this.invoiceSearchTerm().toLowerCase();
    const invoices = this.realFinanceInvoices();
    const formatTotal = (total: number) => `$${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    if (!term) {
      return invoices.map(inv => ({
        value: inv.id,
        label: `${inv.id} - ${inv.customerName}`,
        subtitle: formatTotal(inv.total)
      }));
    }
    return invoices
      .filter(inv =>
        inv.id.toLowerCase().includes(term) ||
        inv.customerName.toLowerCase().includes(term)
      )
      .map(inv => ({
        value: inv.id,
        label: `${inv.id} - ${inv.customerName}`,
        subtitle: formatTotal(inv.total)
      }));
  });

  // Correction concepts for credit notes — only total annulment (code '2')
  correctionConcepts = [
    { code: '2', label: '2 - Anulación de factura electrónica' },
  ];

  correctionConceptOptions: SelectOption[] =
    this.correctionConcepts.map(c => ({ value: c.code, label: c.label }));

  constructor() {
    // Watch invoice selection from ui-select
    this.adjustmentForm.get('invoiceSearch')?.valueChanges.subscribe((id) => {
      if (id && typeof id === 'string') {
        const invoice = this.realFinanceInvoices().find(inv => inv.id === id);
        if (invoice) {
          this.selectedInvoice.set(invoice);
          this.adjustmentForm.patchValue({ amount: invoice.total });
        }
      }
    });

    if (this.data.invoice) {
      queueMicrotask(() => {
        if (this.data.invoice) {
          const inv = this.data.invoice;
          this.adjustmentForm.get('invoiceSearch')?.setValue(inv.id);
          this.selectedInvoice.set(inv);
          this.adjustmentForm.patchValue({ amount: inv.total });
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

  onInvoiceSearch(query: string): void {
    this.invoiceSearchTerm.set(query);
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
        observation: val.reason || 'Sin observación',
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

      this.salesNoteService.createCreditNote(invoiceId, dto).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.snackBar.open(
            'Nota de Crédito emitida con éxito ante la DIAN!',
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
