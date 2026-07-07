// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesCustomerDetailPageComponent } from './sales-customer-detail-page.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerService } from '../../../../services/customer.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentRecord } from '../../../../models/customer.model';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../../shared/constants/dialog.config';

describe('SalesCustomerDetailPageComponent', () => {
  let component: SalesCustomerDetailPageComponent;
  let fixture: ComponentFixture<SalesCustomerDetailPageComponent>;
  let mockDialog: any;
  let mockCustomerService: any;
  let mockInvoiceService: any;

  const mockStatsResponse = {
    customer: {
      id: 'cust-1',
      name: 'Test Customer',
      documentType: 'CC' as const,
      documentNumber: '12345',
      status: 'ACTIVE' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    totalInvoiced: 1000000,
    invoiceCount: 5,
    invoices: [],
  };

  beforeEach(async () => {
    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of({}),
      }),
    };

    mockCustomerService = {
      getCustomerStats: vi.fn().mockReturnValue(of(mockStatsResponse)),
      getCustomerCredit: vi.fn().mockReturnValue(of(null)),
      getPaymentHistory: vi.fn().mockReturnValue(of({ data: [], meta: { total: 0, page: 1, lastPage: 1, limit: 10 } })),
    };

    mockInvoiceService = {
      loadInvoices: vi.fn().mockReturnValue(of({ data: [], meta: { total: 0 } })),
    };

    await TestBed.configureTestingModule({
      imports: [SalesCustomerDetailPageComponent, NoopAnimationsModule, MatDialogModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? 'cust-1' : null,
              },
            },
          },
        },
        { provide: MatDialog, useValue: mockDialog },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: InvoiceService, useValue: mockInvoiceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesCustomerDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should open ReceiptPreviewDialog on receiptRequested', () => {
    const payment: PaymentRecord = {
      id: 'pay-1',
      invoiceId: 'inv-1',
      amount: 500000,
      paymentDate: '2026-06-15T00:00:00.000Z',
      notes: null,
      createdAt: '2026-06-15T00:00:00.000Z',
    };

    component.onReceiptRequested(payment);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockDialog.open.mock.calls[0][1]).toMatchObject({
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
      data: { customerId: 'cust-1', paymentId: 'pay-1' },
    });
  });
});
