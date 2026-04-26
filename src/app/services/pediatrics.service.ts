import { Injectable, signal } from '@angular/core';
import { 
  AnamnesisData, 
  PhysicalExamData, 
  DiagnosticsData, 
  DiagnosticItem, 
  PrescriptionData, 
  ProcedureData, 
  OtherTechnologyData, 
  IncapacityData 
} from '../models/consultation.model';

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
  cephalicPerimeter?: number;
  thoracicPerimeter?: number;
  neonatalNotes?: string;
  personalBackground?: string;
  familyBackground?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: 'Pending' | 'Completed';
  
  // Clinical Data
  anamnesis: AnamnesisData;
  physicalExam: PhysicalExamData;
  diagnostics: DiagnosticsData;
  secondaryDiagnoses: DiagnosticItem[];
  prescriptions: PrescriptionData[];
  procedures: ProcedureData[];
  otherTechnologies: OtherTechnologyData[];
  incapacity: IncapacityData;
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
    { 
      id: 'C-001', 
      patientId: 'P-001', 
      patientName: 'Mateo Garcia', 
      date: '2026-04-20', 
      status: 'Completed',
      anamnesis: {
        reason: 'Control de crecimiento y desarrollo',
        currentIllness: 'Paciente asintomático, madre refiere adecuado apetito y sueño. Sin novedades desde la última consulta.'
      },
      physicalExam: {
        weight: 15.5,
        height: 102,
        temperature: 36.5,
        findings: 'Buen estado general, hidratado, eupneico. Ruidos cardiacos rítmicos, pulmones limpios. Abdomen blando, no doloroso.'
      },
      diagnostics: {
        principalCode: 'Z00.1',
        principalDescription: 'Control de salud de rutina del niño'
      },
      secondaryDiagnoses: [],
      prescriptions: [
        { code: 'V-001', name: 'Multivitamínico Jarabe', dose: '5ml', frequency: 'Cada 24 horas', route: 'Oral', duration: '30 días', observations: 'Administrar con el desayuno' }
      ],
      procedures: [],
      otherTechnologies: [],
      incapacity: { days: null, type: 'Enfermedad General', specialLicense: 'Ninguna', recommendations: '' }
    },
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
