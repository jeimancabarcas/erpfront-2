import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
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
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
        </h2>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form #supplierForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>NIT / Identificación</mat-label>
            <input matInput [(ngModel)]="form().nit" name="nit" required placeholder="Ej. 900.123.456-1">
            <mat-icon matPrefix class="!text-gray-400 mr-2">fingerprint</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre del Proveedor</mat-label>
            <input matInput [(ngModel)]="form().name" name="name" required placeholder="Ej. Distribuidora Global S.A.S">
            <mat-icon matPrefix class="!text-gray-400 mr-2">business</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Dirección</mat-label>
            <input matInput [(ngModel)]="form().address" name="address" required placeholder="Ej. Calle 123 # 45-67">
            <mat-icon matPrefix class="!text-gray-400 mr-2">location_on</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Teléfono</mat-label>
            <input matInput [(ngModel)]="form().phone" name="phone" required placeholder="Ej. +57 300 123 4567">
            <mat-icon matPrefix class="!text-gray-400 mr-2">phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" [(ngModel)]="form().email" name="email" required placeholder="Ej. contacto@proveedor.com" email>
            <mat-icon matPrefix class="!text-gray-400 mr-2">email</mat-icon>
          </mat-form-field>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button mat-button (click)="dialogRef.close()" class="!h-12 !px-8 !rounded-full !font-bold text-gray-500">
            Cancelar
          </button>
          <button 
            mat-flat-button 
            color="primary" 
            [disabled]="!supplierForm.valid"
            (click)="saveSupplier()"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Registrar Proveedor' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 40px !important;
      padding: 32px !important;
    }
  `]
})
export class SupplierDialogOrganism implements OnInit {
  public dialogRef = inject(MatDialogRef<SupplierDialogOrganism>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private supplierService = inject(SupplierService);

  isEditMode = false;
  form = signal<any>({
    nit: '',
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  ngOnInit() {
    if (this.data && this.data.supplier) {
      this.isEditMode = true;
      this.form.set({ ...this.data.supplier });
    }
  }

  saveSupplier() {
    const { id, nit, name, address, phone, email } = this.form();
    const payload = { nit, name, address, phone, email };
    
    const request = this.isEditMode 
      ? this.supplierService.updateSupplier(id, payload)
      : this.supplierService.createSupplier(payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Error saving supplier:', err)
    });
  }
}
