import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Invoice } from '../../../services/sales.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, CurrencyPipe, StatusTagAtom],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-start mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-3xl font-black text-gray-900 !m-0">{{ data.invoice.id }}</h2>
            <app-status-tag [label]="data.invoice.status" [color]="getStatusColor(data.invoice.status)" />
          </div>
          <p class="text-gray-500 font-medium">Detalle de facturación - {{ data.invoice.date }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
          <p class="text-lg font-bold text-gray-900">{{ data.invoice.customer }}</p>
        </div>
        <div class="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Monto Total</p>
          <p class="text-2xl font-black text-indigo-600">{{ data.invoice.amount | currency }}</p>
        </div>
      </div>

      <div class="border border-gray-100 rounded-3xl overflow-hidden mb-8">
        <table mat-table [dataSource]="data.invoice.products || []" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase">Producto</th>
            <td mat-cell *matCellDef="let p" class="!py-4">{{p.name}}</td>
          </ng-container>

          <ng-container matColumnDef="qty">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase text-center">Cant.</th>
            <td mat-cell *matCellDef="let p" class="text-center">{{p.quantity}}</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase text-right">Precio Unit.</th>
            <td mat-cell *matCellDef="let p" class="text-right">{{p.price | currency}}</td>
          </ng-container>

          <ng-container matColumnDef="subtotal">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !font-bold !uppercase text-right">Subtotal</th>
            <td mat-cell *matCellDef="let p" class="text-right font-bold text-gray-900">{{p.quantity * p.price | currency}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['name', 'qty', 'price', 'subtotal']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['name', 'qty', 'price', 'subtotal']" class="hover:bg-gray-50/50"></tr>
        </table>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <button mat-stroked-button class="!h-12 !px-8 !rounded-full !font-bold !border-gray-200">
          <mat-icon class="mr-2">print</mat-icon>
          Imprimir
        </button>
        <button mat-flat-button color="primary" (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold">
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 32px !important;
      padding: 32px !important;
    }
  `]
})
export class InvoiceDetailMolecule {
  public dialogRef = inject(MatDialogRef<InvoiceDetailMolecule>);
  public data = inject(MAT_DIALOG_DATA);

  getStatusColor(status: string): 'green' | 'amber' | 'red' | 'gray' {
    switch (status) {
      case 'Paid': return 'green';
      case 'Pending': return 'amber';
      case 'Overdue': return 'red';
      default: return 'gray';
    }
  }
}
