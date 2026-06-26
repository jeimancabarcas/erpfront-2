import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice, InvoiceItemTax } from '../../../models/invoice.model';
import { SalesNoteService } from '../../../services/sales-note.service';
import { CreditNote } from '../../../models/sales-note.model';
import { downloadBase64Pdf } from '../../../utils/pdf-utils';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { SalesNoteFormDialogOrganism, SalesNoteDialogData } from '../sales-note-form-dialog/sales-note-form-dialog.component';
import { CustomerService } from '../../../services/customer.service';
import { PaymentRecord } from '../../../models/customer.model';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';

interface TraceEvent {
  type: 'Emisión Inicial' | 'Emisión Electrónica' | 'Nota Crédito' | 'Abono';
  number: string;
  date: string;
  concept: string;
  observation: string | null;
  amount: number;
  isCredit: boolean;
  cude?: string | null;
  publicUrl?: string | null;
}

@Component({
  selector: 'app-invoice-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ButtonAtom,
    TextareaComponent,
    TableComponent,
    TableCellDirective
  ],
  template: `
    <div class="relative overflow-hidden bg-white dark:bg-gray-900 flex flex-col max-h-[95vh] w-full max-w-[950px] shadow-2xl">
      <!-- Decorative background blur -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50"></div>
      
      @if (loading()) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs">Cargando Factura...</p>
        </div>
      } @else if (error()) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <span class="material-icons !text-[32px]">error_outline</span>
          </div>
          <p class="text-gray-900 dark:text-gray-100 font-black text-lg">No se pudo cargar la factura</p>
          <p class="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">El registro no existe o el servidor no está disponible</p>
          <button (click)="close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-4">
            Cerrar
          </button>
        </div>
      } @else if (invoice(); as inv) {
        <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
          <header class="flex items-start justify-between mb-8">
            <div class="flex items-center gap-5">
              <div [className]="inv.status === 'CANCELLED' 
                ? 'w-14 h-14 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center shadow-sm'
                : inv.status === 'ON_CREDIT'
                ? 'w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm'
                : 'w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm'">
                <span class="material-icons !text-[28px] !w-7 !h-7">{{ 
                  inv.status === 'CANCELLED' ? 'cancel' : 
                  inv.status === 'ON_CREDIT' ? 'credit_card' : 'verified' 
                }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight !m-0 leading-tight">Factura {{ inv.invoiceNumber }}</h2>
                  <span [className]="inv.status === 'CANCELLED'
                    ? 'px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider'
                    : inv.status === 'ON_CREDIT'
                    ? 'px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-wider'
                    : 'px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider'">
                    {{ inv.status === 'CANCELLED' ? 'ANULADA' : inv.status === 'ON_CREDIT' ? 'A CRÉDITO' : inv.status }}
                  </span>
                </div>
                <p class="text-gray-400 dark:text-gray-500 text-sm font-semibold uppercase tracking-widest mt-1">Detalle de Operación</p>
              </div>
            </div>
            <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
              <span class="material-icons">close</span>
            </ui-button>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Customer Info -->
            <div class="space-y-4">
              <label class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Información del Cliente</label>
              <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-[28px] border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                <div class="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                  <span class="material-icons">person</span>
                </div>
                <div>
                  <h4 class="font-black text-gray-900 dark:text-gray-100 leading-none mb-1">{{ inv.customer?.name }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{{ inv.customer?.documentType }}: {{ inv.customer?.documentNumber }}</p>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                      <span class="material-icons !text-[14px] !w-3.5 !h-3.5">email</span>
                      {{ inv.customer?.email }}
                    </div>
                    @if (inv.customer?.phone) {
                      <div class="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                        <span class="material-icons !text-[14px] !w-3.5 !h-3.5">phone</span>
                        {{ inv.customer?.phone }}
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Invoice Summary -->
            <div class="space-y-4">
              <label class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Resumen General</label>
              <div class="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-[28px] border border-indigo-100/50 dark:border-indigo-800/30 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Fecha de Emisión</span>
                  <span class="text-xs font-black text-gray-900 dark:text-gray-100">{{ inv.date | date:'longDate' }}</span>
                </div>
                <hr class="border-t border-indigo-100 dark:border-indigo-800/30">
                <div class="flex justify-between items-center pt-1">
                  <span class="text-sm font-bold text-gray-500 dark:text-gray-400">Total Facturado</span>
                  <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">{{ inv.totalAmount | currency }}</span>
                </div>
                @if (inv.netTotal != null) {
                  <div class="flex justify-between items-center pt-1">
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Neto (con ajustes)</span>
                    <span class="text-base font-black text-emerald-600 dark:text-emerald-400">{{ inv.netTotal | currency }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Credit Balance Card -->
          @if (showBalanceCard()) {
            <div class="mb-8 animate-in fade-in duration-300">
              <div class="p-6 bg-teal-50/50 dark:bg-teal-900/20 rounded-[28px] border border-teal-100/50 dark:border-teal-800/30 space-y-3">
                <label class="text-[10px] text-teal-700 dark:text-teal-400 font-black uppercase tracking-widest">Estado de Crédito</label>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Total Facturado</span>
                  <span class="text-xs font-black text-gray-900 dark:text-gray-100">{{ totalAmount() | currency }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Total Abonado</span>
                  <span class="text-xs font-black text-emerald-600 dark:text-emerald-400">{{ totalPaid() | currency }}</span>
                </div>
                <hr class="border-t border-teal-200 dark:border-teal-800/30">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-gray-600 dark:text-gray-400">Saldo Pendiente</span>
                  <span class="text-lg font-black" [ngClass]="{ 'text-red-600 dark:text-red-400': remainingBalance() > 0, 'text-emerald-600 dark:text-emerald-400': remainingBalance() <= 0 }">
                    {{ remainingBalance() | currency }}
                  </span>
                </div>
                @if (remainingBalance() <= 0) {
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-emerald-500 text-sm">check_circle</span>
                    <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pagada</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Items Table -->
          <div class="space-y-4 mb-8">
            <label class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Productos / Servicios</label>
            <div class="border border-gray-100 dark:border-gray-700 rounded-[28px] overflow-hidden shadow-sm bg-white dark:bg-gray-900">
              <ui-table [columns]="itemsColumns" [data]="invoice()?.items || []">
                <ng-template uiTableCell="product" let-item>
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ item.product?.name || 'Producto Desconocido' }}</span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 font-medium">SKU: {{ item.product?.sku }}</span>
                  </div>
                </ng-template>
                <ng-template uiTableCell="quantity" let-item>
                  <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-black text-gray-600 dark:text-gray-400">{{ item.quantity }}</span>
                </ng-template>
                <ng-template uiTableCell="unitPrice" let-item>
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.unitPrice | currency }}</span>
                </ng-template>
                <ng-template uiTableCell="subtotal" let-item>
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ toNumber(item.subtotal) - toNumber(item.taxAmount) | currency }}</span>
                  </div>
                </ng-template>
                <ng-template uiTableCell="taxes" let-item>
                  @if (getItemTaxes(item).length > 0) {
                    <div class="flex flex-col items-center gap-0.5">
                      @for (tax of getItemTaxes(item); track tax.taxCode) {
                        <span class="text-[11px] font-medium text-gray-500 dark:text-gray-400">{{ tax.taxName ?? tax.taxCode }}: {{ toNumber(tax.taxAmount) | currency }}</span>
                      }
                    </div>
                  } @else {
                    <span class="text-xs text-gray-300 dark:text-gray-600">-</span>
                  }
                </ng-template>
              </ui-table>
            </div>
          </div>

          <!-- Trazabilidad de la Factura -->
          @if (traceEvents().length > 0) {
            <div class="space-y-4 mb-8 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Trazabilidad de la Factura</label>
              <div class="border border-gray-100 dark:border-gray-700 rounded-[28px] overflow-hidden shadow-sm bg-white dark:bg-gray-900">
                <ui-table [columns]="traceColumns" [data]="traceEvents()">
                  <ng-template uiTableCell="type" let-event>
                    <div class="flex items-center gap-2">
                      <span [className]="event.type === 'Emisión Inicial' 
                        ? 'w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0'
                        : event.type === 'Emisión Electrónica'
                        ? 'w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0'
                        : event.type === 'Nota Crédito'
                        ? 'w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0'
                        : 'w-8 h-8 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shrink-0'">
                        <span class="material-icons scale-75">
                          {{ event.type === 'Emisión Inicial' ? 'receipt' : event.type === 'Emisión Electrónica' ? 'rocket_launch' : event.type === 'Nota Crédito' ? 'assignment_returned' : 'payments' }}
                        </span>
                      </span>
                      <span class="text-xs font-black text-gray-900 dark:text-gray-100">{{ event.type }}</span>
                    </div>
                  </ng-template>
                  <ng-template uiTableCell="number" let-event>
                    <span class="text-xs font-bold text-gray-900 dark:text-gray-100">{{ event.number }}</span>
                  </ng-template>
                  <ng-template uiTableCell="date" let-event>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ event.date | date:'dd MMM, yyyy' }}</span>
                  </ng-template>
                  <ng-template uiTableCell="concept" let-event>
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ event.concept }}</span>
                  </ng-template>
                  <ng-template uiTableCell="amount" let-event>
                    <span [className]="event.type === 'Nota Crédito' || event.type === 'Abono'
                      ? 'text-xs font-black text-red-600 dark:text-red-400'
                      : 'text-xs font-black text-gray-900 dark:text-gray-100'">
                      {{ event.isCredit ? '-' : '+' }}{{ event.amount | currency }}
                    </span>
                  </ng-template>
                  <ng-template uiTableCell="balance" let-event let-i="index">
                    <span class="text-xs font-black text-gray-900 dark:text-gray-100">{{ runningBalance(i) | currency }}</span>
                  </ng-template>
                  <ng-template uiTableCell="cude" let-event>
                    @if (event.cude) {
                      <span class="text-[9px] text-gray-400 dark:text-gray-500 font-medium" [title]="'CUDE: ' + event.cude">CUDE</span>
                    }
                  </ng-template>
                </ui-table>
              </div>
            </div>
          }

          <!-- Notes -->
          @if (inv.notes) {
            <div class="mb-8">
              <ui-textarea
                label="Observaciones"
                [value]="inv.notes"
                [disabled]="true"
                [rows]="3"
              />
            </div>
          }

          <!-- Emit error -->
          @if (emitError(); as errorMsg) {
            <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[24px] mb-6 flex items-center gap-3">
              <span class="material-icons text-red-500">error_outline</span>
              <p class="text-xs text-red-700 dark:text-red-400 font-medium">{{ errorMsg }}</p>
            </div>
          }

          <!-- Emission metadata (DIAN) -->
          @if (inv.emission) {
            <div class="space-y-4 mb-6 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Emisión Electrónica (DIAN)</label>
              <div class="p-6 bg-indigo-50/40 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-[28px] space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400">Número de Emisión</span>
                    <p class="font-black text-gray-900 dark:text-gray-100">{{ inv.emission.number }}</p>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400">CUDE</span>
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-400 break-all">{{ inv.emission.cude || 'N/A' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Validado:</span>
                  @if (inv.emission.isValidated) {
                    <span class="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[9px] font-black">SÍ</span>
                  } @else {
                    <span class="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[9px] font-black">PENDIENTE</span>
                  }
                </div>
                <div class="flex items-center gap-4 flex-wrap">
                  @if (inv.emission.publicUrl) {
                    <ui-button variant="outline" (clicked)="openUrl(inv.emission.publicUrl)">
                      <span class="material-icons text-[16px]">open_in_new</span>
                      Ver en DIAN
                    </ui-button>
                  }
                  @if (inv.emission.qrUrl) {
                    <ui-button variant="outline" (clicked)="openUrl(inv.emission.qrUrl)">
                      <span class="material-icons text-[16px]">qr_code_scanner</span>
                      Ver QR
                    </ui-button>
                  }
                </div>
              </div>
            </div>
          }

          <footer class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 flex-wrap">
            <ui-button variant="ghost" (clicked)="close()">
              Cerrar
            </ui-button>

            @if (inv.status !== 'CANCELLED') {
              <ui-button variant="outline" (clicked)="openAdjustmentDialog(inv)">
                <span class="material-icons">post_add</span>
                Emitir Nota de Crédito
              </ui-button>
            }

            @if (!inv.isElectronic && !inv.emission) {
              <ui-button variant="primary" (clicked)="emitInvoice()" [disabled]="emitLoading()" [loading]="emitLoading()">
                <span class="material-icons">rocket_launch</span>
                Emitir Electrónicamente
              </ui-button>
            }

            <ui-button variant="primary" (clicked)="printPdf(inv)" [disabled]="pdfLoading()" [loading]="pdfLoading()">
              <span class="material-icons">print</span>
              Imprimir Factura
            </ui-button>
          </footer>
        </div>
      }
    </div>

  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
  `]
})
export class InvoiceDetailDialogOrganism implements OnInit {
  private dialogRef = inject(MatDialogRef<InvoiceDetailDialogOrganism>);
  private matDialog = inject(MatDialog);
  private dialogData = inject(MAT_DIALOG_DATA);
  private invoiceService = inject(InvoiceService);
  private salesNoteService = inject(SalesNoteService);
  private customerService = inject(CustomerService);

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  error = signal(false);
  notes = signal<{ creditNotes: CreditNote[] }>({ creditNotes: [] });
  payments = signal<PaymentRecord[]>([]);
  pdfLoading = signal(false);
  emitLoading = signal(false);
  emitError = signal<string | null>(null);

