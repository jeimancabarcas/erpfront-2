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

describe('AdjustmentFormDialogOrganism — Scenario D only', () => {
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

  it('has only code 2 in correction concepts', async () => {
    await setupWithData({});
    expect(component.correctionConcepts).toHaveLength(1);
    expect(component.correctionConcepts[0].code).toBe('2');
  });

  it('defaults correction concept to empty (user must select)', async () => {
    await setupWithData({});
    expect(component.adjustmentForm.get('correctionConceptCode')?.value).toBe('');
  });

  it('submits credit note with correction concept code 2', async () => {
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
        electronicId: 'elec-001',
      },
    });

    component.adjustmentForm.patchValue({
      correctionConceptCode: '2',
      reason: 'Test annulment',
    });

    component.onSubmit();

    expect(mockSalesNoteService.createCreditNote).toHaveBeenCalled();
    const dto = mockSalesNoteService.createCreditNote.mock.calls[0][1];
    expect(dto.correctionConceptCode).toBe('2');
  });

  it('derives isElectronic from invoice electronicId', async () => {
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
        electronicId: 'elec-001',
      },
    });

    component.adjustmentForm.patchValue({
      correctionConceptCode: '2',
      reason: 'Test',
    });

    component.onSubmit();

    const dto1 = mockSalesNoteService.createCreditNote.mock.calls[0][1];
    expect(dto1.isElectronic).toBe(true);
  });

  it('sets isElectronic to false when invoice has no electronicId', async () => {
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
      },
    });

    component.adjustmentForm.patchValue({
      correctionConceptCode: '2',
      reason: 'Test manual',
    });

    component.onSubmit();

    const dto2 = mockSalesNoteService.createCreditNote.mock.calls[0][1];
    expect(dto2.isElectronic).toBe(false);
  });
});
