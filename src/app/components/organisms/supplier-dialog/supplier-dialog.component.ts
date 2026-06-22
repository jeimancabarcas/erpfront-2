import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom
  ],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
        </h2>
        <ui-button variant="icon" (clicked)="onClose()" class="!text-gray-400">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form #supplierForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">NIT / Identificación</label>
            <div class="relative">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">fingerprint</span>
              <input [(ngModel)]="form().nit" name="nit" required placeholder="Ej. 900.123.456-1"
                class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Nombre del Proveedor</label>
            <div class="relative">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">business</span>
              <input [(ngModel)]="form().name" name="name" required placeholder="Ej. Distribuidora Global S.A.S"
                class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Dirección</label>
            <div class="relative">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
              <input [(ngModel)]="form().address" name="address" required placeholder="Ej. Calle 123 # 45-67"
                class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Teléfono</label>
            <div class="relative">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">phone</span>
              <input [(ngModel)]="form().phone" name="phone" required placeholder="Ej. +57 300 123 4567"
                class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Correo Electrónico</label>
            <div class="relative">
              <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">email</span>
              <input type="email" [(ngModel)]="form().email" name="email" required placeholder="Ej. contacto@proveedor.com"
                class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()" class="!h-12 !px-8 !rounded-full !font-bold text-gray-500">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!supplierForm.valid"
            (clicked)="saveSupplier()"
            class="!h-12 !px-8 !rounded-full !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Registrar Proveedor' }}
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SupplierDialogOrganism implements OnInit {
  data = input<{ supplier?: Supplier }>({});
  closed = output<boolean>();

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
    const incoming = this.data();
    if (incoming.supplier) {
      this.isEditMode = true;
      this.form.set({ ...incoming.supplier });
    }
  }

  onClose() {
    this.closed.emit(false);
  }

  saveSupplier() {
    const { id, nit, name, address, phone, email } = this.form();
    const payload = { nit, name, address, phone, email };
    
    const request = this.isEditMode 
      ? this.supplierService.updateSupplier(id, payload)
      : this.supplierService.createSupplier(payload);

    request.subscribe({
      next: () => this.closed.emit(true),
      error: (err) => console.error('Error saving supplier:', err)
    });
  }
}
