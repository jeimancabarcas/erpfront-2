import { Injectable, signal, computed } from '@angular/core';
import { Vehicle, TransportRoute, TransportServiceDefinition, VehicleStatus, TransportOperation, TransportExpense, TransportIncident, VehicleMaintenance } from '../models/transport.model';

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
      origin: 'Bogotá, DC',
      destination: 'Medellín, ANT',
      vehicleId: 'ABC-456',
      driverName: 'Juan Perez',
      customerName: 'Distribuidora Nacional S.A.',
      servicePrice: 1500000,
      standbyHours: 4,
      standbyTotal: 140000, // 4 * 35000
      departureDate: '2026-04-27T08:00:00',
      status: 'Active',
      milestones: [],
      operations: [],
      detailedExpenses: [],
      incidents: []
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
    this._routes.update(items => [{ 
      ...route, 
      operations: route.operations || [],
      detailedExpenses: route.detailedExpenses || [],
      incidents: route.incidents || []
    }, ...items]);
    if (route.vehicleId) {
      this.updateVehicleStatus(route.vehicleId, 'Committed');
    }
  }

  addOperation(routeId: string, operation: Omit<TransportOperation, 'id'>) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        const newOp: TransportOperation = { 
          ...operation, 
          id: `OP-${Math.floor(Math.random() * 10000)}`,
          timestamp: operation.timestamp || new Date().toISOString()
        };

        let updatedVehicleId = r.vehicleId;
        let updatedDriverName = r.driverName;

        // If a new operation starts in process and has a vehicle, it takes over the service
        if (newOp.status === 'InProcess' && newOp.vehicleId) {
          updatedVehicleId = newOp.vehicleId;
          const v = this._vehicles().find(vh => vh.id === updatedVehicleId);
          updatedDriverName = v?.driverName || updatedDriverName;
        }

        return { 
          ...r, 
          vehicleId: updatedVehicleId,
          driverName: updatedDriverName,
          operations: [...(r.operations || []), newOp] 
        };
      }
      return r;
    }));
  }

  updateOperationStatus(routeId: string, operationId: string, status: 'InProcess' | 'Completed' | 'Cancelled', notes?: string) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        let updatedVehicleId = r.vehicleId;
        let updatedDriverName = r.driverName;

        const operations = r.operations.map(op => {
          if (op.id === operationId) {
            const description = notes ? `${op.description} | Notas: ${notes}` : op.description;
            const updatedOp = { 
              ...op, 
              status, 
              description,
              timestamp: new Date().toISOString() 
            };
            
            if (status === 'InProcess' && updatedOp.vehicleId) {
              updatedVehicleId = updatedOp.vehicleId;
              const v = this._vehicles().find(vh => vh.id === updatedVehicleId);
              updatedDriverName = v?.driverName || updatedDriverName;
            }
            
            return updatedOp;
          }
          return op;
        });

        return { 
          ...r, 
          vehicleId: updatedVehicleId,
          driverName: updatedDriverName,
          operations 
        };
      }
      return r;
    }));
  }

  addExpense(routeId: string, expense: Omit<TransportExpense, 'id' | 'timestamp'>) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        const newExp: TransportExpense = {
          ...expense,
          id: `EXP-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString()
        };

        return { 
          ...r, 
          detailedExpenses: [...(r.detailedExpenses || []), newExp]
        };
      }
      return r;
    }));
  }

  startRoute(vehicleId: string) {
    this.updateVehicleStatus(vehicleId, 'InRoute');
    this._routes.update(items => items.map(r => 
      (r.vehicleId === vehicleId && r.status === 'Planning') ? { ...r, status: 'Active' } : r
    ));
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

  cancelRoute(routeId: string, notes: string) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        this.updateVehicleStatus(r.vehicleId, 'Available');
        return { ...r, status: 'Cancelled', cancellationNotes: notes };
      }
      return r;
    }));
  }

  addIncident(routeId: string, incident: Omit<TransportIncident, 'id' | 'timestamp'>) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        const newIncident: TransportIncident = {
          ...incident,
          id: `INC-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString()
        };
        return { 
          ...r, 
          incidents: [...(r.incidents || []), newIncident] 
        };
      }
      return r;
    }));
  }

  changeVehicle(routeId: string, newVehicleId: string, reason: string) {
    this._routes.update(items => items.map(r => {
      if (r.id === routeId) {
        const previousVehicleId = r.vehicleId;
        
        // Update vehicle statuses
        this.updateVehicleStatus(previousVehicleId, 'Available');
        this.updateVehicleStatus(newVehicleId, r.status === 'Planning' ? 'Committed' : 'InRoute');

        const incident: TransportIncident = {
          id: `INC-${Math.floor(Math.random() * 10000)}`,
          type: 'Cambio de Vehículo',
          description: reason,
          timestamp: new Date().toISOString(),
          previousVehicleId,
          newVehicleId,
          reportedBy: 'Sistema'
        };

        const newVehicle = this._vehicles().find(v => v.id === newVehicleId);

        return { 
          ...r, 
          vehicleId: newVehicleId,
          driverName: newVehicle?.driverName || r.driverName,
          incidents: [...(r.incidents || []), incident] 
        };
      }
      return r;
    }));
  }

  addMaintenanceAttachment(vehicleId: string, maintenanceId: string, filename: string) {
    this._vehicles.update(items => items.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: v.maintenanceHistory?.map(m => 
            m.id === maintenanceId ? { ...m, attachments: [...(m.attachments || []), filename] } : m
          )
        };
      }
      return v;
    }));
  }

  scheduleMaintenance(maintenance: Omit<VehicleMaintenance, 'id'>) {
    this._vehicles.update(items => items.map(v => {
      const m = maintenance as any;
      if (v.id === m.vehicleId) {
        const newMaint: VehicleMaintenance = {
          ...maintenance,
          id: `MAINT-${Math.floor(Math.random() * 10000)}`
        };
        return {
          ...v,
          maintenanceHistory: [...(v.maintenanceHistory || []), newMaint]
        };
      }
      return v;
    }));
  }

  updateMaintenanceStatus(vehicleId: string, maintenanceId: string, status: VehicleMaintenance['status']) {
    this._vehicles.update(items => items.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: v.maintenanceHistory?.map(m => 
            m.id === maintenanceId ? { 
              ...m, 
              status, 
              completedDate: status === 'Completed' ? new Date().toISOString() : m.completedDate 
            } : m
          )
        };
      }
      return v;
    }));
  }
}
