import { Injectable, signal } from '@angular/core';

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  parentName: string;
  phone: string;
  gender: 'M' | 'F';
  weight?: number;
  height?: number;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  reason: string;
  diagnosis: string;
  status: 'Pending' | 'Completed';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'Control' | 'Urgency' | 'Specialist';
  status: 'Scheduled' | 'Confirmed' | 'Cancelled' | 'Completed';
}

@Injectable({
  providedIn: 'root'
})
export class PediatricsService {
  private _patients = signal<Patient[]>([
    { id: 'P-001', name: 'Mateo Garcia', birthDate: '2020-05-15', parentName: 'Ana Maria', phone: '3001234567', gender: 'M', weight: 15, height: 95 },
    { id: 'P-002', name: 'Sofia Rodriguez', birthDate: '2022-08-10', parentName: 'Carlos Perez', phone: '3119876543', gender: 'F', weight: 10, height: 80 },
  ]);

  private _consultations = signal<Consultation[]>([
    { id: 'C-001', patientId: 'P-001', patientName: 'Mateo Garcia', date: '2026-04-23', reason: 'Fiebre y tos', diagnosis: 'Gripe común', status: 'Completed' },
  ]);

  private _appointments = signal<Appointment[]>([
    { id: 'APP-001', patientId: 'P-001', patientName: 'Mateo Garcia', date: '2026-04-24', time: '09:00', type: 'Control', status: 'Scheduled' },
    { id: 'APP-002', patientId: 'P-002', patientName: 'Sofia Rodriguez', date: '2026-04-24', time: '10:30', type: 'Specialist', status: 'Confirmed' },
  ]);

  public patients = this._patients.asReadonly();
  public consultations = this._consultations.asReadonly();
  public appointments = this._appointments.asReadonly();

  addPatient(patient: Patient) {
    this._patients.update(items => [...items, patient]);
  }

  addConsultation(consultation: Consultation) {
    this._consultations.update(items => [consultation, ...items]);
  }

  addAppointment(appointment: Appointment) {
    this._appointments.update(items => [appointment, ...items]);
  }

  updateAppointmentStatus(id: string, status: Appointment['status']) {
    this._appointments.update(items => items.map(a => a.id === id ? { ...a, status } : a));
  }
}
