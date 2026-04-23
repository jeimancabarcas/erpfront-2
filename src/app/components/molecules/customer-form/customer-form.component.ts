import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SalesService, Customer } from '../../../services/sales.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">Nuevo Cliente</h2>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="space-y-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre del Representante</mat-label>
          <input matInput [(ngModel)]="name" placeholder="Ej. Juan Pérez" required>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre de la Empresa</mat-label>
            <input matInput [(ngModel)]="company" placeholder="Ej. Tech Solutions">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>NIT</mat-label>
            <input matInput [(ngModel)]="nit" placeholder="Ej. 900.123.456-1" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Correo Electrónico</mat-label>
          <input matInput type="email" [(ngModel)]="email" placeholder="juan@ejemplo.com" required>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Teléfono</mat-label>
            <input matInput [(ngModel)]="phone" placeholder="Ej. +57 300 000 0000">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Dirección</mat-label>
            <input matInput [(ngModel)]="address" placeholder="Ej. Calle 123 #45-67">
          </mat-form-field>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold">
            Cancelar
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            [disabled]="!name || !email || !nit"
            (click)="saveCustomer()"
            class="!h-12 !px-12 !rounded-full !font-bold"
          >
            Crear Cliente
          </button>
        </div>
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
export class CustomerFormMolecule {
  public dialogRef = inject(MatDialogRef<CustomerFormMolecule>);
  private salesService = inject(SalesService);

  name = '';
  company = '';
  nit = '';
  email = '';
  phone = '';
  address = '';

  saveCustomer() {
    const newCustomer: Customer = {
      id: `C-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: this.name,
      company: this.company,
      nit: this.nit,
      email: this.email,
      phone: this.phone,
      address: this.address,
      status: 'Active',
      totalSpent: 0
    };

    this.salesService.addCustomer(newCustomer);
    this.dialogRef.close(true);
  }
}
