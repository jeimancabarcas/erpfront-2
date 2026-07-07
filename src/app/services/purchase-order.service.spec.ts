// @vitest-environment jsdom
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { PurchaseOrderService } from './purchase-order.service';
import { environment } from '../../environments/environment';
import { PurchaseOrder } from '../models/purchase-order.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}

describe('PurchaseOrderService — getOrderById', () => {
  let service: PurchaseOrderService;
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PurchaseOrderService],
    });
    service = TestBed.inject(PurchaseOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock?.verify();
  });

  it('should fetch purchase order by id with full relations', () => {
    setup();
    const orderId = 'order-uuid';
    const mockOrder: PurchaseOrder = {
      id: orderId,
      orderNumber: 'OC-0001',
      orderDate: '2026-07-07',
      observations: 'Test order',
      status: 'CREATED',
      supplierId: 'supplier-uuid',
      supplier: { id: 'supplier-uuid', name: 'Proveedor Test', nit: '900123456-7' } as any,
      items: [
        {
          productId: 'product-uuid',
          quantity: 10,
          price: 5000,
        },
      ],
      supportDocuments: [],
      adjustmentNotes: [],
      createdAt: '2026-07-07T00:00:00Z',
    };

    service.getOrderById(orderId).subscribe((order) => {
      expect(order).toEqual(mockOrder);
      expect(order.id).toBe(orderId);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/purchase-orders/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should support documents and adjustment notes when present', () => {
    setup();
    const orderId = 'order-uuid-2';
    const mockOrder: PurchaseOrder = {
      id: orderId,
      orderNumber: 'OC-0002',
      orderDate: '2026-07-07',
      observations: '',
      status: 'COMPLETED',
      supplierId: 'supplier-uuid',
      supplier: { id: 'supplier-uuid', name: 'Proveedor Test', nit: '900123456-7' } as any,
      items: [],
      supportDocuments: [
        {
          id: 'doc-1',
          referenceCode: 'DS-OC-0002-12345',
          number: 'SETP100',
          cude: 'cude-abc',
          createdAt: '2026-07-07T12:00:00Z',
        },
      ],
      adjustmentNotes: [
        {
          id: 'note-1',
          referenceCode: 'NA-OC-0002-12345',
          noteNumber: 'NA100',
          cude: 'cude-def',
          correctionConceptCode: '2',
          amount: 50000,
          createdAt: '2026-07-07T13:00:00Z',
        },
      ],
    };

    service.getOrderById(orderId).subscribe((order) => {
      expect(order.supportDocuments).toHaveLength(1);
      expect(order.supportDocuments![0].number).toBe('SETP100');
      expect(order.adjustmentNotes).toHaveLength(1);
      expect(order.adjustmentNotes![0].noteNumber).toBe('NA100');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/purchase-orders/${orderId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should propagate error when order not found', () => {
    setup();
    const orderId = 'nonexistent';
    let errorReceived = false;

    service.getOrderById(orderId).subscribe({
      next: () => {},
      error: (err) => {
        errorReceived = true;
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/purchase-orders/${orderId}`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorReceived).toBe(true);
  });
});
