import { TestBed } from '@angular/core/testing';
import { SkeletonAtom } from './skeleton.component';

describe('SkeletonAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(SkeletonAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.variant()).toBe('text');
  });

  it('should have aria-busy="true" and role="status"', () => {
    const fixture = TestBed.createComponent(SkeletonAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const skeleton = el.querySelector('.skeleton');
    expect(skeleton?.getAttribute('aria-busy')).toBe('true');
    expect(skeleton?.getAttribute('role')).toBe('status');
  });

  it('should apply custom width and height', () => {
    const fixture = TestBed.createComponent(SkeletonAtom);
    fixture.componentRef.setInput('width', '200px');
    fixture.componentRef.setInput('height', '2rem');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const skeleton = el.querySelector('.skeleton') as HTMLElement;
    expect(skeleton?.style.width).toBe('200px');
    expect(skeleton?.style.height).toBe('2rem');
  });

  it('should apply circle variant class', () => {
    const fixture = TestBed.createComponent(SkeletonAtom);
    fixture.componentRef.setInput('variant', 'circle');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const skeleton = el.querySelector('.skeleton--circle');
    expect(skeleton).toBeTruthy();
  });
});
