// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OperationsServicesPageComponent } from './operations-services-page.component';
import { ServiceService } from '../../../../services/service.service';
import { ActivityService } from '../../../../services/activity.service';
import { Service } from '../../../../models/service.model';
import { describe, it, expect, vi } from 'vitest';

describe('OperationsServicesPageComponent', () => {
  const mockServices: Service[] = [
    { id: '1', nombre: 'Masaje terapéutico', descripcion: 'Masaje', precioBase: 50000, actividades: [{ actividadId: 'act-1' }], isActive: true, createdAt: '', updatedAt: '' },
    { id: '2', nombre: 'Consulta general', descripcion: 'Consulta', precioBase: 30000, actividades: [], isActive: true, createdAt: '', updatedAt: '' },
  ];

  it('should be created', async () => {
    const mockServiceService = {
      loadServices: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockServices, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
      }),
      services: vi.fn(() => mockServices),
      meta: vi.fn(() => ({ total: 2 })),
      createService: vi.fn(),
      updateService: vi.fn(),
      deleteService: vi.fn(),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: [], meta: null }); return { unsubscribe: () => {} }; },
      }),
      data: vi.fn(() => []),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsServicesPageComponent],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsServicesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load services on init', async () => {
    const loadServicesSpy = vi.fn().mockReturnValue({
      subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockServices, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
    });

    const mockServiceService = {
      loadServices: loadServicesSpy,
      services: vi.fn(() => mockServices),
      meta: vi.fn(() => ({ total: 2 })),
      createService: vi.fn(),
      updateService: vi.fn(),
      deleteService: vi.fn(),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: [], meta: null }); return { unsubscribe: () => {} }; },
      }),
      data: vi.fn(() => []),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsServicesPageComponent],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsServicesPageComponent);
    fixture.detectChanges();

    expect(loadServicesSpy).toHaveBeenCalled();
  });

  it('should filter services by name', async () => {
    const loadServicesSpy = vi.fn().mockReturnValue({
      subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockServices, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
    });

    const mockServiceService = {
      loadServices: loadServicesSpy,
      services: vi.fn(() => mockServices),
      meta: vi.fn(() => ({ total: 2 })),
      createService: vi.fn(),
      updateService: vi.fn(),
      deleteService: vi.fn(),
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: [], meta: null }); return { unsubscribe: () => {} }; },
      }),
      data: vi.fn(() => []),
      loading: vi.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsServicesPageComponent],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsServicesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.nameFilter.set('Masaje');
    component.loadData();
    expect(loadServicesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Masaje' })
    );
  });

  it('should call deleteService on confirm delete', async () => {
    const deleteSpy = vi.fn().mockReturnValue({
      subscribe: (cb: any) => { if (typeof cb === 'function') cb(); return { unsubscribe: () => {} }; },
    });

    const mockServiceService = {
      loadServices: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockServices, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
      }),
      services: vi.fn(() => mockServices),
      meta: vi.fn(() => ({ total: 2 })),
      createService: vi.fn(),
      updateService: vi.fn(),
      deleteService: deleteSpy,
    };

    const mockActivityService = {
      loadData: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: [], meta: null }); return { unsubscribe: () => {} }; },
      }),
      data: vi.fn(() => []),
      loading: vi.fn(() => false),
    };

    const mockDialogRef = {
      afterClosed: () => ({
        subscribe: (cb: any) => {
          // Simulate user confirming the delete dialog
          if (typeof cb === 'function') cb(true);
          else if (cb && typeof cb.next === 'function') cb.next(true);
          return { unsubscribe: () => {} };
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsServicesPageComponent],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
        { provide: ActivityService, useValue: mockActivityService },
        {
          provide: MatDialog,
          useValue: { open: vi.fn().mockReturnValue(mockDialogRef) }
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsServicesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.confirmDelete(mockServices[0]);
    expect(deleteSpy).toHaveBeenCalledWith('1');
  });
});
