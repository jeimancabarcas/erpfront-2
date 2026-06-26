// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../environments/environment';
import { CreditPortfolio, PaymentRecord } from '../models/customer.model';
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
    const mockRecords: PaymentRecord[] = [
      { id: 'rec-1', invoiceId: 'inv-1', amount: 500000, paymentDate: new Date().toISOString(), notes: null, createdAt: new Date().toISOString() },
    ];

    service.getPaymentHistory(customerId).subscribe((records) => {
      expect(records).toHaveLength(1);
      expect(records[0].amount).toBe(500000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/customers/${customerId}/credit/payments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRecords);
  });
});
