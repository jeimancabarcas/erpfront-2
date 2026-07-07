// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentHistoryTableOrganism } from './payment-history-table.component';
import { PaymentRecord } from '../../../models/customer.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PaymentHistoryTableOrganism', () => {
  let component: PaymentHistoryTableOrganism;
  let fixture: ComponentFixture<PaymentHistoryTableOrganism>;

  const mockPayments: PaymentRecord[] = [
    { id: 'pay-1', invoiceId: 'inv-1', invoiceNumber: 'MAN-000001', amount: 500000, paymentDate: '2026-06-15T00:00:00.000Z', notes: null, createdAt: '2026-06-15T00:00:00.000Z' },
    { id: 'pay-2', invoiceId: 'inv-2', invoiceNumber: 'MAN-000002', amount: 300000, paymentDate: '2026-07-01T00:00:00.000Z', notes: 'Pago parcial', createdAt: '2026-07-01T00:00:00.000Z' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryTableOrganism, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryTableOrganism);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('payments', mockPayments);
    fixture.detectChanges();
  });

  it('should render payment rows', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('MAN-000001');
    expect(el.textContent).toContain('MAN-000002');
  });

  it('should show "Acciones" column header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acciones');
  });

  it('should render receipt button per row with aria-label "Generar recibo"', () => {
    const buttons = fixture.nativeElement.querySelectorAll('[aria-label="Generar recibo"]');
    expect(buttons.length).toBe(2);
  });

  it('should emit receiptRequested with payment data on button click', () => {
    const emittedData: PaymentRecord[] = [];
    component.receiptRequested.subscribe((data: PaymentRecord) => emittedData.push(data));

    const buttons = fixture.nativeElement.querySelectorAll('[aria-label="Generar recibo"]');
    (buttons[0] as HTMLElement).click();

    expect(emittedData).toHaveLength(1);
    expect(emittedData[0].id).toBe('pay-1');
  });
});
