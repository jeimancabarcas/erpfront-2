export interface Supplier {
  id: string; // UUID
  nit: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  nit: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface UpdateSupplierDto {
  nit?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}
