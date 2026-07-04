// @vitest-environment jsdom
import { ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { InvoiceDetailDialogOrganism } from './invoice-detail-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { InvoiceService } from '../../../services/invoice.service';
import { SalesNoteService } from '../../../services/sales-note.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Invoice } from '../../../models/invoice.model';

// Initialize Angular testing environment if not already initialized
try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}

function createManualInvoice(overrides?: Partial<Invoice>): Invoice {
  return {
    id: 'inv-1',
    invoiceNumber: 'FAC-0001',
    sequentialNumber: 1,
    date: '2026-06-23',
    customerId: 'cust-1',
    totalAmount: 100000,
    status: 'PAID',
    items: [
      {
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 50000,
        subtotal: 100000,
      },
    ],
    ...overrides,
  };
}

describe('InvoiceDetailDialogOrganism — Emit button (TDD)', () => {
  let component: InvoiceDetailDialogOrganism;
  let fixture: ComponentFixture<InvoiceDetailDialogOrganism>;
  let mockInvoiceService: any;
  let mockSalesNoteService: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockInvoiceService = {
      getInvoiceById: vi.fn().mockReturnValue(of(createManualInvoice())),
      emitInvoice: vi.fn().mockReturnValue(of(createManualInvoice({ emission: { number: 'SETP990003678', cude: '', qrUrl: '', publicUrl: '', isValidated: false } }))),
      getInvoicePdf: vi.fn().mockReturnValue(of({ pdfBase64Encoded: '', fileName: 'test.pdf' })),
      getInvoiceDianPdf: vi.fn().mockReturnValue(of({ pdfBase64Encoded: '', fileName: 'dian.pdf' })),
    };

    mockSalesNoteService = {
      getNotesByInvoiceId: vi.fn().mockReturnValue(of({ creditNotes: [], debitNotes: [] })),
    };

    mockDialogRef = {
      close: vi.fn(),
    };

    const mockMatDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of({ success: true })),
      }),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { invoiceId: 'inv-1' } },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should show emit button for manual invoice without emission', () => {
    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll('button'));
    const emitButton = buttons.find(b => b.textContent?.includes('Emitir Electrónicamente'));
    expect(emitButton).toBeTruthy();
  });

  it('should call emitInvoice when emit button is clicked', () => {
    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll('button'));
    const emitButton = buttons.find(b => b.textContent?.includes('Emitir Electrónicamente'));
    expect(emitButton).toBeTruthy();
    emitButton!.click();
    expect(mockInvoiceService.emitInvoice).toHaveBeenCalledWith('inv-1');
  });

  it('should update invoice with emission on successful emit', () => {
    const updatedInvoice = createManualInvoice({ emission: { number: 'SETP990003678', cude: '', qrUrl: '', publicUrl: '', isValidated: false } });
    mockInvoiceService.emitInvoice.mockReturnValue(of(updatedInvoice));

    component.emitInvoice();

    expect(component.invoice()?.emission?.number).toBe('SETP990003678');
  });

  it('should not show emit button for electronic invoice', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InvoiceDetailDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { invoice: createManualInvoice({ emission: { number: 'SETP990001', cude: '', qrUrl: '', publicUrl: '', isValidated: true } }) } },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailDialogOrganism);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll('button'));
    const emitButton = buttons.find(b => b.textContent?.includes('Emitir Electrónicamente'));
    expect(emitButton).toBeFalsy();
  });

  it('should not show emit button for manual invoice already with emission', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InvoiceDetailDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { invoice: createManualInvoice({ emission: { number: 'SETP990003678', cude: '', qrUrl: '', publicUrl: '', isValidated: false } }) } },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailDialogOrganism);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll('button'));
    const emitButton = buttons.find(b => b.textContent?.includes('Emitir Electrónicamente'));
    expect(emitButton).toBeFalsy();
  });

  it('should set error state when emit fails', () => {
    mockInvoiceService.emitInvoice.mockReturnValue(throwError(() => new Error('Emit failed')));

    component.emitInvoice();

    expect(component.emitError()).toBe('Error al emitir la factura electrónica');
  });
});

