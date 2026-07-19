import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { OperationsProgrammingPageComponent } from './operations-programacion-page.component';
import { ProgrammingService } from '../../../../services/programming.service';
import { CustomerService } from '../../../../services/customer.service';
import { ServiceService } from '../../../../services/service.service';
import { ServicioProgramado, ChangeStateDto, CancelDto } from '../../../../models/programming.model';
import { Customer } from '../../../../models/customer.model';
import { Service } from '../../../../models/service.model';

// Helper to create a mock service with spy methods
function createMockService(methods: string[], props: Record<string, unknown>): Record<string, unknown> {
  const mock: Record<string, unknown> = {};
  for (const method of methods) {
    (mock as Record<string, unknown>)[method] = vi.fn();
  }
  for (const [key, value] of Object.entries(props)) {
    (mock as Record<string, unknown>)[key] = value;
  }
  return mock;
}

describe('OperationsProgrammingPageComponent', () => {
  let component: OperationsProgrammingPageComponent;
  let fixture: ComponentFixture<OperationsProgrammingPageComponent>;
  let programmingService: ProgrammingService;
  let customerService: CustomerService;
  let serviceService: ServiceService;

  const mockProgramados: ServicioProgramado[] = [
    {
      id: 'prog-1',
      customer: { id: 'cust-1', name: 'Cliente 1' },
      servicio: { id: 'serv-1', nombre: 'Servicio 1', totalHoras: 16 },
      estado: 'PENDIENTE',
      fechaInicioEstimada: '2026-01-12T08:00:00Z',
      fechaFinEstimada: '2026-01-13T17:00:00Z',
      totalHoras: 16,
      actividades: [
        { id: 'act-1', actividadNombre: 'Actividad 1', actividadHorasEstimadas: 4 },
        { id: 'act-2', actividadNombre: 'Actividad 2', actividadHorasEstimadas: 6 },
        { id: 'act-3', actividadNombre: 'Actividad 3', actividadHorasEstimadas: 3 },
        { id: 'act-4', actividadNombre: 'Actividad 4', actividadHorasEstimadas: 3 },
      ],
      insumos: [],
      notas: '',
      motivoEstado: '',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'prog-2',
      customer: { id: 'cust-2', name: 'Cliente 2' },
      servicio: { id: 'serv-2', nombre: 'Servicio 2', totalHoras: 8 },
      estado: 'INICIADO',
      fechaInicioEstimada: '2026-01-13T08:00:00Z',
      fechaFinEstimada: '2026-01-13T17:00:00Z',
      totalHoras: 8,
      actividades: [
        { id: 'act-5', actividadNombre: 'Actividad 5', actividadHorasEstimadas: 4 },
        { id: 'act-6', actividadNombre: 'Actividad 6', actividadHorasEstimadas: 4 },
      ],
      insumos: [{ id: 'pin-1', insumo: { id: 'ins-1', nombre: 'Insumo A' }, cantidad: 2 }],
      notas: 'Notas de prueba',
      motivoEstado: '',
      createdAt: '2026-01-10T11:00:00Z',
      updatedAt: '2026-01-10T11:00:00Z',
    },
  ];

  const mockClientes: Customer[] = [
    { id: 'cust-1', name: 'Cliente 1', documentType: 'CC', documentNumber: '123', status: 'ACTIVE', phone: '123', address: 'dir', createdAt: '', updatedAt: '' },
    { id: 'cust-2', name: 'Cliente 2', documentType: 'CC', documentNumber: '456', status: 'ACTIVE', phone: '456', address: 'dir', createdAt: '', updatedAt: '' },
  ];

  const mockServicios: Service[] = [
    { id: 'serv-1', nombre: 'Servicio 1', precioBase: 100, isActive: true, createdAt: '', updatedAt: '', totalHoras: 16 },
    { id: 'serv-2', nombre: 'Servicio 2', precioBase: 200, isActive: true, createdAt: '', updatedAt: '', totalHoras: 8 },
  ];

  beforeEach(async () => {
    const programmingSpy = createMockService(
      ['loadProgramados', 'changeState', 'cancelProgramado'],
      {
        data: of(mockProgramados),
        meta: of({ total: 2, page: 1, lastPage: 1, limit: 10 }),
        loading: of(false),
      }
    );

    const customerSpy = createMockService(
      ['loadCustomers'],
      {
        customers: of(mockClientes),
      }
    );

    const serviceSpy = createMockService(
      ['loadServices'],
      {
        services: of(mockServicios),
      }
    );

    const dialogOpenMock = vi.fn().mockReturnValue({
      afterClosed: () => of(false),
    } as any);

    await TestBed.configureTestingModule({
      imports: [
        OperationsProgrammingPageComponent,
        MatSnackBarModule,
        RouterTestingModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ProgrammingService, useValue: programmingSpy },
        { provide: CustomerService, useValue: customerSpy },
        { provide: ServiceService, useValue: serviceSpy },
        { provide: MatDialog, useValue: { open: dialogOpenMock } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsProgrammingPageComponent);
    component = fixture.componentInstance;
    programmingService = TestBed.inject(ProgrammingService);
    customerService = TestBed.inject(CustomerService);
    serviceService = TestBed.inject(ServiceService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(programmingService.loadProgramados).toHaveBeenCalled();
  });

  it('should have estado options', () => {
    expect(component.estadoOptions.length).toBe(6);
    expect(component.estadoOptions[0].label).toBe('Todos');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2026-01-12T08:00:00Z');
    expect(formatted).toBeTruthy();
    expect(formatted).toContain('2026');
  });

  it('should return empty string for null date', () => {
    const formatted = component.formatDate('');
    expect(formatted).toBe('—');
  });

  it('should get estado badge class', () => {
    expect(component.getEstadoBadgeClass('PENDIENTE')).toContain('yellow');
    expect(component.getEstadoBadgeClass('INICIADO')).toContain('blue');
    expect(component.getEstadoBadgeClass('PAUSADO')).toContain('orange');
    expect(component.getEstadoBadgeClass('FINALIZADO')).toContain('green');
    expect(component.getEstadoBadgeClass('CANCELADO')).toContain('red');
  });

  it('should get total horas text', () => {
    expect(component.getTotalHorasText(16)).toBe('16h');
    expect(component.getTotalHorasText(8.5)).toBe('8h 30m');
    expect(component.getTotalHorasText(0)).toBe('—');
    expect(component.getTotalHorasText(null as any)).toBe('—');
  });

  it('should get activity count from actividades array', () => {
    const programado = mockProgramados[0];
    expect(component.getActivityCount(programado)).toBe(4);
  });

  it('should return 0 when actividades is empty', () => {
    const programado = mockProgramados[1];
    programado.actividades = [];
    expect(component.getActivityCount(programado)).toBe(0);
  });

  it('should clear filters and reload', () => {
    component.estadoFilter.set('PENDIENTE');
    component.clienteFilter.set('cust-1');
    component.clearFilters();
    expect(component.estadoFilter()).toBe('');
    expect(component.clienteFilter()).toBe('');
  });

  it('should open schedule dialog', () => {
    const dialogSpy = TestBed.inject(MatDialog);
    component.openScheduleDialog();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should change estado via dialog confirmation', () => {
    const dialogSpy = TestBed.inject(MatDialog);
    (dialogSpy.open as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      afterClosed: () => of(true),
    } as any);

    component.changeEstado(mockProgramados[0], 'INICIADO');

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should cancel programado via dialog confirmation', () => {
    const dialogSpy = TestBed.inject(MatDialog);
    (dialogSpy.open as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      afterClosed: () => of(true),
    } as any);

    component.cancelProgramado(mockProgramados[0]);

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should handle empty programados list', () => {
    programmingService.data = of([]) as any;
    component.programados = programmingService.data;
    fixture.detectChanges();
    expect(component.programados()).toEqual([]);
  });

  describe('debouncedFilter', () => {
    it('should clear previous timer before starting new one', fakeAsync(() => {
      const loadDataSpy = vi.spyOn(component, 'loadData');
      const setTimeoutSpy = vi.spyOn(globalThis.window as any, 'setTimeout');

      // First call
      component.debouncedFilter();
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

      // Second call should clear previous timer
      component.debouncedFilter();
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);

      // Wait for the delay
      tick(500);

      // loadData should be called once after the last timer
      expect(loadDataSpy).toHaveBeenCalledTimes(1);
    }));

    it('should call loadData after 400ms delay', fakeAsync(() => {
      const loadDataSpy = vi.spyOn(component, 'loadData');

      component.debouncedFilter();
      expect(loadDataSpy).not.toHaveBeenCalled();

      tick(400);
      expect(loadDataSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('isDateRangeValid', () => {
    it('should return true when no dates are set', () => {
      component.dateFromFilter.set('');
      component.dateToFilter.set('');
      expect(component.isDateRangeValid()).toBe(true);
    });

    it('should return true when dates are valid (from <= to)', () => {
      component.dateFromFilter.set('2026-01-10');
      component.dateToFilter.set('2026-01-15');
      expect(component.isDateRangeValid()).toBe(true);
    });

    it('should return false when dates are invalid (from > to)', () => {
      component.dateFromFilter.set('2026-01-15');
      component.dateToFilter.set('2026-01-10');
      expect(component.isDateRangeValid()).toBe(false);
    });
  });

  describe('date range validation error', () => {
    it('should show error message when date range is invalid', () => {
      component.dateFromFilter.set('2026-01-15');
      component.dateToFilter.set('2026-01-10');
      fixture.detectChanges();

      const errorMessages = fixture.nativeElement.querySelectorAll('.text-red-500');
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should not show error message when date range is valid', () => {
      component.dateFromFilter.set('2026-01-10');
      component.dateToFilter.set('2026-01-15');
      fixture.detectChanges();

      const errorMessages = fixture.nativeElement.querySelectorAll('.text-red-500');
      expect(errorMessages.length).toBe(0);
    });
  });
});
