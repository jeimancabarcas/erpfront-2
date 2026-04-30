export type VehicleStatus = 'Available' | 'InRoute' | 'Committed' | 'Workshop';

export interface Vehicle {
  id: string; // Plate
  model: string;
  type: string;
  driverName: string;
  status: VehicleStatus;
  standbyRate: number; // Hourly rate for standby time
  lastService: string;
  nextService: string;
  maintenanceHistory?: VehicleMaintenance[];
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  type: 'Preventivo' | 'Correctivo' | 'Inspección' | 'Otros';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'Scheduled' | 'InProcess' | 'Completed' | 'Cancelled';
  attachments?: string[];
  cost?: number;
}

export interface TransportServiceDefinition {
  id: string;
  name: string; // e.g., "Ruta Nacional Bogotá - Medellín"
  basePrice: number;
  expectedDays: number;
}

export interface RouteMilestone {
  id: string;
  name: string;
  timestamp: string;
  status: 'Pending' | 'Completed';
}

export type OperationType = 'Cargue' | 'Descargue' | 'Consolidacion' | 'Desconsolidacion';

export interface TransportOperation {
  id: string;
  type: OperationType;
  timestamp: string;
  vehicleId?: string; // Optional for most, but relevant for Cargue as per requirements
  description: string;
  status: 'InProcess' | 'Completed' | 'Cancelled';
  attachments?: string[]; // Array of filenames or URLs
}

export interface TransportExpense {
  id: string;
  type: 'Peaje' | 'Combustible' | 'Viáticos' | 'Mantenimiento' | 'Otros';
  amount: number;
  description: string;
  timestamp: string;
  attachments?: string[];
}

export interface TransportIncident {
  id: string;
  type: 'Cambio de Vehículo' | 'Retraso' | 'Accidente' | 'Clima' | 'Otros';
  description: string;
  timestamp: string;
  previousVehicleId?: string;
  newVehicleId?: string;
  reportedBy: string;
}

export interface TransportRoute {
  id: string;
  origin: string;
  destination: string;
  customerName: string;
  vehicleId: string;
  driverName: string;
  departureDate: string; // ISO string including time
  servicePrice: number;
  standbyHours: number;
  standbyTotal: number;
  status: 'Planning' | 'Active' | 'Completed' | 'Settled' | 'Cancelled';
  cancellationNotes?: string;
  currentMilestone?: string;
  milestones: RouteMilestone[];
  operations: TransportOperation[];
  detailedExpenses: TransportExpense[];
  incidents: TransportIncident[];
}

export interface TransportSettlement {
  routeId: string;
  vehicleId: string;
  totalExpenses: number;
  recordedTolls: number;
  recordedFuel: number;
  recordedAllowances: number;
  status: 'Pending' | 'Closed';
}
