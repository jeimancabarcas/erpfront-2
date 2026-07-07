// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../environments/environment';
import { CreditPortfolio, PaymentRecord, PaymentReceiptDto } from '../models/customer.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CustomerService — Credit Methods', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService],
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getCustomerCredit should fetch credit portfolio from /customers/:id/credit', () => {
    const customerId = 'cust-1';
    const mockPortfolio: CreditPortfolio = {
      creditLimit: 5000000,
      currentBalance: 1000000,
      availableCredit: 4000000,
      utilizationPercent: 20,
      creditStatus: 'GOOD',
      paymentTermsDays: 30,
    };

    service.getCustomerCredit(customerId).subscribe((portfolio) => {
      expect(portfolio).toEqual(mockPortfolio);
      expect(portfolio.utilizationPercent).toBe(20);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/credit`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPortfolio);
  });

  it('setCustomerCredit should PATCH credit limit to /customers/:id/credit', () => {
    const customerId = 'cust-1';
    const dto = { creditLimit: 5000000 };

    service.setCustomerCredit(customerId, dto).subscribe((result) => {
      expect(result).toBeDefined();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/credit`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({ id: customerId, creditLimit: 5000000 });
  });

  it('recordPayment should POST payment to /customers/:id/credit/payment', () => {
    const customerId = 'cust-1';
    const dto = { invoiceId: 'inv-1', amount: 500000, notes: 'Test payment' };

    service.recordPayment(customerId, dto).subscribe((result) => {
      expect(result.newBalance).toBe(1500000);
      expect(result.invoiceStatus).toBe('ON_CREDIT');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/credit/payment`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ newBalance: 1500000, invoiceStatus: 'ON_CREDIT', paymentRecord: { id: 'rec-1', invoiceId: 'inv-1', amount: 500000, paymentDate: new Date().toISOString(), createdAt: new Date().toISOString() } });
  });

  it('getPaymentHistory should fetch payment records from /customers/:id/credit/payments', () => {
    const customerId = 'cust-1';
    const mockResponse = {
      data: [
        { id: 'rec-1', invoiceId: 'inv-1', amount: 500000, paymentDate: new Date().toISOString(), notes: null, createdAt: new Date().toISOString() },
      ],
      meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
    };

    service.getPaymentHistory(customerId).subscribe((res) => {
      expect(res.data).toHaveLength(1);
      expect(res.data[0].amount).toBe(500000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/credit/payments?page=1&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  describe('getPaymentReceipt', () => {
    it('should fetch receipt from /customers/:id/payments/:paymentId/receipt', () => {
      const customerId = 'cust-1';
      const paymentId = 'pay-1';
      const mockReceipt: PaymentReceiptDto = {
        paymentId: 'pay-1',
        paymentAmount: 400000,
        paymentDate: '2026-06-15T00:00:00.000Z',
        paymentNotes: 'Pago parcial',
        invoiceId: 'inv-1',
        invoiceNumber: 'MAN-000001',
        invoiceStatus: 'ON_CREDIT',
        invoiceTotal: 1000000,
        invoiceSubtotal: 850000,
        invoiceDate: '2026-06-01T00:00:00.000Z',
        invoiceItems: [{ productName: 'Producto A', quantity: 2, unitPrice: 500, subtotal: 1000 }],
        allInvoicePayments: [{ id: 'pay-1', amount: 400000, paymentDate: '2026-06-15T00:00:00.000Z', notes: null, isCurrentPayment: true }],
        installments: null,
        paymentFrequency: null,
        dueDate: null,
        remainingBalance: 600000,
        customerId: 'cust-1',
        customerName: 'Juan Pérez',
        customerDocument: '123456789',
      };

      service.getPaymentReceipt(customerId, paymentId).subscribe((receipt) => {
        expect(receipt).toEqual(mockReceipt);
        expect(receipt.invoiceNumber).toBe('MAN-000001');
        expect(receipt.remainingBalance).toBe(600000);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/payments/${paymentId}/receipt`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReceipt);
    });

    it('should propagate HTTP errors', () => {
      const customerId = 'cust-1';
      const paymentId = 'pay-1';

      service.getPaymentReceipt(customerId, paymentId).subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/payments/${paymentId}/receipt`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getPaymentReceiptPdf', () => {
    it('should fetch PDF from /customers/:id/payments/:paymentId/receipt/pdf', () => {
      const customerId = 'cust-1';
      const paymentId = 'pay-1';
      const mockResponse = { pdf: 'base64encodedpdfstring' };

      service.getPaymentReceiptPdf(customerId, paymentId).subscribe((res) => {
        expect(res.pdf).toBe('base64encodedpdfstring');
        expect(typeof res.pdf).toBe('string');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/payments/${paymentId}/receipt/pdf`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
