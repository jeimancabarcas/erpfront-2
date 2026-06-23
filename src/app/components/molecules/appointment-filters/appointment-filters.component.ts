import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { DatepickerComponent } from '../../atoms/datepicker/datepicker.component';

@Component({
  selector: 'app-appointment-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    TextInputComponent,
    SelectAtom,
    DatepickerComponent
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
      <ui-text-input icon="search" placeholder="Nombre del paciente..." [(value)]="searchQuery" />

      <ui-datepicker label="Fecha" [(value)]="dateFilter" />

      <ui-select placeholder="Todos los estados" [options]="statusOptions" [(value)]="statusFilter" />

      <div class="flex items-center gap-2">
        <button mat-stroked-button class="!rounded-2xl !h-14 w-full !border-gray-100 text-gray-500 font-bold" (click)="clear.emit()">
          <mat-icon class="mr-2">filter_alt_off</mat-icon>
          Limpiar
        </button>
      </div>
    </div>
  `,
  styles: [``]
})
export class AppointmentFiltersMolecule {
  searchQuery = model<string>('');
  statusFilter = model<string>('all');
  dateFilter = model<Date | null>(null);

  statusOptions: SelectOption[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'Scheduled', label: 'Programado' },
    { value: 'Confirmed', label: 'Confirmado' },
    { value: 'Cancelled', label: 'Cancelado' },
    { value: 'Completed', label: 'Completado' },
  ];
  
  clear = output<void>();
}
