import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ButtonAtom } from '../../../atoms/button/button.component';
import { TextInputComponent } from '../../../atoms/text-input/text-input.component';
import { FinanceService } from '../../../../services/finance.service';
import { GeneralInvoiceTableOrganism } from '../../../organisms/general-invoice-table/general-invoice-table.component';
import { ElectronicBillFormDialogOrganism } from '../../../organisms/electronic-bill-form-dialog/electronic-bill-form-dialog.component';
import { FactusDocumentDetailDialogOrganism } from '../../../organisms/factus-document-detail-dialog/factus-document-detail-dialog.component';
import { SalesNoteFormDialogOrganism } from '../../../organisms/sales-note-form-dialog/sales-note-form-dialog.component';
import { InvoiceService } from '../../../../services/invoice.service';
import { FinanceInvoice } from '../../../../models/finance.model';
import { Invoice } from '../../../../models/invoice.model';
import { DIALOG_DEFAULTS, DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-finance-invoicing-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom,
    TextInputComponent,
    GeneralInvoiceTableOrganism,
    MatPaginatorModule,
  ],
  template: `
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Facturación Electrónica</h1>
          <p class="text-gray-500 font-medium">Documentos electrónicos registrados en Factus — facturas y notas crédito.</p>
        </div>
        <div class="flex gap-3">
          <ui-button variant="primary" (clicked)="openNewElectronicBill()">
            <span class="material-icons mr-2">add_circle</span>
            Nueva Factura Electrónica
          </ui-button>
          <ui-button variant="outline" (clicked)="loadFactusDocuments()">
            <span class="material-icons mr-2">refresh</span>
            Actualizar
          </ui-button>
        </div>
      </header>

      <!-- Filter Bar -->
      <div class="flex flex-wrap items-end gap-4 mb-8">
        <div class="flex-1 min-w-[200px]">
          <ui-text-input
            label="Identificación"
            [(ngModel)]="filterIdentification"
            (keyup.enter)="searchDocuments()"
            placeholder="NIT / CC..."
          />
        </div>
        <div class="flex-1 min-w-[200px]">
          <ui-text-input
            label="Nombre / Razón Social"
            [(ngModel)]="filterNames"
            (keyup.enter)="searchDocuments()"
            placeholder="Nombre del cliente..."
          />
        </div>
        <div class="flex-1 min-w-[200px]">
          <ui-text-input
            label="Nº Documento"
            [(ngModel)]="filterNumber"
            (keyup.enter)="searchDocuments()"
            placeholder="Número de factura..."
          />
        </div>
        <ui-button variant="outline" (clicked)="searchDocuments()">
          <span class="material-icons mr-2">search</span>
          Buscar
        </ui-button>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex items-center justify-center p-20">
          <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-sm font-medium text-gray-400">Cargando documentos desde Factus...</p>
          </div>
        </div>
      } @else {
        <!-- Error state -->
        @if (error(); as err) {
          <div class="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <span class="material-icons text-red-500 mt-0.5">error_outline</span>
            <div>
              <h4 class="text-sm font-black text-red-800 mb-1">Error al cargar documentos</h4>
              <p class="text-xs font-medium text-red-600">{{ err }}</p>
              <button class="mt-3 text-xs font-bold text-red-700 underline hover:no-underline" (click)="loadFactusDocuments()">
                Reintentar
              </button>
            </div>
          </div>
        }

        <!-- Type Toggle -->
        <div class="flex gap-2 mb-4">
          <ui-button [variant]="factusType() === 'bill' ? 'primary' : 'outline'" (clicked)="switchFactusType('bill')">
            Facturas
          </ui-button>
          <ui-button [variant]="factusType() === 'credit-note' ? 'primary' : 'outline'" (clicked)="switchFactusType('credit-note')">
            Notas Crédito
          </ui-button>
        </div>

        <!-- Factus Documents Table -->
        <div class="mb-4">
          <h3 class="text-lg font-black text-gray-800 mb-4">Documentos Factus</h3>
          <app-general-invoice-table
            [invoices]="financeService.factusTableData()"
            [showAdjustmentAction]="factusType() === 'bill'"
            (onAction)="handleAction($event)"
          />
        </div>

        <!-- Paginator -->
        @if (factusTotal() > 0) {
          <mat-paginator
            [length]="factusTotal()"
            [pageSize]="factusPerPage()"
            [pageIndex]="factusPage() - 1"
            [pageSizeOptions]="[5, 10, 20, 50]"
            (page)="onFactusPageChange($event)"
            showFirstLastButtons
            aria-label="Paginar documentos Factus">
          </mat-paginator>
        }
      }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceInvoicingViewComponent implements OnInit {
  public financeService = inject(FinanceService);
  private invoiceService = inject(InvoiceService);
  private dialog = inject(MatDialog);

  filterIdentification = '';
  filterNames = '';
  filterNumber = '';
  loading = this.financeService.loading;
  error = this.financeService.error;

  factusPage = signal(1);
  factusPerPage = signal(10);
  factusTotal = this.financeService.factusTotal;
  factusType = signal<'bill' | 'credit-note'>('bill');
  /** Active search filters — preserved across pagination navigation */
  private activeFilters = signal<Record<string, string | number> | null>(null);

  ngOnInit(): void {
    this.loadFactusDocuments();
  }

  /** Build params merging pagination + active filters */
  private buildLoadParams(): Record<string, string | number> {
    return {
      page: this.factusPage(),
      perPage: this.factusPerPage(),
      ...(this.activeFilters() ?? {}),
    };
  }

  loadFactusDocuments(): void {
    const params = this.buildLoadParams();
    if (this.factusType() === 'bill') {
      this.financeService.loadBills(params);
    } else {
      this.financeService.loadCreditNotes(params);
    }
  }

  searchDocuments(): void {
    // Build filter params from individual inputs
    const filters: Record<string, string> = {};
    const id = this.filterIdentification.trim();
    const names = this.filterNames.trim();
    const number = this.filterNumber.trim();
    if (id) filters['identification'] = id;
    if (names) filters['names'] = names;
    if (number) filters['number'] = number;

    // Store filters so pagination preserves them; reset to page 1
    this.activeFilters.set(Object.keys(filters).length > 0 ? filters : null);
    this.factusPage.set(1);
    this.loadFactusDocuments();
  }

  switchFactusType(type: 'bill' | 'credit-note'): void {
    this.factusType.set(type);
    this.factusPage.set(1);
    this.loadFactusDocuments();
  }

  onFactusPageChange(event: PageEvent): void {
    this.factusPage.set(event.pageIndex + 1);
    this.factusPerPage.set(event.pageSize);
    this.loadFactusDocuments(); // activeFilters are automatically included via buildLoadParams()
  }

  openNewElectronicBill(): void {
    const dialogRef = this.dialog.open(ElectronicBillFormDialogOrganism, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'electronic-bill-dialog-panel',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadFactusDocuments();
      }
    });
  }

  handleAction(event: { invoice: FinanceInvoice; action: string }) {
    if (event.action === 'view') {
      const factusDoc = event.invoice.raw;
      if (factusDoc) {
        // setTimeout avoids ExpressionChangedAfterItHasBeenCheckedError from mat-icon's font host binding
        setTimeout(() => {
          this.dialog.open(FactusDocumentDetailDialogOrganism, {
            width: DIALOG_WIDTHS.lg,
            panelClass: DIALOG_PANEL_CLASS,
            ...DIALOG_DEFAULTS,
            data: { document: factusDoc },
          });
        });
      }
    } else if (event.action === 'adjustment') {
      // Look up the local invoice behind this Factus document, then open the credit-note dialog
      const documentNumber = event.invoice.id; // Factus document number (e.g. "SETP990000123")
      const factusRaw = event.invoice.raw; // Raw Factus data for synthetic invoice fallback
      this.financeService.lookupLocalInvoiceId(documentNumber).subscribe({
        next: (result) => {
          if (result?.invoiceId) {
            // Has local invoice — open with full options, Factus path
            this.invoiceService.getInvoiceById(result.invoiceId).subscribe({
              next: (invoice) => {
                this.openAdjustmentDialog(invoice, {
                  useFactusCreditNote: true,
                  forceElectronic: true,
                  billNumber: documentNumber,
                });
              },
              error: () => {
                this.financeService.error.set('No se pudo cargar la factura local asociada.');
              },
            });
          } else {
            // No local invoice — build synthetic invoice from Factus data, Factus path
            const syntheticInvoice = this.buildSyntheticInvoice(event.invoice);
            this.openAdjustmentDialog(syntheticInvoice, {
              useFactusCreditNote: true,
              forceElectronic: true,
              forceCorrectionCode: '2',
              billNumber: documentNumber,
            });
          }
        },
        error: () => {
          this.financeService.error.set('Error al buscar la factura local asociada.');
        },
      });
    }
  }

  /** Open the credit-note dialog with optional flags */
  private openAdjustmentDialog(
    invoice: Invoice,
    opts: {
      forceElectronic?: boolean;
      forceCorrectionCode?: string;
      useFactusCreditNote?: boolean;
      billNumber?: string;
    },
  ): void {
    setTimeout(() => {
      this.dialog.open(SalesNoteFormDialogOrganism, {
        width: DIALOG_WIDTHS.xl,
        panelClass: DIALOG_PANEL_CLASS,
        ...DIALOG_DEFAULTS,
        data: { invoice, ...opts },
      });
    });
  }

  /** Build a minimal Invoice from FinanceInvoice + raw Factus data for credit-note creation */
  private buildSyntheticInvoice(fi: FinanceInvoice): Invoice {
    const raw = fi.raw;
    return {
      id: fi.dbId || fi.id,
      invoiceNumber: fi.id,
      sequentialNumber: 0,
      date: fi.date || new Date().toISOString().split('T')[0],
      customerId: '',
      totalAmount: fi.total,
      status: 'DRAFT',
      isElectronic: true,
      items: [],
      customer: raw?.customer ? {
        id: '',
        name: raw.customer.names || fi.customerName,
        documentType: 'NIT' as const,
        documentNumber: raw.customer.identification || fi.customerTaxId,
        email: raw.customer.email || '',
        phone: raw.customer.phone || '',
        address: raw.customer.address || '',
        status: 'ACTIVE' as const,
        createdAt: fi.date || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } : undefined,
    };
  }
}
