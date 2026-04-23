import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InvoicesTableMolecule } from '../../molecules/invoices-table/invoices-table.component';
import { CustomerCardListMolecule } from '../../molecules/customer-card-list/customer-card-list.component';
import { SaleFormMolecule } from '../../molecules/sale-form/sale-form.component';
import { CustomerFormMolecule } from '../../molecules/customer-form/customer-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    InvoicesTableMolecule,
    CustomerCardListMolecule
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Ventas y Clientes</h1>
          <p class="text-gray-500 font-medium">Gestiona tu facturación y base de datos de clientes.</p>
        </div>
        <div class="flex gap-3">
          <button mat-stroked-button (click)="openCustomerForm()" class="!rounded-full !h-12 !px-6 !border-gray-200 !font-bold">
            <mat-icon class="mr-2">person_add</mat-icon>
            Nuevo Cliente
          </button>
          <button mat-flat-button color="primary" (click)="openSaleForm()" class="!rounded-full !h-12 !px-6 !font-bold">
            <mat-icon class="mr-2">add</mat-icon>
            Nueva Venta
          </button>
        </div>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <mat-tab-group class="sales-tabs" animationDuration="0ms">
          <!-- Billing/Facturación -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="flex items-center gap-3 py-4 px-2">
                <mat-icon class="!text-[20px]">receipt_long</mat-icon>
                <span class="text-sm font-bold tracking-wide">Facturación</span>
              </div>
            </ng-template>
            <div class="p-4 md:p-8">
              <app-invoices-table />
            </div>
          </mat-tab>

          <!-- Customers/Clientes -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="flex items-center gap-3 py-4 px-2">
                <mat-icon class="!text-[20px]">group</mat-icon>
                <span class="text-sm font-bold tracking-wide">Clientes</span>
              </div>
            </ng-template>
            <div class="p-4 md:p-8">
              <app-customer-card-list />
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .sales-tabs .mat-mdc-tab-header {
      background-color: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }
    ::ng-deep .sales-tabs .mat-mdc-tab {
      height: 64px;
      opacity: 0.5;
    }
    ::ng-deep .sales-tabs .mat-mdc-tab.mdc-tab--active {
      opacity: 1;
    }
  `]
})
export class SalesPageComponent {
  private dialog = inject(MatDialog);

  openSaleForm() {
    this.dialog.open(SaleFormMolecule, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: true
    });
  }

  openCustomerForm() {
    this.dialog.open(CustomerFormMolecule, {
      width: '600px',
      maxWidth: '95vw'
    });
  }
}
