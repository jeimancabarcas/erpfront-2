import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { Invoice } from '../../../models/billing.model';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-billing-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    StatusTagAtom
  ],
  template: `
    <div class="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      <div class="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-black text-gray-900">Registros de Facturación</h3>
          <p class="text-sm text-gray-500 font-medium">{{ selection.selected.length }} facturas seleccionadas para cobro a prestador</p>
        </div>
        @if (selection.selected.length > 0) {
          <button 
            mat-flat-button 
            color="primary" 
            class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600 shadow-lg shadow-indigo-200"
            (click)="onBulkInvoice()"
          >
            <mat-icon class="mr-2">send_and_archive</mat-icon>
            Facturar Seleccionados
          </button>
        }
      </div>

      <table mat-table [dataSource]="invoices()" class="w-full">
        <!-- Checkbox Column -->
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef class="!pl-8 !w-14">
            <mat-checkbox 
              (change)="$event ? toggleAllRows() : null"
              [checked]="selection.hasValue() && isAllSelected()"
              [indeterminate]="selection.hasValue() && !isAllSelected()"
              color="primary">
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row" class="!pl-8">
            <mat-checkbox 
              (click)="$event.stopPropagation()"
              (change)="$event ? selection.toggle(row) : null"
              [checked]="selection.isSelected(row)"
              [disabled]="row.providerStatus !== 'Pending'"
              color="primary">
            </mat-checkbox>
          </td>
        </ng-container>

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef class="!font-black !text-gray-400 !uppercase !text-[10px] !tracking-widest">Folio</th>
          <td mat-cell *matCellDef="let row" class="font-bold text-gray-900">{{row.id}}</td>
        </ng-container>

        <ng-container matColumnDef="patient">
          <th mat-header-cell *matHeaderCellDef class="!font-black !text-gray-400 !uppercase !text-[10px] !tracking-widest">Paciente / Prestador</th>
          <td mat-cell *matCellDef="let row">
            <p class="font-black text-gray-900 leading-tight">{{row.patientName}}</p>
            <p class="text-[10px] text-gray-400 font-bold uppercase">{{row.provider}}</p>
          </td>
        </ng-container>

        <ng-container matColumnDef="patientPayment">
          <th mat-header-cell *matHeaderCellDef class="!font-black !text-gray-400 !uppercase !text-[10px] !tracking-widest text-center">Copago (Paciente)</th>
          <td mat-cell *matCellDef="let row" class="text-center">
            <div class="flex flex-col items-center gap-1">
              <span class="text-sm font-black text-gray-900">{{row.patientAmount | currency:'USD':'symbol':'1.0-0'}}</span>
              <app-status-tag [label]="row.patientStatus === 'Paid' ? 'Recaudado' : 'Pendiente'" [color]="row.patientStatus === 'Paid' ? 'green' : 'amber'" />
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="providerPayment">
          <th mat-header-cell *matHeaderCellDef class="!font-black !text-gray-400 !uppercase !text-[10px] !tracking-widest text-center">Cobro (Prestador)</th>
          <td mat-cell *matCellDef="let row" class="text-center">
            <div class="flex flex-col items-center gap-1">
              <span class="text-sm font-black text-indigo-600">{{row.providerAmount | currency:'USD':'symbol':'1.0-0'}}</span>
              <app-status-tag [label]="getProviderLabel(row.providerStatus)" [color]="getStatusColor(row.providerStatus)" />
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row" class="text-right !pr-8">
            <button mat-icon-button [matMenuTriggerFor]="menu" class="!text-gray-400">
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #menu="matMenu" class="!rounded-2xl !p-2">
              <button mat-menu-item (click)="markPatientAsPaid.emit(row.id)" [disabled]="row.patientStatus === 'Paid'">
                <mat-icon class="!text-green-600">payments</mat-icon>
                <span>Recaudar Copago</span>
              </button>
              <div class="border-t border-gray-100 my-1"></div>
              <button mat-menu-item (click)="invoiceAction.emit(row.id)" [disabled]="row.providerStatus !== 'Pending'">
                <mat-icon class="!text-indigo-600">send</mat-icon>
                <span>Facturar a Prestador</span>
              </button>
              <button mat-menu-item (click)="markAsPaid.emit(row.id)" [disabled]="row.providerStatus !== 'Invoiced'">
                <mat-icon class="!text-green-600">check_circle</mat-icon>
                <span>Marcar Pago Prestador</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
      </table>
    </div>
  `,
  styles: [`
    .mat-mdc-header-cell { padding: 20px 16px; background: transparent; }
    .mat-mdc-cell { padding: 24px 16px; border-bottom: 1px solid #f9fafb; }
  `]
})
export class BillingTableOrganism {
  invoices = input.required<Invoice[]>();
  invoiceAction = output<string>();
  bulkInvoiceAction = output<string[]>();
  markAsPaid = output<string>();
  markPatientAsPaid = output<string>();

  selection = new SelectionModel<Invoice>(true, []);
  displayedColumns: string[] = ['select', 'id', 'patient', 'patientPayment', 'providerPayment', 'actions'];

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.invoices().filter(i => i.providerStatus === 'Pending').length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.invoices().filter(i => i.providerStatus === 'Pending'));
  }

  onBulkInvoice() {
    const ids = this.selection.selected.map(s => s.id);
    this.bulkInvoiceAction.emit(ids);
    this.selection.clear();
  }

  getProviderLabel(status: string): string {
    switch (status) {
      case 'Paid': return 'Pagado';
      case 'Invoiced': return 'Facturado';
      case 'Pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  getStatusColor(status: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' {
    switch (status) {
      case 'Paid': return 'green';
      case 'Invoiced': return 'blue';
      case 'Pending': return 'amber';
      case 'Overdue': return 'red';
      default: return 'gray';
    }
  }
}