  protected readonly itemsColumns: TableColumn[] = [
    { key: 'product', header: 'Producto', align: 'center' },
    { key: 'quantity', header: 'Cant.', align: 'center', width: '80px' },
    { key: 'unitPrice', header: 'Precio Unit.', align: 'center', width: '120px' },
    { key: 'subtotal', header: 'Subtotal', align: 'center', width: '120px' },
    { key: 'taxes', header: 'Impuestos', align: 'center' },
  ];

  protected readonly traceColumns: TableColumn[] = [
    { key: 'type', header: 'Tipo' },
    { key: 'number', header: 'Número' },
    { key: 'date', header: 'Fecha' },
    { key: 'concept', header: 'Concepto' },
    { key: 'amount', header: 'Monto', align: 'right' },
    { key: 'balance', header: 'Saldo', align: 'right' },
    { key: 'cude', header: '', width: '60px' },
  ];

  totalPaid = computed(() =>
    this.payments().reduce((sum, p) => sum + Number(p.amount), 0)
  );
  remainingBalance = computed(() => {
    const inv = this.invoice();
    return inv ? Number(inv.totalAmount) - this.totalPaid() : 0;
  });
  totalAmount = computed(() => {
    const inv = this.invoice();
    return inv ? Number(inv.totalAmount) : 0;
  });
  showBalanceCard = computed(() => {
    const inv = this.invoice();
    if (!inv) return false;
    // Show for ON_CREDIT invoices, or if payments have been recorded
    return inv.status === 'ON_CREDIT' || this.payments().length > 0;
  });

