import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let router: Router;
  let urlMock = '/dashboard';

  beforeEach(async () => {
    urlMock = '/dashboard';

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    Object.defineProperty(router, 'url', {
      get: () => urlMock,
      configurable: true,
    });

    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should display items in the correct order', () => {
    const expectedOrder = [
      'Inicio',
      'Clientes',
      'Ventas',
      'Compras',
      'Inventario',
      'Finanzas',
      'Pediatría',
      'Transporte',
    ];

    // Find all spans in the main navigation
    const textEls = fixture.debugElement.queryAll(By.css('nav.flex-1 span'));
    const foundTexts = textEls
      .map((el) => el.nativeElement.textContent?.trim())
      .filter((text) => expectedOrder.includes(text || ''));

    expect(foundTexts).toEqual(expectedOrder);
  });

  it('should have Ventas and Compras as root-level entries', () => {
    const ventasLink = fixture.debugElement.query(By.css('a[routerLink="/sales"]'));
    const comprasLink = fixture.debugElement.query(By.css('a[routerLink="/inventory/purchases"]'));

    expect(ventasLink).toBeTruthy();
    expect(comprasLink).toBeTruthy();

    // Verify they are not nested inside a mat-expansion-panel
    expect(ventasLink.nativeElement.closest('mat-expansion-panel')).toBeNull();
    expect(comprasLink.nativeElement.closest('mat-expansion-panel')).toBeNull();
  });

  it('should collapse the Inventario accordion by default', () => {
    const panels = fixture.debugElement.queryAll(By.css('mat-expansion-panel'));
    // The Inventario panel is the first expansion panel in our template
    const inventarioPanel = panels[0].componentInstance;
    expect(inventarioPanel.expanded).toBeFalsy();
  });

  it('should test isInventoryActive() helper logic', () => {
    const activeUrls = [
      '/inventory',
      '/inventory/categories',
      '/inventory/products',
      '/inventory/suppliers',
      '/inventory/categories/123',
    ];
    const inactiveUrls = ['/inventory/purchases', '/sales', '/dashboard'];

    for (const url of activeUrls) {
      urlMock = url;
      expect(component.isInventoryActive()).toBe(true);
    }

    for (const url of inactiveUrls) {
      urlMock = url;
      expect(component.isInventoryActive()).toBe(false);
    }
  });
});
