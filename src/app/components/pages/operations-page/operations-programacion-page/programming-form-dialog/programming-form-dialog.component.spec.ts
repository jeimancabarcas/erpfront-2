import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ProgrammingFormDialogComponent } from './programming-form-dialog.component';
import { ProgrammingService } from '../../../../services/programming.service';
import { CustomerService } from '../../../../services/customer.service';
import { ServiceService } from '../../../../services/service.service';
import { Customer } from '../../../../models/customer.model';
import { Service } from '../../../../models/service.model';

describe('ProgrammingFormDialogComponent', () => {
  let component: ProgrammingFormDialogComponent;
  let fixture: ComponentFixture<ProgrammingFormDialogComponent>;
  let programmingService: jasmine.SpyObj<ProgrammingService>;

  const mockClientes: Customer[] = [
    { id: 'cust-1', name: 'Cliente 1', documentType: 'CC', documentNumber: '123', status: 'ACTIVE', phone: '123', address: 'dir' },
    { id: 'cust-2', name: 'Cliente 2', documentType: 'NIT', documentNumber: '456', status: 'ACTIVE', phone: '456', address: 'dir' },
  ];

  const mockServicios: Service[] = [
    { id: 'serv-1', nombre: 'Servicio 1', precioBase: 100, isActive: true, createdAt: '', updatedAt: '', totalHoras: 16 },
    { id: 'serv-2', nombre: 'Servicio 2', precioBase: 200, isActive: true, createdAt: '', updatedAt: '', totalHoras: 8 },
  ];

  beforeEach(async () => {
    const programmingSpy = jasmine.createSpyObj('ProgrammingService', ['createProgramado'], {
      data: of([]),
      meta: of(null),
      loading: of(false),
    });

    await TestBed.configureTestingModule({
      imports: [
        ProgrammingFormDialogComponent,
        MatDialogModule,
        MatSnackBarModule,
        ReactiveFormsModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        FormBuilder,
        { provide: ProgrammingService, useValue: programmingSpy },
        {
          provide: CustomerService,
          useValue: {
            loadCustomers: () => of({}),
            customers: () => mockClientes,
          },
        },
        {
          provide: ServiceService,
          useValue: {
            loadServices: () => of({}),
            services: () => mockServicios,
          },
        },
        { provide: MatDialog, useValue: { closeAll: jasmine.createSpy('closeAll') } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgrammingFormDialogComponent);
    component = fixture.componentInstance;
    programmingService = TestBed.inject(ProgrammingService) as jasmine.SpyObj<ProgrammingService>;
    fixture.detectChanges();
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
    expect(customerId?.hasError('required')).toBeFalse();
    customerId?.setValue('');
    customerId?.markAsTouched();
    expect(customerId?.hasError('required')).toBeTrue();
  });

  it('should have required validators on servicioId', () => {
    const servicioId = component.formGroup.get('servicioId');
    expect(servicioId?.hasError('required')).toBeFalse();
    servicioId?.setValue('');
    servicioId?.markAsTouched();
    expect(servicioId?.hasError('required')).toBeTrue();
  });

  it('should have maxLength validator on notas', () => {
    const notas = component.formGroup.get('notas');
    notas?.setValue('a'.repeat(2001));
    expect(notas?.hasError('maxlength')).toBeTrue();
  });

  it('should have at least one insumo row', () => {
    expect(component.insumos.length).toBe(1);
  });

  it('should add insumo row', () => {
    component.addInsumoRow();
    expect(component.insumos.length).toBe(2);
  });

  it('should remove insumo row', () => {
    component.addInsumoRow();
    expect(component.insumos.length).toBe(2);
    component.removeInsumoRow(0);
    expect(component.insumos.length).toBe(1);
  });

  it('should not remove last insumo row', () => {
    component.removeInsumoRow(0);
    expect(component.insumos.length).toBe(1);
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

  it('should return empty fecha fin preview when no servicio selected', () => {
    component.formGroup.get('servicioId')?.setValue('');
    expect(component.getFechaFinPreview()).toBe('');
  });

  it('should calculate fecha fin preview when servicio selected', () => {
    component.formGroup.get('servicioId')?.setValue('serv-1');
    component.formGroup.get('fechaInicioEstimada')?.setValue('2026-01-12T08:00');
    const fechaFin = component.getFechaFinPreview();
    expect(fechaFin).toBeTruthy();
    expect(fechaFin).toContain('2026');
  });

  it('should submit form and call createProgramado', () => {
    component.formGroup.get('customerId')?.setValue('cust-1');
    component.formGroup.get('servicioId')?.setValue('serv-1');
    component.formGroup.get('fechaInicioEstimada')?.setValue('2026-01-12T08:00');

    programmingService.createProgramado.and.returnValue(of({
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

    programmingService.createProgramado.and.returnValue(
      new Observable(() => { throw new Error('Server error'); })
    );

    component.onSubmit();

    expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalled();
  });
});
