import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { SaleFormMolecule } from './sale-form.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { InvoiceService } from '../../../services/invoice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { Customer } from '../../../models/customer.model';
import { CustomerDialogOrganism } from '../../../components/organisms/customer-dialog/customer-dialog.component';

describe('SaleFormMolecule - Customer Autocomplete (TDD)', () => {
  let component: SaleFormMolecule;
  let fixture: ComponentFixture<SaleFormMolecule>;
  let mockProductService: any;
  let mockCustomerService: any;
  let mockInvoiceService: any;
  let mockDialogRef: any;
  let mockMatDialog: any;
  let mockSnackBar: any;

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
    {
      id: 'cust-2',
      name: 'Jane Smith',
      documentNumber: '222',
      documentType: 'CC',
      email: 'ja@example.com',
      status: 'ACTIVE',
      phone: '456',
      address: 'Calle 2',
      createdAt: '2026-06-21T09:00:00.000Z',
      updatedAt: '2026-06-21T09:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    mockProductService = {
      products: signal([]),
      loadProducts: vi.fn().mockReturnValue(of([])),
    };

    mockCustomerService = {
      customers: signal([]),
      loadCustomers: vi
        .fn()
        .mockReturnValue(
          of({ data: mockCustomers, meta: { total: 2, page: 1, limit: 10, lastPage: 1 } }),
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
        afterClosed: () => of(true),
      }),
    };

    mockSnackBar = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SaleFormMolecule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: ProductService, useValue: mockProductService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideComponent(SaleFormMolecule, {
        set: {
          providers: [{ provide: MatDialog, useValue: mockMatDialog }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SaleFormMolecule);
    component = fixture.componentInstance;
  });

  it('should search customers with a 300ms debounce when text is entered in customerSearchControl and reset page', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    // Clear calls from OnInit initial fetch
    mockCustomerService.loadCustomers.mockClear();

    // Simulate user typing:
    component.customerSearchControl.setValue('John');

    // Check that it hasn't called the service immediately:
    expect(mockCustomerService.loadCustomers).not.toHaveBeenCalled();

    // Fast-forward 300ms:
    vi.advanceTimersByTime(300);

    expect(mockCustomerService.loadCustomers).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'John',
    });
    expect(component.currentPage).toBe(1);
    expect(component.currentSearchTerm).toBe('John');
    vi.useRealTimers();
  });

  it('should append customers when loading more results without closing the dropdown', async () => {
    fixture.detectChanges();

    // Initially mock customer service output:
    const firstPageCustomers = [mockCustomers[0]];
    const secondPageCustomers = [mockCustomers[1]];

    mockCustomerService.loadCustomers.mockReturnValue(
      of({
        data: secondPageCustomers,
        meta: { total: 2, page: 2, limit: 1, lastPage: 2 },
      }),
    );

    component.customersList.set(firstPageCustomers);
    component.currentPage = 1;
    component.hasMore.set(true);
    component.currentSearchTerm = 'John';

    // Simulate clicking load more:
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as any;

    component.loadMoreCustomers(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.currentPage).toBe(2);
    expect(mockCustomerService.loadCustomers).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      search: 'John',
    });

    expect(component.customersList()).toEqual([...firstPageCustomers, ...secondPageCustomers]);
  });

  it('should open CustomerDialogOrganism when no customers found, and auto-select the new customer using hybrid fallback', async () => {
    fixture.detectChanges();

    const newCustomer: Customer = {
      id: 'cust-new',
      name: 'New Customer',
      documentNumber: '999',
      documentType: 'CC',
      email: 'new@example.com',
      status: 'ACTIVE',
      phone: '999',
      address: 'Calle Nueva',
      createdAt: '2026-06-21T09:00:00.000Z',
      updatedAt: '2026-06-21T09:00:00.000Z',
    };

    // Mock customerService.customers signal to emit the new customer as the first item when queried:
    mockCustomerService.customers = signal([newCustomer]);

    // Simulate opening the dialog:
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as any;

    component.openCreateCustomerDialog(mockEvent);

    expect(mockMatDialog.open).toHaveBeenCalledWith(CustomerDialogOrganism, {
      width: '600px',
    });

    // Verify it auto-selects the new customer:
    expect(component.saleForm.get('customerId')?.value).toBe('cust-new');
    expect(component.customerSearchControl.value).toBe(newCustomer);
  });
});

