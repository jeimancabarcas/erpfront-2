import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AdjustmentNote } from '../../../models/finance.model';

@Component({
  selector: 'app-adjustment-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
      <table mat-table [dataSource]="adjustments()" class="w-full">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Nº Nota</th>
          <td mat-cell *matCellDef="let adj" class="!py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   [ngClass]="adj.type === 'Credit' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'">
                <mat-icon class="!text-sm !w-4 !h-4">{{ adj.type === 'Credit' ? 'remove_circle' : 'add_circle' }}</mat-icon>
              </div>
              <span class="text-sm font-black text-gray-900 tracking-tight">{{ adj.id }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Invoice Reference Column -->
        <ng-container matColumnDef="invoice">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Factura Relacionada</th>
          <td mat-cell *matCellDef="let adj" class="!py-4">
            <span class="text-xs font-bold text-indigo-600 uppercase tracking-tighter">REF: {{ adj.invoiceId }}</span>
          </td>
        </ng-container>

        <!-- Reason Column -->
        <ng-container matColumnDef="reason">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Concepto</th>
          <td mat-cell *matCellDef="let adj" class="!py-4">
            <span class="text-xs font-medium text-gray-500 line-clamp-1 max-w-[200px]">{{ adj.reason }}</span>
          </td>
        </ng-container>

        <!-- Amount Column -->
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Valor</th>
          <td mat-cell *matCellDef="let adj" class="!py-4">
            <span class="text-sm font-black tabular-nums"
                  [ngClass]="adj.type === 'Credit' ? 'text-amber-600' : 'text-indigo-600'">
              {{ adj.type === 'Credit' ? '-' : '+' }}{{ adj.amount | currency:'USD':'symbol':'1.0-0' }}
            </span>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-50/50 !py-6 !text-[10px] !font-black !uppercase !tracking-widest !text-gray-400">Estado DIAN</th>
          <td mat-cell *matCellDef="let adj" class="!py-4 text-right pr-8">
            <div class="flex items-center justify-end gap-2">
               <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="{
                      'bg-green-50 text-green-600 border border-green-100': adj.status === 'Applied' || adj.status === 'Electronic_Sent',
                      'bg-amber-50 text-amber-600 border border-amber-100': adj.status === 'Pending'
                    }">
                {{ adj.status === 'Electronic_Sent' ? 'Transmitida' : adj.status }}
              </span>
              <button mat-icon-button class="!text-gray-300 hover:!text-indigo-600 transition-colors">
                <mat-icon class="!text-[18px]">open_in_new</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors cursor-pointer"></tr>
      </table>
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
export class AdjustmentTableOrganism {
  adjustments = input.required<AdjustmentNote[]>();
  displayedColumns: string[] = ['id', 'invoice', 'reason', 'amount', 'status'];
}
