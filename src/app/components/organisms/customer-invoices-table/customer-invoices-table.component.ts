import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Invoice } from '../../../models/invoice.model';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../../../services/invoice.service';
import { InvoiceDetailDialogOrganism } from '../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';

@Component({
  selector: 'app-customer-invoices-table-organism',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <header class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <mat-icon class="!w-6 !h-6">history</mat-icon>
          </div>
          <div>
            <h3 class="text-xl font-black text-gray-900 leading-none">Historial de Facturación</h3>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Transacciones realizadas</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 flex-1 max-w-md">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Filtrar por No. Factura</mat-label>
            <input matInput [formControl]="invoiceFilter" placeholder="Ej: FAC-0001">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>
        </div>
      </header>

      @if (loading) {
        <div class="p-20 flex flex-col items-center justify-center space-y-4">
          <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Consultando registros...</span>
        </div>
      } @else if (invoices.length === 0) {
        <div class="p-20 text-center space-y-4">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <mat-icon class="!w-8 !h-8">receipt_long</mat-icon>
          </div>
          <p class="text-gray-400 font-bold tracking-tight">No se encontraron facturas para este cliente</p>
        </div>
      } @else {
        <div class="overflow-x-auto flex-grow">
          <table mat-table [dataSource]="invoices" class="w-full">
            <!-- No. Factura Column -->
            <ng-container matColumnDef="invoiceNumber">
              <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50">No. Factura</th>
              <td mat-cell *matCellDef="let inv" class="px-8 !py-6">
                <span class="font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg text-xs border border-indigo-100/50">
                  {{ inv.invoiceNumber }}
                </span>
              </td>
            </ng-container>

            <!-- Fecha Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50">Fecha</th>
              <td mat-cell *matCellDef="let inv" class="px-8 !py-6 text-sm text-gray-600 font-medium">
                {{ inv.date | date:'dd MMM, yyyy' }}
              </td>
            </ng-container>

            <!-- Monto Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50 text-right">Monto</th>
              <td mat-cell *matCellDef="let inv" class="px-8 !py-6 text-right font-black text-gray-900">
                {{ inv.totalAmount | currency }}
              </td>
            </ng-container>

            <!-- Acciones Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50 text-center">Acciones</th>
              <td mat-cell *matCellDef="let inv" class="px-8 !py-6 text-center">
                <div class="flex justify-center gap-2">
                  <button 
                    mat-icon-button 
                    (click)="downloadInvoicePdf(inv)" 
                    matTooltip="Ver PDF Oficial"
                    class="!text-red-600 hover:!bg-red-50 transition-all"
                  >
                    <mat-icon>picture_as_pdf</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    (click)="viewInvoiceDetail(inv)" 
                    matTooltip="Ver detalle completo"
                    class="!text-indigo-600 hover:!bg-indigo-50 transition-all"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors"></tr>
          </table>
        </div>

        <mat-paginator 
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex - 1"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="pageChanged.emit($event)"
          class="!bg-transparent !border-t !border-gray-50"
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
  displayedColumns = ['invoiceNumber', 'date', 'amount', 'actions'];

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
      width: '100%',
      maxWidth: '950px',
      panelClass: 'premium-dialog'
    });
  }

  downloadInvoicePdf(invoice: Invoice) {
    this.invoiceService.getInvoicePdf(invoice.id).subscribe({
      next: (res) => {
        try {
          const byteCharacters = atob(res.pdfBase64Encoded);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } catch (e) {
          console.error('Error decoding PDF:', e);
        }
      },
      error: (err) => console.error('Error fetching PDF:', err)
    });
  }
}
