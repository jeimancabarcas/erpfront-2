import { Product } from './product.model';
import { Customer } from './customer.model';

export type InvoiceStatus = 'DRAFT' | 'PAID' | 'CANCELLED' | 'ON_CREDIT';

export interface InvoiceItemTax {
  id: string;
  taxId?: string;
  taxCode: string;
  taxName?: string;
  taxRate: number;
  taxAmount: number;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount?: number;
  taxes?: InvoiceItemTax[];
  invoiceItemTaxes?: InvoiceItemTax[];
  product?: Product; // Incluido en respuestas GET
}

export interface EmissionInfo {
  number: string;
  cude: string;
  qrUrl: string;
  publicUrl: string;
  isValidated: boolean;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // Generado por el back (e.g., FAC-0001)
  sequentialNumber: number; // Auto-increment asignado por PostgreSQL
  date: string;
  customerId: string;
  totalAmount: number;
  netTotal?: number; // Computed by backend: totalAmount - Σcn.amount + Σdn.amount
  status: InvoiceStatus;
  notes?: string;
  dueDate?: string | Date;
  paymentFrequency?: string;
  emission?: EmissionInfo; // Metadata de emisión electrónica Factus
  installments?: number;
  paymentTypeId?: string;
  items: InvoiceItem[];
  customer?: Customer; // Incluido en respuestas GET
}

export interface CreateInvoiceDto {
  customerId: string;
  notes?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  paymentFrequency?: string;
  installments?: number;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
