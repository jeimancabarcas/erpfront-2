import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormMolecule } from './product-form.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { TaxesService } from '../../../services/taxes.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

describe('ProductFormMolecule', () => {
  let component: ProductFormMolecule;
  let fixture: ComponentFixture<ProductFormMolecule>;
  let mockProductService: any;
  let mockCategoryService: any;
  let mockTaxesService: any;
  let mockDialogRef: any;

  const mockProductData = {
    id: 'prod-1',
    name: 'Product 1',
    sku: 'SKU-1',
    currentStock: 10,
    minStock: 2,
    maxStock: 20,
    taxIds: [],
    sellingPrice: 15,
    averagePurchasePrice: 10,
  };

  beforeEach(async () => {
    mockProductService = {
      createProduct: vi.fn().mockReturnValue(of({})),
      updateProduct: vi.fn().mockReturnValue(of({})),
    };

    mockCategoryService = {
      categories: signal([]),
      loadCategories: vi.fn().mockReturnValue(of([])),
    };

    mockTaxesService = {
      data: signal([]),
      loading: signal(false),
      loadData: vi.fn().mockReturnValue(of({ data: [], meta: null })),
    };

    mockDialogRef = {
      close: vi.fn(),
    };
  });

  async function createTestBed(data: any = null) {
    await TestBed.configureTestingModule({
      imports: [ProductFormMolecule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: TaxesService, useValue: mockTaxesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormMolecule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should compile and not require reason in creation mode', async () => {
    await createTestBed(null);
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBeFalsy();
    expect(component.isReasonRequired()).toBeFalsy();
  });

  it('should track originalStock on init in edit mode and check if stock changed', async () => {
    await createTestBed({ product: mockProductData });
    expect(component.isEditMode).toBeTruthy();
    expect(component.originalStock).toBe(10);
    expect(component.isReasonRequired()).toBeFalsy();

    // Change stock:
    component.product.update(p => ({ ...p, currentStock: 15 }));
    fixture.detectChanges();
    expect(component.isReasonRequired()).toBeTruthy();

    // Revert stock:
    component.product.update(p => ({ ...p, currentStock: 10 }));
    fixture.detectChanges();
    expect(component.isReasonRequired()).toBeFalsy();
  });

  it('should block submission if reason is required but empty, and include reason in payload if provided', async () => {
    await createTestBed({ product: mockProductData });
    
    // Change stock:
    component.product.update(p => ({ ...p, currentStock: 15 }));
    fixture.detectChanges();
    
    // Attempt save with empty reason:
    component.saveProduct();
    expect(mockProductService.updateProduct).not.toHaveBeenCalled();

    // Set reason and save:
    component.adjustmentReason = 'Auditoría';
    component.saveProduct();

    expect(mockProductService.updateProduct).toHaveBeenCalledWith('prod-1', expect.objectContaining({
      currentStock: 15,
      adjustmentReason: 'Auditoría',
    }));
  });
});
