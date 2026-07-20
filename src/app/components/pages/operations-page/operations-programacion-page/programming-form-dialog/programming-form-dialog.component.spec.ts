// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { ProgrammingFormDialogComponent } from './programming-form-dialog.component';
import { ProgrammingService } from '../../../../../services/programming.service';
import { CustomerService } from '../../../../../services/customer.service';
import { ServiceService } from '../../../../../services/service.service';
import { SupplyService } from '../../../../../services/supply.service';
import { Customer } from '../../../../../models/customer.model';
import { Service } from '../../../../../models/service.model';
import { Supply } from '../../../../../models/supply.model';
import { calculateBusinessHoursEnd } from '../../../../../shared/utils/business-hours.utils';

// Initialize Angular testing environment if not already initialized
try {
  TestBed.initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}

describe('ProgrammingFormDialogComponent', () => {
  let component: ProgrammingFormDialogComponent;
  let fixture: ComponentFixture<ProgrammingFormDialogComponent>;
  let programmingService: ProgrammingService;
  let snackBar: MatSnackBar;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };
  let matDialogSpy: { open: ReturnType<typeof vi.fn> };

  const mockClientes: Customer[] = [
    { id: 'cust-1', name: 'Cliente 1', documentType: 'CC', documentNumber: '123', status: 'ACTIVE', phone: '123', address: 'dir', createdAt: '', updatedAt: '' },
    { id: 'cust-2', name: 'Cliente 2', documentType: 'NIT', documentNumber: '456', status: 'ACTIVE', phone: '456', address: 'dir', createdAt: '', updatedAt: '' },
  ];

  const mockServicios: Service[] = [
    { id: 'serv-1', nombre: 'Servicio 1', precioBase: 100, isActive: true, createdAt: '', updatedAt: '', totalHoras: 16 },
    { id: 'serv-2', nombre: 'Servicio 2', precioBase: 200, isActive: true, createdAt: '', updatedAt: '', totalHoras: 8 },
  ];

  const mockInsumos: Supply[] = [
    { id: 'ins-1', nombre: 'Insumo 1', isActive: true, createdAt: '', updatedAt: '' },
    { id: 'ins-2', nombre: 'Insumo 2', isActive: true, createdAt: '', updatedAt: '' },
  ];

  let createProgramadoMock: ReturnType<typeof vi.fn>;
  let mockProgrammingService: Record<string, unknown>;
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    dialogRefSpy = { close: vi.fn() };
    matDialogSpy = { open: vi.fn(() => ({ afterClosed: vi.fn(() => of(false)) })) };
    createProgramadoMock = vi.fn().mockReturnValue(of({} as any));
    mockSnackBar = { open: vi.fn() };

    mockProgrammingService = {
      createProgramado: createProgramadoMock,
      data: signal([]),
      meta: signal(null),
      loading: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProgrammingFormDialogComponent,
        MatDialogModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: ProgrammingService, useValue: mockProgrammingService },
        {
          provide: CustomerService,
          useValue: {
            loadCustomers: () => of({}),
            customers: signal(mockClientes),
          },
        },
        {
          provide: ServiceService,
          useValue: {
            loadServices: () => of({}),
            services: signal(mockServicios),
            getServiceActivities: () => of([]),
          },
        },
        {
          provide: SupplyService,
          useValue: {
            loadSupplies: () => of({}),
            supplies: signal(mockInsumos),
          },
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgrammingFormDialogComponent);
    component = fixture.componentInstance;
    programmingService = TestBed.inject(ProgrammingService);
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  });

  afterEach(() => {
    createProgramadoMock.mockClear();
    mockSnackBar.open.mockClear();
    dialogRefSpy.close.mockClear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default fechaInicio', () => {
    const fechaInicio = component.formGroup.get('fechaInicioEstimada');
    expect(fechaInicio).toBeTruthy();
    expect(fechaInicio?.value).toBeTruthy();
  });

  it('should have required validators on customerId', () => {
    const customerId = component.formGroup.get('customerId');
    expect(customerId?.hasError('required')).toBeTruthy();
    customerId?.setValue('cust-1');
    expect(customerId?.hasError('required')).toBeFalsy();
  });

  it('should have required validators on servicioId', () => {
    const servicioId = component.formGroup.get('servicioId');
    expect(servicioId?.hasError('required')).toBeTruthy();
    servicioId?.setValue('serv-1');
    expect(servicioId?.hasError('required')).toBeFalsy();
  });

  it('should have maxLength validator on notas', () => {
    const notas = component.formGroup.get('notas');
    notas?.setValue('a'.repeat(2001));
    expect(notas?.hasError('maxlength')).toBeTruthy();
  });

  it('should start with zero added insumos', () => {
    expect(component.insumosCount()).toBe(0);
  });

  it('should get selected servicio', () => {
    component.formGroup.get('servicioId')?.setValue('serv-1');
    const selected = component.getSelectedServicio();
    expect(selected?.id).toBe('serv-1');
    expect(selected?.nombre).toBe('Servicio 1');
  });

  it('should return total horas preview', () => {
    component.formGroup.get('servicioId')?.setValue('serv-1');
    expect(component.getTotalHorasPreview()).toBe(16);
  });

  it('should submit form and call createProgramado without insumos', () => {
    component.formGroup.get('customerId')?.setValue('cust-1');
    component.formGroup.get('servicioId')?.setValue('serv-1');
    component.formGroup.get('fechaInicioEstimada')?.setValue('2026-01-12T08:00');

    createProgramadoMock.mockReturnValue(of({
      id: 'new-prog',
      customer: mockClientes[0],
      servicio: mockServicios[0],
      estado: 'PENDIENTE',
      fechaInicioEstimada: '2026-01-12T08:00:00Z',
      fechaFinEstimada: '2026-01-13T17:00:00Z',
      totalHoras: 16,
      insumos: [],
      notas: '',
      motivoEstado: '',
      createdAt: '',
      updatedAt: '',
    } as any));

    component.onSubmit();

    expect(programmingService.createProgramado).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should submit form with insumos when addedInsumos has items', () => {
    component.formGroup.get('customerId')?.setValue('cust-1');
    component.formGroup.get('servicioId')?.setValue('serv-1');
    component.formGroup.get('fechaInicioEstimada')?.setValue('2026-01-12T08:00');

    // Simulate adding insumos via the signal
    component['_addedInsumos'].set([
      { supplyId: 'ins-1', name: 'Insumo 1', quantity: 2 },
      { supplyId: 'ins-2', name: 'Insumo 2', quantity: 1 },
    ]);

    createProgramadoMock.mockReturnValue(of({
      id: 'new-prog',
      customer: mockClientes[0],
      servicio: mockServicios[0],
      estado: 'PENDIENTE',
      fechaInicioEstimada: '2026-01-12T08:00:00Z',
      fechaFinEstimada: '2026-01-13T17:00:00Z',
      totalHoras: 16,
      insumos: [],
      notas: '',
      motivoEstado: '',
      createdAt: '',
      updatedAt: '',
    } as any));

    component.onSubmit();

    const callArgs = (programmingService.createProgramado as any).mock.calls[0][0];
    expect(callArgs.insumos).toHaveLength(2);
    expect(callArgs.insumos[0].insumoId).toBe('ins-1');
    expect(callArgs.insumos[0].cantidad).toBe(2);
    expect(callArgs.insumos[1].insumoId).toBe('ins-2');
    expect(callArgs.insumos[1].cantidad).toBe(1);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should not submit when form is invalid', () => {
    component.formGroup.get('customerId')?.setValue('');
    component.formGroup.get('servicioId')?.setValue('');
    component.onSubmit();
    expect(programmingService.createProgramado).not.toHaveBeenCalled();
  });

  it('should handle create error', () => {
    component.formGroup.get('customerId')?.setValue('cust-1');
    component.formGroup.get('servicioId')?.setValue('serv-1');
    component.formGroup.get('fechaInicioEstimada')?.setValue('2026-01-12T08:00');

    const mockError = new Error('Server error');
    createProgramadoMock.mockReturnValue(
      new Observable(observer => observer.error(mockError))
    );

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should calculate business hours end correctly (16h from Monday 08:00 = Tuesday 15:00)', () => {
    const start = new Date('2026-01-12T08:00:00');
    const result = calculateBusinessHoursEnd({ totalHours: 16, startDateTime: start });
    expect(result.getDay()).toBe(2);
    expect(result.getHours()).toBe(15);
  });

  it('should skip weekends (Friday 16:00 + 8h = Monday 15:00)', () => {
    const start = new Date('2026-01-16T16:00:00');
    const result = calculateBusinessHoursEnd({ totalHours: 8, startDateTime: start });
    expect(result.getDay()).toBe(1);
    expect(result.getHours()).toBe(15);
  });

  it('should handle zero or negative hours (returns start)', () => {
    const start = new Date('2026-01-12T10:00:00');
    expect(calculateBusinessHoursEnd({ totalHours: 0, startDateTime: start }).getTime()).toBe(start.getTime());
    expect(calculateBusinessHoursEnd({ totalHours: -5, startDateTime: start }).getTime()).toBe(start.getTime());
  });

  it('should handle fractional hours (1.5h from Monday 08:00 = Monday 09:30)', () => {
    const start = new Date('2026-01-12T08:00:00');
    const result = calculateBusinessHoursEnd({ totalHours: 1.5, startDateTime: start });
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });

  it('should handle service options mapping', () => {
    const options = component.servicioOptions;
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('serv-1');
    expect(options[0].label).toBe('Servicio 1');
  });

  it('should handle cliente options mapping', () => {
    const options = component.clienteOptions;
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('cust-1');
    expect(options[0].label).toBe('Cliente 1');
  });

  it('should open create customer dialog when footerAction is triggered', () => {
    component.openCreateCustomerDialog();
    expect(matDialogSpy.open).toHaveBeenCalled();
  });

  it('should open create service dialog when footerAction is triggered', () => {
    component.openCreateServiceDialog();
    expect(matDialogSpy.open).toHaveBeenCalled();
  });

  it('should open add insumo dialog when openAddInsumoDialog is called', () => {
    component.openAddInsumoDialog();
    expect(matDialogSpy.open).toHaveBeenCalled();
    const openCall = (matDialogSpy.open as any).mock.calls[0][0];
    expect(openCall).toBeDefined();
  });

  it('should add insumo when dialog returns result', () => {
    let resultCallback: any;
    (matDialogSpy.open as any).mockReturnValue({
      afterClosed: vi.fn(() => {
        resultCallback = { supplyId: 'ins-1', name: 'Insumo 1', quantity: 3 };
        return of(resultCallback);
      }),
    });

    component.openAddInsumoDialog();

    expect(component.insumosCount()).toBe(1);
    expect(component.addedInsumos()[0].supplyId).toBe('ins-1');
    expect(component.addedInsumos()[0].name).toBe('Insumo 1');
    expect(component.addedInsumos()[0].quantity).toBe(3);
  });

  it('should edit insumo when dialog returns result', () => {
    // Pre-populate with one insumo
    component['_addedInsumos'].set([
      { supplyId: 'ins-1', name: 'Insumo 1', quantity: 2 },
    ]);

    let resultCallback: any;
    (matDialogSpy.open as any).mockReturnValue({
      afterClosed: vi.fn(() => {
        resultCallback = { supplyId: 'ins-2', name: 'Insumo 2', quantity: 5 };
        return of(resultCallback);
      }),
    });

    component.openEditInsumoDialog(0);

    expect(component.insumosCount()).toBe(1);
    expect(component.addedInsumos()[0].supplyId).toBe('ins-2');
    expect(component.addedInsumos()[0].name).toBe('Insumo 2');
    expect(component.addedInsumos()[0].quantity).toBe(5);
  });

  it('should remove insumo by index', () => {
    component['_addedInsumos'].set([
      { supplyId: 'ins-1', name: 'Insumo 1', quantity: 2 },
      { supplyId: 'ins-2', name: 'Insumo 2', quantity: 1 },
    ]);

    component.removeInsumo(0);

    expect(component.insumosCount()).toBe(1);
    expect(component.addedInsumos()[0].supplyId).toBe('ins-2');
  });

  it('should not add insumo when dialog returns undefined', () => {
    (matDialogSpy.open as any).mockReturnValue({
      afterClosed: vi.fn(() => of(undefined)),
    });

    component.openAddInsumoDialog();

    expect(component.insumosCount()).toBe(0);
  });

  it('should not edit insumo when dialog returns undefined', () => {
    component['_addedInsumos'].set([
      { supplyId: 'ins-1', name: 'Insumo 1', quantity: 2 },
    ]);

    (matDialogSpy.open as any).mockReturnValue({
      afterClosed: vi.fn(() => of(undefined)),
    });

    component.openEditInsumoDialog(0);

    expect(component.insumosCount()).toBe(1);
    expect(component.addedInsumos()[0].supplyId).toBe('ins-1');
  });

  // ── Inline Edit Tests ──

  // Helpers to pre-populate activities for edit tests
  const createActivity = (id: string, nombre: string, horasEstimadas: number | null) => ({
    actividadId: id,
    nombre,
    horasEstimadas,
  });

  describe('inline edit — nombre', () => {
    beforeEach(() => {
      component['_addedActividades'].set([
        createActivity('act-1', 'Actividad 1', 2),
      ]);
    });

    it('edit nombre: blur saves the value', async () => {
      component.startEdit(0, 'nombre');
      expect(component.editingIndex()).toBe(0);
      expect(component.editField()).toBe('nombre');
      expect(component.editValue().nombre).toBe('Actividad 1');

      component.editValue.set({ nombre: 'Actividad 1 Editada' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].nombre).toBe('Actividad 1 Editada');
      expect(component.editingIndex()).toBeNull();
    });

    it('edit nombre: Enter key saves', async () => {
      component.startEdit(0, 'nombre');
      component.editValue.set({ nombre: 'Actividad Editada Enter' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].nombre).toBe('Actividad Editada Enter');
      expect(component.editingIndex()).toBeNull();
    });

    it('edit nombre: Escape key cancels', () => {
      component.startEdit(0, 'nombre');
      component.editValue.set({ nombre: 'Cancelado' });
      component.cancelEdit();

      expect(component.editingIndex()).toBeNull();
      expect(component.editField()).toBeNull();
      // Original value should be preserved
      expect(component.addedActividades()[0].nombre).toBe('Actividad 1');
    });

    it('edit nombre: empty string rejected (snackbar shown)', () => {
      component.startEdit(0, 'nombre');
      component.editValue.set({ nombre: '' });
      component.saveEdit();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'El nombre no puede estar vacío y debe tener máximo 255 caracteres',
        'Cerrar',
        expect.any(Object)
      );
      // Edit state should persist (not saved)
      expect(component.editingIndex()).toBe(0);
    });

    it('edit nombre: >255 chars rejected', () => {
      const longName = 'a'.repeat(256);
      component.startEdit(0, 'nombre');
      component.editValue.set({ nombre: longName });
      component.saveEdit();

      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.editingIndex()).toBe(0);
    });

    it('edit nombre: valid save updates _addedActividades', async () => {
      component.startEdit(0, 'nombre');
      component.editValue.set({ nombre: 'Nuevo Nombre' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].nombre).toBe('Nuevo Nombre');
      expect(component.editingIndex()).toBeNull();
    });
  });

  describe('inline edit — horasEstimadas', () => {
    beforeEach(() => {
      component['_addedActividades'].set([
        createActivity('act-1', 'Actividad Horas', 3),
      ]);
    });

    it('edit horas: blur saves the value', async () => {
      component.startEdit(0, 'horasEstimadas');
      expect(component.editingIndex()).toBe(0);
      expect(component.editField()).toBe('horasEstimadas');
      expect(component.editValue().horasEstimadas).toBe('3');

      component.editValue.set({ horasEstimadas: '5' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].horasEstimadas).toBe(5);
      expect(component.editingIndex()).toBeNull();
    });

    it('edit horas: Enter key saves', async () => {
      component.startEdit(0, 'horasEstimadas');
      component.editValue.set({ horasEstimadas: '7' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].horasEstimadas).toBe(7);
      expect(component.editingIndex()).toBeNull();
    });

    it('edit horas: Escape key cancels', () => {
      component.startEdit(0, 'horasEstimadas');
      component.editValue.set({ horasEstimadas: '99' });
      component.cancelEdit();

      expect(component.editingIndex()).toBeNull();
      expect(component.addedActividades()[0].horasEstimadas).toBe(3);
    });

    it('edit horas: negative value rejected (snackbar shown)', () => {
      component.startEdit(0, 'horasEstimadas');
      component.editValue.set({ horasEstimadas: '-5' });
      component.saveEdit();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Las horas no pueden ser negativas',
        'Cerrar',
        expect.any(Object)
      );
      expect(component.editingIndex()).toBe(0);
    });

    it('edit horas: zero is allowed', async () => {
      component.startEdit(0, 'horasEstimadas');
      component.editValue.set({ horasEstimadas: '0' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].horasEstimadas).toBe(0);
      expect(component.editingIndex()).toBeNull();
    });

    it('edit horas: null is preserved', async () => {
      component['_addedActividades'].set([
        createActivity('act-2', 'Actividad Sin Horas', null),
      ]);
      component.startEdit(0, 'horasEstimadas');
      component.editValue.set({ horasEstimadas: null });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.addedActividades()[0].horasEstimadas).toBeNull();
      expect(component.editingIndex()).toBeNull();
    });

    it('edit horas: total hours recalculates', async () => {
      component.formGroup.get('servicioId')?.setValue('serv-1');
      // Wait for service activity loading to complete
      await fixture.whenStable();
      // Now set activities manually (loadActivitiesForService may have replaced them)
      component['_addedActividades'].set([
        createActivity('act-1', 'Act 1', 2),
        createActivity('act-2', 'Act 2', 3),
      ]);

      expect(component.getTotalHorasPreview()).toBe(16 + 2 + 3); // base 16 + 5

      component.startEdit(0, 'horasEstimadas');
      component.editValue.set({ horasEstimadas: '10' });
      component.saveEdit();

      await fixture.whenStable();
      expect(component.getTotalHorasPreview()).toBe(16 + 10 + 3); // base 16 + 10 + 3
    });
  });

  describe('inline edit — DTO submission', () => {
    beforeEach(() => {
      component.formGroup.get('customerId')?.setValue('cust-1');
      component.formGroup.get('servicioId')?.setValue('serv-1');
      component.formGroup.get('fechaInicioEstimada')?.setValue('2026-01-12T08:00');
    });

    it('submit: sends nombre in DTO actividades', () => {
      component['_addedActividades'].set([
        createActivity('act-1', 'Actividad Editada', 2),
      ]);

      component.onSubmit();

      const callArgs = (programmingService.createProgramado as any).mock.calls[0][0];
      expect(callArgs.actividades).toHaveLength(1);
      expect(callArgs.actividades[0].nombre).toBe('Actividad Editada');
    });

    it('submit: sends horasEstimadas in DTO actividades', () => {
      component['_addedActividades'].set([
        createActivity('act-1', 'Actividad Horas', 5),
      ]);

      component.onSubmit();

      const callArgs = (programmingService.createProgramado as any).mock.calls[0][0];
      expect(callArgs.actividades).toHaveLength(1);
      expect(callArgs.actividades[0].horasEstimadas).toBe(5);
    });
  });

  describe('inline edit — concurrent edit prevention', () => {
    beforeEach(() => {
      component['_addedActividades'].set([
        createActivity('act-1', 'Act 1', 2),
        createActivity('act-2', 'Act 2', 3),
      ]);
    });

    it('multiple concurrent edits: only one cell editable at a time', () => {
      component.startEdit(0, 'nombre');
      expect(component.editingIndex()).toBe(0);
      expect(component.editField()).toBe('nombre');

      // Try to start editing another cell
      component.startEdit(1, 'horasEstimadas');

      // The new edit should override the previous one
      expect(component.editingIndex()).toBe(1);
      expect(component.editField()).toBe('horasEstimadas');
    });
  });
});
