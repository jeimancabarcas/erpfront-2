export interface Invoice {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  provider: string; // EPS / Prepagada
  date: string;
  totalAmount: number;
  patientAmount: number; // Valor del copago
  patientStatus: 'Pending' | 'Paid';
  providerAmount: number; // Valor a cobrar al prestador
  providerStatus: 'Pending' | 'Invoiced' | 'Paid';
  status: 'Pending' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled'; // Estado general de la factura
  authorizationNumber?: string;
  isParticular: boolean;
}

export interface BillingProvider {
  id: string;
  name: string;
  nit: string;
}
