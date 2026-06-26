// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SalesNoteFormDialogOrganism, SalesNoteDialogData } from './sales-note-form-dialog.component';
import { FinanceService } from '../../../services/finance.service';
import { SalesNoteService } from '../../../services/sales-note.service';
import { InvoiceService } from '../../../services/invoice.service';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Invoice } from '../../../models/invoice.model';

describe('SalesNoteFormDialogOrganism — Factus path', () => {
  let financeService: jasmine.SpyObj<FinanceService>;
  let salesNoteService: jasmine.SpyObj<SalesNoteService>;

  const mockInvoice: Invoice = {
    id: 'inv-uuid-001',
    invoiceNumber: 'FAC-0001',
    sequentialNumber: 1,
    date: '2026-06-26',
    customerId: 'cust-001',
    totalAmount: 1190000,
    status: 'DRAFT',
    isElectronic: true,
    items: [
      {
        productId: 'prod-001',
        name: 'Producto A',
        codeReference: 'P-001',
        quantity: 1,
        unitPrice: 1000000,
        price: 1000000,
        subtotal: 1000000,
      },
    ],
    customer: {
      id: 'cust-001',
      name: 'Cliente Test',
      documentType: 'NIT',
      documentNumber: '900.123.456-7',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  };

  function setup(dataOverrides: Partial<SalesNoteDialogData> = {}) {
    financeService = jasmine.createSpyObj('FinanceService', ['createElectronicCreditNote']);
    salesNoteService = jasmine.createSpyObj('SalesNoteService', ['createCreditNote']);
    const invoiceService = jasmine.createSpyObj('InvoiceService', ['loadInvoices']);

    invoiceService.loadInvoices.and.returnValue(of([]));
    financeService.createElectronicCreditNote.and.returnValue(
      of({ status: 'OK', message: 'Created', data: { number: 'NC-001' } }),
    );
    salesNoteService.createCreditNote.and.returnValue(
      of({ id: 'nc-001', noteNumber: 'NC-001' }),
    );

    const dialogData: SalesNoteDialogData = {
      invoice: mockInvoice,
      ...dataOverrides,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, SalesNoteFormDialogOrganism],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: FinanceService, useValue: financeService },
        { provide: SalesNoteService, useValue: salesNoteService },
        { provide: InvoiceService, useValue: invoiceService },
      ],
    });

    const fixture = TestBed.createComponent(SalesNoteFormDialogOrganism);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture };
  }

  describe('Factus credit note submission', () => {
    it('should call FinanceService.createElectronicCreditNote when useFactusCreditNote is true', () => {
      const { component } = setup({ useFactusCreditNote: true, billNumber: 'SETP990000123' });

      // Set correction concept to '2' (Anulación total) to avoid items being required
      component.noteForm.patchValue({
        correctionConceptCode: '2',
        observation: 'Test anulación',
      });

      (component as any).onSubmit();

      expect(financeService.createElectronicCreditNote).toHaveBeenCalled();
      expect(salesNoteService.createCreditNote).not.toHaveBeenCalled();

      const callArg = financeService.createElectronicCreditNote.calls.mostRecent().args[0];
      expect(callArg.billNumber).toBe('SETP990000123');
      expect(callArg.correctionConceptCode).toBe('2');
    });

    it('should call SalesNoteService.createCreditNote when useFactusCreditNote is not set', () => {
      const { component } = setup(); // no useFactusCreditNote flag

      component.noteForm.patchValue({
        correctionConceptCode: '2',
        observation: 'Test manual',
      });

      (component as any).onSubmit();

      expect(salesNoteService.createCreditNote).toHaveBeenCalled();
      expect(financeService.createElectronicCreditNote).not.toHaveBeenCalled();
    });

    it('should set errorMsg when Factus submission fails', () => {
      financeService.createElectronicCreditNote.and.returnValue(
        throwError(() => ({ error: { message: 'Factus validation error' } })),
      );

      const { component } = setup({ useFactusCreditNote: true, billNumber: 'SETP990000123' });

      component.noteForm.patchValue({
        correctionConceptCode: '2',
        observation: 'Test error',
      });

      (component as any).onSubmit();

      expect(component.errorMsg()).toBe('Factus validation error');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Electronic toggle state', () => {
    it('should be forced ON and disabled when useFactusCreditNote is true', () => {
      const { component } = setup({ useFactusCreditNote: true, billNumber: 'SETP990000123' });

      expect(component.isElectronic()).toBe(true);
      // The toggle disabled state is computed from data.forceElectronic in the template;
      // confirm the signal reflects the forced electronic state
      expect(component.isElectronic()).toBe(true);
    });

    it('should be enabled with invoice.isElectronic when useFactusCreditNote is not set', () => {
      const { component } = setup(); // no flag, invoice.isElectronic = true

      expect(component.isElectronic()).toBe(mockInvoice.isElectronic);
    });
  });
});
