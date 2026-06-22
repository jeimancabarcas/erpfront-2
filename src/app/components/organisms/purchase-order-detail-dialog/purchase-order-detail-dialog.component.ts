import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../models/purchase-order.model';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-purchase-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ButtonAtom
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh]">
      <!-- Header -->
      <header class="flex justify-between items-center mb-6 px-2">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span class="material-icons !text-3xl">receipt_long</span>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
              Detalle de Orden
            </h2>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {{ order().orderNumber }} • {{ order().orderDate | date:'dd MMM, yyyy' }}
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="onClose()">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <!-- Status Banner -->
      <div
        class="mx-2 mb-8 p-4 rounded-3xl flex items-center justify-between gap-4 transition-all duration-500"
        [ngClass]="statusThemes[order().status].bg"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm" [ngClass]="statusThemes[order().status].text">
            <span class="material-icons">{{ statusThemes[order().status].icon }}</span>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-60" [ngClass]="statusThemes[order().status].text">Estado Actual</p>
            <p class="text-sm font-bold uppercase" [ngClass]="statusThemes[order().status].text">
              {{ statusLabels[order().status] }}
            </p>
          </div>
        </div>

        @if (order().receiptUrl) {
          <a
            [href]="order().receiptUrl"
            target="_blank"
            class="flex items-center gap-2 bg-white/50 hover:bg-white px-4 py-2 rounded-full text-xs font-bold transition-all no-underline"
            [ngClass]="statusThemes[order().status].text"
          >
            <span class="material-icons !text-sm">attachment</span>
            Ver Comprobante
          </a>
        }
      </div>

      <div class="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <!-- Seccion de carga de comprobante (ARRIBA) -->
        @if (showReceiptUpload()) {
          <div class="bg-emerald-50 rounded-3xl p-8 border-2 border-dashed border-emerald-200 mb-8 animate-in zoom-in duration-300">
            <div class="text-center">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
                <span class="material-icons !text-3xl">upload_file</span>
              </div>
              <h4 class="text-lg font-black text-emerald-900 mb-2">Subir Comprobante de Pago</h4>
              <p class="text-sm text-emerald-700/70 mb-6 max-w-xs mx-auto">Para completar la orden, es necesario adjuntar el soporte de pago o transferencia.</p>
              
              <input
                type="file"
                #fileInput
                class="hidden"
                (change)="onFileSelected($event)"
                accept="image/*,application/pdf"
              >
              
              @if (!selectedFile()) {
                <ui-button
                  variant="primary"
                  (clicked)="fileInput.click()"
                  class="!bg-emerald-600 !text-white !rounded-full !px-8 !h-12 !font-bold"
                >
                  Seleccionar Archivo
                </ui-button>
              } @else {
                <div class="flex items-center justify-center gap-4">
                  <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-emerald-100">
                    <span class="material-icons text-emerald-500">check_circle</span>
                    <span class="text-xs font-bold text-emerald-900 truncate max-w-[200px]">{{ selectedFile()?.name }}</span>
                  </div>
                  <ui-button variant="icon" (clicked)="selectedFile.set(null)"><!-- TODO: add variant for red icon button -->
                    <span class="material-icons">delete</span>
                  </ui-button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Grid Informacion -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Proveedor -->
          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="material-icons !text-xs">business</span>
              Proveedor
            </h3>
            <p class="text-lg font-black text-gray-900 leading-tight mb-1">{{ order().supplier?.name }}</p>
            <p class="text-sm text-gray-500 font-medium mb-4">NIT: {{ order().supplier?.nit }}</p>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <span class="material-icons !text-sm text-gray-400">phone</span>
                {{ order().supplier?.phone }}
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <span class="material-icons !text-sm text-gray-400">email</span>
                {{ order().supplier?.email }}
              </div>
            </div>
          </div>

          <!-- Resumen Economico -->
          <div class="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <span class="material-icons absolute -right-4 -bottom-4 !text-9xl opacity-10 rotate-12">payments</span>
            <h3 class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="material-icons !text-xs">analytics</span>
              Resumen Económico
            </h3>
            <p class="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Total de la Orden</p>
            <p class="text-4xl font-black tracking-tighter">{{ grandTotal() | currency }}</p>
            <div class="mt-6 pt-4 border-t border-white/10">
              <p class="text-xs font-medium text-indigo-100">Cantidad de Productos: <span class="font-bold text-white">{{ order().items?.length }}</span></p>
            </div>
          </div>
        </div>

        <!-- Tabla de Items -->
        <div class="mb-8">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 px-2">Productos Solicitados</h3>
          <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/50">
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Producto</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-50">Cant.</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-50">Precio</th>
                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-50">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (item of order().items; track $index) {
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <p class="text-sm font-bold text-gray-900">{{ item.product?.name }}</p>
                        <p class="text-[10px] font-mono text-gray-400">{{ item.product?.sku }}</p>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-black">{{ item.quantity }}</span>
                      </td>
                      <td class="px-6 py-4 text-right text-xs font-medium text-gray-500">
                        {{ item.price | currency }}
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-sm font-black text-gray-900">{{ (item.price * item.quantity) | currency }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        @if (order().observations) {
          <div class="bg-amber-50 rounded-3xl p-6 border border-amber-100 mb-8">
            <h3 class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
               <span class="material-icons !text-xs">comment</span>
               Observaciones
            </h3>
            <p class="text-sm text-amber-900 font-medium leading-relaxed italic">"{{ order().observations }}"</p>
          </div>
        }
      </div>

      <!-- Botones de Accion segun estado -->
      <div class="flex justify-end gap-3 pt-6 px-2 border-t border-gray-100 mt-4">
        <!-- Boton Cancelar (Solo en Borrador o Enviado) -->
        @if (['DRAFT', 'SENT'].includes(order().status)) {
          <ui-button
            variant="outline"
            (clicked)="updateStatus('CANCELLED')"
            class="!h-12 !px-8 !rounded-full !font-bold !text-red-400 hover:!bg-red-50 transition-colors"
          >
            Anular Orden
          </ui-button>
        }

        <!-- Botones de Transicion de Estado -->
        @if (order().status === 'DRAFT') {
          <ui-button
            variant="primary"
            (clicked)="updateStatus('SENT')"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 !text-white shadow-xl shadow-indigo-100"
          >
            Enviar a Proveedor
          </ui-button>
        } @else if (order().status === 'SENT') {
          <ui-button
            variant="primary"
            (clicked)="updateStatus('IN_TRANSIT')"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-amber-500 !text-white shadow-xl shadow-amber-100"
          >
            Marcar en Tránsito
          </ui-button>
        } @else if (order().status === 'IN_TRANSIT') {
          @if (!showReceiptUpload()) {
            <ui-button
              variant="primary"
              (clicked)="showReceiptUpload.set(true)"
              class="!h-12 !px-8 !rounded-full !font-bold !bg-emerald-600 !text-white shadow-xl shadow-emerald-100"
            >
              Completar Orden
            </ui-button>
          } @else {
            <ui-button
              variant="primary"
              [disabled]="!selectedFile()"
              (clicked)="completeOrderWithReceipt()"
              class="!h-12 !px-8 !rounded-full !font-bold !bg-emerald-700 !text-white shadow-xl shadow-emerald-100"
            >
              Confirmar Entrega y Pago
            </ui-button>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
  `]
})
export class PurchaseOrderDetailDialogOrganism implements OnInit {
  private dialogRef = inject(MatDialogRef<PurchaseOrderDetailDialogOrganism, boolean>);
  private dialogData = inject<{ order: PurchaseOrder }>(MAT_DIALOG_DATA);

  private purchaseOrderService = inject(PurchaseOrderService);

  order = signal<PurchaseOrder>({} as PurchaseOrder);
  showReceiptUpload = signal(false);
  selectedFile = signal<File | null>(null);

  grandTotal = computed(() => {
    return this.order().items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  });

  statusLabels: Record<PurchaseOrderStatus, string> = {
    DRAFT: 'Borrador',
    SENT: 'Enviado al Proveedor',
    IN_TRANSIT: 'En Tránsito / Despachado',
    CANCELLED: 'Orden Anulada',
    COMPLETED: 'Completada / Recibida'
  };

  statusThemes: Record<PurchaseOrderStatus, any> = {
    DRAFT: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'edit_note' },
    SENT: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'send' },
    IN_TRANSIT: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'local_shipping' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'cancel' },
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'check_circle' }
  };

  ngOnInit() {
    this.order.set(this.dialogData.order);
  }

  onClose() {
    this.dialogRef.close(false);
  }

  updateStatus(status: PurchaseOrderStatus) {
    this.purchaseOrderService.updateStatus(this.order().id, status).subscribe((updated: PurchaseOrder) => {
      this.order.set(updated);
      if (status === 'CANCELLED' || status === 'COMPLETED') {
        this.dialogRef.close(true);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  completeOrderWithReceipt() {
    const mockReceiptUrl = 'https://erp-storage.com/receipts/mock-receipt.pdf';
    
    this.purchaseOrderService.updateStatus(this.order().id, 'COMPLETED', mockReceiptUrl).subscribe((updated: PurchaseOrder) => {
      this.order.set(updated);
      this.dialogRef.close(true);
    });
  }
}
