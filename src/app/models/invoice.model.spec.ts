// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Invoice } from './invoice.model';

describe('Invoice model', () => {
  it('should accept sequentialNumber in Invoice object', () => {
    const invoice: Invoice = {
      id: 'inv-1',
      invoiceNumber: 'FAC-0001',
      sequentialNumber: 1,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      items: [],
    };

    expect(invoice.sequentialNumber).toBe(1);
  });

  it('should accept emission object when invoice is electronic', () => {
    const invoice: Invoice = {
      id: 'inv-1',
      invoiceNumber: 'FAC-0001',
      sequentialNumber: 42,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      items: [],
      emission: {
        number: 'SETP990003678',
        cude: 'abc123cude',
        qrUrl: 'https://example.com/qr',
        publicUrl: 'https://example.com/public',
        isValidated: true,
      },
    };

    expect(invoice.emission?.number).toBe('SETP990003678');
    expect(invoice.emission?.cude).toBe('abc123cude');
    expect(invoice.emission?.qrUrl).toBe('https://example.com/qr');
    expect(invoice.emission?.publicUrl).toBe('https://example.com/public');
    expect(invoice.emission?.isValidated).toBe(true);
  });

  it('should allow emission to be undefined for non-electronic invoices', () => {
    const invoice: Invoice = {
      id: 'inv-2',
      invoiceNumber: 'MAN-0001',
      sequentialNumber: 1,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 50000,
      status: 'PAID',
      items: [],
    };

    expect(invoice.emission).toBeUndefined();
  });
});
