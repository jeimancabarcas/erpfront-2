import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaymentRecord } from '../../../models/customer.model';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-payment-history-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatPaginatorModule,
    ButtonAtom,
  ],
  template: `
    <div class="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <span class="material-icons !text-[18px]">history</span>
          </div>
          <div>
            <h3 class="font-black text-gray-900 text-sm">Historial de Pagos</h3>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Abonos registrados</p>
          </div>
        </div>
      </div>

      @if (payments().length === 0) {
        <div class="p-10 flex flex-col items-center text-center space-y-2">
          <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-gray-300">receipt_long</span>
          </div>
          <p class="text-sm font-bold text-gray-400">Sin pagos registrados</p>
          <p class="text-xs text-gray-300">No hay abonos registrados para este cliente.</p>
        </div>
      } @else {
        <!-- Table -->
        <div class="overflow-x-auto flex-grow">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Fecha</th>
                <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">No. Factura</th>
                <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Notas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (payment of payments(); track payment.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-5 py-4">
                    <span class="text-xs font-medium text-gray-600">{{ payment.paymentDate | date:'dd MMM, yyyy' }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-xs font-black text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                      {{ payment.invoiceNumber || (payment.invoiceId | slice:0:8) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <span class="text-xs font-black text-emerald-600">{{ payment.amount | currency }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="text-xs text-gray-400">{{ payment.notes || '-' }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginator -->
        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="onPageChange($event)"
          class="!bg-transparent !border-t !border-gray-50"
        ></mat-paginator>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PaymentHistoryTableOrganism {
  readonly payments = input<PaymentRecord[]>([]);
  readonly totalCount = input(0);
  readonly pageSize = input(5);
  readonly pageIndex = input(0);
  readonly pageChange = output<PageEvent>();

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
