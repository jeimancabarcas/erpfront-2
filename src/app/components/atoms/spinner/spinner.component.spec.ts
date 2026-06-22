import { TestBed } from '@angular/core/testing';
import { SpinnerAtom } from './spinner.component';

describe('SpinnerAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(SpinnerAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.size()).toBe('md');
  });

  it('should have role="progressbar" and aria-label', () => {
    const fixture = TestBed.createComponent(SpinnerAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const spinner = el.querySelector('.spinner');
    expect(spinner?.getAttribute('role')).toBe('progressbar');
    expect(spinner?.getAttribute('aria-label')).toBe('Cargando');
  });

  it('should apply size classes correctly', () => {
    const fixture = TestBed.createComponent(SpinnerAtom);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const spinner = el.querySelector('.spinner--lg');
    expect(spinner).toBeTruthy();
  });
});
