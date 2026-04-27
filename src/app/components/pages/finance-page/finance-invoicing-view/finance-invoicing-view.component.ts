import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FinanceService } from '../../../../services/finance.service';
import { GeneralInvoiceTableOrganism } from '../../../organisms/general-invoice-table/general-invoice-table.component';
import { GeneralInvoiceFormDialogOrganism } from '../../../organisms/general-invoice-form-dialog/general-invoice-form-dialog.component';
import { AdjustmentFormDialogOrganism } from '../../../organisms/adjustment-form-dialog/adjustment-form-dialog.component';
import { InvoiceDetailDialogOrganism } from '../../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';
import { FinanceInvoice } from '../../../../models/finance.model';

@Component({
  selector: 'app-finance-invoicing-view',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    GeneralInvoiceTableOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Facturación Electrónica</h1>
          <p class="text-gray-500 font-medium">Gestión de facturas de venta para servicios generales.</p>
        </div>
        <div class="flex gap-3">
          <button 
            mat-stroked-button 
            class="!rounded-full !h-12 !px-6 !font-bold !border-gray-200 hover:!bg-gray-50"
          >
            <mat-icon class="mr-2">cloud_upload</mat-icon>
            Importar DIAN
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            (click)="openNewInvoice()"
            class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
          >
            <mat-icon class="mr-2">add</mat-icon>
            Nueva Factura
          </button>
        </div>
      </header>

      <!-- Filter Bar -->
      <div class="flex gap-4 mb-8">
        <mat-form-field appearance="outline" class="flex-1 !m-0">
          <mat-label>Buscar por cliente o factura...</mat-label>
          <input matInput placeholder="Ej: Limpiezas S.A.">
          <mat-icon matPrefix class="mr-2 text-gray-400">search</mat-icon>
        </mat-form-field>
        <button mat-stroked-button class="!rounded-2xl !h-[56px] !px-6 !border-gray-200 hover:!bg-gray-50 font-bold">
          <mat-icon class="mr-2 text-gray-400">filter_list</mat-icon>
          Filtros Avanzados
        </button>
      </div>

      <app-general-invoice-table 
        [invoices]="financeService.invoices()"
        (onAction)="handleAction($event)"
      />
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class FinanceInvoicingViewComponent {
  private dialog = inject(MatDialog);
  public financeService = inject(FinanceService);

  openNewInvoice() {
    this.dialog.open(GeneralInvoiceFormDialogOrganism, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
  }

  handleAction(event: { invoice: FinanceInvoice, action: string }) {
    if (event.action === 'adjustment') {
      this.dialog.open(AdjustmentFormDialogOrganism, {
        width: '450px',
        maxWidth: '95vw',
        data: { invoice: event.invoice }
      });
    } else if (event.action === 'view') {
      this.dialog.open(InvoiceDetailDialogOrganism, {
        width: '600px',
        maxWidth: '95vw',
        data: { invoice: event.invoice }
      });
    }
  }
}
