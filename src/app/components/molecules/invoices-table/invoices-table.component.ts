import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { SalesService, Invoice } from '../../../services/sales.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';
import { InvoiceDetailMolecule } from '../invoice-detail/invoice-detail.component';

@Component({
  selector: 'app-invoices-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, CurrencyPipe, StatusTagAtom],
  template: `
    <div class="overflow-x-auto">
      <table mat-table [dataSource]="salesService.invoices()" class="w-full">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">No. Factura</th>
          <td mat-cell *matCellDef="let inv" class="!text-gray-500 font-mono">{{inv.id}}</td>
        </ng-container>

        <!-- Customer Column -->
        <ng-container matColumnDef="customer">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Cliente</th>
          <td mat-cell *matCellDef="let inv" class="font-bold text-gray-900">{{inv.customer}}</td>
        </ng-container>

        <!-- Amount Column -->
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest text-right">Monto</th>
          <td mat-cell *matCellDef="let inv" class="text-right font-bold">{{inv.amount | currency}}</td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Estado</th>
          <td mat-cell *matCellDef="let inv">
            <app-status-tag [label]="inv.status" [color]="getStatusColor(inv.status)" />
          </td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Fecha</th>
          <td mat-cell *matCellDef="let inv" class="text-gray-500 text-sm">{{inv.date}}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let inv" class="text-right">
            <button mat-icon-button (click)="viewDetail(inv)" class="!bg-indigo-50 !text-indigo-600 !rounded-xl">
              <mat-icon class="!text-[20px]">search</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors cursor-pointer"></tr>
      </table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .mat-mdc-header-cell { padding: 16px; }
    .mat-mdc-cell { padding: 20px 16px; }
  `]
})
export class InvoicesTableMolecule {
  salesService = inject(SalesService);
  private dialog = inject(MatDialog);
  displayedColumns: string[] = ['id', 'customer', 'amount', 'status', 'date', 'actions'];

  viewDetail(invoice: Invoice) {
    this.dialog.open(InvoiceDetailMolecule, {
      width: '800px',
      maxWidth: '95vw',
      data: { invoice }
    });
  }

  getStatusColor(status: string): 'green' | 'amber' | 'red' | 'gray' {
    switch (status) {
      case 'Paid': return 'green';
      case 'Pending': return 'amber';
      case 'Overdue': return 'red';
      default: return 'gray';
    }
  }
}
