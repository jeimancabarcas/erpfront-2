// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditPortfolioOrganism } from './credit-portfolio.component';
import { CreditPortfolio } from '../../../models/customer.model';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CreditPortfolioOrganism', () => {
  let component: CreditPortfolioOrganism;
  let fixture: ComponentFixture<CreditPortfolioOrganism>;

  const mockPortfolio: CreditPortfolio = {
    creditLimit: 5000000,
    currentBalance: 1000000,
    availableCredit: 4000000,
    utilizationPercent: 20,
    creditStatus: 'GOOD',
    paymentTermsDays: 30,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditPortfolioOrganism],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditPortfolioOrganism);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('portfolio', mockPortfolio);
    fixture.detectChanges();
  });

  it('should render credit limit, balance, and available credit', () => {
    const el = fixture.nativeElement as HTMLElement;
    // CurrencyPipe formats as $5,000,000.00
    expect(el.textContent).toContain('5,000,000.00');
    expect(el.textContent).toContain('1,000,000.00');
    expect(el.textContent).toContain('4,000,000.00');
  });

  it('should render utilization as 20%', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('20%');
  });

  it('should show GOOD credit status as "Al Día"', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Al Día');
  });

  it('should show payment terms days', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('30');
  });

  it('should show warning banner when balance exceeds limit', () => {
    const overLimitPortfolio: CreditPortfolio = {
      creditLimit: 5000000,
      currentBalance: 6000000,
      availableCredit: -1000000,
      utilizationPercent: 120,
      creditStatus: 'GOOD',
      paymentTermsDays: 30,
    };
    fixture.componentRef.setInput('portfolio', overLimitPortfolio);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('excedido');
  });

  it('should show no credit limit message when creditLimit is null', () => {
    const noLimitPortfolio: CreditPortfolio = {
      creditLimit: null,
      currentBalance: 0,
      availableCredit: null,
      utilizationPercent: null,
      creditStatus: 'GOOD',
      paymentTermsDays: 30,
    };
    fixture.componentRef.setInput('portfolio', noLimitPortfolio);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin límite de crédito asignado');
  });

  it('should show "Configurar Crédito" button when creditLimit is null', () => {
    const noLimitPortfolio: CreditPortfolio = {
      creditLimit: null,
      currentBalance: 0,
      availableCredit: null,
      utilizationPercent: null,
      creditStatus: 'GOOD',
      paymentTermsDays: 30,
    };
    fixture.componentRef.setInput('portfolio', noLimitPortfolio);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('ui-button');
    const configButton = Array.from(buttons).find(b => b.textContent?.includes('Configurar Crédito'));
    expect(configButton).toBeTruthy();
  });

  it('should show "Editar límite" button when creditLimit exists', () => {
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('ui-button');
    const editButton = Array.from(buttons).find(b => b.textContent?.includes('Editar límite'));
    expect(editButton).toBeTruthy();
  });

  it('should emit configureCredit when config button is clicked', () => {
    const noLimitPortfolio: CreditPortfolio = {
      creditLimit: null,
      currentBalance: 0,
      availableCredit: null,
      utilizationPercent: null,
      creditStatus: 'GOOD',
      paymentTermsDays: 30,
    };
    fixture.componentRef.setInput('portfolio', noLimitPortfolio);
    fixture.detectChanges();

    const emitted = vi.fn();
    component.configureCredit.subscribe(emitted);

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('ui-button');
    const configButton = Array.from(buttons).find(b => b.textContent?.includes('Configurar Crédito'));
    // ui-button has an inner <button> element that handles native clicks
    const innerButton = configButton?.querySelector('button');
    innerButton?.click();

    expect(emitted).toHaveBeenCalledTimes(1);
  });

  it('should show both "Editar límite" and "Registrar Pago" when creditLimit exists', () => {
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('ui-button');
    const editButton = Array.from(buttons).find(b => b.textContent?.includes('Editar límite'));
    const payButton = Array.from(buttons).find(b => b.textContent?.includes('Registrar Pago'));
    expect(editButton).toBeTruthy();
    expect(payButton).toBeTruthy();
  });
});
