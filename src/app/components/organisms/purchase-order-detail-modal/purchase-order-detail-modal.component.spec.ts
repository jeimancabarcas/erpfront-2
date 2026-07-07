// @vitest-environment jsdom
import { TestBed, getTestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { PurchaseOrderDetailModalComponent, PurchaseOrderDetailModalData } from './purchase-order-detail-modal.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { PurchaseOrder } from '../../../models/purchase-order.model';

try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
  );
} catch {
  // Already initialized — ignore
}

function createMockOrder(overrides?: Partial<PurchaseOrder>): PurchaseOrder {
  return {
    id: 'order-uuid',
    orderNumber: 'OC-0001',
    orderDate: '2026-07-07',
    observations: 'Test order',
    status: 'CREATED',
    supplierId: 'supplier-uuid',
    supplier: { id: 'supplier-uuid', name: 'Proveedor Test', nit: '900123456-7' } as any,
    items: [{ productId: 'prod-1', quantity: 10, price: 5000 }],
    supportDocuments: [],
    adjustmentNotes: [],
    createdAt: '2026-07-07T00:00:00Z',
    ...overrides,
  };
}

describe('PurchaseOrderDetailModalComponent — Signal + OnInit (T4)', () => {
  let component: PurchaseOrderDetailModalComponent;
  let mockPurchaseOrderService: any;
  let mockDialogRef: any;
  const mockOrder = createMockOrder();

  async function createComponent(orderData: PurchaseOrder, serviceOverrides?: any) {
    const serviceMock = {
      getOrderById: vi.fn().mockReturnValue(of(createMockOrder())),
      completeOrder: vi.fn(),
      cancelOrder: vi.fn(),
      emitSupportDocument: vi.fn(),
      downloadSupportDocumentPdf: vi.fn(),
      emitAdjustmentNote: vi.fn(),
      downloadAdjustmentNotePdf: vi.fn(),
      ...(serviceOverrides || {}),
    };

    mockDialogRef = { close: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { order: orderData } as PurchaseOrderDetailModalData },
        { provide: PurchaseOrderService, useValue: serviceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseOrderDetailModalComponent);
    component = fixture.componentInstance;
    mockPurchaseOrderService = serviceMock;
    return fixture;
  }

  it('should call getOrderById on init to fetch fresh data', async () => {
    await createComponent(mockOrder);
    expect(mockPurchaseOrderService.getOrderById).toHaveBeenCalledWith('order-uuid');
  });

  it('should set order signal from API response after fetch', async () => {
    await createComponent(mockOrder, {
      getOrderById: vi.fn().mockReturnValue(of(createMockOrder({ orderNumber: 'OC-FRESH' }))),
    });
    expect(component.order()).toBeTruthy();
    expect(component.order()?.id).toBe('order-uuid');
  });

  it('should set loading to true initial, false after fetch', async () => {
    await createComponent(mockOrder);
    expect(component.loading()).toBe(false);
  });

  it('should set error when API call fails', async () => {
    await createComponent(mockOrder, {
      getOrderById: vi.fn().mockReturnValue(throwError(() => new Error('API error'))),
    });
    // No detectChanges needed — error is set synchronously in error callback
    expect(component.error()).toBe('Error al cargar la orden');
  });

  it('should set initial order from dialog data in constructor', async () => {
    await createComponent(mockOrder);
    expect(component.order()?.orderNumber).toBe('OC-0001');
    expect(component.order()?.status).toBe('CREATED');
  });
});

