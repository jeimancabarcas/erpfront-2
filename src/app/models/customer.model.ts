export interface Customer {
  id: string;
  name: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerDto {
  name: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone?: string;
  address?: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
