import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CustomerService } from '../../../services/customer.service';
import { Customer, CreateCustomerDto } from '../../../models/customer.model';

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh]">
      <header class="flex justify-between items-center mb-8 px-2">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <mat-icon class="!text-3xl">person_add</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
              {{ isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h2>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {{ isEditMode() ? 'ID: ' + (customer().id?.split('-')?.[0] || '...') : 'Registro de cliente en el sistema' }}
            </p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <mat-dialog-content class="flex-1 !px-2 custom-scrollbar">
        <form #customerForm="ngForm" class="space-y-6">
          <!-- Datos Básicos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre Completo / Razón Social</mat-label>
              <input matInput [(ngModel)]="customer().name" name="name" required placeholder="Ej. Juan Pérez o Tech SA">
              <mat-icon matPrefix class="!text-indigo-600 mr-2">person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput type="email" [(ngModel)]="customer().email" name="email" required placeholder="ejemplo@correo.com">
              <mat-icon matPrefix class="!text-indigo-600 mr-2">email</mat-icon>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Tipo de Documento</mat-label>
              <mat-select [(ngModel)]="customer().documentType" name="documentType" required>
                <mat-option value="CC">Cédula de Ciudadanía</mat-option>
                <mat-option value="NIT">NIT</mat-option>
                <mat-option value="CE">Cédula de Extranjería</mat-option>
                <mat-option value="PP">Pasaporte</mat-option>
              </mat-select>
              <mat-icon matPrefix class="!text-indigo-600 mr-2">badge</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Número de Documento</mat-label>
              <input matInput [(ngModel)]="customer().documentNumber" name="documentNumber" required placeholder="Ej. 123456789">
              <mat-icon matPrefix class="!text-indigo-600 mr-2">fingerprint</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="customer().status" name="status" required>
                <mat-option value="ACTIVE">Activo</mat-option>
                <mat-option value="INACTIVE">Inactivo</mat-option>
              </mat-select>
              <mat-icon matPrefix class="!text-indigo-600 mr-2">toggle_on</mat-icon>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Teléfono de Contacto</mat-label>
              <input matInput [(ngModel)]="customer().phone" name="phone" placeholder="Ej. +57 300 123 4567">
              <mat-icon matPrefix class="!text-indigo-600 mr-2">phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Dirección</mat-label>
              <input matInput [(ngModel)]="customer().address" name="address" placeholder="Ej. Calle 123 #45-67">
              <mat-icon matPrefix class="!text-indigo-600 mr-2">location_on</mat-icon>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <footer class="flex justify-end gap-3 mt-8 px-2 pt-4 border-t border-gray-100">
        <button mat-button (click)="dialogRef.close()" class="!rounded-full !h-12 !px-6 !font-bold">
          Cancelar
        </button>
        <button 
          mat-flat-button 
          color="primary" 
          [disabled]="customerForm.invalid || isLoading()"
          (click)="save()"
          class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
        >
          {{ isEditMode() ? 'Actualizar Cliente' : 'Crear Cliente' }}
        </button>
      </footer>
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
export class CustomerDialogOrganism implements OnInit {
  public dialogRef = inject(MatDialogRef<CustomerDialogOrganism>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private customerService = inject(CustomerService);

  customer = signal<Partial<Customer>>({
    name: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE'
  });

  isEditMode = signal(false);
  isLoading = signal(false);

  ngOnInit() {
    if (this.data?.customer) {
      this.isEditMode.set(true);
      this.customer.set({ ...this.data.customer });
    }
  }

  save() {
    this.isLoading.set(true);
    const fullData = this.customer() as Customer;
    
    // Extraemos solo los campos editables para el DTO
    const { id, createdAt, updatedAt, ...editableFields } = fullData;
    const dto = editableFields as CreateCustomerDto;
    
    const obs = this.isEditMode() 
      ? this.customerService.updateCustomer(id, dto)
      : this.customerService.createCustomer(dto);

    obs.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading.set(false);
        // Aquí podrías manejar el error con un snackbar o señal
      }
    });
  }
}
