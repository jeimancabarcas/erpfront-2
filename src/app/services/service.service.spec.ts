// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServiceService } from './service.service';
import { environment } from '../../environments/environment';
import { Service, CreateServiceDto } from '../models/service.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ServiceService', () => {
  let service: ServiceService;
  let httpMock: HttpTestingController;

  const mockServices: Service[] = [
    {
      id: '1',
      nombre: 'Masaje terapéutico',
      descripcion: 'Masaje relajante',
      precioBase: 50000,
      actividades: [{ actividadId: 'act-1' }],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      nombre: 'Consulta general',
      descripcion: undefined,
      precioBase: 30000,
      actividades: [],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockResponse = {
    data: mockServices,
    meta: { total: 2, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceService],
    });
    service = TestBed.inject(ServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load services and update signal state', () => {
    service.loadServices().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/servicios`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.services()).toEqual(mockServices);
    expect(service.meta()).toEqual(mockResponse.meta);
  });

  it('should handle 404 error on loadServices', () => {
    let errorEmitted = false;

    service.loadServices().subscribe({
      next: () => {},
      error: (err) => {
        errorEmitted = true;
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/servicios`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorEmitted).toBe(true);
  });

  it('should accept query params in loadServices', () => {
    service.loadServices({ page: 1, limit: 5, name: 'Masaje' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/operational/servicios` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '5' &&
        r.params.get('name') === 'Masaje'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a service and prepend to list', () => {
    const newService: Service = {
      id: '3',
      nombre: 'Nuevo servicio',
      descripcion: 'Descripción',
      precioBase: 25000,
      actividades: [],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    service.loadServices().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/servicios`);
    req.flush(mockResponse);

    service.createService({ nombre: 'Nuevo servicio', descripcion: 'Descripción', precioBase: 25000 }).subscribe(created => {
      expect(created).toEqual(newService);
    });

    const createReq = httpMock.expectOne(`${environment.apiUrl}/operational/servicios`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(newService);

    expect(service.services()[0]).toEqual(newService);
  });

  it('should update a service in-place', () => {
    service.loadServices().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/servicios`);
    req.flush(mockResponse);

    const updated: Service = {
      ...mockServices[0],
      nombre: 'Masaje actualizado',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    service.updateService('1', { nombre: 'Masaje actualizado' }).subscribe(result => {
      expect(result).toEqual(updated);
    });

    const updateReq = httpMock.expectOne(`${environment.apiUrl}/operational/servicios/1`);
    expect(updateReq.request.method).toBe('PATCH');
    updateReq.flush(updated);

    expect(service.services()[0].nombre).toBe('Masaje actualizado');
  });

  it('should delete a service and remove from list', () => {
    service.loadServices().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/servicios`);
    req.flush(mockResponse);

    service.deleteService('1').subscribe();

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/operational/servicios/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(service.services().length).toBe(1);
    expect(service.services()[0].id).toBe('2');
  });

  it('should get a service by id', () => {
    const expected: Service = mockServices[0];

    service.getServiceById('1').subscribe(result => {
      expect(result).toEqual(expected);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/servicios/1`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });
});
