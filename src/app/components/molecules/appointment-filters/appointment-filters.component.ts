import { Component, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-appointment-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
      <mat-form-field appearance="outline" class="!m-0 w-full">
        <mat-label>Buscar Paciente</mat-label>
        <input matInput placeholder="Nombre del paciente..." [(ngModel)]="searchQuery">
        <mat-icon matPrefix class="mr-2 text-gray-400">search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="!m-0 w-full">
        <mat-label>Fecha</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="dateFilter">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="!m-0 w-full">
        <mat-label>Estado</mat-label>
        <mat-select [(ngModel)]="statusFilter">
          <mat-option value="all">Todos los estados</mat-option>
          <mat-option value="Scheduled">Programado</mat-option>
          <mat-option value="Confirmed">Confirmado</mat-option>
          <mat-option value="Cancelled">Cancelado</mat-option>
          <mat-option value="Completed">Completado</mat-option>
        </mat-select>
      </mat-form-field>

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
  
  clear = output<void>();
}
