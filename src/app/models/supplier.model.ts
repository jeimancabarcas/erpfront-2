export interface Supplier {
  id: string; // UUID
  nit: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  dv: string | null;
  municipalityCode: string | null;
  legalOrganizationCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  nit: string;
  name: string;
  address: string;
  phone: string;
  dv?: string;
  municipalityCode?: string;
  legalOrganizationCode?: string;
  email?: string;
}

export interface UpdateSupplierDto {
  nit?: string;
  name?: string;
  address?: string;
  phone?: string;
  dv?: string;
  municipalityCode?: string;
  legalOrganizationCode?: string;
  email?: string;
}
