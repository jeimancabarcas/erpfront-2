import { Product } from './product.model';
import { Customer } from './customer.model';

export type InvoiceStatus = 'DRAFT' | 'PAID' | 'CANCELLED';

export interface InvoiceItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product; // Incluido en respuestas GET
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // Generado por el back (e.g., FAC-0001)
  date: string;
  customerId: string;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  customer?: Customer; // Incluido en respuestas GET
}

export interface CreateInvoiceDto {
  customerId: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
