import { TestBed } from '@angular/core/testing';
import { DividerAtom } from './divider.component';

describe('DividerAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(DividerAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.direction()).toBe('horizontal');
  });

  it('should render horizontal divider with role="separator"', () => {
    const fixture = TestBed.createComponent(DividerAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const divider = el.querySelector('.divider--horizontal');
    expect(divider).toBeTruthy();
    expect(divider?.getAttribute('role')).toBe('separator');
    expect(divider?.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('should render vertical divider', () => {
    const fixture = TestBed.createComponent(DividerAtom);
    fixture.componentRef.setInput('direction', 'vertical');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const divider = el.querySelector('.divider--vertical');
    expect(divider).toBeTruthy();
    expect(divider?.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('should render label on horizontal divider', () => {
    const fixture = TestBed.createComponent(DividerAtom);
    fixture.componentRef.setInput('label', 'Sección');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Sección');
  });
});
