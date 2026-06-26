export type AdjustmentType = 'Credit';

export interface FinanceCustomer {
  id: string;
  name: string;
  taxId: string; // NIT / CC
  email: string;
  phone: string;
  address: string;
}

export interface FinanceProduct {
  id: string;
  name: string;
  price: number;
  taxRate: number;
  category: 'Product' | 'Service';
}

export interface FinanceInvoice {
  id: string;
  dbId?: string; // Database UUID for API calls
  customerName: string;
  customerTaxId: string; // NIT/CC
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  electronicId?: string; // CUFE / UUID for electronic invoicing
  isElectronic?: boolean; // Whether the invoice is electronic (DIAN)
  adjustments?: AdjustmentNote[];
  type?: 'bill' | 'credit-note'; // Document type from Radian/Factus
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 0.19 for 19%
  total: number;
  codeReference?: string; // SKU or product UUID for backend item mapping
}

export interface AdjustmentNote {
  id: string;
  dbId?: string; // Database UUID for PDF download
  type: AdjustmentType;
  invoiceId: string;
  date: string;
  reason: string;
  amount: number;
  electronicId?: string; // CUDE
  status: 'Pending' | 'Applied' | 'Electronic_Sent';
}

export interface FinancialMetric {
  label: string;
  value: number;
  trend: number; // percentage
  icon: string;
  color: string;
}

// Backend DTOs for Radian/Factus documents
export interface FinanceDocumentDto {
  id: string;
  number: string;
  clientName: string;
  clientIdentification: string;
  total: number;
  status: string; // '1' = validated, '0' = pending
  createdAt: string;
  type: 'bill' | 'credit-note';
}

export interface FinanceDocumentsResponse {
  data: FinanceDocumentDto[];
  meta: import('./pagination.model').PaginatedMeta;
}

// --- Electronic billing models ---

export interface CreateElectronicBillPayload {
  manualInvoiceId?: string;
  customer: {
    identification: string;
    names: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  items: {
    codeReference: string;
    name: string;
    quantity: number;
    price: number;
    discountRate?: number;
    productId?: string;
  }[];
}

export interface CreateElectronicBillResponse {
  id: string;
  number: string;
  cufe?: string;
  qrUrl?: string;
  publicUrl?: string;
  status: 'pending' | 'emitted' | 'failed';
  warning?: string;
}

export interface ElectronicBillDto {
  id: string;
  number: string;
  status: 'pending' | 'emitted' | 'failed';
  cufe?: string;
  invoiceId: string | null;
  createdAt: string;
}

export interface ElectronicBillListResponse {
  data: ElectronicBillDto[];
  meta: import('./pagination.model').PaginatedMeta;
}
