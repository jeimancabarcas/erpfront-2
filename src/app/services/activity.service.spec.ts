// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivityService } from './activity.service';
import { environment } from '../../environments/environment';
import { Activity } from '../models/activity.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ActivityService', () => {
  let service: ActivityService;
  let httpMock: HttpTestingController;

  const mockActivities: Activity[] = [
    {
      id: '1',
      nombre: 'Masaje terapéutico',
      descripcion: 'Masaje relajante',
      horasEstimadas: 50000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      nombre: 'Reflexología',
      descripcion: 'Reflexología podal',
      horasEstimadas: 45000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockResponse = {
    data: mockActivities,
    meta: { total: 2, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivityService],
    });
    service = TestBed.inject(ActivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load activities and update signal state', () => {
    service.loadData().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.data()).toEqual(mockActivities);
    expect(service.meta()).toEqual(mockResponse.meta);
  });

  it('should handle 404 error on loadData', () => {
    let errorEmitted = false;

    service.loadData().subscribe({
      next: () => {},
      error: (err) => {
        errorEmitted = true;
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorEmitted).toBe(true);
  });

  it('should set loading state during HTTP request and reset after', () => {
    const obs = service.loadData();
    expect(service.loading()).toBe(true);

    obs.subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    req.flush(mockResponse);

    expect(service.loading()).toBe(false);
  });

  it('should accept query params in loadData', () => {
    service.loadData({ page: 1, limit: 5, name: 'Masaje' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/operational/actividades` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '5' &&
        r.params.get('nombre') === 'Masaje'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create an activity and prepend to list', () => {
    const newActivity: Activity = {
      id: '3',
      nombre: 'Acupuntura',
      descripcion: 'Sesión de acupuntura',
      horasEstimadas: 60000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    service.loadData().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    req.flush(mockResponse);

    service.createActivity({ nombre: 'Acupuntura', descripcion: 'Sesión de acupuntura', horasEstimadas: 60000 }).subscribe(created => {
      expect(created).toEqual(newActivity);
    });

    const createReq = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(newActivity);

    expect(service.data()[0]).toEqual(newActivity);
  });

  it('should update an activity in-place', () => {
    service.loadData().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    req.flush(mockResponse);

    const updated: Activity = {
      ...mockActivities[0],
      nombre: 'Masaje terapéutico actualizado',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    service.updateActivity('1', { nombre: 'Masaje terapéutico actualizado' }).subscribe(result => {
      expect(result).toEqual(updated);
    });

    const updateReq = httpMock.expectOne(`${environment.apiUrl}/operational/actividades/1`);
    expect(updateReq.request.method).toBe('PATCH');
    updateReq.flush(updated);

    expect(service.data()[0].nombre).toBe('Masaje terapéutico actualizado');
  });

  it('should delete an activity and remove from list', () => {
    service.loadData().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/actividades`);
    req.flush(mockResponse);

    service.deleteActivity('1').subscribe();

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/operational/actividades/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(service.data().length).toBe(1);
    expect(service.data()[0].id).toBe('2');
  });
});
