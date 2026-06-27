import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should display items in the correct order', () => {
    const expectedOrder = [
      'Inicio',
      'Gestión Comercial',
      'Punto de venta (POS)',
      'Clientes',
      'Compras',
      'Proveedores',
      'Inventario',
      'Dashboard Inventario',
      'Categorías',
      'Productos',
      'Finanzas',
      'Resumen',
      'Facturación (Electronica)',
      'Pediatría',
      'Pacientes',
      'Agenda Médica',
      'Facturación Médica',
      'Transporte',
    ];

    const textEls = fixture.debugElement.queryAll(By.css('nav.flex-1 span'));
    const foundTexts = textEls
      .map((el) => el.nativeElement.textContent?.trim())
      .filter((text) => expectedOrder.includes(text || ''));

    expect(foundTexts).toEqual(expectedOrder);
  });

  it('should have all sections as static placeholders (no expansion panels)', () => {
    const expansionPanels = fixture.debugElement.queryAll(By.css('mat-expansion-panel'));
    expect(expansionPanels.length).toBe(0);
  });

  it('should have Gestión Comercial with all 4 sub-items visible', () => {
    expect(fixture.debugElement.query(By.css('a[routerLink="/comercial/sales"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('a[routerLink="/comercial/customers"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('a[routerLink="/abastecimiento/purchases"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('a[routerLink="/abastecimiento/suppliers"]'))).toBeTruthy();
  });

  it('should have Dashboard Inventario renamed from Resumen', () => {
    const dashLink = fixture.debugElement.query(By.css('a[routerLink="/inventory"]'));
    expect(dashLink).toBeTruthy();
    expect(dashLink.nativeElement.textContent).toContain('Dashboard Inventario');
  });

  it('should NOT render Notas Crédito/Débito link', () => {
    const notesLink = fixture.debugElement.query(By.css('a[routerLink="/finance/adjustments"]'));
    expect(notesLink).toBeNull();
  });

  it('should have Finanzas and Pediatría as static placeholders', () => {
    const finanzasLink = fixture.debugElement.query(By.css('a[routerLink="/finance"]'));
    const pediatricsLink = fixture.debugElement.query(By.css('a[routerLink="/pediatrics/patients"]'));
    expect(finanzasLink).toBeTruthy();
    expect(pediatricsLink).toBeTruthy();
    expect(finanzasLink.nativeElement.closest('mat-expansion-panel')).toBeNull();
    expect(pediatricsLink.nativeElement.closest('mat-expansion-panel')).toBeNull();
  });
});
