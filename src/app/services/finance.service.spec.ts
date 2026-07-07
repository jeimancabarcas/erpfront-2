// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FinanceService } from './finance.service';
import { environment } from '../../environments/environment';
import { FinanceDocumentDto } from '../models/finance.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('FinanceService', () => {
  let service: FinanceService;
  let httpMock: HttpTestingController;

  const mockDocument: FinanceDocumentDto = {
    id: 'uuid-123',
    number: 'FAC-0001',
    clientName: 'Limpiezas Industriales S.A.',
    clientIdentification: '900.111.222-3',
    total: '1190000',
    status: '1',
    createdAt: '2026-06-23T10:00:00Z',
    type: 'bill',
  };

  const mockPendingDocument: FinanceDocumentDto = {
    id: 'uuid-456',
    number: 'FAC-0002',
    clientName: 'Dotaciones Médicas Corp',
    clientIdentification: '860.000.999-1',
    total: '450000',
    status: '0',
    createdAt: '2026-06-24T14:00:00Z',
    type: 'bill',
  };

  const mockCreditNote: FinanceDocumentDto = {
    id: 'uuid-789',
    number: 'NC-0001',
    clientName: 'Alimentos Saludables Ltda',
    clientIdentification: '800.555.444-0',
    total: '85000',
    status: '1',
    createdAt: '2026-06-25T09:00:00Z',
    type: 'credit-note',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FinanceService],
    });
    service = TestBed.inject(FinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('mapDocumentToInvoice', () => {
    it('should map FinanceDocumentDto with status "1" to FinanceInvoice status "Paid"', () => {
      const result = (service as any).mapDocumentToInvoice(mockDocument);
      expect(result.status).toBe('Paid');
    });

    it('should map FinanceDocumentDto with status "0" to FinanceInvoice status "Sent"', () => {
      const result = (service as any).mapDocumentToInvoice(mockPendingDocument);
      expect(result.status).toBe('Sent');
    });

    it('should map all fields correctly for a validated bill', () => {
      const result = (service as any).mapDocumentToInvoice(mockDocument);
      expect(result.id).toBe('FAC-0001');
      expect(result.dbId).toBe('uuid-123');
      expect(result.customerName).toBe('Limpiezas Industriales S.A.');
      expect(result.customerTaxId).toBe('900.111.222-3');
      expect(result.total).toBe(1190000);
      expect(result.subtotal).toBe(1190000);
      expect(result.date).toBe('2026-06-23T10:00:00Z');
      expect(result.dueDate).toBe('2026-06-23T10:00:00Z');
      expect(result.electronicId).toBe('uuid-123');
      expect(result.type).toBe('bill');
      expect(result.items).toEqual([]);
      expect(result.tax).toBe(0);
    });

    it('should map all fields correctly for a credit note', () => {
      const result = (service as any).mapDocumentToInvoice(mockCreditNote);
      expect(result.id).toBe('NC-0001');
      expect(result.dbId).toBe('uuid-789');
      expect(result.customerName).toBe('Alimentos Saludables Ltda');
      expect(result.customerTaxId).toBe('800.555.444-0');
      expect(result.total).toBe(85000);
      expect(result.type).toBe('credit-note');
      expect(result.status).toBe('Paid');
    });
  });

  describe('loadBills', () => {
    it('should make a GET request to /finance/bills with no params', () => {
      service.loadBills();

      const req = httpMock.expectOne(`${environment.apiUrl}/finance/bills`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);

      req.flush({
        data: [mockDocument, mockPendingDocument],
        meta: { total: 2, page: 1, lastPage: 1, limit: 20 },
      });

      const invoices = service.invoices();
      expect(invoices.length).toBe(2);
      expect(invoices[0].id).toBe('FAC-0001');
      expect(invoices[1].id).toBe('FAC-0002');
    });

    it('should pass query params to the request', () => {
      service.loadBills({ identification: '900.111.222-3', status: '1', page: 1, perPage: 10 });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/finance/bills`
          && r.params.get('identification') === '900.111.222-3'
          && r.params.get('status') === '1'
          && r.params.get('page') === '1'
          && r.params.get('perPage') === '10'
      );
      expect(req.request.method).toBe('GET');

      req.flush({
        data: [mockDocument],
        meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
      });

      const invoices = service.invoices();
      expect(invoices.length).toBe(1);
    });

    it('should update the meta signal', () => {
      service.loadBills();

      const req = httpMock.expectOne(`${environment.apiUrl}/finance/bills`);
      req.flush({
        data: [mockDocument],
        meta: { total: 1, page: 1, lastPage: 1, limit: 20 },
      });

      const meta = service.meta();
      expect(meta).not.toBeNull();
      expect(meta!.total).toBe(1);
      expect(meta!.page).toBe(1);
      expect(meta!.lastPage).toBe(1);
      expect(meta!.limit).toBe(20);
    });

    it('should omit empty params', () => {
      service.loadBills({ identification: '', names: '', status: '1' });

      const req = httpMock.expectOne((r: any) => {
        const hasIdentification = r.params.has('identification');
        const hasNames = r.params.has('names');
        const hasStatus = r.params.has('status');
        return r.url === `${environment.apiUrl}/finance/bills`
          && !hasIdentification
          && !hasNames
          && hasStatus;
      });

      req.flush({ data: [], meta: { total: 0, page: 1, lastPage: 0, limit: 20 } });
    });
  });

  describe('loadCreditNotes', () => {
    it('should make a GET request to /finance/credit-notes', () => {
      service.loadCreditNotes();

      const req = httpMock.expectOne(`${environment.apiUrl}/finance/credit-notes`);
      expect(req.request.method).toBe('GET');

      req.flush({
        data: [mockCreditNote],
        meta: { total: 1, page: 1, lastPage: 1, limit: 20 },
      });

      const invoices = service.invoices();
      const creditNotes = invoices.filter(inv => inv.type === 'credit-note');
      expect(creditNotes.length).toBe(1);
      expect(creditNotes[0].type).toBe('credit-note');
      expect(creditNotes[0].id).toBe('NC-0001');
    });

    it('should pass query params to the credit-notes endpoint', () => {
      service.loadCreditNotes({ number: 'NC-0001', page: 1 });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/finance/credit-notes`
          && r.params.get('number') === 'NC-0001'
          && r.params.get('page') === '1'
      );

      req.flush({
        data: [mockCreditNote],
        meta: { total: 1, page: 1, lastPage: 1, limit: 20 },
      });
    });
  });

  describe('createElectronicCreditNote', () => {
    it('should POST to /finance/electronic-bills/credit-note with correct payload', () => {
      const payload = {
        billNumber: 'SETP990000123',
        referenceCode: 'NC-REF-001',
        correctionConceptCode: '2',
        observation: 'Anulación total',
        paymentDetails: [{ paymentForm: '1', paymentMethodCode: '10', amount: 100000 }],
        items: [{ codeReference: 'P001', name: 'Producto', quantity: 1, price: 100000 }],
      };

      service.createElectronicCreditNote(payload).subscribe(response => {
        expect(response.status).toBe('OK');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/finance/electronic-bills/credit-note`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({ status: 'OK', message: 'Created', data: { number: 'NC-001' } });
    });

    it('should propagate error response', () => {
      const payload = {
        billNumber: 'INVALID',
        referenceCode: 'NC-REF-002',
        correctionConceptCode: '2',
        paymentDetails: [{ paymentForm: '1', paymentMethodCode: '10', amount: 100 }],
        items: [{ codeReference: 'P001', name: 'P', quantity: 1, price: 100 }],
      };

      service.createElectronicCreditNote(payload).subscribe({
        error: (err) => {
          expect(err.status).toBe(422);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/finance/electronic-bills/credit-note`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });
});