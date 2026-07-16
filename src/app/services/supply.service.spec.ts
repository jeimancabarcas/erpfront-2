// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SupplyService } from './supply.service';
import { environment } from '../../environments/environment';
import { Supply, CreateSupplyDto } from '../models/supply.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SupplyService', () => {
  let service: SupplyService;
  let httpMock: HttpTestingController;

  const mockSupplies: Supply[] = [
    {
      id: '1',
      nombre: 'Gasas estériles',
      descripcion: 'Gasas de 10x10',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      nombre: 'Jabón quirúrgico',
      descripcion: undefined,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockResponse = {
    data: mockSupplies,
    meta: { total: 2, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SupplyService],
    });
    service = TestBed.inject(SupplyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load supplies and update signal state', () => {
    service.loadSupplies().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/insumos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.supplies()).toEqual(mockSupplies);
    expect(service.meta()).toEqual(mockResponse.meta);
  });

  it('should handle 404 error on loadSupplies', () => {
    let errorEmitted = false;

    service.loadSupplies().subscribe({
      next: () => {},
      error: (err) => {
        errorEmitted = true;
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/operational/insumos`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorEmitted).toBe(true);
  });

  it('should accept query params in loadSupplies', () => {
    service.loadSupplies({ page: 1, limit: 5, name: 'Gasas' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/operational/insumos` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '5' &&
        r.params.get('name') === 'Gasas'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a supply and prepend to list', () => {
    const newSupply: Supply = {
      id: '3',
      nombre: 'Nuevo insumo',
      descripcion: 'Descripción del insumo',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    service.loadSupplies().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/insumos`);
    req.flush(mockResponse);

    service.createSupply({ nombre: 'Nuevo insumo', descripcion: 'Descripción del insumo' }).subscribe(created => {
      expect(created).toEqual(newSupply);
    });

    const createReq = httpMock.expectOne(`${environment.apiUrl}/operational/insumos`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(newSupply);

    expect(service.supplies()[0]).toEqual(newSupply);
  });

  it('should update a supply in-place', () => {
    service.loadSupplies().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/insumos`);
    req.flush(mockResponse);

    const updated: Supply = {
      ...mockSupplies[0],
      nombre: 'Gasas actualizadas',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    service.updateSupply('1', { nombre: 'Gasas actualizadas' }).subscribe(result => {
      expect(result).toEqual(updated);
    });

    const updateReq = httpMock.expectOne(`${environment.apiUrl}/operational/insumos/1`);
    expect(updateReq.request.method).toBe('PATCH');
    updateReq.flush(updated);

    expect(service.supplies()[0].nombre).toBe('Gasas actualizadas');
  });

  it('should delete a supply and remove from list', () => {
    service.loadSupplies().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/operational/insumos`);
    req.flush(mockResponse);

    service.deleteSupply('1').subscribe();

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/operational/insumos/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(service.supplies().length).toBe(1);
    expect(service.supplies()[0].id).toBe('2');
  });
});