describe('InvoiceDetailDialogOrganism — afterClosed reload (TDD)', () => {
  let component: InvoiceDetailDialogOrganism;
  let fixture: ComponentFixture<InvoiceDetailDialogOrganism>;
  let mockInvoiceService: any;
  let mockSalesNoteService: any;
  let mockDialogRef: any;
  let mockMatDialog: any;

  function createSuiteInvoice(overrides?: Partial<Invoice>): Invoice {
    return {
      id: 'inv-1',
      invoiceNumber: 'FAC-0001',
      sequentialNumber: 1,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      items: [
        { productId: 'prod-1', quantity: 2, unitPrice: 50000, subtotal: 100000 },
      ],
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockInvoiceService = {
      getInvoiceById: vi.fn().mockReturnValue(of(createSuiteInvoice())),
      emitInvoice: vi.fn(),
      getInvoicePdf: vi.fn(),
      getInvoiceDianPdf: vi.fn(),
    };

    mockSalesNoteService = {
      getNotesByInvoiceId: vi.fn().mockReturnValue(of({ creditNotes: [], debitNotes: [] })),
    };

    mockDialogRef = { close: vi.fn() };
  });

  async function setupWithInvoice(invoice: Invoice, afterClosedReturn: any = of({ success: true })) {
    mockMatDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(afterClosedReturn),
      }),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { invoice } },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('calls loadNotes when adjustment dialog returns success', async () => {
    const invoice = createSuiteInvoice();
    await setupWithInvoice(invoice);
    mockSalesNoteService.getNotesByInvoiceId.mockClear();

    component.openAdjustmentDialog(invoice);

    expect(mockSalesNoteService.getNotesByInvoiceId).toHaveBeenCalledWith('inv-1');
  });

  it('does NOT call loadNotes when adjustment dialog is cancelled (no result)', async () => {
    const invoice = createSuiteInvoice();
    await setupWithInvoice(invoice, of(undefined));
    mockSalesNoteService.getNotesByInvoiceId.mockClear();

    component.openAdjustmentDialog(invoice);

    expect(mockSalesNoteService.getNotesByInvoiceId).not.toHaveBeenCalled();
  });

  it('does NOT call loadNotes when adjustment dialog returns error', async () => {
    const invoice = createSuiteInvoice();
    await setupWithInvoice(invoice, of({ success: false }));
    mockSalesNoteService.getNotesByInvoiceId.mockClear();

    component.openAdjustmentDialog(invoice);

    expect(mockSalesNoteService.getNotesByInvoiceId).not.toHaveBeenCalled();
  });

  it('passes invoice data to adjustment dialog', async () => {
    const invoice = createSuiteInvoice();
    await setupWithInvoice(invoice);

    component.openAdjustmentDialog(invoice);

    expect(mockMatDialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: expect.objectContaining({
          invoice: expect.objectContaining({
            id: invoice.id,
          }),
        }),
      }),
    );
  });
});

