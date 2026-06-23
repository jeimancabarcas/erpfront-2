// @vitest-environment jsdom
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoiceService } from './invoice.service';
import { environment } from '../../environments/environment';
import { Invoice } from '../models/invoice.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvoiceService],
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should emit an invoice via POST to the emit endpoint', () => {
    const invoiceId = 'inv-123';
    const updatedInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber: 'FAC-0001',
      sequentialNumber: 1,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      isElectronic: true,
      items: [],
      emission: {
        number: 'SETP990003678',
        cude: '',
        qrUrl: '',
        publicUrl: '',
        isValidated: false,
      },
    };

    service.emitInvoice(invoiceId).subscribe((result) => {
      expect(result).toEqual(updatedInvoice);
      expect(result.emission?.number).toBe('SETP990003678');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sales/invoices/${invoiceId}/emit`);
    expect(req.request.method).toBe('POST');
    req.flush(updatedInvoice);
  });

  it('should propagate error when emit endpoint returns 404', () => {
    const invoiceId = 'inv-unknown';
    let errorEmitted = false;

    service.emitInvoice(invoiceId).subscribe({
      next: () => {},
      error: (err) => {
        errorEmitted = true;
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sales/invoices/${invoiceId}/emit`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(errorEmitted).toBe(true);
  });
});
