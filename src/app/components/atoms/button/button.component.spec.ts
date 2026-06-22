import { TestBed } from '@angular/core/testing';
import { ButtonAtom } from './button.component';

describe('ButtonAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(ButtonAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.variant()).toBe('primary');
    expect(component.size()).toBe('md');
  });

  it('should render native button element', () => {
    const fixture = TestBed.createComponent(ButtonAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn?.getAttribute('type')).toBe('button');
  });

  it('should emit clicked on click', () => {
    const fixture = TestBed.createComponent(ButtonAtom);
    const component = fixture.componentInstance;
    let emitted = false;
    component.clicked.subscribe(() => emitted = true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(emitted).toBe(true);
  });

  it('should not emit when disabled', () => {
    const fixture = TestBed.createComponent(ButtonAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('disabled', true);
    let emittedCount = 0;
    component.clicked.subscribe(() => emittedCount++);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(emittedCount).toBe(0);
  });

  it('should not emit when loading', () => {
    const fixture = TestBed.createComponent(ButtonAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('loading', true);
    let emittedCount = 0;
    component.clicked.subscribe(() => emittedCount++);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(emittedCount).toBe(0);
  });

  it('should show spinner when loading', () => {
    const fixture = TestBed.createComponent(ButtonAtom);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const spinner = el.querySelector('.button__spinner');
    expect(spinner).toBeTruthy();
  });
});
