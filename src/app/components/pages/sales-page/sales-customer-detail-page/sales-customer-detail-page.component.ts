import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../../../../services/customer.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { Customer, CreditPortfolio, PaymentRecord } from '../../../../models/customer.model';
import { Invoice } from '../../../../models/invoice.model';
import { QueryParams } from '../../../../models/pagination.model';

// Atomic Design Imports
import { ButtonAtom } from '../../../atoms/button/button.component';
import { CustomerInfoMolecule } from '../../../molecules/customer-info/customer-info.component';
import { CustomerStatsMolecule } from '../../../molecules/customer-stats/customer-stats.component';
import { CustomerInvoicesTableOrganism } from '../../../organisms/customer-invoices-table/customer-invoices-table.component';
import { CreditPortfolioOrganism } from '../../../organisms/credit-portfolio/credit-portfolio.component';
import { CreditConfigDialogOrganism } from '../../../organisms/credit-config-dialog/credit-config-dialog.component';
import { PaymentHistoryTableOrganism } from '../../../organisms/payment-history-table/payment-history-table.component';
import { ReceiptPreviewDialogOrganism } from '../../../organisms/receipt-preview-dialog/receipt-preview-dialog.component';
import { RecordPaymentFormMolecule } from '../../../molecules/record-payment-form/record-payment-form.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-sales-customer-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonAtom,
    CustomerInfoMolecule,
    CustomerStatsMolecule,
    CustomerInvoicesTableOrganism,
    CreditPortfolioOrganism,
    CreditConfigDialogOrganism,
    PaymentHistoryTableOrganism,
    ReceiptPreviewDialogOrganism,
  ],
  template: `
      <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        
        <!-- Action Bar -->
        <div class="flex items-center justify-between">
          <ui-button variant="ghost" routerLink="/comercial/customers">
            <span class="material-icons mr-2">arrow_back</span>
            Volver a la lista de Clientes
          </ui-button>
        </div>

        @if (loading() && !customer()) {
          <div class="flex flex-col items-center justify-center p-32 space-y-6 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div class="text-center">
              <p class="text-gray-900 dark:text-gray-100 font-black text-lg">Cargando perfil</p>
              <p class="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Sincronizando información del cliente...</p>
            </div>
          </div>
        } @else if (customer(); as c) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left: Sidebar Info & Quick Stats -->
            <div class="lg:col-span-4 space-y-8 flex flex-col">
              <app-customer-info-molecule [customer]="c" />
              <app-customer-stats-molecule 
                [totalBilled]="totalBilled()" 
                [invoiceCount]="totalInvoices()" 
              />
            </div>

            <!-- Right: Detailed History + Credit Portfolio -->
            <div class="lg:col-span-8 space-y-8">
              <!-- Credit Portfolio Section -->
              @if (creditPortfolio(); as portfolio) {
                <app-credit-portfolio
                  [portfolio]="portfolio"
                  (recordPayment)="openRecordPayment()"
                  (configureCredit)="openCreditConfig()"
                />
              }

              <!-- Payment History -->
              <app-payment-history-table
                [payments]="payments()"
                [totalCount]="paymentTotal()"
                [pageSize]="paymentPageSize()"
                [pageIndex]="paymentPageIndex()"
                (pageChange)="onPaymentPageChange($event)"
                (receiptRequested)="onReceiptRequested($event)"
              />

              <!-- Invoices Table -->
              <app-customer-invoices-table-organism 
                [invoices]="invoices()"
                [totalCount]="totalInvoices()"
                [pageSize]="pageSize()"
                [pageIndex]="pageIndex()"
                [loading]="loadingInvoices()"
                (filterChanged)="onFilterChanged($event)"
                (pageChanged)="onPageChange($event)"
              />
            </div>
          </div>
        }
      </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesCustomerDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);

  customer = signal<Customer | null>(null);
  invoices = signal<Invoice[]>([]);
  totalBilled = signal<number>(0);
  totalInvoices = signal<number>(0);
  creditPortfolio = signal<CreditPortfolio | null>(null);
  payments = signal<PaymentRecord[]>([]);
  paymentTotal = signal(0);
  
  loading = signal(true);
  loadingInvoices = signal(false);

  // Pagination & Filtering State
  currentFilter = signal<string>('');
  pageSize = signal(10);
  pageIndex = signal(1);

  // Payment History Pagination (server-side)
  paymentPageSize = signal(5);
  paymentPageIndex = signal(0);

  ngOnInit() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadCustomerData(customerId);
    }
  }

  loadCustomerData(id: string) {
    this.loading.set(true);
    
    // Cargar estadísticas generales
    this.customerService.getCustomerStats(id).subscribe({
      next: (stats) => {
        this.customer.set(stats.customer);
        this.totalBilled.set(stats.totalInvoiced || 0);
        this.totalInvoices.set(stats.invoiceCount || 0);
        this.loadInvoices();
        this.loadCreditData(id);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCreditData(id: string) {
    // Load credit portfolio
    this.customerService.getCustomerCredit(id).subscribe({
      next: (portfolio) => this.creditPortfolio.set(portfolio),
      error: () => {/* portfolio not available */}
    });

    // Load payment history (paginated)
    this.loadPayments(id);
  }

  private loadPayments(customerId: string) {
    this.customerService.getPaymentHistory(
      customerId,
      undefined,
      this.paymentPageIndex() + 1,
      this.paymentPageSize(),
    ).subscribe({
      next: (res) => {
        this.payments.set(res.data);
        this.paymentTotal.set(res.meta.total);
      },
      error: () => {/* no payment history */}
    });
  }

  loadInvoices() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (!customerId) return;

    this.loadingInvoices.set(true);
    const params: QueryParams = {
      customerId: customerId,
      page: this.pageIndex(),
      limit: this.pageSize(),
      invoiceNumber: this.currentFilter() || '',
      sortBy: 'date',
      order: 'DESC'
    };

    this.invoiceService.loadInvoices(params).subscribe({
      next: (res) => {
        const items = res.data || res.items || (Array.isArray(res) ? res : []);
        this.invoices.set(items);
        this.totalInvoices.set(res.meta?.total || this.totalInvoices());
        this.loadingInvoices.set(false);
      },
      error: () => this.loadingInvoices.set(false)
    });
  }

  openCreditConfig() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (!customerId) return;

    const portfolio = this.creditPortfolio();

    const dialogRef = this.dialog.open(CreditConfigDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        customerId,
        creditLimit: portfolio?.creditLimit ?? null,
        paymentTermsDays: portfolio?.paymentTermsDays ?? 30,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadCreditData(customerId);
      }
    });
  }

  openRecordPayment() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (!customerId) return;

    const dialogRef = this.dialog.open(RecordPaymentFormMolecule, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { customerId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadCreditData(customerId);
      }
    });
  }

  onReceiptRequested(payment: PaymentRecord) {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (!customerId) return;

    this.dialog.open(ReceiptPreviewDialogOrganism, {
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
      data: { customerId, paymentId: payment.id },
    });
  }

  onPaymentPageChange(event: any) {
    this.paymentPageSize.set(event.pageSize);
    this.paymentPageIndex.set(event.pageIndex);
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadPayments(customerId);
    }
  }

  onFilterChanged(filter: string) {
    this.currentFilter.set(filter);
    this.pageIndex.set(1);
    this.loadInvoices();
  }

  onPageChange(event: { pageSize: number; pageIndex: number }) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex + 1);
    this.loadInvoices();
  }
}
