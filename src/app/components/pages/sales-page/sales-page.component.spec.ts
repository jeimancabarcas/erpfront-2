import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesPageComponent } from './sales-page.component';
import { InvoiceService } from '../../../services/invoice.service';
import { CustomerService } from '../../../services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Invoice } from '../../../models/invoice.model';
import { provideRouter } from '@angular/router';

// ---------------------------------------------------------------------------
// Helper: build a minimal Invoice for the table
// ---------------------------------------------------------------------------
function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    invoiceNumber: 'FAC-0001',
    sequentialNumber: 1,
    date: '2026-01-01T00:00:00Z',
    customerId: 'cust-1',
    customer: { id: 'cust-1', name: 'Test Customer' } as any,
    totalAmount: 1000,
    status: 'PAID',
    notes: undefined,
    items: [],
    ...overrides,
  };
}

describe('SalesPageComponent — amount column and actions (TDD)', () => {
  let component: SalesPageComponent;
  let fixture: ComponentFixture<SalesPageComponent>;
  let mockInvoiceService: any;
  let mockCustomerService: any;
  let mockDialog: any;

  async function buildComponent(invoices: Invoice[]) {
    mockInvoiceService = {
      invoices: signal(invoices),
      meta: signal(null),
      loadInvoices: vi.fn().mockReturnValue(of({ data: invoices, meta: null })),
      getInvoicePdf: vi.fn().mockReturnValue(of({ pdfBase64Encoded: '', fileName: 'test.pdf' })),
    };

    mockCustomerService = {
      customers: signal([]),
      loadCustomers: vi.fn().mockReturnValue(of({ data: [], meta: null })),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }),
    };

    await TestBed.configureTestingModule({
      imports: [SalesPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // -------------------------------------------------------------------------
  // Scenario (a): netTotal present → column shows netTotal
  // -------------------------------------------------------------------------
  it('(a) displays netTotal in the amount column when netTotal is present on the invoice', async () => {
    const invoice = makeInvoice({ totalAmount: 1000, netTotal: 800 });
    await buildComponent([invoice]);

    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    // The rendered currency amount should reflect netTotal (800) not totalAmount (1000)
    // The CurrencyPipe renders $800.00 — we look for "800" presence
    const amountCells = nativeEl.querySelectorAll('td[mat-cell]');
    const amountText = Array.from(amountCells)
      .map((el) => el.textContent ?? '')
      .join(' ');

    expect(amountText).toContain('800');
    expect(amountText).not.toMatch(/\$1,000|\$1000/);
  });

  // -------------------------------------------------------------------------
  // Scenario (b): netTotal absent → falls back to totalAmount
  // -------------------------------------------------------------------------
  it('(b) displays totalAmount in the amount column when netTotal is absent (undefined)', async () => {
    const invoice = makeInvoice({ totalAmount: 1000, netTotal: undefined });
    await buildComponent([invoice]);

    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const amountCells = nativeEl.querySelectorAll('td[mat-cell]');
    const amountText = Array.from(amountCells)
      .map((el) => el.textContent ?? '')
      .join(' ');

    // Should render $1,000.00 (totalAmount)
    expect(amountText).toMatch(/1[,.]?000/);
  });

  // -------------------------------------------------------------------------
  // Scenario (c): PDF download button must NOT appear in row actions
  // -------------------------------------------------------------------------
  it('(c) does not render a PDF download button in the row actions column', async () => {
    const invoice = makeInvoice({ totalAmount: 1000 });
    await buildComponent([invoice]);

    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    // Look for the picture_as_pdf mat-icon which was in the removed button
    const pdfIcons = nativeEl.querySelectorAll('mat-icon');
    const hasPdfIcon = Array.from(pdfIcons).some(
      (el) => el.textContent?.trim() === 'picture_as_pdf',
    );
    expect(hasPdfIcon).toBe(false);

    // Also verify no tooltip matching "PDF" or "pdf" exists on any button
    const allButtons = nativeEl.querySelectorAll('button[mat-icon-button]');
    const hasPdfButton = Array.from(allButtons).some((btn) => {
      const tooltip = btn.getAttribute('mattooltip') ?? btn.getAttribute('ng-reflect-message') ?? '';
      return tooltip.toLowerCase().includes('pdf');
    });
    expect(hasPdfButton).toBe(false);
  });
});

describe('SalesPageComponent — MANUAL badge in invoice list (TDD)', () => {
  let component: SalesPageComponent;
  let fixture: ComponentFixture<SalesPageComponent>;
  let mockInvoiceService: any;
  let mockCustomerService: any;
  let mockDialog: any;

  async function buildComponent(invoices: Invoice[]) {
    mockInvoiceService = {
      invoices: signal(invoices),
      meta: signal(null),
      loadInvoices: vi.fn().mockReturnValue(of({ data: invoices, meta: null })),
      getInvoicePdf: vi.fn().mockReturnValue(of({ pdfBase64Encoded: '', fileName: 'test.pdf' })),
    };

    mockCustomerService = {
      customers: signal([]),
      loadCustomers: vi.fn().mockReturnValue(of({ data: [], meta: null })),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }),
    };

    await TestBed.configureTestingModule({
      imports: [SalesPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('renders MANUAL badge when isElectronic is false', async () => {
    const invoice = makeInvoice({ invoiceNumber: 'MAN-0001', isElectronic: false });
    await buildComponent([invoice]);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector('[data-testid="manual-badge"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe('MANUAL');
  });

  it('does NOT render MANUAL badge when isElectronic is true', async () => {
    const invoice = makeInvoice({ invoiceNumber: 'FAC-0001', isElectronic: true });
    await buildComponent([invoice]);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector('[data-testid="manual-badge"]');
    expect(badge).toBeNull();
  });

  it('does NOT render MANUAL badge when isElectronic is undefined', async () => {
    const invoice = makeInvoice({ invoiceNumber: 'FAC-0001', isElectronic: undefined });
    await buildComponent([invoice]);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector('[data-testid="manual-badge"]');
    expect(badge).toBeNull();
  });

  it('renders ELECTRÓNICA badge when isElectronic is true', async () => {
    const invoice = makeInvoice({ invoiceNumber: 'SETP990001', isElectronic: true });
    await buildComponent([invoice]);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector('[data-testid="electronic-badge"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe('ELECTRÓNICA');
  });

  it('renders ELECTRÓNICA badge when invoice has been emitted (isElectronic + emission)', async () => {
    const invoice = makeInvoice({ invoiceNumber: 'MAN-0001', emission: { number: 'SETP990099', cude: '', qrUrl: '', publicUrl: '', isValidated: true }, isElectronic: true });
    await buildComponent([invoice]);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector('[data-testid="electronic-badge"]');
    expect(badge).not.toBeNull();
  });

  it('does NOT render ELECTRÓNICA badge when isElectronic is false', async () => {
    const invoice = makeInvoice({ invoiceNumber: 'MAN-0001', isElectronic: false });
    await buildComponent([invoice]);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector('[data-testid="electronic-badge"]');
    expect(badge).toBeNull();
  });
});
