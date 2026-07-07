import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import type { PurchaseOrder } from '../../../models/purchase-order.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { ConfirmDialogMolecule } from '../../molecules/confirm-dialog/confirm-dialog.component';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';

export interface PurchaseOrderDetailModalData {
  order: PurchaseOrder;
}

export interface TraceEvent {
  type: 'Creación' | 'Documento Soporte' | 'Nota de Ajuste' | 'Completada' | 'Cancelación';
  number: string;
  date: string;
  concept: string;
  amount: number;
  cude?: string | null;
}

@Component({
  selector: 'app-purchase-order-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ButtonAtom, ConfirmDialogMolecule, TableComponent, TableCellDirective],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] bg-white dark:bg-gray-900">
      @if (loading()) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs">Cargando Orden...</p>
        </div>
      } @else if (error()) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <span class="material-icons !text-[32px]">error_outline</span>
          </div>
          <p class="text-gray-900 dark:text-gray-100 font-black text-lg">{{ error() }}</p>
          <button (click)="close(false)" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-4">Cerrar</button>
        </div>
      } @else if (order(); as ord) {
        <!-- Header -->
        <div
          class="flex items-start justify-between p-8 pb-4 border-b border-gray-100 dark:border-gray-700"
        >
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="font-black text-2xl text-gray-900 dark:text-gray-100 tracking-tight">
                {{ ord.orderNumber }}
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
              {{ ord.orderDate | date: 'dd MMM, yyyy' }}
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
              {{ ord.supplier?.name }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
              NIT: {{ ord.supplier?.nit }}
            </p>
            @if (ord.supplier?.address) {
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ ord.supplier.address }}
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
                  @for (item of ord.items; track item.productId) {
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
          @if (ord.observations) {
            <section
              class="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700"
            >
              <h3
                class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
              >
                Observaciones
              </h3>
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                {{ ord.observations }}
              </p>
            </section>
          }

          <!-- Trazabilidad de la Orden -->
          @if (traceEvents().length > 0) {
            <div class="space-y-4">
              <label class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest ml-1">Trazabilidad de la Orden</label>
              <div class="border border-gray-100 dark:border-gray-700 rounded-[28px] overflow-hidden shadow-sm bg-white dark:bg-gray-900">
                <ui-table [columns]="traceColumns" [data]="traceEvents()">
                  <ng-template uiTableCell="type" let-event>
                    <div class="flex items-center gap-2">
                      <span [className]="event.type === 'Creación'
                        ? 'w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0'
                        : event.type === 'Documento Soporte'
                        ? 'w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0'
                        : event.type === 'Nota de Ajuste'
                        ? 'w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0'
                        : event.type === 'Completada'
                        ? 'w-8 h-8 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shrink-0'
                        : 'w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0'">
                        <span class="material-icons scale-75">
                          {{ event.type === 'Creación' ? 'receipt' : event.type === 'Documento Soporte' ? 'description' : event.type === 'Nota de Ajuste' ? 'assignment_returned' : event.type === 'Completada' ? 'check_circle' : 'cancel' }}
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
                    <span class="text-xs font-black text-gray-900 dark:text-gray-100">{{ event.amount | currency }}</span>
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
        </div>

        <!-- Actions Footer -->
        <div class="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          @switch (ord.status) {
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
              @if (!supportDocument()) {
                <ui-button
                  variant="primary"
                  [disabled]="actionInProgress() === 'emit'"
                  (clicked)="emitSupportDocument()"
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
              }
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
              @if (supportDocument() && !adjustmentNote()) {
                <ui-button
                  variant="primary"
                  [disabled]="actionInProgress() === 'emitAdjustment'"
                  (clicked)="emitAdjustmentNote()"
                >
                  @if (actionInProgress() === 'emitAdjustment') {
                    <span class="flex items-center gap-2">
                      <span class="material-icons animate-spin">refresh</span>
                      Emitiendo nota...
                    </span>
                  } @else {
                    Emitir nota de ajuste
                  }
                </ui-button>
              }
              @if (adjustmentNote()) {
                <ui-button
                  variant="secondary"
                  [disabled]="actionInProgress() === 'downloadAdjustmentPdf'"
                  (clicked)="downloadAdjustmentNotePdf()"
                >
                  @if (actionInProgress() === 'downloadAdjustmentPdf') {
                    <span class="flex items-center gap-2">
                      <span class="material-icons animate-spin">refresh</span>
                      Descargando...
                    </span>
                  } @else {
                    <span class="flex items-center gap-2">
                      <span class="material-icons">download</span>
                      Descargar PDF Ajuste
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
          @if (ord.status !== 'CANCELLED') {
            <ui-button variant="ghost" [disabled]="true" title="Próximamente">
              <span class="flex items-center gap-2 opacity-50">
                <span class="material-icons">mail</span>
                Enviar al proveedor
              </span>
            </ui-button>
          }
        </div>
      }
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
                order()?.supplier?.name
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
export class PurchaseOrderDetailModalComponent implements OnInit {
  order = signal<PurchaseOrder | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  private dialogRef = inject(MatDialogRef<PurchaseOrderDetailModalComponent, boolean>);
  private purchaseOrderService = inject(PurchaseOrderService);

  // State
  actionInProgress = signal<
    'complete' | 'cancel' | 'emit' | 'download' | 'emitAdjustment' | 'downloadAdjustmentPdf' | null
  >(null);
  showCancelConfirm = signal(false);
  showCompleteDialog = signal(false);
  selectedFile = signal<File | undefined>(undefined);

  constructor() {
    const data = inject<PurchaseOrderDetailModalData>(MAT_DIALOG_DATA);
    if (data?.order) {
      this.order.set(data.order);
    }
  }

  ngOnInit() {
    const currentOrder = this.order();
    if (currentOrder?.id) {
      this.purchaseOrderService.getOrderById(currentOrder.id).subscribe({
        next: (freshOrder) => {
          this.order.set(freshOrder);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Error al cargar la orden');
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  supportDocument = computed(() => {
    const ord = this.order();
    if (ord?.supportDocuments && ord.supportDocuments.length > 0) {
      return ord.supportDocuments[0];
    }
    return null;
  });

  adjustmentNote = computed(() => {
    const ord = this.order();
    if (ord?.adjustmentNotes && ord.adjustmentNotes.length > 0) {
      return ord.adjustmentNotes[0];
    }
    return null;
  });

  totalAmount = computed(() => {
    const ord = this.order();
    if (!ord?.items) return 0;
    return ord.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  });

  statusBadgeClass = computed(() => {
    const ord = this.order();
    if (!ord) return 'bg-gray-50 text-gray-600';
    switch (ord.status) {
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
    const ord = this.order();
    if (!ord) return '';
    switch (ord.status) {
      case 'CREATED':
        return 'Creada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return ord.status;
    }
  });

  cancelMessage = computed(() => {
    const ord = this.order();
    if (!ord) return '';
    if (ord.status === 'COMPLETED') {
      return `¿Estás seguro de cancelar la orden ${ord.orderNumber}? Los productos serán removidos del inventario.`;
    }
    return `¿Estás seguro de cancelar la orden ${ord.orderNumber}?`;
  });

  protected readonly traceColumns: TableColumn[] = [
    { key: 'type', header: 'Tipo' },
    { key: 'number', header: 'Número' },
    { key: 'date', header: 'Fecha' },
    { key: 'concept', header: 'Concepto' },
    { key: 'amount', header: 'Monto', align: 'right' },
    { key: 'cude', header: '', width: '60px' },
  ];

  traceEvents = computed<TraceEvent[]>(() => {
    const ord = this.order();
    if (!ord) return [];
    const events: TraceEvent[] = [];

    // 1. Creación — always present
    events.push({
      type: 'Creación',
      number: ord.orderNumber,
      date: ord.createdAt || ord.orderDate,
      concept: 'Orden de compra creada',
      amount: ord.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0,
    });

    // 2. Documento Soporte events
    if (ord.supportDocuments) {
      for (const doc of ord.supportDocuments) {
        events.push({
          type: 'Documento Soporte',
          number: doc.number || doc.referenceCode,
          date: doc.createdAt || ord.updatedAt || ord.createdAt || '',
          concept: 'Documento soporte electrónico',
          amount: 0,
          cude: doc.cude,
        });
      }
    }

    // 3. Nota de Ajuste events
    if (ord.adjustmentNotes) {
      for (const note of ord.adjustmentNotes) {
        events.push({
          type: 'Nota de Ajuste',
          number: note.noteNumber || note.referenceCode,
          date: note.createdAt || ord.updatedAt || ord.createdAt || '',
          concept: 'Nota de ajuste (anulación)',
          amount: Number(note.amount) || 0,
          cude: note.cude,
        });
      }
    }

    // 4. Completada — inferred from COMPLETED status
    if (ord.status === 'COMPLETED') {
      events.push({
        type: 'Completada',
        number: ord.orderNumber,
        date: ord.updatedAt || ord.createdAt || ord.orderDate,
        concept: 'Orden completada',
        amount: 0,
      });
    }

    // 5. Cancelación — inferred from CANCELLED status
    if (ord.status === 'CANCELLED') {
      events.push({
        type: 'Cancelación',
        number: ord.orderNumber,
        date: ord.updatedAt || ord.createdAt || ord.orderDate,
        concept: 'Orden cancelada',
        amount: 0,
      });
    }

    // Sort chronologically
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return events;
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
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.actionInProgress.set('complete');
    this.error.set(null);

    this.purchaseOrderService.completeOrder(currentOrder.id, this.selectedFile()).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
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
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.actionInProgress.set('cancel');
    this.error.set(null);
    this.showCancelConfirm.set(false);

    this.purchaseOrderService.cancelOrder(currentOrder.id).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
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
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.actionInProgress.set('emit');
    this.error.set(null);

    this.purchaseOrderService.emitSupportDocument(currentOrder.id).subscribe({
      next: (doc) => {
        this.actionInProgress.set(null);
        this.order.update((prev) =>
          prev ? { ...prev, supportDocuments: [doc] } : prev,
        );
      },
      error: (err) => {
        this.actionInProgress.set(null);
        this.error.set(err.error?.message || 'Error al emitir documento soporte.');
      },
    });
  }

  downloadPdf() {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.actionInProgress.set('download');
    this.error.set(null);

    this.purchaseOrderService.downloadSupportDocumentPdf(currentOrder.id).subscribe({
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

  emitAdjustmentNote() {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.actionInProgress.set('emitAdjustment');
    this.error.set(null);

    this.purchaseOrderService
      .emitAdjustmentNote(currentOrder.id, {
        correctionConceptCode: '2',
        observation: `Anulación total de ${currentOrder.orderNumber}`,
      })
      .subscribe({
        next: (note) => {
          this.actionInProgress.set(null);
          this.order.update((prev) =>
            prev
              ? { ...prev, status: 'CANCELLED' as const, adjustmentNotes: [note] }
              : prev,
          );
        },
        error: (err) => {
          this.actionInProgress.set(null);
          this.error.set(err.error?.message || 'Error al emitir nota de ajuste.');
        },
      });
  }

  downloadAdjustmentNotePdf() {
    const currentOrder = this.order();
    if (!currentOrder) return;

    const note = this.adjustmentNote();
    if (!note) return;

    this.actionInProgress.set('downloadAdjustmentPdf');
    this.error.set(null);

    this.purchaseOrderService.downloadAdjustmentNotePdf(currentOrder.id, note.id).subscribe({
      next: (result) => {
        this.actionInProgress.set(null);
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
        link.download = result.fileName || 'nota-ajuste.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.actionInProgress.set(null);
        this.error.set(err.error?.message || 'Error al descargar PDF de la nota de ajuste.');
      },
    });
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
