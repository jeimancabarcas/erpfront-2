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
  raw?: FinanceDocumentDto; // Raw Factus response for detail view
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
export interface FinanceDocumentCustomer {
  identification?: string;
  names?: string;
  graphic_representation_name?: string;
  trade_name?: string | null;
  company?: string | null;
  address?: string;
  email?: string | null;
  phone?: string | null;
}

export interface FinanceDocumentDto {
  // Normalized by backend
  id: string;
  number: string;
  type: 'bill' | 'credit-note';
  // Factus raw fields (snake_case from API)
  reference_code?: string;
  api_client_name?: string;
  customer?: FinanceDocumentCustomer;
  payment_details?: Array<{
    payment_form?: { code: string; name: string };
    payment_method?: { code: string; name: string };
    reference_code?: string | null;
    amount?: string;
    due_date?: string | null;
  }>;
  document?: { code: string; name: string };
  operation_type?: { code: string; name: string };
  total?: string;
  is_validated?: boolean;
  is_negotiable_instrument?: boolean;
  has_claim?: boolean;
  send_email?: boolean;
  validated_at?: string | null;
  created_at?: string;
  errors?: Record<string, string> | null;
  credit_notes?: any[];
  debit_notes?: any[];
  // Legacy flat fields (for backward compat)
  clientName?: string;
  clientIdentification?: string;
  createdAt?: string;
  status?: string;
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


