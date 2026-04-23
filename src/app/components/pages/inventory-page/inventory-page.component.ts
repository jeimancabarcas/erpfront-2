import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockTableMolecule } from '../../molecules/stock-table/stock-table.component';
import { MovementsTableMolecule } from '../../molecules/movements-table/movements-table.component';
import { ProductFormMolecule } from '../../molecules/product-form/product-form.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    StockTableMolecule,
    MovementsTableMolecule
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Inventario</h1>
          <p class="text-gray-500 font-medium">Gestiona tu stock y movimientos en tiempo real.</p>
        </div>
        <div class="flex gap-3">
          <button mat-stroked-button class="!rounded-full !h-12 !px-6 !border-gray-200 !font-bold">
            <mat-icon class="mr-2">download</mat-icon>
            Exportar
          </button>
          <button mat-flat-button color="primary" class="!rounded-full !h-12 !px-6 !font-bold" (click)="openProductForm()">
            <mat-icon class="mr-2">add</mat-icon>
            Nuevo Producto
          </button>
        </div>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <mat-tab-group class="inventory-tabs" animationDuration="0ms">
          <!-- Stock Control -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="flex items-center gap-3 py-4 px-2">
                <mat-icon class="!text-[20px]">inventory_2</mat-icon>
                <span class="text-sm font-bold tracking-wide">Control de Stock</span>
              </div>
            </ng-template>
            <div class="p-4 md:p-8">
              <app-stock-table />
            </div>
          </mat-tab>

          <!-- Movements -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="flex items-center gap-3 py-4 px-2">
                <mat-icon class="!text-[20px]">sync_alt</mat-icon>
                <span class="text-sm font-bold tracking-wide">Movimientos</span>
              </div>
            </ng-template>
            <div class="p-4 md:p-8">
              <app-movements-table />
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
