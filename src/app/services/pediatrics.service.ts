import { Injectable, signal } from '@angular/core';

export interface Patient {
  id: string;
  firstNames: string;
  lastNames: string;
  birthDate: string;
  idType: string;
  idNumber: string;
  address: string;
  city: string;
  country: string;
  eps: string;
  healthRegime: string;
  gender: 'M' | 'F' | 'O';
  zone: string;
  postalCode?: string;
  birthPlace: string;
  observations?: string;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  motherEmail?: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  birthWeight?: number;
  birthHeight?: number;
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
    { 
      id: 'P-001', 
      firstNames: 'Mateo', 
      lastNames: 'Garcia', 
      birthDate: '2020-05-15', 
      idType: 'RC', 
      idNumber: '123456789', 
      address: 'Calle 123', 
      city: 'Bogotá', 
      country: 'Colombia', 
      eps: 'Sura', 
      healthRegime: 'Contributivo', 
      gender: 'M', 
      zone: 'Urbana', 
      birthPlace: 'Clínica del Prado' 
    },
    { 
      id: 'P-002', 
      firstNames: 'Sofia', 
      lastNames: 'Rodriguez', 
      birthDate: '2022-08-10', 
      idType: 'RC', 
      idNumber: '987654321', 
      address: 'Carrera 45', 
      city: 'Medellín', 
      country: 'Colombia', 
      eps: 'Sanitas', 
      healthRegime: 'Contributivo', 
      gender: 'F', 
      zone: 'Urbana', 
      birthPlace: 'Hospital General' 
    },
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

  updatePatient(updatedPatient: Patient) {
    this._patients.update(items => items.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  }
}
