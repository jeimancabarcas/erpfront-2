import { Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Invoice } from '../../../services/sales.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';
import { ButtonAtom } from '../../atoms/button/button.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CurrencyPipe, StatusTagAtom, ButtonAtom],
  template: `
    <div class="p-2">
      <header class="flex justify-between items-start mb-8">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-3xl font-black text-gray-900 !m-0">{{ data().invoice.id }}</h2>
            <app-status-tag [label]="data().invoice.status" [color]="getStatusColor(data().invoice.status)" />
          </div>
          <p class="text-gray-500 font-medium">Detalle de facturación - {{ data().invoice.date }}</p>
        </div>
        <ui-button variant="icon" (clicked)="onClose()">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
          <p class="text-lg font-bold text-gray-900">{{ data().invoice.customer }}</p>
        </div>
        <div class="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Monto Total</p>
          <p class="text-2xl font-black text-indigo-600">{{ data().invoice.amount | currency }}</p>
        </div>
      </div>

      <div class="border border-gray-100 rounded-3xl overflow-hidden mb-8">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
              <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
              <th class="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Precio Unit.</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            @for (p of data().invoice.products || []; track p) {
              <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td class="py-4 px-6 font-bold text-gray-900">{{p.name}}</td>
                <td class="py-4 px-4 text-center text-gray-600">{{p.quantity}}</td>
                <td class="py-4 px-4 text-center text-gray-500">{{p.price | currency}}</td>
                <td class="py-4 px-6 text-center font-bold text-gray-900">{{p.quantity * p.price | currency}}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <ui-button variant="outline">
          <span class="material-icons mr-2">print</span>
          Imprimir
        </ui-button>
        <ui-button variant="primary" (clicked)="onClose()">
          Cerrar
        </ui-button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InvoiceDetailMolecule {
  data = input.required<{ invoice: Invoice }>();
  closed = output<void>();

  onClose() {
    this.closed.emit();
  }

  getStatusColor(status: string): 'green' | 'amber' | 'red' | 'gray' {
    switch (status) {
      case 'Paid': return 'green';
      case 'Pending': return 'amber';
      case 'Overdue': return 'red';
      default: return 'gray';
    }
  }
}
