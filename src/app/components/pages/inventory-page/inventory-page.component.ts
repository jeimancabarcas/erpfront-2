import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MovementsTableMolecule } from '../../molecules/movements-table/movements-table.component';
import { ProductFormMolecule } from '../../molecules/product-form/product-form.component';
import { InventoryStatsOrganism } from '../../organisms/inventory-stats/inventory-stats.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MovementsTableMolecule,
    InventoryStatsOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Inventario</h1>
          <p class="text-gray-500 font-medium">Resumen financiero y auditoría de movimientos en tiempo real.</p>
        </div>
      </header>

      <div class="space-y-12">
        <!-- Financial Summary Section -->
        <section class="animate-in fade-in slide-in-from-bottom duration-700">
          <div class="flex items-center gap-3 mb-6 ml-2">
            <mat-icon class="text-indigo-600">analytics</mat-icon>
            <h2 class="text-xs font-black uppercase tracking-widest text-gray-400">Resumen Financiero de Inventario</h2>
          </div>
          <app-inventory-stats-organism />
        </section>

        <!-- Movements Section -->
        <section class="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-150">
          <header class="p-8 border-b border-gray-50 flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <mat-icon>sync_alt</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900 tracking-tight">Historial de Movimientos</h3>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Registro de entradas y salidas</p>
            </div>
          </header>
          <div class="p-8">
            <app-movements-table />
          </div>
        </section>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .inventory-tabs .mat-mdc-tab-header {
      background-color: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }
    ::ng-deep .inventory-tabs .mat-mdc-tab {
      height: 64px;
      opacity: 0.5;
    }
    ::ng-deep .inventory-tabs .mat-mdc-tab.mdc-tab--active {
      opacity: 1;
    }
    ::ng-deep .inventory-tabs .mat-mdc-tab .mdc-tab__text-label {
      color: inherit !important;
    }
  `]
})
export class InventoryPageComponent {
  private dialog = inject(MatDialog);

  openProductForm() {
    this.dialog.open(ProductFormMolecule, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true
    });
  }
}
