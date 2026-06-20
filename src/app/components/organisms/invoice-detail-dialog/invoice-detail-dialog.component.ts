import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice } from '../../../models/invoice.model';
import { SalesNoteService } from '../../../services/sales-note.service';
import { SalesNoteFormDialogOrganism } from '../sales-note-form-dialog/sales-note-form-dialog.component';
import { CreditNote, DebitNote } from '../../../models/sales-note.model';

@Component({
  selector: 'app-invoice-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    CurrencyPipe,
    DatePipe
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
      } @else if (invoice(); as inv) {
        <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
          <header class="flex items-start justify-between mb-8">
            <div class="flex items-center gap-5">
              <div [className]="inv.status === 'CANCELLED' 
                ? 'w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-sm'
                : 'w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm'">
                <mat-icon class="!text-[28px] !w-7 !h-7">{{ inv.status === 'CANCELLED' ? 'cancel' : 'verified' }}</mat-icon>
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
            <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
              <mat-icon>close</mat-icon>
            </button>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Customer Info -->
            <div class="space-y-4">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Información del Cliente</label>
              <div class="p-6 bg-gray-50 rounded-[28px] border border-gray-100 flex items-start gap-4">
                <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                  <mat-icon>person</mat-icon>
                </div>
                <div>
                  <h4 class="font-black text-gray-900 leading-none mb-1">{{ inv.customer?.name }}</h4>
                  <p class="text-xs text-gray-500 font-medium mb-2">{{ inv.customer?.documentType }}: {{ inv.customer?.documentNumber }}</p>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 text-[11px] text-gray-400">
                      <mat-icon class="!text-[14px] !w-3.5 !h-3.5">email</mat-icon>
                      {{ inv.customer?.email }}
                    </div>
                    @if (inv.customer?.phone) {
                      <div class="flex items-center gap-2 text-[11px] text-gray-400">
                        <mat-icon class="!text-[14px] !w-3.5 !h-3.5">phone</mat-icon>
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
                <mat-divider></mat-divider>
                <div class="flex justify-between items-center pt-2">
                  <span class="text-xs font-bold text-gray-500">Total Facturado</span>
                  <span class="text-xl font-black text-indigo-600">{{ inv.totalAmount | currency }}</span>
                </div>
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
                      <td class="py-4 px-6 text-center font-black text-gray-900">
                        {{ item.subtotal | currency }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Associated Electronic Notes (DIAN) -->
          @if (notes().creditNotes.length > 0 || notes().debitNotes.length > 0) {
            <div class="space-y-4 mb-8 animate-in fade-in duration-300">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Documentos Electrónicos de Ajuste (DIAN)</label>
              <div class="grid grid-cols-1 gap-4">
                <!-- Credit Notes -->
                @for (note of notes().creditNotes; track note.id) {
                  <div class="p-5 bg-red-50/40 border border-red-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shadow-sm">
                        <mat-icon class="scale-90">assignment_returned</mat-icon>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="font-black text-gray-900 text-sm leading-none m-0">Nota de Crédito {{ note.noteNumber }}</h4>
                          <span class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[8px] font-black uppercase tracking-wider">
                            VÁLIDA
                          </span>
                        </div>
                        <p class="text-[9px] text-gray-400 font-semibold uppercase mt-1.5 leading-none">CUDE: {{ note.cude || 'N/A' }}</p>
                        @if (note.observation) {
                          <p class="text-xs text-gray-600 font-medium mt-2.5 italic">"{{ note.observation }}"</p>
                        }
                      </div>
                    </div>
                    <div class="flex items-center gap-4 self-end md:self-auto">
                      <span class="text-base font-black text-red-600">-{{ note.amount | currency }}</span>
                      @if (note.publicUrl) {
                        <a [href]="note.publicUrl" target="_blank" mat-stroked-button class="!rounded-full !px-4 !h-9 !border-red-200 !text-red-700 !bg-white hover:!bg-red-50 text-xs shadow-sm">
                          <mat-icon class="mr-1 scale-75">picture_as_pdf</mat-icon>
                          PDF DIAN
                        </a>
                      }
                    </div>
                  </div>
                }

                <!-- Debit Notes -->
                @for (note of notes().debitNotes; track note.id) {
                  <div class="p-5 bg-blue-50/40 border border-blue-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div class="flex items-start gap-4">
                      <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <mat-icon class="scale-90">assignment_turned_in</mat-icon>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="font-black text-gray-900 text-sm leading-none m-0">Nota de Débito {{ note.noteNumber }}</h4>
                          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] font-black uppercase tracking-wider">
                            VÁLIDA
                          </span>
                        </div>
                        <p class="text-[9px] text-gray-400 font-semibold uppercase mt-1.5 leading-none">CUDE: {{ note.cude || 'N/A' }}</p>
                        @if (note.observation) {
                          <p class="text-xs text-gray-600 font-medium mt-2.5 italic">"{{ note.observation }}"</p>
                        }
                      </div>
                    </div>
                    <div class="flex items-center gap-4 self-end md:self-auto">
                      <span class="text-base font-black text-blue-600">+{{ note.amount | currency }}</span>
                      @if (note.publicUrl) {
                        <a [href]="note.publicUrl" target="_blank" mat-stroked-button class="!rounded-full !px-4 !h-9 !border-blue-200 !text-blue-700 !bg-white hover:!bg-blue-50 text-xs shadow-sm">
                          <mat-icon class="mr-1 scale-75">picture_as_pdf</mat-icon>
                          PDF DIAN
                        </a>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Notes -->
          @if (inv.notes) {
            <div class="p-6 bg-amber-50/30 border border-amber-100 rounded-[24px] mb-8">
              <div class="flex items-center gap-2 mb-2">
                <mat-icon class="text-amber-500 scale-75">description</mat-icon>
                <span class="text-[10px] font-black text-amber-700 uppercase tracking-widest">Observaciones</span>
              </div>
              <p class="text-sm text-amber-900 font-medium">{{ inv.notes }}</p>
            </div>
          }

          <footer class="flex justify-end gap-3 pt-6 border-t border-gray-100 flex-wrap">
            <button mat-button class="!rounded-full !px-6 md:!px-8 !h-12 !font-bold text-gray-500" (click)="dialogRef.close()">
              Cerrar
            </button>
            
            @if (inv.status !== 'CANCELLED') {
              <button mat-stroked-button color="accent" (click)="openSalesNoteDialog(inv)" class="!rounded-full !px-6 md:!px-8 !h-12 !font-black !text-indigo-600 !border-indigo-200 hover:!bg-indigo-50 shadow-sm">
                <mat-icon class="mr-2">post_add</mat-icon>
                Emitir Nota (Crédito/Débito)
              </button>
            }

            <button 
              mat-flat-button 
              (click)="viewPdf(inv)"
              [disabled]="pdfLoading()"
              class="!rounded-full !px-8 md:!px-10 !h-12 !bg-red-600 !text-white !font-black shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              @if (pdfLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-5 h-5 border-2 border-red-100 border-t-red-600 rounded-full animate-spin"></span>
                  <span>Cargando PDF...</span>
                </span>
              } @else {
                <span class="flex items-center justify-center gap-2">
                  <mat-icon>picture_as_pdf</mat-icon>
                  <span>Ver PDF DIAN</span>
                </span>
              }
            </button>

            <button mat-flat-button color="primary" class="!rounded-full !px-8 md:!px-10 !h-12 !bg-indigo-600 !font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <mat-icon class="mr-2">print</mat-icon>
              Imprimir Factura
            </button>
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
  public dialogRef = inject(MatDialogRef<InvoiceDetailDialogOrganism>);
  private data = inject(MAT_DIALOG_DATA);
  private invoiceService = inject(InvoiceService);
  private salesNoteService = inject(SalesNoteService);
  private dialog = inject(MatDialog);

  invoice = signal<Invoice | null>(null);
  loading = signal(true);
  notes = signal<{ creditNotes: CreditNote[], debitNotes: DebitNote[] }>({ creditNotes: [], debitNotes: [] });
  pdfLoading = signal(false);

  ngOnInit() {
    if (this.data?.invoiceId) {
      this.invoiceService.getInvoiceById(this.data.invoiceId).subscribe({
        next: (inv) => {
          this.invoice.set(inv);
          this.loading.set(false);
          this.loadNotes(inv.id);
        },
        error: () => this.dialogRef.close()
      });
    } else if (this.data?.invoice) {
      const inv = this.data.invoice;
      this.invoice.set(inv);
      this.loading.set(false);
      this.loadNotes(inv.id);
    }
  }

  loadNotes(invoiceId: string) {
    this.salesNoteService.getNotesByInvoiceId(invoiceId).subscribe({
      next: (res) => {
        this.notes.set(res);
      },
      error: (err) => console.error('Error cargando notas de ajuste:', err)
    });
  }

  openSalesNoteDialog(invoice: Invoice) {
    const ref = this.dialog.open(SalesNoteFormDialogOrganism, {
      data: { invoice },
      width: '850px',
      maxWidth: '95vw'
    });

    ref.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Re-load invoice state reactively to refresh total and cancelled state
        this.loading.set(true);
        this.invoiceService.getInvoiceById(invoice.id).subscribe({
          next: (inv) => {
            this.invoice.set(inv);
            this.loading.set(false);
            this.loadNotes(inv.id);
          },
          error: () => {
            this.loading.set(false);
            this.loadNotes(invoice.id);
          }
        });
      }
    });
  }

  viewPdf(invoice: Invoice) {
    if (!invoice.id) return;
    this.pdfLoading.set(true);
    this.invoiceService.getInvoicePdf(invoice.id).subscribe({
      next: (res) => {
        this.pdfLoading.set(false);
        try {
          const byteCharacters = atob(res.pdfBase64Encoded);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } catch (e) {
          console.error('Error decoding PDF:', e);
          alert('Error al procesar el PDF de la factura.');
        }
      },
      error: (err) => {
        this.pdfLoading.set(false);
        console.error('Error fetching PDF:', err);
        alert('Error al descargar el PDF de la factura.');
      }
    });
  }
}

