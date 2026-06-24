import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice, InvoiceItemTax } from '../../../models/invoice.model';
import { SalesNoteService } from '../../../services/sales-note.service';
import { CreditNote, DebitNote } from '../../../models/sales-note.model';
import { downloadBase64Pdf } from '../../../utils/pdf-utils';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { AdjustmentFormDialogOrganism } from '../adjustment-form-dialog/adjustment-form-dialog.component';

interface TraceEvent {
  type: 'Emisión Inicial' | 'Emisión Electrónica' | 'Nota Crédito' | 'Nota Débito';
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
    TextareaComponent
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white flex flex-col max-h-[95vh] w-full max-w-[950px] shadow-2xl">
      <!-- Decorative background blur -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      @if (loading()) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando Factura...</p>
        </div>
      } @else if (error()) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <span class="material-icons !text-[32px]">error_outline</span>
          </div>
          <p class="text-gray-900 font-black text-lg">No se pudo cargar la factura</p>
          <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">El registro no existe o el servidor no está disponible</p>
          <button (click)="close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">
            Cerrar
          </button>
        </div>
      } @else if (invoice(); as inv) {
        <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
          <header class="flex items-start justify-between mb-8">
            <div class="flex items-center gap-5">
              <div [className]="inv.status === 'CANCELLED' 
                ? 'w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm'
                : 'w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm'">
                <span class="material-icons !text-[28px] !w-7 !h-7">{{ inv.status === 'CANCELLED' ? 'cancel' : 'verified' }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">Factura {{ inv.invoiceNumber }}</h2>
                  <span [className]="inv.status === 'CANCELLED'
                    ? 'px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider'
                    : 'px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider'">
                    {{ inv.status === 'CANCELLED' ? 'ANULADA' : inv.status }}
                  </span>
                </div>
                <p class="text-gray-400 text-sm font-semibold uppercase tracking-widest mt-1">Detalle de Operación</p>
              </div>
            </div>
            <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
              <span class="material-icons">close</span>
            </ui-button>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Customer Info -->
            <div class="space-y-4">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Información del Cliente</label>
              <div class="p-6 bg-gray-50 rounded-[28px] border border-gray-100 flex items-start gap-4">
                <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                  <span class="material-icons">person</span>
                </div>
                <div>
                  <h4 class="font-black text-gray-900 leading-none mb-1">{{ inv.customer?.name }}</h4>
                  <p class="text-xs text-gray-500 font-medium mb-2">{{ inv.customer?.documentType }}: {{ inv.customer?.documentNumber }}</p>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 text-[11px] text-gray-400">
                      <span class="material-icons !text-[14px] !w-3.5 !h-3.5">email</span>
                      {{ inv.customer?.email }}
                    </div>
                    @if (inv.customer?.phone) {
                      <div class="flex items-center gap-2 text-[11px] text-gray-400">
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
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Resumen General</label>
              <div class="p-6 bg-indigo-50/50 rounded-[28px] border border-indigo-100/50 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-gray-500">Fecha de Emisión</span>
                  <span class="text-xs font-black text-gray-900">{{ inv.date | date:'longDate' }}</span>
                </div>
                <hr class="border-t border-indigo-100">
                <div class="flex justify-between items-center pt-1">
                  <span class="text-sm font-bold text-gray-500">Total Facturado</span>
                  <span class="text-xl font-black text-indigo-600">{{ inv.totalAmount | currency }}</span>
                </div>
                @if (inv.netTotal != null) {
                  <div class="flex justify-between items-center pt-1">
                    <span class="text-xs font-bold text-gray-500">Neto (con ajustes)</span>
                    <span class="text-base font-black text-emerald-600">{{ inv.netTotal | currency }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="space-y-4 mb-8">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Productos / Servicios</label>
            <div class="border border-gray-100 rounded-[28px] overflow-hidden shadow-sm bg-white">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/50 border-b border-gray-100">
                    <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Producto</th>
                    <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                    <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Precio Unit.</th>
                    <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Subtotal</th>
                    <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Impuestos</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of inv.items; track item.productId) {
                    <tr class="border-b border-gray-50 last:border-0">
                      <td class="py-4 px-6 text-center">
                        <div class="flex flex-col items-center">
                          <span class="font-bold text-gray-900">{{ item.product?.name || 'Producto Desconocido' }}</span>
                          <span class="text-[10px] text-gray-400 font-medium">SKU: {{ item.product?.sku }}</span>
                        </div>
                      </td>
                      <td class="py-4 px-4 text-center">
                        <span class="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black text-gray-600">{{ item.quantity }}</span>
                      </td>
                      <td class="py-4 px-4 text-center text-xs font-medium text-gray-500">
                        {{ item.unitPrice | currency }}
                      </td>
                      <td class="py-4 px-6 text-center">
                        <div class="flex flex-col items-center">
                          <span class="font-bold text-gray-900">{{ toNumber(item.subtotal) | currency }}</span>
                          @if (getItemTaxes(item).length > 0) {
                            <div class="text-[11px] text-gray-400 mt-0.5 space-y-0.5">
                              @for (tax of getItemTaxes(item); track tax.taxCode) {
                                <div class="flex justify-between gap-2">
                                  <span>{{ tax.taxName ?? tax.taxCode }}:</span>
                                  <span class="font-medium">{{ toNumber(tax.taxAmount) | currency }}</span>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </td>
                      <td class="py-4 px-6 text-center">
                        @if (getItemTaxes(item).length > 0) {
                          <div class="flex flex-col items-center gap-0.5">
                            @for (tax of getItemTaxes(item); track tax.taxCode) {
                              <span class="text-[11px] font-medium" [class.text-gray-500]="true">{{ tax.taxName ?? tax.taxCode }}: {{ toNumber(tax.taxAmount) | currency }}</span>
                            }
                          </div>
                        } @else {
                          <span class="text-xs text-gray-300">-</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tax Summary -->
          @if (taxSummary().length > 0) {
            <div class="space-y-4 mb-8 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Resumen de Impuestos</label>
              <div class="p-6 bg-gray-50 rounded-[28px] border border-gray-100 space-y-3">
                @for (tax of taxSummary(); track tax.taxCode) {
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-500">{{ tax.taxName ?? tax.taxCode }}</span>
                    <span class="text-xs font-black text-gray-900">{{ toNumber(tax.taxAmount) | currency }}</span>
                  </div>
                }
                <hr class="border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-gray-700">Total Impuestos</span>
                  <span class="text-sm font-black text-indigo-600">{{ totalTaxAmount() | currency }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Trazabilidad de la Factura -->
          @if (traceEvents().length > 0) {
            <div class="space-y-4 mb-8 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Trazabilidad de la Factura</label>
              <div class="border border-gray-100 rounded-[28px] overflow-hidden shadow-sm bg-white">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50/50 border-b border-gray-100">
                      <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                      <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Número</th>
                      <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                      <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                      <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                      <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Saldo</th>
                      <th class="py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (event of traceEvents(); track $index) {
                      <tr class="hover:bg-gray-50/50 transition-colors">
                        <td class="py-4 px-6">
                          <div class="flex items-center gap-2">
                            <span [class]="event.type === 'Emisión Inicial' 
                              ? 'w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0'
                              : event.type === 'Emisión Electrónica'
                              ? 'w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0'
                              : event.type === 'Nota Crédito'
                              ? 'w-8 h-8 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0'
                              : 'w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0'">
                              <span class="material-icons scale-75">
                                {{ event.type === 'Emisión Inicial' ? 'receipt' : event.type === 'Emisión Electrónica' ? 'rocket_launch' : event.type === 'Nota Crédito' ? 'assignment_returned' : 'assignment_turned_in' }}
                              </span>
                            </span>
                            <span class="text-xs font-black text-gray-900">{{ event.type }}</span>
                          </div>
                        </td>
                        <td class="py-4 px-6">
                          <span class="text-xs font-bold text-gray-900">{{ event.number }}</span>
                        </td>
                        <td class="py-4 px-6">
                          <span class="text-xs text-gray-500">{{ event.date | date:'dd MMM, yyyy' }}</span>
                        </td>
                        <td class="py-4 px-6">
                          <span class="text-xs text-gray-600">{{ event.concept }}</span>
                        </td>
                        <td class="py-4 px-6 text-right">
                          <span [class]="event.type === 'Nota Crédito'
                            ? 'text-xs font-black text-red-600'
                            : event.type === 'Nota Débito'
                            ? 'text-xs font-black text-blue-600'
                            : 'text-xs font-black text-gray-900'">
                            {{ event.isCredit ? '-' : '+' }}{{ event.amount | currency }}
                          </span>
                        </td>
                        <td class="py-4 px-6 text-right">
                          <span class="text-xs font-black text-gray-900">{{ runningBalance($index) | currency }}</span>
                        </td>
                        <td class="py-4 px-6 text-right">
                          @if (event.cude) {
                            <span class="text-[9px] text-gray-400 font-medium" [title]="'CUDE: ' + event.cude">CUDE</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
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
            <div class="p-4 bg-red-50 border border-red-200 rounded-[24px] mb-6 flex items-center gap-3">
              <span class="material-icons text-red-500">error_outline</span>
              <p class="text-xs text-red-700 font-medium">{{ errorMsg }}</p>
            </div>
          }

          <!-- Emission metadata (DIAN) -->
          @if (inv.emission) {
            <div class="space-y-4 mb-6 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Emisión Electrónica (DIAN)</label>
              <div class="p-6 bg-indigo-50/40 border border-indigo-100 rounded-[28px] space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-[10px] font-bold text-gray-500">Número de Emisión</span>
                    <p class="font-black text-gray-900">{{ inv.emission.number }}</p>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-gray-500">CUDE</span>
                    <p class="text-xs font-medium text-gray-600 break-all">{{ inv.emission.cude || 'N/A' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Validado:</span>
                  @if (inv.emission.isValidated) {
                    <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black">SÍ</span>
                  } @else {
                    <span class="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black">PENDIENTE</span>
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

          <footer class="flex justify-end gap-3 pt-6 border-t border-gray-100 flex-wrap">
            <ui-button variant="ghost" (clicked)="close()">
              Cerrar
            </ui-button>

            @if (inv.status !== 'CANCELLED') {
              <ui-button variant="outline" (clicked)="openAdjustmentDialog(inv)">
                <span class="material-icons">post_add</span>
                Emitir Nota (Crédito/Débito)
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

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  error = signal(false);
  notes = signal<{ creditNotes: CreditNote[], debitNotes: DebitNote[] }>({ creditNotes: [], debitNotes: [] });
  pdfLoading = signal(false);
  emitLoading = signal(false);
  emitError = signal<string | null>(null);

  traceEvents = computed(() => {
    const inv = this.invoice();
    const { creditNotes, debitNotes } = this.notes();
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

    for (const dn of debitNotes) {
      events.push({
        type: 'Nota Débito',
        number: dn.noteNumber || dn.referenceCode,
        date: dn.createdAt,
        concept: dn.correctionConceptCode,
        observation: dn.observation,
        amount: Number(dn.amount) || 0,
        isCredit: false,
        cude: dn.cude,
        publicUrl: dn.publicUrl,
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

  runningBalance(index: number): number {
    const events = this.traceEvents();
    let balance = 0;
    for (let i = 0; i <= index; i++) {
      const e = events[i];
      if (e.type === 'Emisión Inicial') {
        balance = e.amount;
      } else if (e.type === 'Nota Crédito') {
        balance -= e.amount;
      } else if (e.type === 'Nota Débito') {
        balance += e.amount;
      }
      // Emisión Electrónica no modifica el saldo
    }
    return balance;
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  openAdjustmentDialog(invoice: Invoice): void {
    const dialogRef = this.matDialog.open(AdjustmentFormDialogOrganism, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'erp-dialog-panel',
      data: {
        invoice: {
          id: invoice.invoiceNumber || invoice.id,
          dbId: invoice.id,
          customerName: invoice.customer?.name || 'Desconocido',
          customerTaxId: invoice.customer?.documentNumber || '',
          date: invoice.date,
          dueDate: invoice.date,
          items: invoice.items || [],
          subtotal: Number(invoice.totalAmount) || 0,
          tax: 0,
          total: Number(invoice.totalAmount) || 0,
          status: invoice.status === 'PAID' ? 'Paid' : invoice.status === 'CANCELLED' ? 'Cancelled' : 'Draft',
          isElectronic: invoice.isElectronic,
          adjustments: [],
        },
      },
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

