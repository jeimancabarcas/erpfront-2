import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppSidebarOrganism } from './app-sidebar.component';
import { MenuGroup } from '../../../models/organism.models';

describe('AppSidebarOrganism', () => {
  const mockGroups: MenuGroup[] = [
    {
      label: 'Inventario',
      items: [
        { icon: 'analytics', label: 'Resumen', routerLink: '/inventory' },
        { icon: 'category', label: 'Categorías', routerLink: '/inventory/categories' },
        { icon: 'inventory_2', label: 'Productos', routerLink: '/inventory/products', count: 5 },
      ],
    },
    {
      label: 'Ventas',
      items: [
        { icon: 'payments', label: 'Ventas', routerLink: '/sales' },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSidebarOrganism],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.collapsed()).toBe(false);
    expect(component.mobileOpen()).toBe(false);
  });

  it('should render logo', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const logo = el.querySelector('app-logo');
    expect(logo).toBeTruthy();
  });

  it('should render menu groups', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.componentRef.setInput('menuGroups', mockGroups);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const headers = el.querySelectorAll('.sidebar__group-header');
    expect(headers.length).toBe(2);
  });

  it('should toggle group expansion on header click', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.componentRef.setInput('menuGroups', mockGroups);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    // Initially not expanded
    expect(component['isExpanded']('Inventario')).toBe(false);
    // Click header
    const header = fixture.nativeElement.querySelector('.sidebar__group-header') as HTMLElement;
    header.click();
    fixture.detectChanges();
    expect(component['isExpanded']('Inventario')).toBe(true);
    // Click again to collapse
    header.click();
    fixture.detectChanges();
    expect(component['isExpanded']('Inventario')).toBe(false);
  });

  it('should show badge count on menu items', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.componentRef.setInput('menuGroups', mockGroups);
    fixture.detectChanges();
    // Expand inventory group
    const component = fixture.componentInstance;
    component['toggleGroup']('Inventario');
    fixture.detectChanges();
    // Menu items should render with badge
    const el = fixture.nativeElement as HTMLElement;
    const badges = el.querySelectorAll('ui-badge');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('should emit mobileClose on backdrop click', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.componentRef.setInput('mobileOpen', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let emitted = false;
    component.mobileClose.subscribe(() => emitted = true);
    // Find backdrop
    const backdrop = fixture.nativeElement.querySelector('.sidebar__backdrop') as HTMLElement;
    if (backdrop) {
      backdrop.click();
      expect(emitted).toBe(true);
    }
  });

  it('should emit mobileClose on Escape key', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.componentRef.setInput('mobileOpen', true);
    const component = fixture.componentInstance;
    let emitted = false;
    component.mobileClose.subscribe(() => emitted = true);
    component.onEscape();
    expect(emitted).toBe(true);
  });

  it('should have navigation role', () => {
    const fixture = TestBed.createComponent(AppSidebarOrganism);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('navigation');
  });
});
