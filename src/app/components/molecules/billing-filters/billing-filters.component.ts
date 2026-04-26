import { Component, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { BillingProvider } from '../../../models/billing.model';

@Component({
  selector: 'app-billing-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm mb-10">
      <mat-form-field appearance="outline" class="w-full !m-0">
        <mat-label>Buscar Paciente</mat-label>
        <input matInput placeholder="Nombre..." [(ngModel)]="searchQuery">
        <mat-icon matPrefix class="mr-2 text-gray-400">person_search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full !m-0">
        <mat-label>Prestador / Aseguradora</mat-label>
        <mat-select [(ngModel)]="providerFilter">
          <mat-option value="all">Todos los prestadores</mat-option>
          @for (p of providers(); track p.id) {
            <mat-option [value]="p.name">{{p.name}}</mat-option>
          }
        </mat-select>
        <mat-icon matPrefix class="mr-2 text-gray-400">account_balance</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full !m-0">
        <mat-label>Estado de Factura</mat-label>
        <mat-select [(ngModel)]="statusFilter">
          <mat-option value="all">Todos los estados</mat-option>
          <mat-option value="Pending">Pendiente por Facturar</mat-option>
          <mat-option value="Invoiced">Facturado (Enviado)</mat-option>
          <mat-option value="Paid">Pagado</mat-option>
        </mat-select>
        <mat-icon matPrefix class="mr-2 text-gray-400">payments</mat-icon>
      </mat-form-field>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class BillingFiltersMolecule {
  providers = input.required<readonly BillingProvider[]>();
  
  searchQuery = model<string>('');
  providerFilter = model<string>('all');
  statusFilter = model<string>('all');
}
