import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovementsTableMolecule } from './movements-table.component';
import { InventoryService } from '../../../services/inventory.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
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
    expect(component.displayedColumns).toContain('origin');
    expect(component.displayedColumns).toContain('destination');
    expect(component.displayedColumns).toContain('operator');
  });

  it('should render origin, destination, and operator in the DOM table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check headers
    const headers = Array.from(compiled.querySelectorAll('th')).map(el => el.textContent?.trim());
    expect(headers).toContain('Origen');
    expect(headers).toContain('Destino');
    expect(headers).toContain('Usuario');

    // Check cells
    const cells = Array.from(compiled.querySelectorAll('td')).map(el => el.textContent?.trim());
    expect(cells).toContain('Ajuste de inventario');
    expect(cells).toContain('operator@example.com');
  });
});
