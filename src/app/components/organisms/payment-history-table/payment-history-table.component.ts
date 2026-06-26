import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaymentRecord } from '../../../models/customer.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';

@Component({
  selector: 'app-payment-history-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatPaginatorModule,
    ButtonAtom,
    TableComponent,
    TableCellDirective,
  ],
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <span class="material-icons !text-[18px]">history</span>
          </div>
          <div>
            <h3 class="font-black text-gray-900 dark:text-gray-100 text-sm">Historial de Pagos</h3>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Abonos registrados</p>
          </div>
        </div>
      </div>

      @if (payments().length === 0) {
        <div class="p-10 flex flex-col items-center text-center space-y-2">
          <div class="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <span class="material-icons text-gray-300 dark:text-gray-600">receipt_long</span>
          </div>
          <p class="text-sm font-bold text-gray-400 dark:text-gray-500">Sin pagos registrados</p>
          <p class="text-xs text-gray-300 dark:text-gray-600">No hay abonos registrados para este cliente.</p>
        </div>
      } @else {
        <ui-table
          [columns]="tableColumns"
          [data]="payments()"
          [loading]="false"
          emptyMessage="No se encontraron pagos registrados"
          emptyIcon="receipt_long"
        >
          <ng-template uiTableCell="date" let-payment>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
              {{ payment.paymentDate | date:'dd MMM, yyyy' }}
            </span>
          </ng-template>

          <ng-template uiTableCell="invoiceNumber" let-payment>
            <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-800/50">
              {{ payment.invoiceNumber || (payment.invoiceId | slice:0:8) }}
            </span>
          </ng-template>

          <ng-template uiTableCell="amount" let-payment>
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400">{{ payment.amount | currency }}</span>
          </ng-template>

          <ng-template uiTableCell="notes" let-payment>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ payment.notes || '-' }}</span>
          </ng-template>
        </ui-table>

        <!-- Paginator -->
        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="onPageChange($event)"
          class="!bg-transparent !border-t !border-gray-50 dark:!border-gray-800"
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

  protected readonly tableColumns: TableColumn[] = [
    { key: 'date', header: 'Fecha' },
    { key: 'invoiceNumber', header: 'No. Factura' },
    { key: 'amount', header: 'Monto', align: 'right' },
    { key: 'notes', header: 'Notas' },
  ];

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
