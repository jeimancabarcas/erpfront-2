import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { ButtonAtom } from '../../../atoms/button/button.component';
import { FinanceService } from '../../../../services/finance.service';
import { GeneralInvoiceTableOrganism } from '../../../organisms/general-invoice-table/general-invoice-table.component';
import { ElectronicBillFormDialogOrganism } from '../../../organisms/electronic-bill-form-dialog/electronic-bill-form-dialog.component';
import { FinanceInvoice, ElectronicBillDto } from '../../../../models/finance.model';

@Component({
  selector: 'app-finance-invoicing-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    ButtonAtom,
    GeneralInvoiceTableOrganism,
    MatPaginatorModule,
  ],
  template: `
    <app-dashboard-layout>
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
          <ui-button variant="outline" (clicked)="searchDocuments()">
            <span class="material-icons mr-2">search</span>
            Buscar
          </ui-button>
          <ui-button variant="outline" (clicked)="loadAllDocuments()">
            <span class="material-icons mr-2">refresh</span>
            Actualizar
          </ui-button>
        </div>
      </header>

      <!-- Filter Bar -->
      <div class="flex gap-4 mb-8">
        <div class="flex-1 relative">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (keyup.enter)="searchDocuments()"
            placeholder="Buscar por cliente, identificación o número de documento..."
            class="w-full h-[56px] pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <ui-button variant="outline" (clicked)="searchDocuments()">
          <span class="material-icons mr-2 text-gray-400">filter_list</span>
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
      }

      <!-- Error state -->
      @if (error(); as err) {
        <div class="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <span class="material-icons text-red-500 mt-0.5">error_outline</span>
          <div>
            <h4 class="text-sm font-black text-red-800 mb-1">Error al cargar documentos</h4>
            <p class="text-xs font-medium text-red-600">{{ err }}</p>
            <button class="mt-3 text-xs font-bold text-red-700 underline hover:no-underline" (click)="loadAllDocuments()">
              Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Factus Documents Table -->
      <div class="mb-4">
        <h3 class="text-lg font-black text-gray-800 mb-4">Documentos Factus</h3>
        <app-general-invoice-table
          [invoices]="financeService.invoices()"
          (onAction)="handleAction($event)"
        />
      </div>

      <!-- Local Electronic Emissions -->
      <div class="mt-10">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-black text-gray-800">Emisiones Locales</h3>
          <ui-button variant="ghost" (clicked)="loadLocalEmissions()">
            <span class="material-icons mr-1">refresh</span>
            Recargar
          </ui-button>
        </div>

        @if (localEmissions().length === 0) {
          <div class="bg-white rounded-[32px] border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-[32px] flex items-center justify-center mb-4">
              <span class="material-icons !text-[32px] text-gray-300">receipt_long</span>
            </div>
            <h5 class="text-lg font-black text-gray-900 mb-1">Sin emisiones locales</h5>
            <p class="text-sm text-gray-400 max-w-sm">
              Las facturas electrónicas emitidas directamente desde el módulo de Finanzas aparecerán aquí.
            </p>
          </div>
        } @else {
          <div class="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50/50">
                  <th class="text-left !py-6 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Número</th>
                  <th class="text-left !py-6 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Estado</th>
                  <th class="text-left !py-6 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">CUFE</th>
                  <th class="text-left !py-6 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Vinculada</th>
                  <th class="text-left !py-6 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Creada</th>
                </tr>
              </thead>
              <tbody>
                @for (em of localEmissions(); track em.id) {
                  <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-b-0">
                    <td class="!py-4 !px-6">
                      <span class="text-sm font-black text-indigo-600 tracking-tight">{{ em.number || '—' }}</span>
                    </td>
                    <td class="!py-4 !px-6">
                      <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                            [ngClass]="{
                              'bg-amber-50 text-amber-600 border border-amber-100': em.status === 'pending',
                              'bg-green-50 text-green-600 border border-green-100': em.status === 'emitted',
                              'bg-red-50 text-red-600 border border-red-100': em.status === 'failed'
                            }">
                        {{ em.status }}
                      </span>
                    </td>
                    <td class="!py-4 !px-6">
                      <span class="text-xs font-mono text-gray-500">{{ em.cufe || '—' }}</span>
                    </td>
                    <td class="!py-4 !px-6">
                      <span class="text-xs font-medium text-gray-500">{{ em.invoiceId ? 'Sí' : 'No' }}</span>
                    </td>
                    <td class="!py-4 !px-6">
                      <span class="text-xs font-bold text-gray-700">{{ em.createdAt | date:'short' }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <mat-paginator
              [length]="localMeta()?.total ?? 0"
              [pageSize]="localPerPage()"
              [pageIndex]="localPage() - 1"
              [pageSizeOptions]="[5, 10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons
              aria-label="Paginar emisiones locales">
            </mat-paginator>
          </div>
        }
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceInvoicingViewComponent implements OnInit {
  public financeService = inject(FinanceService);
  private dialog = inject(MatDialog);

  searchTerm = '';
  loading = this.financeService.loading;
  error = this.financeService.error;
  localEmissions = this.financeService.localEmissions;
  localMeta = this.financeService.meta;

  localPage = signal(1);
  localPerPage = signal(10);

  ngOnInit(): void {
    this.loadAllDocuments();
    this.loadLocalEmissions();
  }

  loadAllDocuments(): void {
    this.financeService.loadBills({ perPage: 50 });
    this.financeService.loadCreditNotes({ perPage: 50 });
  }

  loadLocalEmissions(): void {
    this.financeService.loadElectronicBills({
      page: this.localPage(),
      perPage: this.localPerPage(),
    });
  }

  searchDocuments(): void {
    const term = this.searchTerm.trim();
    const params = {
      perPage: 50,
      ...(term && (term.match(/^\d/) ? { identification: term } : { names: term })),
      ...(term && !term.match(/^\d/) && { number: term }),
    };
    this.financeService.loadBills(params);
    this.financeService.loadCreditNotes(params);
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
        // Reload both tables after successful emission
        this.loadAllDocuments();
        this.loadLocalEmissions();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.localPage.set(event.pageIndex + 1);
    this.localPerPage.set(event.pageSize);
    this.loadLocalEmissions();
  }

  handleAction(event: { invoice: FinanceInvoice; action: string }) {
    // Dialog functionality will be restored when dialog organisms are migrated
  }
}
