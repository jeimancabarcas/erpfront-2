export interface ServicioProgramadoInsumo {
  id: string;
  insumo: {
    id: string;
    nombre: string;
  };
  cantidad: number;
}

export interface ServicioProgramado {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  servicio: {
    id: string;
    nombre: string;
    totalHoras?: number;
  };
  estado: string;
  fechaInicioEstimada: string;
  fechaFinEstimada: string | null;
  totalHoras: number;
  insumos: ServicioProgramadoInsumo[];
  notas: string;
  motivoEstado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramadoInsumoDto {
  insumoId: string;
  cantidad: number;
}

export interface CreateProgramadoDto {
  customerId: string;
  servicioId: string;
  fechaInicioEstimada: string;
  insumos?: CreateProgramadoInsumoDto[];
  notas?: string;
}

export interface QueryProgramadosDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  estado?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ChangeStateDto {
  estado: string;
  motivo?: string;
}

export interface CancelDto {
  motivo: string;
}
