import { TestBed } from '@angular/core/testing';
import { AppHeaderOrganism } from './app-header.component';
import { UserInfo } from '../../../models/organism.models';

describe('AppHeaderOrganism', () => {
  const mockUser: UserInfo = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    avatarUrl: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderOrganism],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.sidebarOpen()).toBe(false);
  });

  it('should render user info when provided', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const avatar = el.querySelector('ui-avatar');
    expect(avatar).toBeTruthy();
    const name = el.querySelector('.header__user-name');
    expect(name?.textContent?.trim()).toBe('Juan Pérez');
  });

  it('should not render user section when user is null', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.componentRef.setInput('user', null);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const avatar = el.querySelector('ui-avatar');
    expect(avatar).toBeFalsy();
  });

  it('should render back and forward buttons', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('ui-button');
    // At least back + forward
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should emit toggleSidebar when hamburger clicked', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    const component = fixture.componentInstance;
    let emitted = false;
    component.toggleSidebar.subscribe(() => emitted = true);
    fixture.detectChanges();
    // Find all buttons and click the hamburger one
    const buttons = fixture.nativeElement.querySelectorAll('ui-button');
    // The first button should be hamburger
    const hamburger = buttons[0] as HTMLElement;
    hamburger.click();
    expect(emitted).toBe(true);
  });

  it('should toggle dropdown on user trigger click', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.dropdownOpen()).toBe(false);
    const trigger = fixture.nativeElement.querySelector('.header__user-trigger') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    expect(component.dropdownOpen()).toBe(true);
    trigger.click();
    fixture.detectChanges();
    expect(component.dropdownOpen()).toBe(false);
  });

  it('should show dropdown items when open', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.dropdownOpen.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('should emit logout when logout clicked', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let emitted = false;
    component.logout.subscribe(() => emitted = true);
    component.dropdownOpen.set(true);
    fixture.detectChanges();
    // Find the logout button (last menuitem)
    const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
    const logoutBtn = items[items.length - 1];
    logoutBtn.click();
    expect(emitted).toBe(true);
  });

  it('should emit navigateProfile when profile clicked', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let emitted = false;
    component.navigateProfile.subscribe(() => emitted = true);
    component.dropdownOpen.set(true);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
    const profileBtn = items[0];
    profileBtn.click();
    expect(emitted).toBe(true);
  });

  it('should have banner role', () => {
    const fixture = TestBed.createComponent(AppHeaderOrganism);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('banner');
  });
});
