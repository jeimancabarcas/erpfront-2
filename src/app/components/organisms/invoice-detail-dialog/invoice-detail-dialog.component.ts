import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FinanceService } from '../../../services/finance.service';
import { FinanceInvoice } from '../../../models/finance.model';

@Component({
  selector: 'app-invoice-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[40px] bg-white flex flex-col max-h-[95vh] w-full max-w-2xl">
      <!-- Decorative Background -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 transition-colors duration-500"></div>
      
      <!-- Fixed Header -->
      <header class="flex items-center justify-between p-10 pb-6 relative z-10">
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-100">
            <mat-icon class="!text-[32px] !w-8 !h-8">receipt_long</mat-icon>
          </div>
          <div>
            <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">{{ data.invoice.id }}</h2>
            <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full"
                    [class.bg-green-500]="data.invoice.status === 'Paid'"
                    [class.bg-blue-500]="data.invoice.status === 'Sent'"
                    [class.bg-amber-500]="data.invoice.status === 'Draft'"
                    [class.bg-red-500]="data.invoice.status === 'Overdue'"></span>
              Estado: {{ getStatusLabel(data.invoice.status) }}
            </p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-300 hover:!text-gray-600 transition-colors">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-10 py-2 custom-scrollbar" style="max-height: 65vh;">
        <div class="space-y-8 pb-8">
          
          <!-- Customer & Summary Card -->
          <div class="grid grid-cols-2 gap-6">
            <div class="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Información del Cliente</p>
              <div class="flex flex-col gap-1">
                <span class="text-lg font-black text-gray-900">{{ data.invoice.customerName }}</span>
                <span class="text-sm font-bold text-indigo-600">{{ data.invoice.customerTaxId }}</span>
              </div>
            </div>
            <div class="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
              <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Resumen Financiero</p>
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-gray-500">Total a Pagar</span>
                <span class="text-2xl font-black text-indigo-900 tracking-tighter">{{ data.invoice.total | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- Items Detail -->
          <div class="space-y-4">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detalle de Productos / Servicios</p>
            <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div class="p-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</span>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
              </div>
              <div class="divide-y divide-gray-50">
                @for (item of data.invoice.items; track item.id) {
                  <div class="p-5 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                    <div class="flex flex-col gap-1">
                      <span class="text-sm font-bold text-gray-800">{{ item.description }}</span>
                      <span class="text-[10px] font-medium text-gray-400">{{ item.quantity }} un. x {{ item.unitPrice | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                    <span class="text-sm font-black text-gray-900">{{ (item.quantity * item.unitPrice) | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Electronic Information -->
          <div class="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
            <div class="flex items-center gap-3">
              <mat-icon class="text-indigo-400">qr_code_2</mat-icon>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest !m-0">Información Electrónica DIAN</p>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-gray-400 mb-1">Código Único de Factura Electrónica (CUFE)</span>
                <span class="text-[11px] font-mono font-bold text-gray-600 bg-white p-2 rounded-xl border border-gray-100 break-all">
                  {{ data.invoice.electronicId || 'Generando código...' }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Fixed Footer Actions -->
      <div class="p-10 pt-6 border-t border-gray-50 bg-white relative z-20">
        <div class="flex flex-col gap-4">
          @if (data.invoice.status !== 'Paid') {
            <button mat-flat-button color="primary" type="button" (click)="markAsPaid()"
              class="!rounded-full !h-16 !font-black !bg-green-600 shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <mat-icon class="mr-2">check_circle</mat-icon>
              Registrar Pago Completo
            </button>
          }
          <button mat-button type="button" (click)="dialogRef.close()" class="!rounded-full !h-12 !font-bold text-gray-400 hover:text-gray-600">
            Cerrar Detalle
          </button>
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
export class InvoiceDetailDialogOrganism {
  public dialogRef = inject(MatDialogRef<InvoiceDetailDialogOrganism>);
  public data = inject<{ invoice: FinanceInvoice }>(MAT_DIALOG_DATA);
  public financeService = inject(FinanceService);

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Paid': 'Pagada',
      'Sent': 'Enviada / Pendiente de Pago',
      'Draft': 'Borrador',
      'Overdue': 'Vencida'
    };
    return labels[status] || status;
  }

  markAsPaid() {
    this.financeService.updateInvoiceStatus(this.data.invoice.id, 'Paid');
    this.dialogRef.close({ action: 'paid', invoiceId: this.data.invoice.id });
  }
}
