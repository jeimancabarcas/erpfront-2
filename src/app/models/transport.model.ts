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

export interface TransportRoute {
  id: string;
  serviceId: string;
  origin: string;
  destination: string;
  vehicleId: string;
  driverName: string;
  customerName: string;
  durationDays: number;
  servicePrice: number;
  standbyHours: number; // Hours exceeded from original schedule
  standbyTotal: number; // Total charge for standby
  departureDate: string;
  expectedArrival: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Settled';
  currentMilestone?: string;
  milestones: RouteMilestone[];
  expenses: {
    tolls: number;
    fuel: number;
    allowances: number;
  };
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
