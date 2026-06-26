import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CustomerService } from '../../../services/customer.service';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice } from '../../../models/invoice.model';
import { PaymentRecord } from '../../../models/customer.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';

@Component({
  selector: 'app-record-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
    ButtonAtom,
    TextInputComponent,
    TextareaComponent,
    SelectAtom,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] p-8">
      <!-- Loading -->
      @if (loadingInvoices()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      } @else {
        <header class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <span class="material-icons !text-[24px]">payments</span>
            </div>
            <div>
              <h2 class="text-xl font-black text-gray-900 tracking-tight !m-0">Registrar Pago</h2>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Abono a cuenta de crédito</p>
            </div>
          </div>
          <ui-button variant="icon" (clicked)="close()">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        @if (error()) {
          <div class="p-4 bg-red-50 border border-red-200 rounded-[20px] mb-6 flex items-start gap-3">
            <span class="material-icons text-red-500 text-sm mt-0.5">error_outline</span>
            <p class="text-xs text-red-700 font-medium">{{ error() }}</p>
          </div>
        }

        @if (success()) {
          <div class="p-6 flex flex-col items-center text-center space-y-3">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <span class="material-icons !text-[32px]">check_circle</span>
            </div>
            <p class="font-black text-gray-900 text-lg">Pago Registrado</p>
            <p class="text-sm text-gray-500">El pago se ha registrado exitosamente.</p>
            <p class="text-xs text-gray-400">Nuevo saldo: {{ result()?.newBalance | currency }}</p>
            <ui-button variant="primary" (clicked)="close(true)">Cerrar</ui-button>
          </div>
        } @else {
          <!-- Invoice Selector -->
          <div class="space-y-6">
            <ui-select
              label="Factura"
              placeholder="Seleccione una factura"
              [options]="invoiceOptions()"
              [value]="selectedInvoiceId()"
              (valueChange)="onInvoiceSelected($event)"
            />

            <!-- Selected Invoice Summary -->
            @if (selectedInvoice(); as inv) {
              <div class="p-4 bg-gray-50 rounded-[20px] space-y-2">
                <div class="flex justify-between">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Factura</span>
                  <span class="text-xs font-black text-gray-900">{{ inv.invoiceNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total facturado</span>
                  <span class="text-xs font-black text-gray-900">{{ inv.totalAmount | currency }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total abonado</span>
                  <span class="text-xs font-black text-emerald-600">{{ paidAmount() | currency }}</span>
                </div>
                <hr class="border-t border-gray-200 my-1">
                <div class="flex justify-between">
                  <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saldo pendiente</span>
                  <span class="text-sm font-black" [class.text-red-600]="remainingBalance() > 0"
                       [class.text-emerald-600]="remainingBalance() <= 0">
                    {{ remainingBalance() | currency }}
                  </span>
                </div>
              </div>

              <!-- Previous Payments for this Invoice -->
              @if (paymentsLoading()) {
                <div class="flex justify-center py-4">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              } @else if (invoicePayments().length > 0) {
                <div class="border border-gray-100 rounded-[20px] overflow-hidden">
                  <div class="p-3 bg-gray-50/50 border-b border-gray-100">
                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Abonos realizados</span>
                  </div>
                  @for (pm of invoicePayments(); track pm.id) {
                    <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                      <div class="flex items-center gap-2">
                        <span class="material-icons text-[16px] text-teal-500">check_circle</span>
                        <span class="text-[11px] text-gray-500">{{ pm.paymentDate | date:'dd MMM, yyyy' }}</span>
                      </div>
                      <span class="text-xs font-black text-red-600">-{{ pm.amount | currency }}</span>
                    </div>
                  }
                </div>
              }
            }

            <!-- Amount -->
            <ui-text-input
              label="Monto del Pago"
              type="number"
              placeholder="0.00"
              [value]="amount()"
              (valueChange)="onAmountChange($event)"
            />

            <!-- Notes -->
            <ui-textarea
              label="Notas (opcional)"
              placeholder="Notas del pago..."
              [value]="notes()"
              (valueChange)="notes.set($event)"
              [rows]="3"
            />

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <ui-button variant="ghost" (clicked)="close()">Cancelar</ui-button>
              <ui-button
                variant="primary"
                [disabled]="!isValid() || loading()"
                [loading]="loading()"
                (clicked)="submit()"
              >
                Registrar Pago
              </ui-button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RecordPaymentFormMolecule implements OnInit {
  private dialogRef = inject(MatDialogRef<RecordPaymentFormMolecule>);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);
  data = inject<{ customerId: string }>(MAT_DIALOG_DATA);

  customerId = signal<string>('');
  invoices = signal<Invoice[]>([]);
  loadingInvoices = signal(false);
  selectedInvoiceId = signal<string>('');
  selectedInvoice = computed(() =>
    this.invoices().find(i => i.id === this.selectedInvoiceId())
  );
  invoicePayments = signal<PaymentRecord[]>([]);
  paymentsLoading = signal(false);

  paidAmount = computed(() =>
    this.invoicePayments().reduce((sum, p) => sum + Number(p.amount), 0)
  );
  remainingBalance = computed(() => {
    const inv = this.selectedInvoice();
    if (!inv) return 0;
    return Number(inv.totalAmount) - this.paidAmount();
  });

  amount = signal<string>('');
  notes = signal<string>('');

  invoiceOptions = computed<SelectOption[]>(() =>
    this.invoices()
      .filter(i => i.status === 'ON_CREDIT')
      .map(i => ({
        value: i.id,
        label: `${i.invoiceNumber} - $${Number(i.totalAmount).toLocaleString()}`,
      }))
  );

  isValid = computed(() => {
    const amt = parseFloat(this.amount());
    return this.selectedInvoiceId() && !isNaN(amt) && amt > 0;
  });

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  result = signal<{ newBalance: number; invoiceStatus: string } | null>(null);

  ngOnInit() {
    this.customerId.set(this.data.customerId);
    this.loadInvoices();
  }

  private loadInvoices() {
    const id = this.data.customerId;
    if (!id) return;

    this.loadingInvoices.set(true);
    this.invoiceService.loadInvoices({
      customerId: id,
      status: 'ON_CREDIT',
      limit: 50,
    }).subscribe({
      next: (res) => {
        const items = res.data || res.items || (Array.isArray(res) ? res : []);
        this.invoices.set(items);
        this.loadingInvoices.set(false);
      },
      error: () => {
        this.loadingInvoices.set(false);
        this.error.set('Error al cargar las facturas pendientes');
      },
    });
  }

  onInvoiceSelected(id: string) {
    this.selectedInvoiceId.set(id);
    this.amount.set('');
    if (id) {
      this.loadInvoicePayments(id);
    } else {
      this.invoicePayments.set([]);
    }
  }

  private loadInvoicePayments(invoiceId: string) {
    this.paymentsLoading.set(true);
    this.customerService.getPaymentHistory(this.customerId(), invoiceId, 1, 50).subscribe({
      next: (res) => {
        this.invoicePayments.set(res.data);
        this.paymentsLoading.set(false);
      },
      error: () => {
        this.invoicePayments.set([]);
        this.paymentsLoading.set(false);
      },
    });
  }

  onAmountChange(val: string) {
    this.amount.set(val);
  }

  close(success = false) {
    this.dialogRef.close({ success });
  }

  submit() {
    const amt = parseFloat(this.amount());
    if (!this.isValid()) return;

    this.loading.set(true);
    this.error.set(null);

    this.customerService.recordPayment(this.customerId(), {
      invoiceId: this.selectedInvoiceId(),
      amount: amt,
      notes: this.notes() || undefined,
    }).subscribe({
      next: (res) => {
        this.result.set(res);
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al registrar el pago');
        this.loading.set(false);
      },
    });
  }
}
