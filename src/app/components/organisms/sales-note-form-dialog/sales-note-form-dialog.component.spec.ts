// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SalesNoteFormDialogOrganism, SalesNoteDialogData } from './sales-note-form-dialog.component';
import { SalesNoteService } from '../../../services/sales-note.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Invoice } from '../../../models/invoice.model';

describe('SalesNoteFormDialogOrganism — Scenario D (Total Annulment)', () => {
  let salesNoteService: { createCreditNote: ReturnType<typeof vi.fn> };

  const mockInvoice: Invoice = {
    id: 'inv-uuid-001',
    invoiceNumber: 'FAC-0001',
    sequentialNumber: 1,
    date: '2026-06-26',
    customerId: 'cust-001',
    totalAmount: 1190000,
    status: 'DRAFT',
    items: [
      {
        productId: 'prod-001',
        quantity: 1,
        unitPrice: 1000000,
        subtotal: 1000000,
        product: { id: 'prod-001', name: 'Producto A', sku: 'P-001' } as any,
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
    salesNoteService = { createCreditNote: vi.fn() };
    salesNoteService.createCreditNote.mockReturnValue(
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
        { provide: SalesNoteService, useValue: salesNoteService },
      ],
    });

    const fixture = TestBed.createComponent(SalesNoteFormDialogOrganism);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture };
  }

  it('should default to correction concept code 2 (total annulment)', () => {
    const { component } = setup();
    expect(component.noteForm.get('correctionConceptCode')?.value).toBe('2');
  });

  it('should have scenario set to D (total annulment)', () => {
    const { component } = setup();
    expect(component.scenario()).toBe('D');
  });

  it('showItemsTable should always be false', () => {
    const { component } = setup();
    expect(component.showItemsTable()).toBe(false);
  });

  it('should call SalesNoteService.createCreditNote on submit', () => {
    const { component } = setup();

    component.noteForm.patchValue({
      correctionConceptCode: '2',
      observation: 'Test annulment',
    });

    (component as any).onSubmit();

    expect(salesNoteService.createCreditNote).toHaveBeenCalled();
    const callArg = salesNoteService.createCreditNote.mock.calls[0][1];
    expect(callArg.correctionConceptCode).toBe('2');
    expect(callArg.scenarioType).toBe('total_annulment');
  });

  it('should derive isElectronic from invoice.emission', () => {
    const invoiceWithEmission: Invoice = {
      ...mockInvoice,
      emission: { number: 'SETP990001', cude: 'abc', qrUrl: '', publicUrl: '', isValidated: true },
    };
    const { component } = setup({ invoice: invoiceWithEmission });

    component.noteForm.patchValue({
      correctionConceptCode: '2',
      observation: 'Test',
    });

    (component as any).onSubmit();

    const callArg1 = salesNoteService.createCreditNote.mock.calls[0][1];
    expect(callArg1.isElectronic).toBe(true);
  });

  it('should set isElectronic to false when invoice has no emission', () => {
    const { component } = setup();

    component.noteForm.patchValue({
      correctionConceptCode: '2',
      observation: 'Test manual',
    });

    (component as any).onSubmit();

    const callArg2 = salesNoteService.createCreditNote.mock.calls[0][1];
    expect(callArg2.isElectronic).toBe(false);
  });
});