describe('InvoiceDetailDialogOrganism — Tax Display (TDD)', () => {
  let component: InvoiceDetailDialogOrganism;
  let fixture: ComponentFixture<InvoiceDetailDialogOrganism>;
  let mockInvoiceService: any;
  let mockSalesNoteService: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockInvoiceService = {
      getInvoiceById: vi.fn(),
      emitInvoice: vi.fn(),
      getInvoicePdf: vi.fn(),
      getInvoiceDianPdf: vi.fn(),
    };
    mockSalesNoteService = {
      getNotesByInvoiceId: vi.fn().mockReturnValue(of({ creditNotes: [], debitNotes: [] })),
    };
    mockDialogRef = { close: vi.fn() };
  });

  async function setupWithInvoice(invoice: Invoice) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { invoice } },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should show tax breakdown per item when item.taxes is present', async () => {
    const invoice: Invoice = {
      id: 'inv-tax-1',
      invoiceNumber: 'FAC-9999',
      sequentialNumber: 99,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 119000,
      status: 'PAID',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          unitPrice: 119000,
          subtotal: 119000,
          taxAmount: 19000,
          taxes: [
            { id: 'tax-1', taxCode: 'IVA', taxRate: 19, taxAmount: 19000 },
          ],
        },
      ],
    };
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('IVA');
    expect(el.textContent).toContain('19,000');
  });

  it('should show dash when item.taxes is absent', async () => {
    const invoice: Invoice = {
      id: 'inv-no-tax-1',
      invoiceNumber: 'FAC-9998',
      sequentialNumber: 98,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
    };
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    const cells = Array.from(el.querySelectorAll('td'));
    const taxCell = cells.find(c => c.textContent?.trim() === '-');
    expect(taxCell).toBeTruthy();
  });

  it('should show dash when item.taxes is empty array', async () => {
    const invoice: Invoice = {
      id: 'inv-empty-tax-1',
      invoiceNumber: 'FAC-9997',
      sequentialNumber: 97,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
          taxAmount: 0,
          taxes: [],
        },
      ],
    };
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    const cells = Array.from(el.querySelectorAll('td'));
    const taxCell = cells.find(c => c.textContent?.trim() === '-');
    expect(taxCell).toBeTruthy();
  });

  it('should show tax summary section with grouped amounts', async () => {
    const invoice: Invoice = {
      id: 'inv-tax-sum-1',
      invoiceNumber: 'FAC-9996',
      sequentialNumber: 96,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 246000,
      status: 'PAID',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          unitPrice: 123000,
          subtotal: 123000,
          taxes: [
            { id: 'tax-iva', taxCode: 'IVA', taxRate: 19, taxAmount: 19000 },
            { id: 'tax-inc', taxCode: 'INC', taxRate: 4, taxAmount: 4000 },
          ],
        },
        {
          productId: 'prod-2',
          quantity: 1,
          unitPrice: 123000,
          subtotal: 123000,
          taxes: [
            { id: 'tax-iva-2', taxCode: 'IVA', taxRate: 19, taxAmount: 19000 },
            { id: 'tax-inc-2', taxCode: 'INC', taxRate: 4, taxAmount: 4000 },
          ],
        },
      ],
    };
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Resumen de Impuestos');
    expect(el.textContent).toContain('Total Impuestos');
    // Each tax code appears once in summary (grouped)
    expect(component.taxSummary().length).toBe(2);
    expect(component.totalTaxAmount()).toBe(46000);
  });

  it('should NOT show tax summary when no items have taxes', async () => {
    const invoice: Invoice = {
      id: 'inv-no-tax-sum-1',
      invoiceNumber: 'FAC-9995',
      sequentialNumber: 95,
      date: '2026-06-23',
      customerId: 'cust-1',
      totalAmount: 100000,
      status: 'PAID',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
    };
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Resumen de Impuestos');
  });
});

describe('InvoiceDetailDialogOrganism — Emission metadata section (TDD)', () => {
  let component: InvoiceDetailDialogOrganism;
  let fixture: ComponentFixture<InvoiceDetailDialogOrganism>;
  let mockInvoiceService: any;
  let mockSalesNoteService: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockInvoiceService = {
      getInvoiceById: vi.fn(),
      emitInvoice: vi.fn(),
      getInvoicePdf: vi.fn(),
      getInvoiceDianPdf: vi.fn(),
    };
    mockSalesNoteService = {
      getNotesByInvoiceId: vi.fn().mockReturnValue(of({ creditNotes: [], debitNotes: [] })),
    };
    mockDialogRef = { close: vi.fn() };
  });

  async function setupWithInvoice(invoice: Invoice) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { invoice } },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should display emission number, CUDE, QR, public URL and validation status when emission is present', async () => {
    const invoice = createManualInvoice({
      emission: {
        number: 'SETP990003678',
        cude: 'abc123cudehash',
        qrUrl: 'https://example.com/qr.png',
        publicUrl: 'https://example.com/dian-view',
        isValidated: true,
      },
    });
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SETP990003678');
    expect(el.textContent).toContain('abc123cudehash');
    expect(el.textContent).toContain('Emisión Electrónica');
  });

  it('should display PENDIENTE validation badge when emission is not validated', async () => {
    const invoice = createManualInvoice({
      emission: {
        number: 'SETP990003679',
        cude: 'anothercude',
        qrUrl: '',
        publicUrl: '',
        isValidated: false,
      },
    });
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SETP990003679');
    expect(el.textContent).toContain('PENDIENTE');
  });

  it('should NOT display emission section when invoice has no emission', async () => {
    const invoice = createManualInvoice(); // no emission
    await setupWithInvoice(invoice);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Emisión Electrónica');
  });
});
