import { TestBed } from '@angular/core/testing';
import { InputAtom } from './input.component';

describe('InputAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(InputAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.type()).toBe('text');
  });

  it('should render input element with default type', () => {
    const fixture = TestBed.createComponent(InputAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('type')).toBe('text');
  });

  it('should render textarea when type is textarea', () => {
    const fixture = TestBed.createComponent(InputAtom);
    fixture.componentRef.setInput('type', 'textarea');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('textarea')).toBeTruthy();
    expect(el.querySelector('input')).toBeFalsy();
  });

  it('should emit valueChange on input', () => {
    const fixture = TestBed.createComponent(InputAtom);
    const component = fixture.componentInstance;
    let emitted = '';
    component.valueChange.subscribe(v => emitted = v);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe('test');
  });

  it('should show clear button when clearable and has value', () => {
    const fixture = TestBed.createComponent(InputAtom);
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', 'some text');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const clearBtn = el.querySelector('.input__clear');
    expect(clearBtn).toBeTruthy();
  });

  it('should emit empty string on clear', () => {
    const fixture = TestBed.createComponent(InputAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', 'text');
    let emitted = '';
    component.valueChange.subscribe(v => emitted = v);
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.input__clear') as HTMLButtonElement;
    clearBtn.click();
    expect(emitted).toBe('');
  });

  it('should show error text', () => {
    const fixture = TestBed.createComponent(InputAtom);
    fixture.componentRef.setInput('error', 'Campo requerido');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Campo requerido');
  });
});
