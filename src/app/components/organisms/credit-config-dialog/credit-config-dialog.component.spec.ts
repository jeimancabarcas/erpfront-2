// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditConfigDialogOrganism, CreditConfigData } from './credit-config-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerService } from '../../../services/customer.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CreditConfigDialogOrganism', () => {
  let component: CreditConfigDialogOrganism;
  let fixture: ComponentFixture<CreditConfigDialogOrganism>;
  let mockDialogRef: any;
  let mockCustomerService: any;

  const defaultData: CreditConfigData = {
    customerId: 'cust-1',
    creditLimit: null,
    paymentTermsDays: 30,
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    mockCustomerService = {
      setCustomerCredit: vi.fn().mockReturnValue(of({ id: 'cust-1' })),
    };

    await TestBed.configureTestingModule({
      imports: [CreditConfigDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: defaultData },
        { provide: CustomerService, useValue: mockCustomerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditConfigDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and display config title for new credit', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Configurar Crédito');
  });

  it('should show "Editar Límite de Crédito" when creditLimit is provided', () => {
    fixture.componentRef.destroy();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreditConfigDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...defaultData, creditLimit: 5000000 } },
        { provide: CustomerService, useValue: mockCustomerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditConfigDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Editar Límite de Crédito');
  });

  it('should call setCustomerCredit on submit and show success', () => {
    component.creditLimit.set('5000000');
    component.paymentTermsDays.set('30');

    component.submit();

    expect(mockCustomerService.setCustomerCredit).toHaveBeenCalledWith('cust-1', {
      creditLimit: 5000000,
      paymentTermsDays: 30,
    });
    expect(component.success()).toBe(true);
  });

  it('should NOT submit when creditLimit is empty or invalid', () => {
    component.creditLimit.set('');
    component.submit();
    expect(mockCustomerService.setCustomerCredit).not.toHaveBeenCalled();

    component.creditLimit.set('0');
    component.submit();
    expect(mockCustomerService.setCustomerCredit).not.toHaveBeenCalled();
  });

  it('should display error message when API fails', () => {
    const errorMsg = 'Error del servidor';
    mockCustomerService.setCustomerCredit.mockReturnValue(
      throwError(() => ({ error: { message: errorMsg } }))
    );

    component.creditLimit.set('5000000');
    component.submit();
    fixture.detectChanges();

    expect(component.error()).toBe(errorMsg);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(errorMsg);
  });

  it('should close dialog with success result on success', () => {
    component.creditLimit.set('5000000');
    component.submit();

    component.close(true);
    expect(mockDialogRef.close).toHaveBeenCalledWith({ success: true });
  });

  it('should close dialog without result on cancel', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('should pre-fill creditLimit from data for edit mode', () => {
    fixture.componentRef.destroy();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreditConfigDialogOrganism, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...defaultData, creditLimit: 1000000, paymentTermsDays: 60 } },
        { provide: CustomerService, useValue: mockCustomerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditConfigDialogOrganism);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.creditLimit()).toBe('1000000');
    expect(component.paymentTermsDays()).toBe('60');
    expect(component.isEdit()).toBe(true);
  });
});
