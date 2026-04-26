import { Component, inject, signal } from '@angular/core';
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
import { PatientSearchMolecule } from '../../molecules/patient-search/patient-search.component';

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
    MatIconModule,
    PatientSearchMolecule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white">
      <!-- Decorative Background Element -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <div class="p-8 relative z-10">
        <header class="flex items-center gap-5 mb-10">
          <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 animate-in zoom-in duration-500">
            <mat-icon class="!text-[28px] !w-7 !h-7">calendar_today</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">Programar Cita</h2>
            <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Agenda Médica</p>
          </div>
        </header>

        <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Patient Selection Molecule -->
          <div class="space-y-2">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Paciente</label>
            <app-patient-search 
              label="Seleccione el paciente"
              (selectedPatientChange)="onPatientSelected($event)"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Date -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Fecha de Atención</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <input matInput [matDatepicker]="picker" formControlName="date" required placeholder="DD/MM/AAAA">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Time -->
            <div class="space-y-2">
              <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Hora</label>
              <mat-form-field appearance="outline" class="w-full !m-0">
                <input matInput [matTimepicker]="timePicker" formControlName="time" required placeholder="--:--">
                <mat-timepicker-toggle matSuffix [for]="timePicker"></mat-timepicker-toggle>
                <mat-timepicker #timePicker></mat-timepicker>
              </mat-form-field>
            </div>
          </div>

          <!-- Type -->
          <div class="space-y-2">
            <label class="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Tipo de Consulta</label>
            <mat-form-field appearance="outline" class="w-full !m-0">
              <mat-select formControlName="type" required>
                <mat-option value="Control">Consulta de Control</mat-option>
                <mat-option value="Urgency">Urgencia Pediátrica</mat-option>
                <mat-option value="Specialist">Especialista</mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">category</mat-icon>
            </mat-form-field>
          </div>

          <div class="pt-6 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
            <button 
              mat-button 
              type="button"
              (click)="dialogRef.close()"
              class="!h-12 !rounded-full !font-bold !text-gray-500 flex-1"
            >
              Cancelar
            </button>
            <button 
              mat-flat-button 
              color="primary" 
              type="submit"
              [disabled]="appointmentForm.invalid"
              class="!h-12 !rounded-full !font-black text-lg !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex-[2]"
            >
              <mat-icon class="mr-2">check_circle</mat-icon>
              Confirmar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class AppointmentFormOrganism {
  private fb = inject(FormBuilder);
  public pediatricsService = inject(PediatricsService);
  public dialogRef = inject(MatDialogRef<AppointmentFormOrganism>);

  appointmentForm = this.fb.group({
    patient: [null as Patient | null, Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    type: ['Control', Validators.required]
  });

  onPatientSelected(patient: Patient | null) {
    this.appointmentForm.patchValue({ patient });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const patient = formValue.patient as Patient;

      const newAppointment: Appointment = {
        id: `APP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        patientId: patient.id,
        patientName: `${patient.firstNames} ${patient.lastNames}`,
        date: this.formatDate(formValue.date as any),
        time: this.formatTime(formValue.time as any),
        type: formValue.type as any,
        status: 'Scheduled'
      };

      this.pediatricsService.addAppointment(newAppointment);
      this.dialogRef.close(true);
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
