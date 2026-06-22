import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../../services/customer.service';
import { Customer, CreateCustomerDto } from '../../../models/customer.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';

export interface CustomerDialogData {
  customer?: Customer;
}

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom,
    TextInputComponent
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="onClosed()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="flex flex-col h-full max-h-[90vh] p-8">
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span class="material-icons !text-3xl">person_add</span>
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
        <ui-button variant="icon" (clicked)="onClosed()" aria-label="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <form #customerForm="ngForm" class="space-y-6">
          <!-- Datos Básicos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ui-text-input label="Nombre Completo / Razón Social" icon="person" [(value)]="customer().name" name="name" required placeholder="Ej. Juan Pérez o Tech SA" />

            <ui-text-input type="email" label="Correo Electrónico" icon="email" [(value)]="customer().email" name="email" required placeholder="ejemplo@correo.com" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Tipo de Documento</label>
              <div class="relative">
                <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">badge</span>
                <select [(ngModel)]="customer().documentType" name="documentType" required
                  class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PP">Pasaporte</option>
                </select>
              </div>
            </div>

            <ui-text-input label="Número de Documento" icon="fingerprint" [(value)]="customer().documentNumber" name="documentNumber" required placeholder="Ej. 123456789" />

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Estado</label>
              <div class="relative">
                <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600">toggle_on</span>
                <select [(ngModel)]="customer().status" name="status" required
                  class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ui-text-input label="Teléfono de Contacto" icon="phone" [(value)]="customer().phone" name="phone" placeholder="Ej. +57 300 123 4567" />

            <ui-text-input label="Dirección" icon="location_on" [(value)]="customer().address" name="address" placeholder="Ej. Calle 123 #45-67" />
          </div>
        </form>
      </div>

      <footer class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
        <ui-button variant="outline" (clicked)="onClosed()">
          Cancelar
        </ui-button>
        <ui-button 
          variant="primary"
          [disabled]="customerForm.invalid || isLoading()"
          (clicked)="save()"
        >
          {{ isEditMode() ? 'Actualizar Cliente' : 'Crear Cliente' }}
        </ui-button>
      </footer>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class CustomerDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  private dialogRef = inject(MatDialogRef<CustomerDialogOrganism, boolean>);
  private dialogData = inject<CustomerDialogData>(MAT_DIALOG_DATA);

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
    const incoming = this.dialogData;
    if (incoming?.customer) {
      this.isEditMode.set(true);
      this.customer.set({ ...incoming.customer });
    }
  }

  onClosed() {
    this.dialogRef.close(false);
  }

  save() {
    this.isLoading.set(true);
    const fullData = this.customer() as Customer;
    
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
      }
    });
  }
}
