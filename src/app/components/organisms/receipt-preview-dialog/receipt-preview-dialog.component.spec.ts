// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReceiptPreviewDialogOrganism,
  ReceiptPreviewDialogData,
} from './receipt-preview-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../../services/customer.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentReceiptDto } from '../../../models/customer.model';
import { of, throwError, delay } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ReceiptPreviewDialogOrganism', () => {
  let component: ReceiptPreviewDialogOrganism;
  let fixture: ComponentFixture<ReceiptPreviewDialogOrganism>;
  let mockDialogRef: any;
  let mockCustomerService: any;

  const defaultData: ReceiptPreviewDialogData = {
    customerId: 'cust-1',
    paymentId: 'pay-1',
  };

  const mockReceipt: PaymentReceiptDto = {
    paymentId: 'pay-1',
    paymentAmount: 400000,
    paymentDate: '2026-06-15T00:00:00.000Z',
    paymentNotes: 'Pago parcial quincena 1',
    invoiceId: 'inv-1',
    invoiceNumber: 'MAN-000001',
    invoiceStatus: 'ON_CREDIT',
    invoiceTotal: 1000000,
    invoiceSubtotal: 850000,
    invoiceDate: '2026-06-01T00:00:00.000Z',
    invoiceItems: [
      { productName: 'Producto A', quantity: 2, unitPrice: 500, subtotal: 1000 },
      { productName: 'Producto B', quantity: 3, unitPrice: 100, subtotal: 300 },
    ],
    allInvoicePayments: [
      {
        id: 'pay-2',
        amount: 300000,
        paymentDate: '2026-07-01T00:00:00.000Z',
        notes: null,
        isCurrentPayment: false,
      },
      {
        id: 'pay-1',
        amount: 400000,
        paymentDate: '2026-06-15T00:00:00.000Z',
        notes: 'Pago parcial quincena 1',
        isCurrentPayment: true,
      },
    ],
    installments: null,
    paymentFrequency: null,
    dueDate: null,
    remainingBalance: 600000,
    customerId: 'cust-1',
    customerName: 'Juan Pérez',
    customerDocument: '123456789',
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    mockCustomerService = {
      getPaymentReceipt: vi.fn().mockReturnValue(of(mockReceipt)),
      getPaymentReceiptPdf: vi.fn().mockReturnValue(of({ pdf: 'base64pdf' })),
    };

    await TestBed.configureTestingModule({
      imports: [ReceiptPreviewDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: defaultData },
        { provide: CustomerService, useValue: mockCustomerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptPreviewDialogOrganism);
    component = fixture.componentInstance;
  });

  it('should set loading=true on init before API resolves (FR-3)', () => {
    // loading starts as true before detectChanges triggers the API call
    expect(component.loading()).toBe(true);
  });

  it('should show "Generando recibo..." while loading (FR-3)', () => {
    mockCustomerService.getPaymentReceipt.mockReturnValue(
      of(mockReceipt).pipe(delay(1000))
    );
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Generando recibo');
  });

  it('should show receipt content on successful load (FR-3)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockCustomerService.getPaymentReceipt).toHaveBeenCalledWith('cust-1', 'pay-1');
    expect(component.loading()).toBe(false);
    expect(component.data()).not.toBeNull();
  });

  it('should display invoice number after loading (FR-3)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(component.data()).not.toBeNull();
    expect(el.textContent).toContain('MAN-000001');
  });

  it('should show error state on API failure (FR-4)', () => {
    mockCustomerService.getPaymentReceipt.mockReturnValue(
      throwError(() => new Error('API Error')),
    );
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(component.error()).toBeTruthy();
    expect(el.textContent).toContain('No se pudo cargar el recibo');
    expect(el.textContent).toContain('Cerrar');
  });

  it('should render invoice line items section (FR-5)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Detalle de Factura');
    expect(el.textContent).toContain('Producto A');
    expect(el.textContent).toContain('Producto B');
  });

  it('should render payment mini-history section (FR-7)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Historial de Abonos');
    // Should show "Este recibo" badge for current payment
    expect(el.textContent).toContain('Este recibo');
  });

  it('should render plazo/cuotas section when paymentFrequency is present (CR-1)', async () => {
    const receiptWithTerms = {
      ...mockReceipt,
      installments: 3,
      paymentFrequency: 'MONTHLY',
      dueDate: '2026-09-01T00:00:00.000Z',
    };
    mockCustomerService.getPaymentReceipt.mockReturnValue(of(receiptWithTerms));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Plazo y Cuotas');
    expect(el.textContent).toContain('Mensual');
    expect(el.textContent).toContain('3 cuotas');
  });

  it('should show "Sin condiciones de pago" when no payment terms (CR-2)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin condiciones');
  });

  it('should render remaining balance section (FR-10, FR-11)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Saldo Pendiente');
    // remainingBalance = 600000 > 0, should show in amber
    expect(el.textContent).toContain('600,000');
    expect(el.textContent).not.toContain('Pagada');
  });

  it('should show "Pagada" when remainingBalance is 0 (FR-10)', () => {
    const paidReceipt = { ...mockReceipt, remainingBalance: 0, invoiceStatus: 'PAID' };
    mockCustomerService.getPaymentReceipt.mockReturnValue(of(paidReceipt));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pagada');
  });

  it('should render notes section (FR-12)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Notas del Pago');
    expect(el.textContent).toContain('Pago parcial quincena 1');
  });

  it('should show "Sin notas" when no payment notes (FR-12)', () => {
    const noNotesReceipt = { ...mockReceipt, paymentNotes: null };
    mockCustomerService.getPaymentReceipt.mockReturnValue(of(noNotesReceipt));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin notas');
  });

  it('should have download PDF button in footer', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Descargar PDF');
  });

  it('should close dialog via close button', () => {
    fixture.detectChanges();
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call getPaymentReceiptPdf on download click', async () => {
    // Use valid base64 input for atob (base64 encoding of "test")
    mockCustomerService.getPaymentReceiptPdf.mockReturnValue(of({ pdf: 'dGVzdA==' }));

    const originalCreateObjectURL = URL.createObjectURL;
    const mockUrl = 'blob:http://localhost/test';
    URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);

    const anchorClick = vi.fn();
    const anchor = { href: '', download: '', click: anchorClick } as any;
    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return anchor;
      return origCreateElement(tag);
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.downloadPdf();

    await fixture.whenStable();

    expect(mockCustomerService.getPaymentReceiptPdf).toHaveBeenCalledWith('cust-1', 'pay-1');
    expect(anchorClick).toHaveBeenCalled();

    // Cleanup
    URL.createObjectURL = originalCreateObjectURL;
    createElementSpy.mockRestore();
  });

  it('should show download loading state', () => {
    // Use delayed observable so loading state persists before assertion
    mockCustomerService.getPaymentReceiptPdf.mockReturnValue(
      of({ pdf: 'dGVzdA==' }).pipe(delay(100000))
    );
    fixture.detectChanges();
    component.downloadPdf();
    expect(component.downloading()).toBe(true);
  });

  it('should show download error state on failure', () => {
    mockCustomerService.getPaymentReceiptPdf.mockReturnValue(
      throwError(() => new Error('Download failed')),
    );
    fixture.detectChanges();
    component.downloadPdf();
    expect(component.downloadError()).toBe(true);
  });

  it('should close dialog on Escape or close button (FR-16)', () => {
    fixture.detectChanges();
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
