export interface AnamnesisData {
  reason: string;
  currentIllness: string;
}

export interface PhysicalExamData {
  weight: number | null;
  height: number | null;
  temperature: number | null;
  findings: string;
}

export interface DiagnosticItem {
  code: string;
  description: string;
}

export interface DiagnosticsData {
  principalCode: string;
  principalDescription: string;
  complications?: string;
  comorbidities?: string;
}

export interface PrescriptionData {
  code: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
  observations: string;
}

export interface ProcedureData {
  code: string;
  name: string;
  indications: string;
}

export interface OtherTechnologyData {
  description: string;
  indications: string;
}

export interface IncapacityData {
  days: number | null;
  type: string;
  specialLicense: string;
  recommendations: string;
}
