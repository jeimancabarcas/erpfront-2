// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentTypesService } from './payment-types.service';
import { environment } from '../../environments/environment';
import { PaymentType } from '../models/payment-type.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('PaymentTypesService', () => {
  let service: PaymentTypesService;
  let httpMock: HttpTestingController;

  const mockItems: PaymentType[] = [
    {
      id: '1',
      name: 'Contado',
      code: 'CASH',
      description: 'Pago contado',
      isActive: true,
      sortOrder: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Crédito',
      code: 'CRED',
      description: 'Pago a crédito',
      isActive: true,
      sortOrder: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockResponse = {
    data: mockItems,
    meta: { total: 2, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentTypesService],
    });
    service = TestBed.inject(PaymentTypesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load payment types and update signal state', () => {
    service.loadData().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/settings/payment-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.data()).toEqual(mockItems);
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

    const req = httpMock.expectOne(`${environment.apiUrl}/settings/payment-types`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorEmitted).toBe(true);
  });

  it('should set loading state during HTTP request and reset after', () => {
    const obs = service.loadData();
    expect(service.loading()).toBe(true);

    obs.subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/settings/payment-types`);
    req.flush(mockResponse);

    expect(service.loading()).toBe(false);
  });

  it('should accept query params in loadData', () => {
    const params = { page: 1, limit: 10, sortBy: 'name', order: 'ASC' as const };

    service.loadData(params).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/settings/payment-types` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '10' &&
        r.params.get('sortBy') === 'name' &&
        r.params.get('order') === 'ASC'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
