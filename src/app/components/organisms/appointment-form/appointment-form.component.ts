import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PediatricsService, Appointment, Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-4 max-w-md">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Programar Cita</h2>
          <p class="text-gray-500 font-medium text-sm">Asigne un horario para la atención médica</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400 hover:!text-gray-600 transition-colors">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Patient Selection -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Paciente</mat-label>
          <mat-select formControlName="patientId" placeholder="Seleccione un paciente" required>
            @for (patient of pediatricsService.patients(); track patient.id) {
              <mat-option [value]="patient.id">
                {{ patient.firstNames }} {{ patient.lastNames }} ({{ patient.idNumber }})
              </mat-option>
            }
          </mat-select>
          <mat-icon matPrefix class="mr-2 text-gray-400">person</mat-icon>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <!-- Date -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <!-- Time -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Hora</mat-label>
            <input matInput [matTimepicker]="timePicker" formControlName="time" required>
            <mat-timepicker-toggle matSuffix [for]="timePicker"></mat-timepicker-toggle>
            <mat-timepicker #timePicker></mat-timepicker>
          </mat-form-field>
        </div>

        <!-- Type -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Tipo de Cita</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="Control">Control</mat-option>
            <mat-option value="Urgency">Urgencia</mat-option>
            <mat-option value="Specialist">Especialista</mat-option>
          </mat-select>
          <mat-icon matPrefix class="mr-2 text-gray-400">category</mat-icon>
        </mat-form-field>

        <div class="pt-4 flex flex-col gap-3">
          <button 
            mat-flat-button 
            color="primary" 
            type="submit"
            class="!h-14 !rounded-full !font-bold text-lg shadow-lg shadow-indigo-100"
          >
            <mat-icon class="mr-2">check_circle</mat-icon>
            Confirmar Cita
          </button>
          
          <button 
            mat-button 
            type="button"
            (click)="dialogRef.close()"
            class="!h-12 !rounded-full !font-bold !text-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 32px !important;
      padding: 16px !important;
    }
  `]
})
export class AppointmentFormOrganism {
  private fb = inject(FormBuilder);
  public pediatricsService = inject(PediatricsService);
  public dialogRef = inject(MatDialogRef<AppointmentFormOrganism>);

  appointmentForm = this.fb.group({
    patientId: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    type: ['Control', Validators.required]
  });

  onSubmit() {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const selectedPatient = this.pediatricsService.patients().find(p => p.id === formValue.patientId);

      if (selectedPatient) {
        const newAppointment: Appointment = {
          id: `APP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          patientId: formValue.patientId!,
          patientName: `${selectedPatient.firstNames} ${selectedPatient.lastNames}`,
          date: this.formatDate(formValue.date as any),
          time: this.formatTime(formValue.time as any),
          type: formValue.type as any,
          status: 'Scheduled'
        };

        this.pediatricsService.addAppointment(newAppointment);
        this.dialogRef.close(true);
      }
    }
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  private formatTime(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    let hours = '' + d.getHours();
    let minutes = '' + d.getMinutes();

    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    return `${hours}:${minutes}`;
  }
}
