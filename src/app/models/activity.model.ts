export interface Activity {
  id: string;
  nombre: string;
  descripcion?: string;
  horasEstimadas?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  nombre: string;
  descripcion?: string;
  horasEstimadas?: number | null;
}

export interface UpdateActivityDto {
  nombre?: string;
  descripcion?: string;
  horasEstimadas?: number | null;
}
