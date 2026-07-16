// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupplyFormMolecule } from './supply-form.component';
import { SupplyService } from '../../../services/supply.service';
import { Supply } from '../../../models/supply.model';
import { describe, it, expect, vi } from 'vitest';

describe('SupplyFormMolecule', () => {
  it('should be created', async () => {
    const mockSupplyService = {
      createSupply: vi.fn(),
      updateSupply: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, SupplyFormMolecule],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplyFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.supply().nombre).toBe('');
    expect(component.isEditMode).toBe(false);
  });

  it('should populate form data in edit mode', async () => {
    const mockSupplyService = {
      createSupply: vi.fn(),
      updateSupply: vi.fn(),
    };

    const mockSupply: Supply = {
      id: 'sup-1',
      nombre: 'Gasas estériles',
      descripcion: 'Gasas de 10x10',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, SupplyFormMolecule],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { supply: mockSupply } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplyFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(component.supply().nombre).toBe('Gasas estériles');
    expect(component.supply().descripcion).toBe('Gasas de 10x10');
  });

  it('should call createSupply when saving in create mode', async () => {
    const mockCreated: Supply = {
      id: 'new-1',
      nombre: 'Nuevo insumo',
      descripcion: 'Descripción',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    const mockSupplyService = {
      createSupply: vi.fn().mockReturnValue({
        subscribe: (cb: any) => cb(mockCreated)
      }),
      updateSupply: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, SupplyFormMolecule],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplyFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.supply.set({ nombre: 'Nuevo insumo', descripcion: 'Descripción' });
    component.saveSupply();

    expect(mockSupplyService.createSupply).toHaveBeenCalledWith({
      nombre: 'Nuevo insumo',
      descripcion: 'Descripción'
    });
  });

  it('should call updateSupply when saving in edit mode', async () => {
    const mockSupply: Supply = {
      id: 'sup-1',
      nombre: 'Gasas estériles',
      descripcion: 'Gasas de 10x10',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    const mockSupplyService = {
      createSupply: vi.fn(),
      updateSupply: vi.fn().mockReturnValue({
        subscribe: (cb: any) => cb({ ...mockSupply, nombre: 'Gasas actualizadas' })
      }),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule, SupplyFormMolecule],
      providers: [
        { provide: SupplyService, useValue: mockSupplyService },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { supply: mockSupply } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplyFormMolecule);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.supply.set({ ...mockSupply, nombre: 'Gasas actualizadas' });
    component.saveSupply();

    expect(mockSupplyService.updateSupply).toHaveBeenCalledWith('sup-1', {
      nombre: 'Gasas actualizadas',
      descripcion: 'Gasas de 10x10'
    });
  });
});
