export interface Supply {
  id: string;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplyDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateSupplyDto {
  nombre?: string;
  descripcion?: string;
}
