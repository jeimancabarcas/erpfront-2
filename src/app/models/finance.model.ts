export type AdjustmentType = 'Credit' | 'Debit';

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
  adjustments?: AdjustmentNote[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 0.19 for 19%
  total: number;
}

export interface AdjustmentNote {
  id: string;
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
