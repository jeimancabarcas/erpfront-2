import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { PageHeaderMolecule } from './page-header.component';

describe('PageHeaderMolecule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(PageHeaderMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.title()).toBe('');
  });

  it('should render title and description', () => {
    const fixture = TestBed.createComponent(PageHeaderMolecule);
    fixture.componentRef.setInput('title', 'Dashboard');
    fixture.componentRef.setInput('description', 'Welcome to the dashboard');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Dashboard');
    expect(el.textContent?.trim()).toContain('Welcome to the dashboard');
  });

  it('should project breadcrumb content', () => {
    const fixture = TestBed.createComponent(PageHeaderMolecule);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const breadcrumbSlot = el.querySelector('[breadcrumb]');
    // ng-content is replaced by the projected content at runtime
    expect(el.querySelector('.page-header__breadcrumb')).toBeTruthy();
  });

  it('should project action content', () => {
    const fixture = TestBed.createComponent(PageHeaderMolecule);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.page-header__actions')).toBeTruthy();
  });

  it('should render with title only', () => {
    const fixture = TestBed.createComponent(PageHeaderMolecule);
    fixture.componentRef.setInput('title', 'Minimal');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Minimal');
  });
});
