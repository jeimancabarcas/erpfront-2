// @vitest-environment jsdom
import { ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { AdjustmentFormDialogOrganism, AdjustmentFormData } from './adjustment-form-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FinanceService } from '../../../services/finance.service';
import { InvoiceService } from '../../../services/invoice.service';
import { SalesNoteService } from '../../../services/sales-note.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';

// Initialize Angular testing environment if not already initialized
try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}

describe('AdjustmentFormDialogOrganism — conditional electronic toggle (TDD)', () => {
  let component: AdjustmentFormDialogOrganism;
  let fixture: ComponentFixture<AdjustmentFormDialogOrganism>;
  let mockFinanceService: any;
  let mockInvoiceService: any;
  let mockSalesNoteService: any;
  let mockDialogRef: any;

  async function setupWithData(data: AdjustmentFormData) {
    mockFinanceService = {};
    mockInvoiceService = {
      invoices: signal([]),
      loadInvoices: vi.fn().mockReturnValue(of([])),
    };
    mockSalesNoteService = {
      getNotesByInvoiceId: vi.fn().mockReturnValue(of({ creditNotes: [], debitNotes: [] })),
      createCreditNote: vi.fn().mockReturnValue(of({})),
      createDebitNote: vi.fn().mockReturnValue(of({})),
    };
    mockDialogRef = {
      close: vi.fn(),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AdjustmentFormDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: FinanceService, useValue: mockFinanceService },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: SalesNoteService, useValue: mockSalesNoteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdjustmentFormDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('sets isElectronic to false for manual invoice from data', async () => {
    await setupWithData({
      invoice: {
        id: 'MAN-001',
        dbId: 'inv-1',
        customerName: 'Test',
        customerTaxId: '123',
        date: '2026-06-23',
        dueDate: '2026-06-23',
        items: [],
        subtotal: 1000,
        tax: 0,
        total: 1000,
        status: 'Paid',
        isElectronic: false,
      },
    });

    expect(component.isElectronic()).toBe(false);
    expect(component.isElectronicDisabled()).toBe(true);
  });

  it('sets isElectronic to true for electronic invoice from data', async () => {
    await setupWithData({
      invoice: {
        id: 'FAC-001',
        dbId: 'inv-2',
        customerName: 'Test',
        customerTaxId: '123',
        date: '2026-06-23',
        dueDate: '2026-06-23',
        items: [],
        subtotal: 1000,
        tax: 0,
        total: 1000,
        status: 'Paid',
        isElectronic: true,
      },
    });

    expect(component.isElectronic()).toBe(true);
    expect(component.isElectronicDisabled()).toBe(false);
  });

  it('renders toggle disabled for manual invoice', async () => {
    await setupWithData({
      invoice: {
        id: 'MAN-001',
        dbId: 'inv-1',
        customerName: 'Test',
        customerTaxId: '123',
        date: '2026-06-23',
        dueDate: '2026-06-23',
        items: [],
        subtotal: 1000,
        tax: 0,
        total: 1000,
        status: 'Paid',
        isElectronic: false,
      },
    });

    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('mat-slide-toggle');
    expect(toggle).not.toBeNull();
    expect(component.isElectronicDisabled()).toBe(true);
    expect(component.isElectronic()).toBe(false);
  });

  it('shows explanation message for manual invoice', async () => {
    await setupWithData({
      invoice: {
        id: 'MAN-001',
        dbId: 'inv-1',
        customerName: 'Test',
        customerTaxId: '123',
        date: '2026-06-23',
        dueDate: '2026-06-23',
        items: [],
        subtotal: 1000,
        tax: 0,
        total: 1000,
        status: 'Paid',
        isElectronic: false,
      },
    });

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('manual');
    expect(el.textContent).toContain('solo pueden emitirse para facturas electrónicas');
  });

  it('renders toggle enabled for electronic invoice', async () => {
    await setupWithData({
      invoice: {
        id: 'FAC-001',
        dbId: 'inv-2',
        customerName: 'Test',
        customerTaxId: '123',
        date: '2026-06-23',
        dueDate: '2026-06-23',
        items: [],
        subtotal: 1000,
        tax: 0,
        total: 1000,
        status: 'Paid',
        isElectronic: true,
      },
    });

    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('mat-slide-toggle');
    expect(toggle).not.toBeNull();
    expect(component.isElectronic()).toBe(true);
    expect(component.isElectronicDisabled()).toBe(false);
  });

  it('defaults isElectronic to false when data.invoice is undefined', async () => {
    await setupWithData({});

    expect(component.isElectronic()).toBe(false);
    expect(component.isElectronicDisabled()).toBe(true);
  });
});
