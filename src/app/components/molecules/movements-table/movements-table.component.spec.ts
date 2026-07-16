// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovementsTableMolecule } from './movements-table.component';
import { InventoryService } from '../../../services/inventory.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MovementsTableMolecule', () => {
  let component: MovementsTableMolecule;
  let fixture: ComponentFixture<MovementsTableMolecule>;
  let mockInventoryService: any;

  beforeEach(async () => {
    mockInventoryService = {
      movements: signal([
        {
          id: 'IN-B1111111',
          date: '2026-06-20',
          type: 'In',
          product: 'Laptop Pro 14',
          quantity: 10,
          origin: 'Ajuste de inventario',
          destination: 'Ajuste de inventario',
          operator: 'operator@example.com',
        },
      ]),
      loadMovements: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [MovementsTableMolecule, NoopAnimationsModule],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementsTableMolecule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display origin, destination and operator in columns list', () => {
    expect((component as any).tableColumns).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'origin' }),
      expect.objectContaining({ key: 'destination' }),
      expect.objectContaining({ key: 'operator' }),
    ]));
  });

  it('should render origin, destination, and operator in the DOM table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check headers (ui-table atom uses .ui-table__head-cell)
    const headers = Array.from(compiled.querySelectorAll('.ui-table__head-cell')).map(el => el.textContent?.trim());
    expect(headers).toContain('Origen');
    expect(headers).toContain('Destino');
    expect(headers).toContain('Usuario');

    // Check cells (ui-table atom uses .ui-table__cell)
    const cells = Array.from(compiled.querySelectorAll('.ui-table__cell')).map(el => el.textContent?.trim());
    expect(cells).toContain('Ajuste de inventario');
    expect(cells).toContain('operator@example.com');
  });
});
