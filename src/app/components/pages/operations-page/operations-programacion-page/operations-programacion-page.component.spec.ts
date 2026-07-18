import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { OperationsProgrammingPageComponent } from './operations-programacion-page.component';
import { ProgrammingService } from '../../../../services/programming.service';
import { CustomerService } from '../../../../services/customer.service';
import { ServiceService } from '../../../../services/service.service';
import { ServicioProgramado, ChangeStateDto, CancelDto } from '../../../../models/programming.model';
import { Customer } from '../../../../models/customer.model';
import { Service } from '../../../../models/service.model';

describe('OperationsProgrammingPageComponent', () => {
  let component: OperationsProgrammingPageComponent;
  let fixture: ComponentFixture<OperationsProgrammingPageComponent>;
  let programmingService: jasmine.SpyObj<ProgrammingService>;
  let customerService: jasmine.SpyObj<CustomerService>;
  let serviceService: jasmine.SpyObj<ServiceService>;

  const mockProgramados: ServicioProgramado[] = [
    {
      id: 'prog-1',
      customer: { id: 'cust-1', name: 'Cliente 1' },
      servicio: { id: 'serv-1', nombre: 'Servicio 1', totalHoras: 16 },
      estado: 'PENDIENTE',
      fechaInicioEstimada: '2026-01-12T08:00:00Z',
      fechaFinEstimada: '2026-01-13T17:00:00Z',
      totalHoras: 16,
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
      insumos: [{ id: 'pin-1', insumo: { id: 'ins-1', nombre: 'Insumo A' }, cantidad: 2 }],
      notas: 'Notas de prueba',
      motivoEstado: '',
      createdAt: '2026-01-10T11:00:00Z',
      updatedAt: '2026-01-10T11:00:00Z',
    },
  ];

  const mockClientes: Customer[] = [
    { id: 'cust-1', name: 'Cliente 1', documentType: 'CC', documentNumber: '123', status: 'ACTIVE', phone: '123', address: 'dir' },
    { id: 'cust-2', name: 'Cliente 2', documentType: 'CC', documentNumber: '456', status: 'ACTIVE', phone: '456', address: 'dir' },
  ];

  const mockServicios: Service[] = [
    { id: 'serv-1', nombre: 'Servicio 1', precioBase: 100, isActive: true, createdAt: '', updatedAt: '', totalHoras: 16 },
    { id: 'serv-2', nombre: 'Servicio 2', precioBase: 200, isActive: true, createdAt: '', updatedAt: '', totalHoras: 8 },
  ];

  beforeEach(async () => {
    const programmingSpy = jasmine.createSpyObj('ProgrammingService', ['loadProgramados', 'changeState', 'cancelProgramado'], {
      data: of(mockProgramados),
      meta: of({ total: 2, page: 1, lastPage: 1, limit: 10 }),
      loading: of(false),
    });
    const customerSpy = jasmine.createSpyObj('CustomerService', ['loadCustomers'], {
      customers: of(mockClientes),
    });
    const serviceSpy = jasmine.createSpyObj('ServiceService', ['loadServices'], {
      services: of(mockServicios),
    });

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
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(false) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsProgrammingPageComponent);
    component = fixture.componentInstance;
    programmingService = TestBed.inject(ProgrammingService) as jasmine.SpyObj<ProgrammingService>;
    customerService = TestBed.inject(CustomerService) as jasmine.SpyObj<CustomerService>;
    serviceService = TestBed.inject(ServiceService) as jasmine.SpyObj<ServiceService>;
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

  it('should get activity count from servicio', () => {
    const programado = mockProgramados[0];
    expect(component.getActivityCount(programado)).toBe(16);
  });

  it('should clear filters and reload', () => {
    component.estadoFilter.set('PENDIENTE');
    component.clienteFilter.set('cust-1');
    component.clearFilters();
    expect(component.estadoFilter()).toBe('');
    expect(component.clienteFilter()).toBe('');
  });

  it('should open schedule dialog', () => {
    const dialogSpy = (TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>).open;
    component.openScheduleDialog();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should change estado via dialog confirmation', () => {
    const dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(true),
    } as any);

    component.changeEstado(mockProgramados[0], 'INICIADO');

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should cancel programado via dialog confirmation', () => {
    const dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogSpy.open.and.returnValue({
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
      const loadDataSpy = spyOn(component, 'loadData');
      const setTimeoutSpy = spyOn(window, 'setTimeout');

      // First call
      component.debouncedFilter();
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

      // Second call should clear previous timer
      component.debouncedFilter();
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2); // Another setTimeout call

      // Wait for the delay
      tick(500);

      // loadData should be called once after the last timer
      expect(loadDataSpy).toHaveBeenCalledTimes(1);
    }));

    it('should call loadData after 400ms delay', fakeAsync(() => {
      const loadDataSpy = spyOn(component, 'loadData');

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
      // No error messages should be present
      expect(errorMessages.length).toBe(0);
    });
  });
});
