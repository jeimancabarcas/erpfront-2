import { TestBed } from '@angular/core/testing';
import { ToggleAtom } from './toggle.component';

describe('ToggleAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(ToggleAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.checked()).toBe(false);
  });

  it('should have role="switch" and aria-checked="false" by default', () => {
    const fixture = TestBed.createComponent(ToggleAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('.toggle');
    expect(btn?.getAttribute('role')).toBe('switch');
    expect(btn?.getAttribute('aria-checked')).toBe('false');
  });

  it('should emit checkedChange=true on click', () => {
    const fixture = TestBed.createComponent(ToggleAtom);
    const component = fixture.componentInstance;
    let emitted = false;
    component.checkedChange.subscribe(v => emitted = v);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    btn.click();
    expect(emitted).toBe(true);
  });

  it('should not emit when disabled', () => {
    const fixture = TestBed.createComponent(ToggleAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('disabled', true);
    let emitted = false;
    let emittedCount = 0;
    component.checkedChange.subscribe(v => { emitted = v; emittedCount++; });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    btn.click();
    expect(emittedCount).toBe(0);
  });

  it('should toggle on Space key', () => {
    const fixture = TestBed.createComponent(ToggleAtom);
    const component = fixture.componentInstance;
    let emitted = false;
    component.checkedChange.subscribe(v => emitted = v);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    const event = new KeyboardEvent('keydown', { key: ' ' });
    btn.dispatchEvent(event);
    expect(emitted).toBe(true);
  });
});
