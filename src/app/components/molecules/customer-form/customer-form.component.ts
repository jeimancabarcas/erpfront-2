import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SalesService, Customer } from '../../../services/sales.service';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom
  ],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight !m-0">Nuevo Cliente</h2>
        <ui-button variant="icon" (clicked)="onClose()">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="space-y-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Nombre del Representante</label>
          <input [(ngModel)]="name" placeholder="Ej. Juan Pérez" required
            class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Nombre de la Empresa</label>
            <input [(ngModel)]="company" placeholder="Ej. Tech Solutions"
              class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">NIT</label>
            <input [(ngModel)]="nit" placeholder="Ej. 900.123.456-1" required
              class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Correo Electrónico</label>
          <input type="email" [(ngModel)]="email" placeholder="juan@ejemplo.com" required
            class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Teléfono</label>
            <input [(ngModel)]="phone" placeholder="Ej. +57 300 000 0000"
              class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Dirección</label>
            <input [(ngModel)]="address" placeholder="Ej. Calle 123 #45-67"
              class="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!name || !email || !nit"
            (clicked)="saveCustomer()"
          >
            Crear Cliente
          </ui-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CustomerFormMolecule {
  closed = output<boolean>();
  private salesService = inject(SalesService);

  name = '';
  company = '';
  nit = '';
  email = '';
  phone = '';
  address = '';

  onClose() {
    this.closed.emit(false);
  }

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
    this.closed.emit(true);
  }
}
