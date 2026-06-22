import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';

@Component({
  selector: 'app-appointment-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
    TextInputComponent,
    SelectAtom
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
      <ui-text-input icon="search" placeholder="Nombre del paciente..." [(value)]="searchQuery" />

      <mat-form-field appearance="outline" class="!m-0 w-full">
        <mat-label>Fecha</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="dateFilter">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <ui-select placeholder="Todos los estados" [options]="statusOptions" [(value)]="statusFilter" />

      <div class="flex items-center gap-2">
        <button mat-stroked-button class="!rounded-2xl !h-14 w-full !border-gray-100 text-gray-500 font-bold" (click)="clear.emit()">
          <mat-icon class="mr-2">filter_alt_off</mat-icon>
          Limpiar
        </button>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
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
