import { Injectable, signal, computed } from '@angular/core';
import { Vehicle, TransportRoute, TransportServiceDefinition, VehicleStatus } from '../models/transport.model';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private _serviceCatalog = signal<TransportServiceDefinition[]>([
    { id: 'S-001', name: 'Ruta Nacional Bogotá - Medellín', basePrice: 1500000, expectedDays: 2 },
    { id: 'S-002', name: 'Ruta Nacional Bogotá - Cali', basePrice: 1800000, expectedDays: 3 },
    { id: 'S-003', name: 'Ruta Costa Bogotá - Barranquilla', basePrice: 3200000, expectedDays: 5 },
    { id: 'S-004', name: 'Urbano Bogotá (Jornada Completa)', basePrice: 450000, expectedDays: 1 }
  ]);

  private _vehicles = signal<Vehicle[]>([
    { id: 'XYZ-123', model: 'Chevrolet NHR', type: 'Light Truck', driverName: 'Carlos Ruiz', status: 'Available', standbyRate: 25000, lastService: '2026-01-10', nextService: '2026-07-10' },
    { id: 'ABC-456', model: 'Hino 300', type: 'Medium Truck', driverName: 'Juan Perez', status: 'InRoute', standbyRate: 35000, lastService: '2026-02-15', nextService: '2026-08-15' },
    { id: 'DEF-789', model: 'Ford F-150', type: 'Pickup', driverName: 'Luis Gomez', status: 'Committed', standbyRate: 20000, lastService: '2026-03-05', nextService: '2026-09-05' },
    { id: 'GHI-012', model: 'Mitsubishi Fuso', type: 'Heavy Truck', driverName: 'Pedro Martinez', status: 'Workshop', standbyRate: 50000, lastService: '2025-12-20', nextService: '2026-06-20' },
    { id: 'JKL-345', model: 'Chevrolet NHR', type: 'Light Truck', driverName: 'Andres Castro', status: 'Available', standbyRate: 25000, lastService: '2026-04-01', nextService: '2026-10-01' }
  ]);

  private _routes = signal<TransportRoute[]>([
    {
      id: 'RT-001',
      serviceId: 'S-001',
      origin: 'Bogotá',
      destination: 'Medellín',
      vehicleId: 'ABC-456',
      driverName: 'Juan Perez',
      customerName: 'Distribuidora Nacional S.A.',
      durationDays: 2,
      servicePrice: 1500000,
      standbyHours: 4,
      standbyTotal: 140000, // 4 * 35000
      departureDate: '2026-04-27T08:00:00',
      expectedArrival: '2026-04-29T18:00:00',
      status: 'Active',
      currentMilestone: 'Paso por Peaje Guaduas',
      milestones: [
        { id: '1', name: 'Salida Bogotá', timestamp: '2026-04-27T08:15:00', status: 'Completed' as const },
        { id: '2', name: 'Paso por Peaje Guaduas', timestamp: '2026-04-27T11:30:00', status: 'Completed' as const },
        { id: '3', name: 'Llegada Medellín', timestamp: '', status: 'Pending' as const }
      ],
      expenses: { tolls: 45000, fuel: 120000, allowances: 50000 }
    }
  ]);

  // Read-only signals
  public vehicles = this._vehicles.asReadonly();
  public routes = this._routes.asReadonly();
  public catalog = this._serviceCatalog.asReadonly();

  // Dashboard Stats
  public stats = computed(() => {
    const list = this._vehicles();
    return [
      { label: 'Disponibles', count: list.filter(v => v.status === 'Available').length, color: 'emerald' },
      { label: 'En Ruta', count: list.filter(v => v.status === 'InRoute').length, color: 'blue' },
      { label: 'Comprometidos', count: list.filter(v => v.status === 'Committed').length, color: 'orange' },
      { label: 'En Taller', count: list.filter(v => v.status === 'Workshop').length, color: 'red' }
    ];
  });

  addRoute(route: TransportRoute) {
    this._routes.update(items => [route, ...items]);
    this.updateVehicleStatus(route.vehicleId, 'Committed');
  }

  startRoute(vehicleId: string) {
    this.updateVehicleStatus(vehicleId, 'InRoute');
  }

  updateMilestone(routeId: string, milestoneId: string) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        const milestones = r.milestones.map(m => 
          m.id === milestoneId ? { ...m, status: 'Completed' as const, timestamp: new Date().toISOString() } : m
        );
        const lastCompleted = milestones.filter(m => m.status === 'Completed').pop();
        return { ...r, milestones, currentMilestone: lastCompleted?.name };
      }
      return r;
    }));
  }

  updateVehicleStatus(vehicleId: string, status: VehicleStatus) {
    this._vehicles.update(list => 
      list.map(v => v.id === vehicleId ? { ...v, status } : v)
    );
  }

  settleVehicle(vehicleId: string) {
    const activeRoute = this._routes().find(r => r.vehicleId === vehicleId && r.status === 'Active');
    if (activeRoute) {
      this.settleRoute(activeRoute.id);
    } else {
      this.updateVehicleStatus(vehicleId, 'Available');
    }
  }

  settleRoute(routeId: string) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        this.updateVehicleStatus(r.vehicleId, 'Available');
        return { ...r, status: 'Settled' };
      }
      return r;
    }));
  }
}