  traceEvents = computed(() => {
    const inv = this.invoice();
    const { creditNotes } = this.notes();
    const paymentRecords = this.payments();
    const events: TraceEvent[] = [];

    if (inv) {
      events.push({
        type: 'Emisión Inicial',
        number: inv.invoiceNumber,
        date: inv.date,
        concept: '-',
        observation: inv.notes || null,
        amount: Number(inv.totalAmount) || 0,
        isCredit: false,
      });

      if (inv.emission) {
        const emissionDate = inv.emission.createdAt ?? inv.date;
        events.push({
          type: 'Emisión Electrónica',
          number: inv.emission.number,
          date: emissionDate,
          concept: `Emisión #${inv.emission.number}`,
          observation: null,
          amount: Number(inv.totalAmount) || 0,
          isCredit: false,
          cude: inv.emission.cude,
          publicUrl: inv.emission.publicUrl,
        });
      }
    }

    for (const cn of creditNotes) {
      events.push({
        type: 'Nota Crédito',
        number: cn.noteNumber || cn.referenceCode,
        date: cn.createdAt,
        concept: cn.correctionConceptCode,
        observation: cn.observation,
        amount: Number(cn.amount) || 0,
        isCredit: true,
        cude: cn.cude,
        publicUrl: cn.publicUrl,
      });
    }

    for (const pm of paymentRecords) {
      events.push({
        type: 'Abono',
        number: pm.id.slice(0, 8),
        date: pm.paymentDate,
        concept: pm.notes || 'Abono a cuenta',
        observation: pm.notes || null,
        amount: Number(pm.amount) || 0,
        isCredit: true,
      });
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return events;
  });

  taxSummary = computed(() => {
    const inv = this.invoice();
    if (!inv?.items) return [];

    const taxMap = new Map<string, { taxCode: string; taxName: string; taxAmount: number }>();
    for (const item of inv.items) {
      const itemTaxes = this.getItemTaxes(item);
      if (itemTaxes.length > 0) {
        for (const tax of itemTaxes) {
          const existing = taxMap.get(tax.taxCode);
          if (existing) {
            existing.taxAmount += Number(tax.taxAmount);
          } else {
            taxMap.set(tax.taxCode, {
              taxCode: tax.taxCode,
              taxName: tax.taxName ?? tax.taxCode,
              taxAmount: Number(tax.taxAmount),
            });
          }
        }
      }
    }
    return Array.from(taxMap.values());
  });

  totalTaxAmount = computed(() =>
    this.taxSummary().reduce((sum, t) => sum + t.taxAmount, 0),
  );

  subtotalBeforeTax = computed(() => {
    const inv = this.invoice();
    if (!inv?.items) return 0;
    return inv.items.reduce((sum, item) => {
      const itemTax = Number(item.taxAmount) || 0;
      return sum + Number(item.subtotal) - itemTax;
    }, 0);
  });

  /** Returns taxes from either taxes or invoiceItemTaxes field */
  getItemTaxes(item: any): InvoiceItemTax[] {
    return item.taxes ?? item.invoiceItemTaxes ?? [];
  }

  toNumber(val: any): number {
    return Number(val) || 0;
  }

  ngOnInit() {
    const data = this.dialogData;
    if (data?.invoiceId) {
      this.invoiceService.getInvoiceById(data.invoiceId).subscribe({
        next: (inv) => {
          this.invoice.set(inv);
          this.loading.set(false);
          this.loadNotes(inv.id);
          this.loadPayments(inv.id);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
          setTimeout(() => this.close(), 3000);
        }
      });
    } else if (data?.invoice) {
      const inv = data.invoice;
      this.invoice.set(inv);
      this.loading.set(false);
      this.loadNotes(inv.id);
      this.loadPayments(inv.id);
    }
  }

  close() {
    this.dialogRef.close();
  }

  emitInvoice() {
    const currentInvoice = this.invoice();
    if (!currentInvoice?.id) return;

    this.emitLoading.set(true);
    this.emitError.set(null);

    this.invoiceService.emitInvoice(currentInvoice.id).subscribe({
      next: (updatedInvoice) => {
        this.invoice.set(updatedInvoice);
        this.emitLoading.set(false);
      },
      error: () => {
        this.emitLoading.set(false);
        this.emitError.set('Error al emitir la factura electrónica');
      },
    });
  }

  loadNotes(invoiceId: string) {
    this.salesNoteService.getNotesByInvoiceId(invoiceId).subscribe({
      next: (res) => {
        this.notes.set(res);
      },
      error: (err) => console.error('Error cargando notas de ajuste:', err)
    });
  }

  private loadPayments(invoiceId: string) {
    const inv = this.invoice();
    if (!inv?.customerId) return;
    this.customerService.getPaymentHistory(inv.customerId, invoiceId, 1, 50).subscribe({
      next: (res) => {
        this.payments.set(res.data);
      },
      error: (err) => console.error('Error cargando abonos:', err),
    });
  }

  runningBalance(index: number): number {
    const events = this.traceEvents();
    let balance = 0;
    for (let i = 0; i <= index; i++) {
      const e = events[i];
      if (e.type === 'Emisión Inicial') {
        balance = e.amount;
      } else if (e.type === 'Nota Crédito') {
        balance -= e.amount;
      } else if (e.type === 'Abono') {
        balance -= e.amount;
      }
      // Emisión Electrónica no modifica el saldo
    }
    return balance;
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  openAdjustmentDialog(invoice: Invoice): void {
    // Compute already returned quantities per product from existing credit notes
    const returnedQuantities: Record<string, number> = {};
    // Compute current effective price per product after previous adjustments
    const adjustedPrices: Record<string, number> = {};
    const { creditNotes } = this.notes();

    // Process notes in chronological order (oldest first) to track effective price
    const sortedNotes = [...creditNotes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (const cn of sortedNotes) {
      if (cn.items) {
        for (const item of cn.items) {
          if (item.productId) {
            // Track returned quantity
            returnedQuantities[item.productId] = (returnedQuantities[item.productId] || 0) + Number(item.quantity);

            // Track price adjustments (discount B, correction C use a new price)
            if (item.unitPrice != null) {
              adjustedPrices[item.productId] = Number(item.unitPrice);
            }
          }
        }
      }
    }

    const dialogRef = this.matDialog.open(SalesNoteFormDialogOrganism, {
      width: '850px',
      maxWidth: '95vw',
      panelClass: 'erp-dialog-panel',
      data: {
        invoice: invoice,
        returnedQuantities,
        adjustedPrices,
      } as SalesNoteDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.reloadInvoice();
      }
    });
  }

  private reloadInvoice(): void {
    const current = this.invoice();
    if (!current?.id) return;
    this.invoiceService.getInvoiceById(current.id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.loadNotes(inv.id);
        this.loadPayments(inv.id);
      },
    });
  }

  printPdf(invoice: Invoice) {
    if (!invoice.id) return;
    this.pdfLoading.set(true);
    this.invoiceService.getInvoicePdf(invoice.id).subscribe({
      next: (res) => {
        this.pdfLoading.set(false);
        downloadBase64Pdf(res.pdfBase64Encoded);
      },
      error: (err) => {
        this.pdfLoading.set(false);
        console.error('Error fetching PDF:', err);
        alert('Error al generar el PDF de la factura.');
      }
    });
  }

}

