import { TestBed } from '@angular/core/testing';
import { SelectAtom } from './select.component';

describe('SelectAtom', () => {
  const testOptions = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.placeholder()).toBe('Seleccionar...');
  });

  it('should display placeholder when no value', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Seleccionar...');
  });

  it('should display selected option label', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.componentRef.setInput('value', '2');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Opción 2');
  });

  it('should open dropdown on trigger click', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.select__trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.select__panel');
    expect(panel).toBeTruthy();
  });

  it('should emit valueChange on option selection', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', testOptions);
    let emitted = '';
    component.valueChange.subscribe(v => emitted = v);
    fixture.detectChanges();
    // Open dropdown
    const trigger = fixture.nativeElement.querySelector('.select__trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    // Select first option
    const option = fixture.nativeElement.querySelector('.select__option') as HTMLElement;
    option.click();
    expect(emitted).toBe('1');
  });
});
