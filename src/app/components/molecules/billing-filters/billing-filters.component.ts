import { Component, model, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { BillingProvider } from '../../../models/billing.model';

@Component({
  selector: 'app-billing-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TextInputComponent,
    SelectAtom
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm mb-10 dark:shadow-none">
      <ui-text-input
        label="Buscar Paciente"
        icon="person_search"
        placeholder="Nombre..."
        [value]="searchQuery()"
        (valueChange)="searchQuery.set($event)"
      />

      <ui-select label="Prestador / Aseguradora" placeholder="Todos los prestadores" [options]="providerOptions()" [(value)]="providerFilter" />

      <ui-select label="Estado de Factura" placeholder="Todos los estados" [options]="statusOptions" [(value)]="statusFilter" />
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

  providerOptions = computed<SelectOption[]>(() => {
    const opts: SelectOption[] = [{ value: 'all', label: 'Todos los prestadores' }];
    this.providers().forEach(p => opts.push({ value: p.name, label: p.name }));
    return opts;
  });

  statusOptions: SelectOption[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'Pending', label: 'Pendiente por Facturar' },
    { value: 'Invoiced', label: 'Facturado (Enviado)' },
    { value: 'Paid', label: 'Pagado' },
  ];
}
