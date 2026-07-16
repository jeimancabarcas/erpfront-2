export interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  actividades?: ServiceActivity[];
}

export interface CreateServiceActivityInput {
  actividadId: string;
}

export interface CreateServiceDto {
  nombre: string;
  descripcion?: string;
  precioBase: number;
  actividades?: CreateServiceActivityInput[];
}

export interface UpdateServiceDto {
  nombre?: string;
  descripcion?: string;
  precioBase?: number;
  actividades?: CreateServiceActivityInput[];
}

export interface ServiceActivity {
  id?: string;
  actividadId?: string;
  actividad?: {
    id: string;
    nombre: string;
    descripcion?: string;
    horasEstimadas?: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
