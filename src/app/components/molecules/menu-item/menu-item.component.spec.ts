import { TestBed } from '@angular/core/testing';
import { MenuItemMolecule } from './menu-item.component';

describe('MenuItemMolecule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.icon()).toBe('');
    expect(component.label()).toBe('');
    expect(component.count()).toBe(0);
    expect(component.active()).toBe(false);
    expect(component.disabled()).toBe(false);
  });

  it('should render icon and label', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    fixture.componentRef.setInput('icon', 'home');
    fixture.componentRef.setInput('label', 'Inicio');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('Inicio');
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('home');
    expect(el.querySelector('[role="menuitem"]')).toBeTruthy();
  });

  it('should render badge when count > 0', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    fixture.componentRef.setInput('label', 'Notificaciones');
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('3');
  });

  it('should apply active state', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    fixture.componentRef.setInput('active', true);
    fixture.componentRef.setInput('label', 'Active');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const item = el.querySelector('[role="menuitem"]');
    expect(item?.getAttribute('aria-current')).toBe('page');
    expect(item?.classList.contains('menu-item--active')).toBe(true);
  });

  it('should apply disabled state', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('label', 'Disabled');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const item = el.querySelector('[role="menuitem"]');
    expect(item?.getAttribute('aria-disabled')).toBe('true');
    expect(item?.classList.contains('menu-item--disabled')).toBe(true);
  });

  it('should emit clicked when not disabled', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    fixture.componentRef.setInput('label', 'Click');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const item = el.querySelector('[role="menuitem"]')!;
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    item.dispatchEvent(new MouseEvent('click'));
    expect(emitted).toBe(true);
  });

  it('should not emit clicked when disabled', () => {
    const fixture = TestBed.createComponent(MenuItemMolecule);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('label', 'NoClick');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const item = el.querySelector('[role="menuitem"]')!;
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    item.dispatchEvent(new MouseEvent('click'));
    expect(emitted).toBe(false);
  });
});
