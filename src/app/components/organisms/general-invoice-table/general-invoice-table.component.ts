import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { FinanceInvoice } from '../../../models/finance.model';

@Component({
  selector: 'app-general-invoice-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatChipsModule
  ],
  template: `
    <div class="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
      <table mat-table [dataSource]="invoices()" class="w-full">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Nº Factura</th>
          <td mat-cell *matCellDef="let inv" class="!py-4">
            <span class="text-sm font-black text-indigo-600 tracking-tight">{{ inv.id }}</span>
          </td>
        </ng-container>

        <!-- Customer Column -->
        <ng-container matColumnDef="customer">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Cliente</th>
          <td mat-cell *matCellDef="let inv" class="!py-4">
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-900">{{ inv.customerName }}</span>
              <span class="text-[10px] font-medium text-gray-400 tracking-tighter">{{ inv.customerTaxId }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Fecha / Venc.</th>
          <td mat-cell *matCellDef="let inv" class="!py-4">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-gray-700">{{ inv.date }}</span>
              <span class="text-[10px] font-medium text-red-400">{{ inv.dueDate }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Total Column -->
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Total</th>
          <td mat-cell *matCellDef="let inv" class="!py-4">
            <span class="text-sm font-black text-gray-900 tabular-nums">
              {{ inv.total | currency:'USD':'symbol':'1.0-0' }}
            </span>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Estado</th>
          <td mat-cell *matCellDef="let inv" class="!py-4">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  [ngClass]="{
                    'bg-green-50 text-green-600 border border-green-100': inv.status === 'Paid',
                    'bg-blue-50 text-blue-600 border border-blue-100': inv.status === 'Sent',
                    'bg-amber-50 text-amber-600 border border-amber-100': inv.status === 'Draft',
                    'bg-red-50 text-red-600 border border-red-100': inv.status === 'Overdue'
                  }">
              {{ inv.status }}
            </span>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400"></th>
          <td mat-cell *matCellDef="let inv" class="!py-4 text-right pr-6">
            <button mat-icon-button [matMenuTriggerFor]="menu" class="!text-gray-400 hover:!text-indigo-600 transition-colors">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu" class="!rounded-2xl !p-2 !shadow-2xl">
              <button mat-menu-item (click)="onAction.emit({invoice: inv, action: 'view'})">
                <mat-icon class="!text-indigo-500">visibility</mat-icon>
                <span class="font-bold">Ver Detalles</span>
              </button>
              <button mat-menu-item (click)="onAction.emit({invoice: inv, action: 'print'})">
                <mat-icon class="!text-gray-500">print</mat-icon>
                <span class="font-bold">Imprimir PDF</span>
              </button>
              <div class="h-px bg-gray-100 my-2"></div>
              <button mat-menu-item (click)="onAction.emit({invoice: inv, action: 'adjustment'})">
                <mat-icon class="!text-amber-500">history_edu</mat-icon>
                <span class="font-bold">Crear Nota Crédito/Débito</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors cursor-pointer"></tr>
      </table>

      <!-- Empty State -->
      @if (invoices().length === 0) {
        <div class="p-20 flex flex-col items-center justify-center text-center">
          <div class="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mb-6">
            <mat-icon class="!text-[40px] !w-10 !h-10 text-gray-200">receipt_long</mat-icon>
          </div>
          <h5 class="text-xl font-black text-gray-900 mb-2">Sin facturas registradas</h5>
          <p class="text-gray-400 text-sm max-w-xs mx-auto">
            Aún no se han generado facturas para productos o servicios generales.
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mat-mdc-table { background: transparent; }
    .mat-mdc-header-cell { border-bottom: none !important; }
    .mat-mdc-cell { border-bottom: 1px solid #f9fafb !important; }
    tr:last-child .mat-mdc-cell { border-bottom: none !important; }
  `]
})
export class GeneralInvoiceTableOrganism {
  invoices = input.required<FinanceInvoice[]>();
  onAction = output<{invoice: FinanceInvoice, action: string}>();

  displayedColumns: string[] = ['id', 'customer', 'date', 'total', 'status', 'actions'];
}
