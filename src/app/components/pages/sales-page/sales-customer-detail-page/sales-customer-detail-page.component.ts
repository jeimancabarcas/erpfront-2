import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { CustomerService } from '../../../../services/customer.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { Customer } from '../../../../models/customer.model';
import { Invoice } from '../../../../models/invoice.model';
import { InvoiceDetailDialogOrganism } from '../../../organisms/invoice-detail-dialog/invoice-detail-dialog.component';

@Component({
  selector: 'app-sales-customer-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    DashboardLayoutComponent,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <app-dashboard-layout title="Detalle del Cliente" subtitle="Información histórica y facturación">
      <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        
        <!-- Breadcrumbs & Actions -->
        <div class="flex items-center justify-between">
          <button mat-button routerLink="/sales/customers" class="!rounded-full !px-4 !text-gray-500">
            <mat-icon class="mr-2">arrow_back</mat-icon>
            Volver a Clientes
          </button>
        </div>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center p-20 space-y-4">
            <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando información...</p>
          </div>
        } @else if (customer(); as c) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left: Profile Info -->
            <div class="lg:col-span-1 space-y-6">
              <div class="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div class="flex flex-col items-center text-center space-y-4 mb-8">
                  <div class="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center shadow-inner">
                    <mat-icon class="!text-[48px] !w-12 !h-12">person</mat-icon>
                  </div>
                  <div>
                    <h2 class="text-2xl font-black text-gray-900 leading-tight">{{ c.name }}</h2>
                    <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{{ c.documentType }}: {{ c.documentNumber }}</p>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="py-6 space-y-4">
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <mat-icon>email</mat-icon>
                    </div>
                    <div>
                      <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Email</p>
                      <p class="text-sm font-bold text-gray-700">{{ c.email }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <mat-icon>phone</mat-icon>
                    </div>
                    <div>
                      <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Teléfono</p>
                      <p class="text-sm font-bold text-gray-700">{{ c.phone || 'No registrado' }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <mat-icon>location_on</mat-icon>
                    </div>
                    <div>
                      <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Dirección</p>
                      <p class="text-sm font-bold text-gray-700">{{ c.address || 'No registrada' }}</p>
                    </div>
                  </div>
                </div>

                <div class="pt-6">
                  <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <span class="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Estado</span>
                    <span class="px-3 py-1 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase shadow-sm border border-emerald-100">
                      {{ c.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Mini Stats -->
              <div class="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
                <div class="flex items-center gap-3 mb-6">
                  <mat-icon>payments</mat-icon>
                  <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Total Facturado</span>
                </div>
                <h3 class="text-3xl font-black mb-2">{{ totalBilled() | currency }}</h3>
                <p class="text-xs opacity-80 font-bold">En un total de {{ invoices().length }} facturas emitidas</p>
              </div>
            </div>

            <!-- Right: Invoices Table -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <header class="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 class="text-xl font-black text-gray-900">Historial de Facturación</h3>
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Todas las ventas asociadas</p>
                  </div>
                  <mat-icon class="text-gray-200 !text-[40px] !w-10 !h-10">receipt_long</mat-icon>
                </header>

                @if (invoices().length === 0) {
                  <div class="p-20 text-center space-y-4">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <mat-icon>inbox</mat-icon>
                    </div>
                    <p class="text-gray-400 font-bold">No se han registrado facturas para este cliente</p>
                  </div>
                } @else {
                  <div class="overflow-x-auto">
                    <table mat-table [dataSource]="invoices()" class="w-full">
                      <ng-container matColumnDef="invoiceNumber">
                        <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50">No. Factura</th>
                        <td mat-cell *matCellDef="let inv" class="px-8 !py-6">
                          <span class="font-black text-indigo-600">{{ inv.invoiceNumber }}</span>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50">Fecha</th>
                        <td mat-cell *matCellDef="let inv" class="px-8 !py-6 text-sm text-gray-600 font-medium">
                          {{ inv.date | date:'mediumDate' }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50 text-right">Monto</th>
                        <td mat-cell *matCellDef="let inv" class="px-8 !py-6 text-right font-black text-gray-900">
                          {{ inv.totalAmount | currency }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef class="px-8 !py-6 !text-[10px] !font-black !text-gray-400 !uppercase !tracking-widest !bg-gray-50/50 text-center">Acciones</th>
                        <td mat-cell *matCellDef="let inv" class="px-8 !py-6 text-center">
                          <button mat-icon-button (click)="viewInvoiceDetail(inv)" class="!text-indigo-600 hover:!bg-indigo-50 transition-all">
                            <mat-icon>visibility</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="['invoiceNumber', 'date', 'amount', 'actions']"></tr>
                      <tr mat-row *matRowDef="let row; columns: ['invoiceNumber', 'date', 'amount', 'actions'];" 
                          class="hover:bg-gray-50/50 transition-colors cursor-pointer"></tr>
                    </table>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    .mat-column-invoiceNumber { width: 30%; }
    .mat-column-date { width: 30%; }
    .mat-column-amount { width: 25%; }
    .mat-column-actions { width: 15%; }
  `]
})
export class SalesCustomerDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);
  private dialog = inject(MatDialog);

  customer = signal<Customer | null>(null);
  invoices = signal<Invoice[]>([]);
  totalBilled = signal<number>(0);
  loading = signal(true);

  ngOnInit() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadCustomerData(customerId);
    }
  }

  loadCustomerData(id: string) {
    this.loading.set(true);
    
    this.customerService.getCustomerStats(id).subscribe({
      next: (stats) => {
        this.customer.set(stats.customer);
        this.invoices.set(stats.invoices || []);
        this.totalBilled.set(stats.totalInvoiced || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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
}
