import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FinanceService } from '../../../services/finance.service';
import { SalesNoteService } from '../../../services/sales-note.service';
import { AdjustmentNote, FinanceInvoice } from '../../../models/finance.model';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface AdjustmentDetailData {
  note: AdjustmentNote;
}

@Component({
  selector: 'app-adjustment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ButtonAtom
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
      </div>
    } @else {
    <div class="relative overflow-hidden rounded-[32px] bg-white flex flex-col max-h-[95vh] w-full max-w-[650px] shadow-2xl">
      <!-- Decorative background blur -->
      <div 
        class="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-40"
        [ngClass]="note.type === 'Credit' ? 'bg-amber-100' : 'bg-indigo-100'">
      </div>
      
      <div class="p-8 relative z-10 overflow-y-auto custom-scrollbar">
        <!-- Header -->
        <header class="flex items-start justify-between mb-8">
          <div class="flex items-center gap-5">
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              class="bg-amber-50 text-amber-600">
              <span class="material-icons !text-[28px] !w-7 !h-7">remove_circle</span>
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">
                  Nota Crédito
                </h2>
                <span 
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  [ngClass]="{
                    'bg-green-50 text-green-600 border border-green-100': note.status === 'Applied' || note.status === 'Electronic_Sent',
                    'bg-amber-50 text-amber-600 border border-amber-100': note.status === 'Pending'
                  }">
                  {{ note.status === 'Electronic_Sent' ? 'Transmitida' : note.status }}
                </span>
              </div>
              <p class="text-gray-400 text-xs font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                Nº {{ note.id }} • {{ note.date | date:'longDate' }}
              </p>
            </div>
          </div>
          <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        <!-- Technical UUID / CUDE -->
        <div class="p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="material-icons text-gray-400 scale-75">security</span>
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">CUDE (DIAN)</span>
          </div>
          <code class="text-[11px] font-mono text-indigo-900 font-bold bg-indigo-50/50 px-2.5 py-1 rounded-lg break-all">
            {{ note.electronicId || 'N/A' }}
          </code>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Associated Invoice Info -->
          <div class="space-y-4">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Factura Relacionada</label>
            <div class="p-6 bg-gray-50 rounded-[28px] border border-gray-100 flex items-start gap-4">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 shrink-0">
                <span class="material-icons">receipt</span>
              </div>
              <div>
                <h4 class="font-black text-gray-900 leading-none mb-1">{{ note.invoiceId }}</h4>
                @if (invoice) {
                  <p class="text-xs text-gray-500 font-medium mb-2">{{ invoice.customerName }}</p>
                  <p class="text-[10px] text-gray-400 font-bold">NIT: {{ invoice.customerTaxId }}</p>
                } @else {
                  <p class="text-xs text-gray-400 italic">Detalles de factura no disponibles</p>
                }
              </div>
            </div>
          </div>

          <!-- Adjustment Summary -->
          <div class="space-y-4">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Resumen del Ajuste</label>
            <div 
              class="p-6 rounded-[28px] border space-y-4"
              [ngClass]="note.type === 'Credit' ? 'bg-amber-50/30 border-amber-100/50' : 'bg-indigo-50/30 border-indigo-100/50'">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-gray-500">Monto Base</span>
                <span class="text-xs font-black text-gray-900">{{ baseAmount | currency }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-gray-500">IVA (19% Incluido)</span>
                <span class="text-xs font-black text-gray-600">{{ taxAmount | currency }}</span>
              </div>
              <hr class="border-t border-gray-200">
              <div class="flex justify-between items-center pt-2">
                <span class="text-xs font-bold text-gray-500">Total Ajustado</span>
                <span 
                  class="text-xl font-black"
                  [ngClass]="note.type === 'Credit' ? 'text-amber-600' : 'text-indigo-600'">
                  {{ (note.type === 'Credit' ? '-' : '+') }}{{ note.amount | currency }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Justification / Reason -->
        <div class="p-6 bg-gray-50 border border-gray-100 rounded-[24px] mb-8">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-icons text-gray-400 scale-75">subject</span>
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto / Justificación</span>
          </div>
          <p class="text-sm text-gray-700 font-medium leading-relaxed italic">
            "{{ note.reason || 'Sin justificación técnica especificada.' }}"
          </p>
        </div>

        <!-- Footer Actions -->
        <footer class="flex justify-end gap-3 pt-6 border-t border-gray-100 flex-wrap">
          <button (click)="close()" class="!rounded-full !px-6 md:!px-8 !h-12 !font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cerrar
          </button>
          
          <button 
            (click)="simulatePdfDownload()"
            [disabled]="pdfLoading()"
            [ngClass]="note.type === 'Credit' ? '!bg-amber-500' : '!bg-indigo-600'"
            class="!rounded-full !px-8 md:!px-10 !h-12 !text-white !font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            @if (pdfLoading()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Generando PDF…</span>
              </span>
            } @else {
              <span class="flex items-center justify-center gap-2">
                <span class="material-icons">picture_as_pdf</span>
                <span>Descargar PDF DIAN</span>
              </span>
            }
          </button>
        </footer>
      </div>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class AdjustmentDetailDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  private dialogRef = inject(MatDialogRef<AdjustmentDetailDialogOrganism>);
  private dialogData = inject<AdjustmentDetailData>(MAT_DIALOG_DATA);
  private financeService = inject(FinanceService);
  private salesNoteService = inject(SalesNoteService);

  note!: AdjustmentNote;
  invoice: FinanceInvoice | null = null;
  baseAmount: number = 0;
  taxAmount: number = 0;
  pdfLoading = signal(false);

  ngOnInit() {
    this.note = this.dialogData.note;
    
    // Find associated invoice
    const foundInvoice = this.financeService.invoices().find(inv => inv.id === this.note.invoiceId);
    if (foundInvoice) {
      this.invoice = foundInvoice;
    } else if ((this.note as any).mappedInvoice) {
      this.invoice = (this.note as any).mappedInvoice;
    }

    // Calculate simulated tax and base (assuming 19% VAT is included in total amount)
    // base = amount / 1.19
    // tax = amount - base
    this.baseAmount = Math.round(this.note.amount / 1.19);
    this.taxAmount = this.note.amount - this.baseAmount;
  }

  close() {
    this.dialogRef.close();
  }

  simulatePdfDownload() {
    const noteId = this.note.dbId || (this.note as any).id;
    if (!noteId) {
      alert('Error: No se pudo identificar el ID único de la nota para la descarga.');
      return;
    }

    this.pdfLoading.set(true);

    this.salesNoteService.getCreditNotePdf(noteId).subscribe({
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
          
          // Open PDF in a new tab for elegant viewing and native printing/downloading
          window.open(blobUrl, '_blank');
        } catch (e) {
          console.error('Error decoding PDF:', e);
          alert('Error al procesar el PDF de la nota de ajuste.');
        }
      },
      error: (err) => {
        this.pdfLoading.set(false);
        console.error('Error fetching note PDF:', err);
        alert('Error al descargar el PDF de la nota de la DIAN.');
      }
    });
  }
}
