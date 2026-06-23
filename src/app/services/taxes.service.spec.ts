// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaxesService } from './taxes.service';
import { environment } from '../../environments/environment';
import { Tax } from '../models/tax.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TaxesService', () => {
  let service: TaxesService;
  let httpMock: HttpTestingController;

  const mockTaxes: Tax[] = [
    {
      id: '1',
      name: 'IVA',
      code: 'IVA',
      percentage: 21,
      type: 'percentage',
      isPurchase: false,
      isSell: true,
      isActive: true,
      sortOrder: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'IIBB',
      code: 'IIBB',
      percentage: 3,
      type: 'percentage',
      isPurchase: true,
      isSell: true,
      isActive: true,
      sortOrder: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockResponse = {
    data: mockTaxes,
    meta: { total: 2, page: 1, lastPage: 1, limit: 10 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaxesService],
    });
    service = TestBed.inject(TaxesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load taxes and update signal state', () => {
    service.loadData().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/settings/taxes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.data()).toEqual(mockTaxes);
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

    const req = httpMock.expectOne(`${environment.apiUrl}/settings/taxes`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorEmitted).toBe(true);
  });

  it('should set loading state during HTTP request and reset after', () => {
    const obs = service.loadData();
    expect(service.loading()).toBe(true);

    obs.subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/settings/taxes`);
    req.flush(mockResponse);

    expect(service.loading()).toBe(false);
  });

  it('should accept query params in loadData', () => {
    const params = { page: 1, limit: 5, sortBy: 'name', order: 'ASC' as const };

    service.loadData(params).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/settings/taxes` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '5' &&
        r.params.get('sortBy') === 'name' &&
        r.params.get('order') === 'ASC'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle empty params gracefully', () => {
    service.loadData({ page: undefined, limit: undefined }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/settings/taxes`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockResponse);
  });
});
