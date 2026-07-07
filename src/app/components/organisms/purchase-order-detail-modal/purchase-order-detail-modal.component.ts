import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import type { PurchaseOrder } from '../../../models/purchase-order.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { ConfirmDialogMolecule } from '../../molecules/confirm-dialog/confirm-dialog.component';

export interface PurchaseOrderDetailModalData {
  order: PurchaseOrder;
}

@Component({
  selector: 'app-purchase-order-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ButtonAtom, ConfirmDialogMolecule],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] bg-white dark:bg-gray-900">
      <!-- Header -->
      <div
        class="flex items-start justify-between p-8 pb-4 border-b border-gray-100 dark:border-gray-700"
      >
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="font-black text-2xl text-gray-900 dark:text-gray-100 tracking-tight">
              {{ order.orderNumber }}
            </span>
            <span
              [class]="
                'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ' +
                statusBadgeClass()
              "
            >
              {{ statusLabel() }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {{ order.orderDate | date: 'dd MMM, yyyy' }}
          </p>
        </div>
        <ui-button variant="icon" (clicked)="close(false)" ariaLabel="Cerrar">
          <span class="material-icons">close</span>
        </ui-button>
      </div>

      <div class="flex-1 overflow-y-auto p-8 pt-6 space-y-6 custom-scrollbar">
        <!-- Error message -->
        @if (error()) {
          <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-red-700 dark:text-red-300"
          >
            <div class="flex items-center gap-3">
              <span class="material-icons text-red-500">error_outline</span>
              <p class="text-xs font-bold uppercase tracking-wide">{{ error() }}</p>
            </div>
            <ui-button variant="icon" (clicked)="error.set(null)">
              <span class="material-icons">close</span>
            </ui-button>
          </div>
        }

        <!-- Supplier Card -->
        <section
          class="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3
            class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3"
          >
            Proveedor
          </h3>
          <p class="font-bold text-gray-900 dark:text-gray-100 text-lg">
            {{ order.supplier?.name }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            NIT: {{ order.supplier?.nit }}
          </p>
          @if (order.supplier?.address) {
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ order.supplier.address }}
            </p>
          }
        </section>

        <!-- Items Table -->
        <section
          class="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3
            class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4"
          >
            Productos
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th
                    class="text-left py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                  >
                    Producto
                  </th>
                  <th
                    class="text-center py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                  >
                    Cant.
                  </th>
                  <th
                    class="text-right py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                  >
                    Precio Unit.
                  </th>
                  <th
                    class="text-right py-2 px-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (item of order.items; track item.productId) {
                  <tr class="border-b border-gray-100 dark:border-gray-700/50">
                    <td class="py-3 px-2">
                      <span class="font-bold text-gray-900 dark:text-gray-100">{{
                        item.product?.name || 'Producto'
                      }}</span>
                    </td>
                    <td class="text-center py-3 px-2">
                      <span
                        class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-black"
                      >
                        {{ item.quantity }}
                      </span>
                    </td>
                    <td class="text-right py-3 px-2">
                      <span class="text-gray-700 dark:text-gray-300 font-medium">{{
                        item.price | currency
                      }}</span>
                    </td>
                    <td class="text-right py-3 px-2">
                      <span class="font-black text-gray-900 dark:text-gray-100">{{
                        item.quantity * item.price | currency
                      }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-right">
              <p
                class="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1"
              >
                Total
              </p>
              <p class="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                {{ totalAmount() | currency }}
              </p>
            </div>
          </div>
        </section>

        <!-- Observations -->
        @if (order.observations) {
          <section
            class="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <h3
              class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >
              Observaciones
            </h3>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              {{ order.observations }}
            </p>
          </section>
        }

        <!-- Support Document Info -->
        @if (supportDocument()) {
          <section
            class="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-3xl p-6"
          >
            <h3
              class="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest mb-2"
            >
              Documento Soporte Electrónico
            </h3>
            <p class="text-sm text-green-800 dark:text-green-300 font-bold">
              Número: {{ supportDocument()?.number }}
            </p>
            <p class="text-xs text-green-600 dark:text-green-400 font-medium break-all">
              CUDE: {{ supportDocument()?.cude }}
            </p>
          </section>
        }
      </div>

      <!-- Actions Footer -->
      <div class="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        @switch (order.status) {
          @case ('CREATED') {
            <ui-button
              variant="primary"
              [disabled]="actionInProgress() === 'complete'"
              (clicked)="openCompleteDialog()"
            >
              @if (actionInProgress() === 'complete') {
                <span class="flex items-center gap-2">
                  <span class="material-icons animate-spin">refresh</span>
                  Completando...
                </span>
              } @else {
                Completar Orden
              }
            </ui-button>
            <ui-button
              variant="ghost"
              [disabled]="actionInProgress() !== null"
              (clicked)="showCancelConfirm.set(true)"
              class="text-red-600 hover:text-red-800 dark:text-red-400"
            >
              Cancelar Orden
            </ui-button>
          }
          @case ('COMPLETED') {
            <ui-button
              variant="primary"
              [disabled]="actionInProgress() === 'emit' || !!supportDocument()"
              (clicked)="emitSupportDocument()"
              [title]="supportDocument() ? 'Documento ya emitido' : ''"
            >
              @if (actionInProgress() === 'emit') {
                <span class="flex items-center gap-2">
                  <span class="material-icons animate-spin">refresh</span>
                  Emitiendo...
                </span>
              } @else {
                Emitir documento soporte
              }
            </ui-button>
            @if (supportDocument()) {
              <ui-button
                variant="secondary"
                [disabled]="actionInProgress() === 'download'"
                (clicked)="downloadPdf()"
              >
                @if (actionInProgress() === 'download') {
                  <span class="flex items-center gap-2">
                    <span class="material-icons animate-spin">refresh</span>
                    Descargando...
                  </span>
                } @else {
                  <span class="flex items-center gap-2">
                    <span class="material-icons">download</span>
                    Descargar PDF
                  </span>
                }
              </ui-button>
            }
            <ui-button
              variant="ghost"
              [disabled]="actionInProgress() !== null"
              (clicked)="showCancelConfirm.set(true)"
              class="text-red-600 hover:text-red-800 dark:text-red-400"
            >
              Cancelar Orden
            </ui-button>
          }
          @case ('CANCELLED') {
            <div class="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold text-sm">
              <span class="material-icons">cancel</span>
              Orden Cancelada
            </div>
          }
        }
        <!-- Enviar al proveedor: visible siempre excepto CANCELLED -->
        @if (order.status !== 'CANCELLED') {
          <ui-button variant="ghost" [disabled]="true" title="Próximamente">
            <span class="flex items-center gap-2 opacity-50">
              <span class="material-icons">mail</span>
              Enviar al proveedor
            </span>
          </ui-button>
        }
      </div>
    </div>

    <!-- Complete Order Sub-dialog -->
    @if (showCompleteDialog()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (click)="showCompleteDialog.set(false)"
      >
        <div
          class="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <h3 class="text-xl font-black text-gray-900 dark:text-gray-100 mb-4">Completar Orden</h3>

          <div class="mb-4 space-y-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Proveedor:
              <span class="font-bold text-gray-900 dark:text-gray-100">{{
                order.supplier?.name
              }}</span>
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Total:
              <span class="font-bold text-gray-900 dark:text-gray-100">{{
                totalAmount() | currency
              }}</span>
            </p>
          </div>

          <!-- File Upload -->
          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 mb-4 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            (click)="fileInput.click()"
          >
            @if (selectedFile()) {
              <div class="flex items-center justify-center gap-2">
                <span class="material-icons text-indigo-500">description</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ selectedFile()?.name }}
                </span>
                <span class="text-xs text-gray-400">
                  ({{ (selectedFile()?.size || 0) / 1024 | number: '1.0-0' }} KB)
                </span>
              </div>
              <button
                class="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                (click)="clearFile(); $event.stopPropagation()"
              >
                Eliminar archivo
              </button>
            } @else {
              <span class="material-icons text-gray-300 dark:text-gray-500 text-4xl mb-2">
                cloud_upload
              </span>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Arrastra o haz clic para adjuntar archivo (opcional)
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PDF, PNG, JPG, ZIP — Máx 10MB
              </p>
            }
            <input
              #fileInput
              type="file"
              class="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.zip"
              (change)="onFileSelected($event)"
            />
          </div>

          <div class="flex justify-end gap-3">
            <ui-button variant="ghost" (clicked)="showCompleteDialog.set(false)">
              Cancelar
            </ui-button>
            <ui-button
              variant="primary"
              [disabled]="actionInProgress() === 'complete'"
              (clicked)="confirmComplete()"
            >
              @if (actionInProgress() === 'complete') {
                <span class="flex items-center gap-2">
                  <span class="material-icons animate-spin">refresh</span>
                  Procesando...
                </span>
              } @else {
                Confirmar y Completar
              }
            </ui-button>
          </div>
        </div>
      </div>
    }

    <!-- Cancel Confirmation -->
    <ui-confirm-dialog
      [open]="showCancelConfirm()"
      title="Cancelar Orden"
      [message]="cancelMessage()"
      variant="danger"
      confirmLabel="Sí, cancelar"
      (confirm)="confirmCancel()"
      (cancel)="showCancelConfirm.set(false)"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 10px;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `,
  ],
})
export class PurchaseOrderDetailModalComponent {
  order: PurchaseOrder;
  private dialogRef = inject(MatDialogRef<PurchaseOrderDetailModalComponent, boolean>);
  private purchaseOrderService = inject(PurchaseOrderService);

  // State
  error = signal<string | null>(null);
  actionInProgress = signal<'complete' | 'cancel' | 'emit' | 'download' | null>(null);
  showCancelConfirm = signal(false);
  showCompleteDialog = signal(false);
  selectedFile = signal<File | undefined>(undefined);

  constructor() {
    const data = inject<PurchaseOrderDetailModalData>(MAT_DIALOG_DATA);
    this.order = data.order;
  }

  supportDocument = computed(() => {
    if (this.order.supportDocuments && this.order.supportDocuments.length > 0) {
      return this.order.supportDocuments[0];
    }
    return null;
  });

  totalAmount = computed(() =>
    this.order.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  );

  statusBadgeClass = computed(() => {
    switch (this.order.status) {
      case 'CREATED':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  });

  statusLabel = computed(() => {
    switch (this.order.status) {
      case 'CREATED':
        return 'Creada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return this.order.status;
    }
  });

  cancelMessage = computed(() => {
    if (this.order.status === 'COMPLETED') {
      return `¿Estás seguro de cancelar la orden ${this.order.orderNumber}? Los productos serán removidos del inventario.`;
    }
    return `¿Estás seguro de cancelar la orden ${this.order.orderNumber}?`;
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  clearFile() {
    this.selectedFile.set(undefined);
  }

  openCompleteDialog() {
    this.showCompleteDialog.set(true);
  }

  confirmComplete() {
    this.actionInProgress.set('complete');
    this.error.set(null);

    this.purchaseOrderService.completeOrder(this.order.id, this.selectedFile()).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.actionInProgress.set(null);
        this.showCompleteDialog.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.actionInProgress.set(null);
        this.error.set(err.error?.message || 'Error al completar la orden. Intente nuevamente.');
      },
    });
  }

  confirmCancel() {
    this.actionInProgress.set('cancel');
    this.error.set(null);
    this.showCancelConfirm.set(false);

    this.purchaseOrderService.cancelOrder(this.order.id).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.actionInProgress.set(null);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.actionInProgress.set(null);
        this.error.set(err.error?.message || 'Error al cancelar la orden. Intente nuevamente.');
      },
    });
  }

  emitSupportDocument() {
    this.actionInProgress.set('emit');
    this.error.set(null);

    this.purchaseOrderService.emitSupportDocument(this.order.id).subscribe({
      next: (doc) => {
        this.actionInProgress.set(null);
        // Update the order's supportDocuments to include the new doc
        this.order = {
          ...this.order,
          supportDocuments: [doc],
        };
      },
      error: (err) => {
        this.actionInProgress.set(null);
        this.error.set(err.error?.message || 'Error al emitir documento soporte.');
      },
    });
  }

  downloadPdf() {
    this.actionInProgress.set('download');
    this.error.set(null);

    this.purchaseOrderService.downloadSupportDocumentPdf(this.order.id).subscribe({
      next: (result) => {
        this.actionInProgress.set(null);
        // Trigger download
        const byteCharacters = atob(result.pdfBase64Encoded);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName || 'support-document.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.actionInProgress.set(null);
        this.error.set(err.error?.message || 'Error al descargar PDF.');
      },
    });
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