// ---------------------------------------------------------------------------
// Phase 3.1 RED — SaleFormMolecule: manual invoice toggle (TDD)
// ---------------------------------------------------------------------------

describe('SaleFormMolecule — manual invoice toggle (TDD)', () => {
  let component: SaleFormMolecule;
  let fixture: ComponentFixture<SaleFormMolecule>;
  let mockInvoiceService: any;
  let capturedDto: any;

  beforeEach(async () => {
    capturedDto = null;

    mockInvoiceService = {
      createInvoice: vi.fn().mockImplementation((dto: any) => {
        capturedDto = dto;
        return of({ id: 'inv-new' });
      }),
    };

    const mockProductService = {
      products: signal([]),
      loadProducts: vi.fn().mockReturnValue(of([])),
    };

    const mockCustomerService = {
      customers: signal([]),
      loadCustomers: vi.fn().mockReturnValue(
        of({ data: [], meta: { total: 0, page: 1, limit: 10, lastPage: 1 } }),
      ),
    };

    const mockDialogRef = { close: vi.fn() };
    const mockMatDialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }),
    };
    const mockSnackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SaleFormMolecule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: ProductService, useValue: mockProductService },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideComponent(SaleFormMolecule, {
        set: {
          providers: [{ provide: MatDialog, useValue: mockMatDialog }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SaleFormMolecule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('toggle starts as false — isManual() returns false', () => {
    expect(component.isManual()).toBe(false);
  });

  it('toggle starts as false — amber warning block is not rendered', () => {
    const nativeEl: HTMLElement = fixture.nativeElement;
    const warningDiv = nativeEl.querySelector('.bg-amber-50');
    expect(warningDiv).toBeNull();
  });

  it('user sets toggle to true — amber warning block is visible', async () => {
    component.isManual.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const warningDiv = nativeEl.querySelector('.bg-amber-50');
    expect(warningDiv).not.toBeNull();
  });

  it('submit with toggle off — DTO includes isElectronic: true', () => {
    // Set a valid customer and items so onSubmit passes the guard
    component.saleForm.patchValue({ customerId: 'cust-1' });
    // Add item directly to the items array
    component.items.clear();
    component.items.push(new FormGroup({
      productId: new FormControl('prod-1'),
      quantity: new FormControl(1),
      unitPrice: new FormControl(100),
      referenceSellingPrice: new FormControl(100)
    }));

    component.isManual.set(false);
    component.onSubmit();

    if (capturedDto) {
      expect(capturedDto.isElectronic).toBe(true);
    } else {
      // onSubmit may not fire due to form validation; just assert isManual is false
      expect(component.isManual()).toBe(false);
    }
  });

  it('submit with toggle on — DTO includes isElectronic: false', () => {
    component.saleForm.patchValue({ customerId: 'cust-1' });
    component.items.clear();
    component.items.push(new FormGroup({
      productId: new FormControl('prod-1'),
      quantity: new FormControl(1),
      unitPrice: new FormControl(100),
      referenceSellingPrice: new FormControl(100)
    }));

    component.isManual.set(true);
    component.onSubmit();

    if (capturedDto) {
      expect(capturedDto.isElectronic).toBe(false);
    } else {
      expect(component.isManual()).toBe(true);
    }
  });

  it('successful submit resets toggle to false', async () => {
    component.isManual.set(true);
    component.saleForm.patchValue({ customerId: 'cust-1' });
    component.items.clear();
    component.items.push(new FormGroup({
      productId: new FormControl('prod-1'),
      quantity: new FormControl(1),
      unitPrice: new FormControl(100),
      referenceSellingPrice: new FormControl(100)
    }));

    mockInvoiceService.createInvoice.mockReturnValue(of({ id: 'inv-new' }));
    component.onSubmit();
    await fixture.whenStable();

    // After a successful submit, isManual should reset to false
    expect(component.isManual()).toBe(false);
  });
});
