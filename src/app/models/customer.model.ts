export type DocumentType = 'CC' | 'NIT' | 'CE' | 'PP';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type CreditStatus = 'GOOD' | 'OVERDUE' | 'BLOCKED';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  documentType: DocumentType;
  documentNumber: string;
  status: CustomerStatus;
  phone?: string;
  address?: string;
  creditLimit?: number | null;
  currentBalance?: number;
  paymentTermsDays?: number;
  creditStatus?: CreditStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  documentType: DocumentType;
  documentNumber: string;
  status?: CustomerStatus;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CustomerStats {
  customer: Customer;
  totalInvoiced: number;
  invoiceCount: number;
  invoices: any[];
  creditLimit?: number | null;
  currentBalance?: number;
  creditStatus?: CreditStatus;
  paymentTermsDays?: number;
}

export interface CreditPortfolio {
  creditLimit: number | null;
  currentBalance: number;
  availableCredit: number | null;
  utilizationPercent: number | null;
  creditStatus: CreditStatus;
  paymentTermsDays: number;
}

export interface RecordPaymentDto {
  invoiceId: string;
  amount: number;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  amount: number;
  paymentDate: string;
  notes?: string | null;
  createdAt: string;
}
