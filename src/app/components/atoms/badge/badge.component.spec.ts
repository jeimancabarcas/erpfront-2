import { TestBed } from '@angular/core/testing';
import { BadgeAtom } from './badge.component';

describe('BadgeAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(BadgeAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.variant()).toBe('status');
    expect(component.status()).toBe('success');
    expect(component.size()).toBe('md');
  });

  it('should render status badge', () => {
    const fixture = TestBed.createComponent(BadgeAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const span = el.querySelector('.badge--status');
    expect(span).toBeTruthy();
    expect(span?.getAttribute('role')).toBe('status');
  });

  it('should render counter badge with count', () => {
    const fixture = TestBed.createComponent(BadgeAtom);
    fixture.componentRef.setInput('variant', 'counter');
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('5');
  });

  it('should render dot badge', () => {
    const fixture = TestBed.createComponent(BadgeAtom);
    fixture.componentRef.setInput('variant', 'dot');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('.badge--dot');
    expect(dot).toBeTruthy();
    expect(dot?.getAttribute('role')).toBe('status');
  });

  it('should apply status color classes', () => {
    const fixture = TestBed.createComponent(BadgeAtom);
    fixture.componentRef.setInput('status', 'error');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const span = el.querySelector('.badge--error');
    expect(span).toBeTruthy();
  });
});
