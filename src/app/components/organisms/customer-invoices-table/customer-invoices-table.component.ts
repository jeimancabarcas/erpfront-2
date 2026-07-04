import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Invoice } from '../../../models/invoice.model';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../../../services/invoice.service';
import { InvoiceDetailDialogOrganism } from '../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';
import { downloadBase64Pdf } from '../../../utils/pdf-utils';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../shared/constants/dialog.config';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';

@Component({
  selector: 'app-customer-invoices-table-organism',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    ButtonAtom,
    TextInputComponent,
    TableComponent,
    TableCellDirective
  ],
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden flex flex-col">
      <header class="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <mat-icon class="!w-6 !h-6">history</mat-icon>
          </div>
          <div>
            <h3 class="text-xl font-black text-gray-900 dark:text-gray-100 leading-none">Historial de Facturación</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2">Transacciones realizadas</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 flex-1 max-w-md">
          <ui-text-input icon="search" [formControl]="invoiceFilter" placeholder="Filtrar por No. Factura" />
        </div>
      </header>

      @if (loading) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span class="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Consultando registros...</span>
        </div>
      } @else if (invoices.length === 0) {
        <div class="p-20 text-center space-y-4">
          <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-gray-600">
            <mat-icon class="!w-8 !h-8">receipt_long</mat-icon>
          </div>
          <p class="text-gray-400 dark:text-gray-500 font-bold tracking-tight">No se encontraron facturas para este cliente</p>
        </div>
      } @else {
        <ui-table
          [columns]="tableColumns"
          [data]="invoices"
          [loading]="false"
          emptyMessage="No se encontraron facturas para este cliente"
          emptyIcon="receipt_long"
        >
          <ng-template uiTableCell="invoiceNumber" let-inv>
            <span class="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-xs border border-indigo-100/50 dark:border-indigo-800/50">
              {{ inv.invoiceNumber }}
            </span>
          </ng-template>

          <ng-template uiTableCell="date" let-inv>
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {{ inv.date | date:'dd MMM, yyyy' }}
            </span>
          </ng-template>

          <ng-template uiTableCell="amount" let-inv>
            <span class="font-black text-gray-900 dark:text-gray-100">
              {{ (inv.netTotal ?? inv.totalAmount) | currency }}
            </span>
          </ng-template>

          <ng-template uiTableCell="actions" let-inv>
            <div class="flex justify-center gap-2">
              <ui-button 
                variant="icon"
                size="sm"
                [tooltip]="inv.emission ? 'Descargar PDF DIAN' : 'Ver PDF Historial'"
                (clicked)="downloadInvoicePdf(inv)"
              >
                <mat-icon class="!text-red-600">picture_as_pdf</mat-icon>
              </ui-button>
              <ui-button 
                variant="icon"
                size="sm"
                tooltip="Ver detalle completo"
                (clicked)="viewInvoiceDetail(inv)"
              >
                <mat-icon class="!text-indigo-600">visibility</mat-icon>
              </ui-button>
            </div>
          </ng-template>
        </ui-table>

        <mat-paginator 
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex - 1"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="pageChanged.emit($event)"
          class="!bg-transparent !border-t !border-gray-50 dark:!border-gray-800"
        ></mat-paginator>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class CustomerInvoicesTableOrganism {
  @Input({ required: true }) invoices: Invoice[] = [];
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 1;
  @Input() loading: boolean = false;

  @Output() filterChanged = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<PageEvent>();

  private dialog = inject(MatDialog);
  private invoiceService = inject(InvoiceService);
  
  invoiceFilter = new FormControl('');
  protected readonly tableColumns: TableColumn[] = [
    { key: 'invoiceNumber', header: 'No. Factura' },
    { key: 'date', header: 'Fecha' },
    { key: 'amount', header: 'Monto Neto', align: 'right' },
    { key: 'actions', header: 'Acciones', align: 'center', width: '140px' },
  ];

  constructor() {
    this.invoiceFilter.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterChanged.emit(value || '');
    });
  }

  viewInvoiceDetail(invoice: Invoice) {
    this.dialog.open(InvoiceDetailDialogOrganism, {
      data: { invoiceId: invoice.id },
      panelClass: DIALOG_PANEL_CLASS,
      width: DIALOG_WIDTHS.xl
    });
  }

  downloadInvoicePdf(invoice: Invoice) {
    const request$ = invoice.emission
      ? this.invoiceService.getInvoiceDianPdf(invoice.id)
      : this.invoiceService.getInvoicePdf(invoice.id);

    request$.subscribe({
      next: (res) => {
        downloadBase64Pdf(res.pdfBase64Encoded, res.fileName);
      },
      error: (err) => {
        console.error('Error fetching PDF:', err);
        alert('Error al descargar el PDF.');
      }
    });
  }
}
