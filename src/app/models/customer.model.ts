export type DocumentType = 'CC' | 'NIT' | 'CE' | 'PP';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  documentType: DocumentType;
  documentNumber: string;
  status: CustomerStatus;
  phone?: string;
  address?: string;
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
