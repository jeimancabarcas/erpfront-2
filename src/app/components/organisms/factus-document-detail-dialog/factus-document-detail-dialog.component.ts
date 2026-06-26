import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FinanceDocumentDto } from '../../../models/finance.model';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface FactusDocumentDetailData {
  document: FinanceDocumentDto;
}

@Component({
  selector: 'app-factus-document-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ButtonAtom],
  template: `
    <div class="flex flex-col max-h-[85vh]">
      <!-- Header -->
      <header class="flex justify-between items-start mb-4 px-8 pt-8 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
              {{ document.number || 'Documento Factus' }}
            </h2>
            <p class="text-sm text-gray-500 font-medium">
              {{ document.type === 'bill' ? 'Factura Electrónica' : 'Nota Crédito Electrónica' }}
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="close()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </ui-button>
      </header>

      <!-- Content: display all Factus fields excluding IDs -->
      <div class="flex-1 overflow-y-auto px-8 custom-scrollbar space-y-6">
        <!-- Customer Info -->
        @if (document.customer) {
          <section>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Cliente</h3>
            <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5">
              @if (document.customer.names) {
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Nombre / Razón Social</p>
                  <p class="text-sm font-bold text-gray-900">{{ document.customer.names }}</p>
                </div>
              }
              @if (document.customer.identification) {
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Identificación</p>
                  <p class="text-sm font-bold text-gray-900">{{ document.customer.identification }}</p>
                </div>
              }
              @if (document.customer.email) {
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Email</p>
                  <p class="text-sm font-medium text-gray-700">{{ document.customer.email }}</p>
                </div>
              }
              @if (document.customer.phone) {
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Teléfono</p>
                  <p class="text-sm font-medium text-gray-700">{{ document.customer.phone }}</p>
                </div>
              }
              @if (document.customer.address) {
                <div class="col-span-2">
                  <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Dirección</p>
                  <p class="text-sm font-medium text-gray-700">{{ document.customer.address }}</p>
                </div>
              }
            </div>
          </section>
        }

        <!-- Document Info -->
        <section>
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Documento</h3>
          <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5">
            @if (document.type) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Tipo</p>
                <p class="text-sm font-bold text-gray-900">{{ document.type === 'bill' ? 'Factura' : 'Nota Crédito' }}</p>
              </div>
            }
            @if (document.number) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Número</p>
                <p class="text-sm font-bold text-gray-900">{{ document.number }}</p>
              </div>
            }
            @if (document.total) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Total</p>
                <p class="text-sm font-black text-gray-900">{{ document.total | currency:'USD':'symbol':'1.0-0' }}</p>
              </div>
            }
            @if (document.is_validated !== undefined) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Validado</p>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                      [ngClass]="document.is_validated ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'">
                  {{ document.is_validated ? 'Sí' : 'No' }}
                </span>
              </div>
            }
            @if (document.document) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Tipo Documento</p>
                <p class="text-sm font-medium text-gray-700">{{ document.document.name }} ({{ document.document.code }})</p>
              </div>
            }
            @if (document.operation_type) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Operación</p>
                <p class="text-sm font-medium text-gray-700">{{ document.operation_type.name }}</p>
              </div>
            }
            @if (document.created_at) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Creado</p>
                <p class="text-sm font-medium text-gray-700">{{ formatFactusDate(document.created_at) }}</p>
              </div>
            }
            @if (document.validated_at) {
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Validado el</p>
                <p class="text-sm font-medium text-gray-700">{{ formatFactusDate(document.validated_at) }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Payment Details -->
        @if (document.payment_details && document.payment_details.length > 0) {
          <section>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Detalles de Pago</h3>
            <div class="space-y-3">
              @for (pd of document.payment_details; track pd.reference_code || pd.amount) {
                <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5">
                  @if (pd.payment_form) {
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Forma de Pago</p>
                      <p class="text-sm font-medium text-gray-700">{{ pd.payment_form.name }}</p>
                    </div>
                  }
                  @if (pd.payment_method) {
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Método de Pago</p>
                      <p class="text-sm font-medium text-gray-700">{{ pd.payment_method.name }}</p>
                    </div>
                  }
                  @if (pd.amount) {
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Monto</p>
                      <p class="text-sm font-black text-gray-900">{{ pd.amount | currency:'USD':'symbol':'1.0-0' }}</p>
                    </div>
                  }
                  @if (pd.due_date) {
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Vencimiento</p>
                      <p class="text-sm font-medium text-gray-700">{{ formatFactusDate(pd.due_date) }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </section>
        }

        <!-- Validation Errors -->
        @if (document.errors) {
          <section>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Errores de Validación</h3>
            <div class="bg-red-50 border border-red-100 rounded-2xl p-5">
              @for (key of objectKeys(document.errors); track key) {
                <div class="flex gap-2 py-1">
                  <span class="text-[10px] font-bold text-red-500 uppercase">{{ key }}:</span>
                  <span class="text-sm font-medium text-red-700">{{ document.errors[key] }}</span>
                </div>
              }
            </div>
          </section>
        }

        <!-- Flags -->
        <section>
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Indicadores</h3>
          <div class="flex flex-wrap gap-3">
            @if (document.is_negotiable_instrument) {
              <span class="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600">Título Negociable</span>
            }
            @if (document.has_claim) {
              <span class="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600">Tiene Reclamo</span>
            }
            @if (document.send_email) {
              <span class="px-3 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-600">Email Enviado</span>
            }
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 pt-4 pb-6 px-8 border-t border-gray-100 shrink-0">
        <ui-button variant="primary" (clicked)="close()">
          Cerrar
        </ui-button>
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
export class FactusDocumentDetailDialogOrganism {
  readonly data = inject<FactusDocumentDetailData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FactusDocumentDetailDialogOrganism>);

  // Expose Object.keys for template use
  objectKeys = Object.keys;

  get document(): FinanceDocumentDto {
    return this.data.document;
  }

  /** Parse Factus date format "DD-MM-YYYY HH:MM:SS AM/PM" into a locale string */
  formatFactusDate(raw: string | null | undefined): string {
    if (!raw) return '';
    // Match "26-06-2026 09:18:25 AM" or "26-06-2026 09:18:25 PM"
    const match = raw.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (!match) {
      // Try ISO fallback for other formats
      const d = new Date(raw);
      return isNaN(d.getTime()) ? raw : d.toLocaleString('es-CO');
    }
    const [, day, month, year, hour, min, sec, ampm] = match;
    let h = parseInt(hour, 10);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, parseInt(min, 10), parseInt(sec, 10));
    return isNaN(date.getTime()) ? raw : date.toLocaleString('es-CO');
  }

  close(): void {
    this.dialogRef.close();
  }
}
