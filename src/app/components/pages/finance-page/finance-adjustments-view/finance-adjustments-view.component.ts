import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../templates/dashboard-layout/dashboard-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FinanceService } from '../../../../services/finance.service';
import { AdjustmentTableOrganism } from '../../../organisms/adjustment-table/adjustment-table.component';
import { AdjustmentFormDialogOrganism } from '../../../organisms/adjustment-form-dialog/adjustment-form-dialog.component';

@Component({
  selector: 'app-finance-adjustments-view',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardLayoutComponent, 
    MatButtonModule, 
    MatIconModule,
    MatDialogModule,
    AdjustmentTableOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Notas Crédito y Débito</h1>
          <p class="text-gray-500 font-medium">Ajustes contables y devoluciones de facturación electrónica.</p>
        </div>
        <div class="flex gap-3">
          <button 
            mat-flat-button 
            (click)="openAdjustment('Credit')"
            class="!rounded-full !h-12 !px-8 !font-black !bg-amber-500 !text-white shadow-xl shadow-amber-100 hover:scale-105 transition-transform"
          >
            <mat-icon class="mr-2">remove_circle</mat-icon>
            Nueva Nota Crédito
          </button>
          <button 
            mat-flat-button 
            (click)="openAdjustment('Debit')"
            class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600 !text-white shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
          >
            <mat-icon class="mr-2">add_circle</mat-icon>
            Nueva Nota Débito
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Notas Crédito</p>
          <p class="text-2xl font-black text-amber-600 tabular-nums">$2,450.00</p>
        </div>
        <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Notas Débito</p>
          <p class="text-2xl font-black text-indigo-600 tabular-nums">$850.00</p>
        </div>
      </div>

      <app-adjustment-table 
        [adjustments]="financeService.adjustments()"
      />
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FinanceAdjustmentsViewComponent {
  private dialog = inject(MatDialog);
  public financeService = inject(FinanceService);

  openAdjustment(type: 'Credit' | 'Debit') {
    this.dialog.open(AdjustmentFormDialogOrganism, {
      width: '500px',
      maxWidth: '95vw',
      data: { type }
    });
  }
}
