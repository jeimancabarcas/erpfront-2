// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OperationsSuppliesPageComponent } from './operations-supplies-page.component';
import { SupplyService } from '../../../../services/supply.service';
import { Supply } from '../../../../models/supply.model';
import { describe, it, expect, vi } from 'vitest';

describe('OperationsSuppliesPageComponent', () => {
  const mockSupplies: Supply[] = [
    { id: '1', nombre: 'Gasas estériles', descripcion: 'Gasas de 10x10', isActive: true, createdAt: '', updatedAt: '' },
    { id: '2', nombre: 'Jabón quirúrgico', descripcion: undefined, isActive: true, createdAt: '', updatedAt: '' },
  ];

  it('should be created', async () => {
    const mockSupplyService = {
      loadSupplies: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockSupplies, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
      }),
      supplies: vi.fn(() => mockSupplies),
      meta: vi.fn(() => ({ total: 2 })),
      createSupply: vi.fn(),
      updateSupply: vi.fn(),
      deleteSupply: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsSuppliesPageComponent],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsSuppliesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load supplies on init', async () => {
    const loadSuppliesSpy = vi.fn().mockReturnValue({
      subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockSupplies, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
    });

    const mockSupplyService = {
      loadSupplies: loadSuppliesSpy,
      supplies: vi.fn(() => mockSupplies),
      meta: vi.fn(() => ({ total: 2 })),
      createSupply: vi.fn(),
      updateSupply: vi.fn(),
      deleteSupply: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsSuppliesPageComponent],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsSuppliesPageComponent);
    fixture.detectChanges();

    expect(loadSuppliesSpy).toHaveBeenCalled();
  });

  it('should filter supplies by name', async () => {
    const loadSuppliesSpy = vi.fn().mockReturnValue({
      subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockSupplies, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
    });

    const mockSupplyService = {
      loadSupplies: loadSuppliesSpy,
      supplies: vi.fn(() => mockSupplies),
      meta: vi.fn(() => ({ total: 2 })),
      createSupply: vi.fn(),
      updateSupply: vi.fn(),
      deleteSupply: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsSuppliesPageComponent],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsSuppliesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.nameFilter.set('Gasas');
    component.loadData();
    expect(loadSuppliesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Gasas' })
    );
  });

  it('should call deleteSupply on confirm delete', async () => {
    const deleteSpy = vi.fn().mockReturnValue({
      subscribe: (cb: any) => { if (typeof cb === 'function') cb(); return { unsubscribe: () => {} }; },
    });

    const mockSupplyService = {
      loadSupplies: vi.fn().mockReturnValue({
        subscribe: (cb: any) => { if (typeof cb === 'function') cb({ data: mockSupplies, meta: { total: 2 } }); return { unsubscribe: () => {} }; },
      }),
      supplies: vi.fn(() => mockSupplies),
      meta: vi.fn(() => ({ total: 2 })),
      createSupply: vi.fn(),
      updateSupply: vi.fn(),
      deleteSupply: deleteSpy,
    };

    const mockDialogRef = {
      afterClosed: () => ({
        subscribe: (cb: any) => {
          if (typeof cb === 'function') cb(true);
          else if (cb && typeof cb.next === 'function') cb.next(true);
          return { unsubscribe: () => {} };
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, HttpClientTestingModule, RouterTestingModule, OperationsSuppliesPageComponent],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
        {
          provide: MatDialog,
          useValue: { open: vi.fn().mockReturnValue(mockDialogRef) }
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OperationsSuppliesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.confirmDelete(mockSupplies[0]);
    expect(deleteSpy).toHaveBeenCalledWith('1');
  });
});
