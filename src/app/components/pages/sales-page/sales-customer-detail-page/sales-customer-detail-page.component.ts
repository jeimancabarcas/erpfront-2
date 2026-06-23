import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { CustomerService } from '../../../../services/customer.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { Customer } from '../../../../models/customer.model';
import { Invoice } from '../../../../models/invoice.model';
import { QueryParams } from '../../../../models/pagination.model';

// Atomic Design Imports
import { ButtonAtom } from '../../../atoms/button/button.component';
import { CustomerInfoMolecule } from '../../../molecules/customer-info/customer-info.component';
import { CustomerStatsMolecule } from '../../../molecules/customer-stats/customer-stats.component';
import { CustomerInvoicesTableOrganism } from '../../../organisms/customer-invoices-table/customer-invoices-table.component';

@Component({
  selector: 'app-sales-customer-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonAtom,
    DashboardLayoutComponent,
    CustomerInfoMolecule,
    CustomerStatsMolecule,
    CustomerInvoicesTableOrganism
  ],
  template: `
    <app-dashboard-layout title="Detalle del Cliente" subtitle="Información histórica y facturación">
      <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        
        <!-- Action Bar -->
        <div class="flex items-center justify-between">
          <ui-button variant="ghost" routerLink="/comercial/customers">
            <span class="material-icons mr-2">arrow_back</span>
            Volver a la lista de Clientes
          </ui-button>
        </div>

        @if (loading() && !customer()) {
          <div class="flex flex-col items-center justify-center p-32 space-y-6 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div class="text-center">
              <p class="text-gray-900 font-black text-lg">Cargando perfil</p>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Sincronizando información del cliente...</p>
            </div>
          </div>
        } @else if (customer(); as c) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            <!-- Left: Sidebar Info & Quick Stats -->
            <div class="lg:col-span-4 space-y-8 flex flex-col">
              <app-customer-info-molecule [customer]="c" />
              <app-customer-stats-molecule 
                [totalBilled]="totalBilled()" 
                [invoiceCount]="totalInvoices()" 
              />
            </div>

            <!-- Right: Detailed History -->
            <div class="lg:col-span-8">
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
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesCustomerDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);

  customer = signal<Customer | null>(null);
  invoices = signal<Invoice[]>([]);
  totalBilled = signal<number>(0);
  totalInvoices = signal<number>(0);
  
  loading = signal(true);
  loadingInvoices = signal(false);

  // Pagination & Filtering State
  currentFilter = signal<string>('');
  pageSize = signal(10);
  pageIndex = signal(1);

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
        // Note: Initial total invoices count comes from stats, 
        // but table handles its own count from paginated responses
        this.totalInvoices.set(stats.invoiceCount || 0);
        this.loadInvoices();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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
