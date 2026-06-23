// @vitest-environment jsdom
import { ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { SaleFormMolecule } from './sale-form.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { InvoiceService } from '../../../services/invoice.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Customer } from '../../../models/customer.model';
import { CustomerDialogOrganism } from '../../../components/organisms/customer-dialog/customer-dialog.component';
import { ProductSelectionDialogComponent, ProductSelectionDialogResult } from '../../organisms/product-selection-dialog/product-selection-dialog.component';

// Initialize Angular testing environment if not already initialized by Angular test builder
try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}

function createTestModule(
  mockDialogRef: any,
  mockMatDialog: any,
  mockProductService: any,
  mockCustomerService: any,
  mockInvoiceService: any,
) {
  TestBed.resetTestingModule();
  return TestBed.configureTestingModule({
    imports: [SaleFormMolecule, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: null },
      { provide: ProductService, useValue: mockProductService },
      { provide: CustomerService, useValue: mockCustomerService },
      { provide: InvoiceService, useValue: mockInvoiceService },
      { provide: MatDialog, useValue: mockMatDialog },
    ],
  })
    .overrideComponent(SaleFormMolecule, {
      set: {
        providers: [{ provide: MatDialog, useValue: mockMatDialog }],
      },
    })
    .compileComponents();
}

describe('SaleFormMolecule — Product Dialog Integration (TDD)', () => {
  let component: SaleFormMolecule;
  let fixture: ComponentFixture<SaleFormMolecule>;
  let mockProductService: any;
  let mockCustomerService: any;
  let mockInvoiceService: any;
  let mockDialogRef: any;
  let mockMatDialog: any;

  const mockCustomers: Customer[] = [
    {
      id: 'cust-1',
      name: 'John Doe',
      documentNumber: '111',
      documentType: 'CC',
      email: 'j@example.com',
      status: 'ACTIVE',
      phone: '123',
      address: 'Calle 1',
      createdAt: '2026-06-21T09:00:00.000Z',
      updatedAt: '2026-06-21T09:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    mockProductService = {
      products: signal([]),
      loadProducts: vi.fn().mockReturnValue(of([])),
    } as any;

    mockCustomerService = {
      customers: signal([]),
      loadCustomers: vi
        .fn()
        .mockReturnValue(
          of({ data: mockCustomers, meta: { total: 1, page: 1, limit: 10, lastPage: 1 } }),
        ),
    };

    mockInvoiceService = {
      createInvoice: vi.fn().mockReturnValue(of({})),
    };

    mockDialogRef = {
      close: vi.fn(),
    };

    mockMatDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(null),
      }),
    };

    await createTestModule(mockDialogRef, mockMatDialog, mockProductService, mockCustomerService, mockInvoiceService);

    fixture = TestBed.createComponent(SaleFormMolecule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open ProductSelectionDialog in "add" mode when openAddProductDialog is called', () => {
    component.openAddProductDialog();

    expect(mockMatDialog.open).toHaveBeenCalledWith(
      ProductSelectionDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ mode: 'add' }),
      }),
    );
  });

  it('should push new FormGroup to FormArray when dialog returns a result', () => {
    const mockResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 2,
      unitPrice: 50000,
      referenceSellingPrice: 80000,
      referenceAveragePrice: 50000,
      referenceStock: 10,
    };

    mockMatDialog.open.mockReturnValue({
      afterClosed: () => of(mockResult),
    });

    component.openAddProductDialog();

    expect(component.items.length).toBe(1);
    expect(component.items.at(0).value.productId).toBe('prod-1');
    expect(component.items.at(0).value.name).toBe('Test Product');
    expect(component.items.at(0).value.quantity).toBe(2);
    expect(component.items.at(0).value.unitPrice).toBe(50000);
  });

  it('should NOT add item when dialog is dismissed (returns undefined)', () => {
    component.openAddProductDialog();
    expect(component.items.length).toBe(0);
  });

  it('should allow duplicate products — each add creates independent FormGroup', () => {
    const mockResult1: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Product A',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };

    const mockResult2: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Product A',
      quantity: 2,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };

    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(mockResult1) });
    component.openAddProductDialog();

    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(mockResult2) });
    component.openAddProductDialog();

    expect(component.items.length).toBe(2);
    expect(component.items.at(0).value.productId).toBe('prod-1');
    expect(component.items.at(1).value.productId).toBe('prod-1');
    expect(component.items.at(0).value.quantity).toBe(1);
    expect(component.items.at(1).value.quantity).toBe(2);
  });

  it('should open ProductSelectionDialog in "edit" mode with pre-filled line item', () => {
    // First add a product
    const mockResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(mockResult) });
    component.openAddProductDialog();

    mockMatDialog.open.mockClear();
    mockMatDialog.open.mockReturnValue({ afterClosed: () => of(null) });

    component.openEditProductDialog(0);

    expect(mockMatDialog.open).toHaveBeenCalledWith(
      ProductSelectionDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          mode: 'edit',
          lineItem: expect.objectContaining({
            productId: 'prod-1',
            quantity: 1,
            unitPrice: 100,
          }),
          index: 0,
        }),
      }),
    );
  });

  it('should patch FormGroup when edit dialog returns result', () => {
    const initialResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(initialResult) });
    component.openAddProductDialog();

    const editResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 5,
      unitPrice: 90,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(editResult) });
    component.openEditProductDialog(0);

    expect(component.items.at(0).value.quantity).toBe(5);
    expect(component.items.at(0).value.unitPrice).toBe(90);
  });

  it('should NOT update item when edit dialog is dismissed', () => {
    const initialResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(initialResult) });
    component.openAddProductDialog();

    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(undefined) });

    const previousValue = component.items.at(0).value.quantity;
    component.openEditProductDialog(0);

    expect(component.items.at(0).value.quantity).toBe(previousValue);
  });

  it('should remove item when delete is called', () => {
    const mockResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(mockResult) });
    component.openAddProductDialog();

    expect(component.items.length).toBe(1);

    component.removeItem(0);
    expect(component.items.length).toBe(0);
  });

  it('should have isElectronic signal defaulting to false', () => {
    expect(component.isElectronic()).toBe(false);
  });

  it('should send isElectronic: false by default (manual mode)', () => {
    component.saleForm.patchValue({ customerId: 'cust-1' });

    const mockResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(mockResult) });
    component.openAddProductDialog();

    let capturedDto: any = null;
    mockInvoiceService.createInvoice = vi.fn().mockImplementation((dto: any) => {
      capturedDto = dto;
      return of({ id: 'inv-new' });
    });

    component.onSubmit();

    expect(capturedDto).not.toBeNull();
    expect(capturedDto.isElectronic).toBe(false);
  });

  it('should send isElectronic: true when toggle is activated', () => {
    component.saleForm.patchValue({ customerId: 'cust-1' });

    const mockResult: ProductSelectionDialogResult = {
      productId: 'prod-1',
      name: 'Test Product',
      quantity: 1,
      unitPrice: 100,
      referenceSellingPrice: 100,
      referenceAveragePrice: 50,
      referenceStock: 10,
    };
    mockMatDialog.open.mockReturnValueOnce({ afterClosed: () => of(mockResult) });
    component.openAddProductDialog();

    component.isElectronic.set(true);

    let capturedDto: any = null;
    mockInvoiceService.createInvoice = vi.fn().mockImplementation((dto: any) => {
      capturedDto = dto;
      return of({ id: 'inv-new' });
    });

    component.onSubmit();

    expect(capturedDto).not.toBeNull();
    expect(capturedDto.isElectronic).toBe(true);
  });
});
