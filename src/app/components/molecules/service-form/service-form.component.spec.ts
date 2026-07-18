// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceFormMolecule } from './service-form.component';
import { ServiceService } from '../../../services/service.service';
import { ActivityService } from '../../../services/activity.service';
import { Service } from '../../../models/service.model';
import { Activity } from '../../../models/activity.model';
import { describe, it, expect, vi } from 'vitest';

describe('ServiceFormMolecule', () => {
  const mockActivities: Activity[] = [
    { id: 'act-1', nombre: 'Masaje terapéutico', descripcion: 'Masaje', horasEstimadas: 1.5, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'act-2', nombre: 'Reflexología', descripcion: 'Reflexología podal', horasEstimadas: 0.75, isActive: true, createdAt: '', updatedAt: '' },
  ];

  it('should be created', async () => {
    const mockServiceService = {
      createService: vi.fn(),
      updateService: vi.fn(),
      services: vi.fn(() => ({ subscribe: () => ({ unsubscribe: () => {} }), asReadonly: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) })),
      meta: vi.fn(() => ({ subscribe: () => ({ unsubscribe: () => {} }), asReadonly: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) })),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({
        subscribe: (cb: any) => {
          if (typeof cb === 'function') cb({ data: mockActivities, meta: null });
          else if (cb && typeof cb.next === 'function') cb.next({ data: mockActivities, meta: null });
          return { unsubscribe: () => {} };
        },
      }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.service().nombre).toBe('');
    expect(component.service().precioBase).toBe(0);
    expect(component.isEditMode).toBe(false);
  });

  it('should populate form data in edit mode', async () => {
    const mockService: Service = {
      id: 'svc-1',
      nombre: 'Masaje terapéutico',
      descripcion: 'Masaje relajante',
      precioBase: 50000,
      actividades: [{ actividadId: 'act-1' }],
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    const mockServiceService = {
      createService: vi.fn(),
      updateService: vi.fn(),
      services: vi.fn(),
      meta: vi.fn(),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({
        subscribe: (cb: any) => {
          if (typeof cb === 'function') cb({ data: mockActivities, meta: null });
          else if (cb && typeof cb.next === 'function') cb.next({ data: mockActivities, meta: null });
          return { unsubscribe: () => {} };
        },
      }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { service: mockService } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(component.service().nombre).toBe('Masaje terapéutico');
    expect(component.service().precioBase).toBe(50000);
  });

  it('onActivitySelect should add activity to selectedActivity', async () => {
    const mockServiceService = { createService: vi.fn(), updateService: vi.fn(), services: vi.fn(), meta: vi.fn() };
    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onActivitySelect('act-1');
    expect(component.selectedActivity().length).toBe(1);
    expect(component.serviceActivities()[0].actividadId).toBe('act-1');
  });

  it('onActivitySelect should not add duplicate activity', async () => {
    const mockServiceService = { createService: vi.fn(), updateService: vi.fn(), services: vi.fn(), meta: vi.fn() };
    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onActivitySelect('act-1');
    component.onActivitySelect('act-1');
    expect(component.selectedActivity().length).toBe(1);
  });

  it('removeActivity should remove activity from selectedActivity', async () => {
    const mockServiceService = { createService: vi.fn(), updateService: vi.fn(), services: vi.fn(), meta: vi.fn() };
    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.serviceActivities.set(mockActivities.map((a: any) => ({ actividadId: a.id, horasEstimadas: a.horasEstimadas })));
    component.removeServiceActivity('act-1');
    expect(component.selectedActivity().length).toBe(1);
    expect(component.serviceActivities()[0].actividadId).toBe('act-2');
  });

  it('getActivityName should return activity name', async () => {
    const mockServiceService = { createService: vi.fn(), updateService: vi.fn(), services: vi.fn(), meta: vi.fn() };
    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.serviceActivities.set(mockActivities.map((a: any) => ({ actividadId: a.id, horasEstimadas: a.horasEstimadas })));
    const label = component.getActivityName('act-1');
    expect(label).toBe('Masaje terapéutico');
  });

  it('updateField should update the service signal', async () => {
    const mockServiceService = { createService: vi.fn(), updateService: vi.fn(), services: vi.fn(), meta: vi.fn() };
    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.updateField('nombre', 'Nuevo nombre');
    expect(component.service().nombre).toBe('Nuevo nombre');
  });

  it('should call createService when saving in create mode', async () => {
    const mockServiceService = {
      createService: vi.fn().mockReturnValue({
        subscribe: (cb: any) => {
          const result = { id: 'new-1', nombre: 'Nuevo servicio', precioBase: 30000, actividades: [], isActive: true, createdAt: '', updatedAt: '' };
          if (typeof cb === 'function') cb(result);
          else if (cb && typeof cb.next === 'function') cb.next(result);
          return { unsubscribe: () => {} };
        },
      }),
      updateService: vi.fn(),
      services: vi.fn(),
      meta: vi.fn(),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.service.set({ nombre: 'Nuevo servicio', precioBase: 30000, descripcion: '' });
    component.serviceActivities.set([]);
    component.saveService();

    expect(mockServiceService.createService).toHaveBeenCalled();
  });

  it('should call updateService when saving in edit mode', async () => {
    const mockService: Service = {
      id: 'svc-1',
      nombre: 'Masaje terapéutico',
      descripcion: 'Masaje relajante',
      precioBase: 50000,
      actividades: [],
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    const mockServiceService = {
      createService: vi.fn(),
      updateService: vi.fn().mockReturnValue({
        subscribe: (cb: any) => {
          const result = { ...mockService, nombre: 'Masaje actualizado', precioBase: 60000 };
          if (typeof cb === 'function') cb(result);
          else if (cb && typeof cb.next === 'function') cb.next(result);
          return { unsubscribe: () => {} };
        },
      }),
      services: vi.fn(),
      meta: vi.fn(),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({ subscribe: (cb: any) => cb({ data: mockActivities, meta: null }), unsubscribe: () => {} }),
      data: vi.fn(() => mockActivities),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, ServiceFormMolecule],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { service: mockService } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServiceFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.service.update(s => ({ ...s, nombre: 'Masaje actualizado', precioBase: 60000 }));
    component.serviceActivities.set([]);
    component.saveService();

    expect(mockServiceService.updateService).toHaveBeenCalledWith('svc-1', expect.objectContaining({ nombre: 'Masaje actualizado' }));
  });
});
