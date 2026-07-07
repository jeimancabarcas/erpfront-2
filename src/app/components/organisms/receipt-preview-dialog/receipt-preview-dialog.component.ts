import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../../services/customer.service';
import { PaymentReceiptDto } from '../../../models/customer.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../shared/constants/dialog.config';
import { finalize } from 'rxjs';

export interface ReceiptPreviewDialogData {
  customerId: string;
  paymentId: string;
}

@Component({
  selector: 'app-receipt-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatDialogModule,
    ButtonAtom,
    TableComponent,
    TableCellDirective,
  ],
  template: `
    <div class="flex flex-col max-h-[85vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <span class="material-icons !text-[20px]">receipt</span>
          </div>
          <div>
            @if (loading()) {
              <h2 class="text-lg font-black text-gray-900 dark:text-gray-100">Generando recibo...</h2>
            } @else if (data(); as d) {
              <h2 class="text-lg font-black text-gray-900 dark:text-gray-100">Recibo de Pago</h2>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{{ d.invoiceNumber }}</p>
            } @else if (error()) {
              <h2 class="text-lg font-black text-red-600 dark:text-red-400">Error</h2>
            }
          </div>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar">
          <span class="material-icons">close</span>
        </ui-button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="p-10 flex flex-col items-center justify-center space-y-4">
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p class="text-sm font-bold text-gray-400 dark:text-gray-500">Cargando información del recibo...</p>
        </div>
      }

      <!-- Error State -->
      @if (error(); as errMsg) {
        <div class="p-10 flex flex-col items-center text-center space-y-4">
          <div class="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-red-500 dark:text-red-400 !text-[28px]">error_outline</span>
          </div>
          <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ errMsg }}</p>
          <ui-button variant="ghost" (clicked)="close()">Cerrar</ui-button>
        </div>
      }

      <!-- Success State -->
      @if (data(); as d) {
        <div class="p-6 space-y-6">
          <!-- Section 1: Invoice Line-Item Breakdown -->
          <section>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-black text-gray-900 dark:text-gray-100">Detalle de Factura</h3>
              <span [class]="'text-xs font-bold px-2.5 py-1 rounded-lg ' + statusBadgeClass(d.invoiceStatus)">
                {{ d.invoiceStatus }}
              </span>
            </div>
            <div class="border border-gray-100 dark:border-gray-700 rounded-[24px] overflow-hidden bg-white dark:bg-gray-900 shadow-sm dark:shadow-none">
              <ui-table
                [columns]="itemsColumns"
                [data]="d.invoiceItems"
                emptyMessage="No hay productos en esta factura"
              >
                <ng-template uiTableCell="productName" let-item>
                  <span class="font-bold text-gray-900 dark:text-gray-100">{{ item.productName }}</span>
                </ng-template>

                <ng-template uiTableCell="quantity" let-item>
                  <span class="text-sm font-black text-gray-900 dark:text-gray-100">{{ item.quantity }}</span>
                </ng-template>

                <ng-template uiTableCell="unitPrice" let-item>
                  <span class="font-bold text-gray-900 dark:text-gray-100">{{ item.unitPrice | currency }}</span>
                </ng-template>

                <ng-template uiTableCell="subtotal" let-item>
                  <span class="text-sm font-black text-gray-900 dark:text-gray-100">{{ item.subtotal | currency }}</span>
                </ng-template>
              </ui-table>
            </div>
            @if (d.invoiceItems.length > 0) {
              <div class="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-800/30 rounded-b-xl">
                <span class="text-xs font-black text-gray-900 dark:text-gray-100 mr-4">Total</span>
                <span class="text-xs font-black text-gray-900 dark:text-gray-100">{{ d.invoiceTotal | currency }}</span>
              </div>
            }
          </section>

          <!-- Section 1b: Payment Terms (Plazo y Cuotas) -->
          @if (d.installments || d.paymentFrequency || d.dueDate) {
            <section>
              <h3 class="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Plazo y Cuotas</h3>
              <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 space-y-1">
                @if (d.paymentFrequency) {
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Plazo: <span class="font-semibold">{{ paymentFrequencyLabel(d.paymentFrequency) }}</span>
                  </p>
                }
                @if (d.installments) {
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ d.installments }} {{ d.installments === 1 ? 'cuota' : 'cuotas' }}
                  </p>
                }
                @if (d.dueDate) {
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Vencimiento: <span class="font-semibold">{{ d.dueDate | date:'dd MMM, yyyy' }}</span>
                  </p>
                }
              </div>
            </section>
          } @else {
            <section>
              <h3 class="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Plazo y Cuotas</h3>
              <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <p class="text-sm text-gray-400 dark:text-gray-500 italic">Sin condiciones de pago</p>
              </div>
            </section>
          }

          <!-- Section 2: Payment Mini-History -->
          <section>
            <h3 class="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Historial de Abonos</h3>
            <div [class.max-h-64]="d.allInvoicePayments.length > 8" class="overflow-y-auto space-y-2">
              @for (payment of d.allInvoicePayments; track payment.id) {
                <div
                  class="p-3 rounded-xl border"
                  [class.border-blue-300]="payment.isCurrentPayment"
                  [class.bg-blue-50]="payment.isCurrentPayment"
                  [class.dark:bg-blue-900/20]="payment.isCurrentPayment"
                  [class.border-l-4]="payment.isCurrentPayment"
                  [class.border-l-blue-500]="payment.isCurrentPayment"
                  [class.border-gray-100]="!payment.isCurrentPayment"
                  [class.dark:border-gray-800]="!payment.isCurrentPayment"
                  [class.bg-white]="!payment.isCurrentPayment"
                  [class.dark:bg-gray-900]="!payment.isCurrentPayment"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-black text-gray-900 dark:text-gray-100">{{ payment.amount | currency }}</span>
                      @if (payment.isCurrentPayment) {
                        <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">Este recibo</span>
                      }
                    </div>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ payment.paymentDate | date:'dd MMM, yyyy' }}</span>
                  </div>
                  @if (payment.notes) {
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{{ payment.notes }}</p>
                  }
                </div>
              }
            </div>
          </section>

          <!-- Section 3: Remaining Balance -->
          <section>
            <h3 class="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Saldo Pendiente</h3>
            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              @if (d.remainingBalance <= 0) {
                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span class="material-icons !text-[20px]">check_circle</span>
                  <span class="text-lg font-black">¡Pagada!</span>
                </div>
              } @else {
                <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <span class="material-icons !text-[20px]">warning_amber</span>
                  <span class="text-lg font-black">{{ d.remainingBalance | currency }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Section 4: Notes -->
          <section>
            <h3 class="text-sm font-black text-gray-900 dark:text-gray-100 mb-3">Notas del Pago</h3>
            @if (d.paymentNotes) {
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ d.paymentNotes }}</p>
            } @else {
              <p class="text-sm text-gray-400 dark:text-gray-500 italic">Sin notas</p>
            }
          </section>
        </div>
      }

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
        <ui-button variant="ghost" (clicked)="close()">Cerrar</ui-button>
        <ui-button
          variant="primary"
          [loading]="downloading()"
          [disabled]="downloadError()"
          (clicked)="downloadPdf()"
        >
          @if (downloadError()) {
            <span class="flex items-center gap-1">
              <span class="material-icons !text-[16px]">error</span>
              Error al descargar
            </span>
          } @else if (downloading()) {
            <span class="flex items-center gap-1">
              <span class="material-icons !text-[16px]">download</span>
              Descargando...
            </span>
          } @else {
            <span class="flex items-center gap-1">
              <span class="material-icons !text-[16px]">download</span>
              Descargar PDF
            </span>
          }
        </ui-button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class ReceiptPreviewDialogOrganism implements OnInit {
  private dialogRef = inject(MatDialogRef<ReceiptPreviewDialogOrganism>);
  private customerService = inject(CustomerService);
  readonly dataModel = inject<ReceiptPreviewDialogData>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<PaymentReceiptDto | null>(null);

  readonly downloading = signal(false);
  readonly downloadError = signal(false);

  protected readonly itemsColumns: TableColumn[] = [
    { key: 'productName', header: 'Producto' },
    { key: 'quantity', header: 'Cantidad', align: 'center', width: '100px' },
    { key: 'unitPrice', header: 'Precio Unit.', align: 'center', width: '130px' },
    { key: 'subtotal', header: 'Subtotal', align: 'right', width: '120px' },
  ];

  ngOnInit() {
    this.loadReceipt();
  }

  private loadReceipt() {
    this.loading.set(true);
    this.error.set(null);

    this.customerService
      .getPaymentReceipt(this.dataModel.customerId, this.dataModel.paymentId)
      .subscribe({
        next: (receipt) => {
          this.data.set(receipt);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el recibo');
          this.loading.set(false);
        },
      });
  }

  downloadPdf() {
    if (this.downloading()) return;

    this.downloading.set(true);
    this.downloadError.set(false);

    this.customerService
      .getPaymentReceiptPdf(this.dataModel.customerId, this.dataModel.paymentId)
      .pipe(finalize(() => this.downloading.set(false)))
      .subscribe({
        next: (res) => {
          const receipt = this.data();
          const invoiceNumber = receipt?.invoiceNumber || 'recibo';
          const filename = `recibo-${invoiceNumber}-${this.dataModel.paymentId}.pdf`;

          const byteCharacters = atob(res.pdf);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.downloadError.set(true);
        },
      });
  }

  close() {
    this.dialogRef.close();
  }

  protected paymentFrequencyLabel(frequency: string): string {
    const labels: Record<string, string> = {
      DAILY: 'Diario',
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quincenal',
      MONTHLY: 'Mensual',
      QUARTERLY: 'Trimestral',
      YEARLY: 'Anual',
    };
    return labels[frequency] || frequency;
  }

  protected statusBadgeClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
      case 'CANCELLED':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      default:
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30';
    }
  }
}


