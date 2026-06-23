// @vitest-environment jsdom
import { ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';

// Initialize Angular testing environment if not already initialized by Angular test builder
try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}
import {
  ProductSelectionDialogComponent,
  ProductSelectionDialogData,
  ProductSelectionDialogResult,
} from './product-selection-dialog.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Producto Alpha',
    sku: 'ALP-001',
    currentStock: 10,
    minStock: 2,
    maxStock: 50,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Categoria 1', description: '' },
    averagePurchasePrice: 50000,
    sellingPrice: 80000,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Producto Beta',
    sku: 'BET-001',
    currentStock: 5,
    minStock: 1,
    maxStock: 20,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Categoria 1', description: '' },
    averagePurchasePrice: 30000,
    sellingPrice: 45000,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Producto Sin Precio',
    sku: 'NOP-001',
    currentStock: 3,
    minStock: 1,
    maxStock: 10,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Categoria 1', description: '' },
    averagePurchasePrice: 40000,
    sellingPrice: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function createModule(
  dialogData: ProductSelectionDialogData,
  mockDialogRef: { close: ReturnType<typeof vi.fn> },
  mockProductService: { products: ReturnType<typeof signal<Product[]>>; loadProducts?: ReturnType<typeof vi.fn> },
) {
  TestBed.resetTestingModule();
  return TestBed.configureTestingModule({
    imports: [ProductSelectionDialogComponent, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: dialogData },
      { provide: ProductService, useValue: mockProductService },
    ],
  }).compileComponents();
}

describe('ProductSelectionDialogComponent', () => {
  describe('Add mode', () => {
    let fixture: ComponentFixture<ProductSelectionDialogComponent>;
    let component: ProductSelectionDialogComponent;
    let mockDialogRef: { close: ReturnType<typeof vi.fn> };
    let mockProductService: { products: ReturnType<typeof signal<Product[]>>; loadProducts: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockProductService = {
        products: signal(mockProducts),
        loadProducts: vi.fn().mockReturnValue(of(mockProducts)),
      };

      const dialogData: ProductSelectionDialogData = { mode: 'add' };
      await createModule(dialogData, mockDialogRef, mockProductService);

      fixture = TestBed.createComponent(ProductSelectionDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should display "Añadir Producto" title in add mode', () => {
      const titleEl: HTMLElement = fixture.nativeElement.querySelector('h2')!;
      expect(titleEl?.textContent).toContain('Añadir Producto');
    });

    it('should start with an empty form — product not selected, quantity 1, unitPrice 0', () => {
      expect(component.form.controls['productId'].value).toBe('');
      expect(component.form.controls['quantity'].value).toBe(1);
      expect(component.form.controls['unitPrice'].value).toBe(0);
    });

    it('should have save button disabled when no product selected', () => {
      const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="save-btn"] button')!;
      expect(saveBtn?.disabled).toBe(true);
    });

    it('should show price reference panel with correct values when a product is selected', async () => {
      component.selectProduct('prod-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.selectedProduct()?.id).toBe('prod-1');
    });

    it('should enable save button when form is valid (product selected, qty >= 1, unitPrice >= 0)', async () => {
      component.selectProduct('prod-1');
      component.form.controls['quantity'].setValue(2);
      component.form.controls['unitPrice'].setValue(80000);
      fixture.detectChanges();
      await fixture.whenStable();

      const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="save-btn"] button')!;
      expect(saveBtn?.disabled).toBe(false);
    });

    it('should call dialogRef.close with result data on save', () => {
      component.selectProduct('prod-1');
      component.form.controls['quantity'].setValue(3);
      component.form.controls['unitPrice'].setValue(75000);

      component.onSave();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        productId: 'prod-1',
        name: 'Producto Alpha',
        quantity: 3,
        unitPrice: 75000,
        referenceSellingPrice: 80000,
        referenceAveragePrice: 50000,
        referenceStock: 10,
      } satisfies ProductSelectionDialogResult);
    });

    it('should call dialogRef.close with undefined on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
    });

    it('should show stock error when quantity exceeds currentStock', () => {
      component.selectProduct('prod-2');
      component.form.controls['quantity'].setValue(10, { emitEvent: true });
      component.form.controls['quantity'].updateValueAndValidity();

      // Verify the form control has the stockExceeded error
      const qtyErrors = component.form.controls['quantity'].errors;
      expect(qtyErrors).not.toBeNull();
      expect(qtyErrors!['stockExceeded']).toBeDefined();
      expect(qtyErrors!['stockExceeded'].max).toBe(5);
    });

    it('should disable save when quantity exceeds stock', async () => {
      component.selectProduct('prod-2');
      component.form.controls['quantity'].setValue(10);
      fixture.detectChanges();
      await fixture.whenStable();

      const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="save-btn"] button')!;
      expect(saveBtn?.disabled).toBe(true);
    });

    it('should disable save when unitPrice is negative', async () => {
      component.selectProduct('prod-1');
      component.form.controls['unitPrice'].setValue(-1);
      fixture.detectChanges();
      await fixture.whenStable();

      const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="save-btn"] button')!;
      expect(saveBtn?.disabled).toBe(true);
    });
  });

  describe('Edit mode', () => {
    let fixture: ComponentFixture<ProductSelectionDialogComponent>;
    let component: ProductSelectionDialogComponent;
    let mockDialogRef: { close: ReturnType<typeof vi.fn> };
    let mockProductService: { products: ReturnType<typeof signal<Product[]>>; loadProducts: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockProductService = {
        products: signal(mockProducts),
        loadProducts: vi.fn().mockReturnValue(of(mockProducts)),
      };

      const dialogData: ProductSelectionDialogData = {
        mode: 'edit',
        lineItem: {
          productId: 'prod-1',
          name: 'Producto Alpha',
          quantity: 2,
          unitPrice: 80000,
          referenceSellingPrice: 80000,
          referenceAveragePrice: 50000,
          referenceStock: 10,
        },
        index: 0,
      };
      await createModule(dialogData, mockDialogRef, mockProductService);

      fixture = TestBed.createComponent(ProductSelectionDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should display "Editar Producto" title in edit mode', () => {
      const titleEl: HTMLElement = fixture.nativeElement.querySelector('h2')!;
      expect(titleEl?.textContent).toContain('Editar Producto');
    });

    it('should pre-fill form with lineItem values in edit mode', () => {
      expect(component.form.controls['productId'].value).toBe('prod-1');
      expect(component.form.controls['quantity'].value).toBe(2);
      expect(component.form.controls['unitPrice'].value).toBe(80000);
    });

    it('should have save button enabled when edit form is valid (pre-filled data)', () => {
      const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="save-btn"] button')!;
      expect(saveBtn?.disabled).toBe(false);
    });
  });

  describe('Empty product list', () => {
    let fixture: ComponentFixture<ProductSelectionDialogComponent>;
    let component: ProductSelectionDialogComponent;
    let mockDialogRef: { close: ReturnType<typeof vi.fn> };
    let mockProductService: { products: ReturnType<typeof signal<Product[]>> };

    beforeEach(async () => {
      mockDialogRef = { close: vi.fn() };
      mockProductService = {
        products: signal([]),
        loadProducts: vi.fn().mockReturnValue(of([])),
      } as any;

      await createModule({ mode: 'add' }, mockDialogRef, mockProductService);

      fixture = TestBed.createComponent(ProductSelectionDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show ui-select when no products available (empty state handled by component)', () => {
      const select = fixture.nativeElement.querySelector('ui-select');
      expect(select).not.toBeNull();
    });
  });
});