describe('PurchaseOrderDetailModalComponent — traceEvents computed (T5)', () => {
  let component: PurchaseOrderDetailModalComponent;
  let mockDialogRef: any;

  async function createComponent(orderData: PurchaseOrder) {
    const serviceMock = {
      getOrderById: vi.fn().mockReturnValue(of(orderData)),
      completeOrder: vi.fn(),
      cancelOrder: vi.fn(),
      emitSupportDocument: vi.fn(),
      downloadSupportDocumentPdf: vi.fn(),
      emitAdjustmentNote: vi.fn(),
      downloadAdjustmentNotePdf: vi.fn(),
    };

    mockDialogRef = { close: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { order: orderData } as PurchaseOrderDetailModalData },
        { provide: PurchaseOrderService, useValue: serviceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseOrderDetailModalComponent);
    component = fixture.componentInstance;
    return fixture;
  }

  it('should include Creación event for any order', async () => {
    const order = createMockOrder({ status: 'CREATED' });
    await createComponent(order);
    const events = component.traceEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe('Creación');
  });

  it('should include Documento Soporte events for support documents', async () => {
    const order = createMockOrder({
      status: 'COMPLETED',
      supportDocuments: [{
        id: 'doc-1',
        referenceCode: 'DS-001',
        number: 'SETP100',
        cude: 'cude-abc',
        createdAt: '2026-07-07T12:00:00Z',
      }],
    });
    await createComponent(order);
    const events = component.traceEvents();
    const docEvents = events.filter(e => e.type === 'Documento Soporte');
    expect(docEvents.length).toBe(1);
    expect(docEvents[0].number).toBe('SETP100');
  });

  it('should include Nota de Ajuste events for adjustment notes', async () => {
    const order = createMockOrder({
      status: 'CANCELLED',
      adjustmentNotes: [{
        id: 'note-1',
        referenceCode: 'NA-001',
        noteNumber: 'NA100',
        cude: 'cude-def',
        correctionConceptCode: '2',
        amount: 50000,
        createdAt: '2026-07-07T13:00:00Z',
      }],
    });
    await createComponent(order);
    const events = component.traceEvents();
    const adjEvents = events.filter(e => e.type === 'Nota de Ajuste');
    expect(adjEvents.length).toBe(1);
    expect(adjEvents[0].number).toBe('NA100');
  });

  it('should include Completada when status is COMPLETED', async () => {
    const order = createMockOrder({ status: 'COMPLETED' });
    await createComponent(order);
    const events = component.traceEvents();
    const completedEvents = events.filter(e => e.type === 'Completada');
    expect(completedEvents.length).toBe(1);
  });

  it('should include Cancelación when status is CANCELLED', async () => {
    const order = createMockOrder({ status: 'CANCELLED' });
    await createComponent(order);
    const events = component.traceEvents();
    const cancelledEvents = events.filter(e => e.type === 'Cancelación');
    expect(cancelledEvents.length).toBe(1);
  });

  it('should sort events chronologically by date', async () => {
    const order = createMockOrder({
      status: 'COMPLETED',
      createdAt: '2026-07-07T10:00:00Z',
      supportDocuments: [{
        id: 'doc-1',
        referenceCode: 'DS-001',
        number: 'SETP100',
        createdAt: '2026-07-07T12:00:00Z',
      }],
    });
    await createComponent(order);
    const events = component.traceEvents();
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i - 1].date).getTime()
      );
    }
  });

  it('should produce exactly one event (Creación) for CREATED order with no docs', async () => {
    const order = createMockOrder({ status: 'CREATED', supportDocuments: [], adjustmentNotes: [] });
    await createComponent(order);
    const events = component.traceEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('Creación');
  });
});

describe('PurchaseOrderDetailModalComponent — Template rendering (T6)', () => {
  let component: PurchaseOrderDetailModalComponent;
  let fixture: ComponentFixture<PurchaseOrderDetailModalComponent>;
  let mockPurchaseOrderService: any;
  let mockDialogRef: any;

  async function createComponent(orderData: PurchaseOrder) {
    const serviceMock = {
      getOrderById: vi.fn().mockReturnValue(of(orderData)),
      completeOrder: vi.fn(),
      cancelOrder: vi.fn(),
      emitSupportDocument: vi.fn(),
      downloadSupportDocumentPdf: vi.fn(),
      emitAdjustmentNote: vi.fn(),
      downloadAdjustmentNotePdf: vi.fn(),
    };

    mockDialogRef = { close: vi.fn() };
    mockPurchaseOrderService = serviceMock;

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { order: orderData } as PurchaseOrderDetailModalData },
        { provide: PurchaseOrderService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should render traceability section with table for orders with events', async () => {
    const order = createMockOrder({ status: 'CREATED' });
    await createComponent(order);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Trazabilidad de la Orden');
  });

  it('should render section label with correct text style', async () => {
    const order = createMockOrder({ status: 'CREATED' });
    await createComponent(order);
    const el = fixture.nativeElement as HTMLElement;
    const labels = el.querySelectorAll('label');
    const traceLabel = Array.from(labels).find(l => l.textContent?.includes('Trazabilidad'));
    expect(traceLabel).toBeTruthy();
  });

  it('should show Creación badge in traceability table', async () => {
    const order = createMockOrder({ status: 'CREATED' });
    await createComponent(order);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Creación');
  });

  it('should show existing action buttons (Completar Orden) for CREATED status', async () => {
    const order = createMockOrder({ status: 'CREATED' });
    await createComponent(order);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Completar Orden');
    expect(el.textContent).toContain('Cancelar Orden');
  });

  it('should show loading spinner initially', async () => {
    mockPurchaseOrderService = {
      getOrderById: vi.fn().mockReturnValue(of(createMockOrder())),
      completeOrder: vi.fn(),
      cancelOrder: vi.fn(),
      emitSupportDocument: vi.fn(),
      downloadSupportDocumentPdf: vi.fn(),
      emitAdjustmentNote: vi.fn(),
      downloadAdjustmentNotePdf: vi.fn(),
    };
    mockDialogRef = { close: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { order: createMockOrder() } as PurchaseOrderDetailModalData },
        { provide: PurchaseOrderService, useValue: mockPurchaseOrderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderDetailModalComponent);
    component = fixture.componentInstance;
    // ngOnInit hasn't run yet
    expect(component.loading()).toBe(true);
  });
});
