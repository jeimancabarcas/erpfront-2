import { TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { FormsModule, FormControl } from '@angular/forms';
import { Component } from '@angular/core';

// ── Test host for ngModel integration ──
@Component({
  standalone: true,
  imports: [TextInputComponent, FormsModule],
  template: `<ui-text-input [(ngModel)]="name" name="name" />`
})
class NgModelHost {
  name = '';
}

describe('TextInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent]
    }).compileComponents();
  });

  it('renders label and input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label')!;
    const input = el.querySelector('input')!;
    expect(label.textContent).toContain('Name');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('emits valueChange on input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    const component = fixture.componentInstance;
    let emitted = '';
    component.value.subscribe(v => emitted = v);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe('test');
  });

  it('shows error with aria-invalid', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    expect(el.textContent).toContain('Required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders material-icons span', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('icon', 'person');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span.material-icons');
    expect(span).toBeTruthy();
    expect(span.textContent).toContain('person');
  });

  it('renders boxicons with bx prefix', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('icon', 'user');
    fixture.componentRef.setInput('iconLibrary', 'boxicons');
    fixture.detectChanges();
    const i = fixture.nativeElement.querySelector('.bx');
    expect(i).toBeTruthy();
    expect(i.className).toContain('bx-user');
  });

  it('supports ngModel two-way binding', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'John';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.name).toBe('John');
  });

  it('supports formControl binding', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    const ctrl = new FormControl('initial');
    fixture.componentRef.setInput('value', ctrl.value);
    // CVA: simulate writeValue path
    fixture.componentInstance.writeValue('written');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('written');
  });

  it('disables input', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('shows required indicator', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const asterisk = el.querySelector('.text-red-500');
    expect(asterisk).toBeTruthy();
    expect(asterisk?.textContent).toBe('*');
    const input = el.querySelector('input')!;
    expect(input.required).toBe(true);
  });

  it('shows helper text when no error', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('helperText', 'Enter your name');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Enter your name');
  });

  it('hides helper text when error is present', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('helperText', 'Some help');
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Required');
    expect(el.textContent).not.toContain('Some help');
  });

  it('renders without icon element when icon is empty', () => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.material-icons')).toBeFalsy();
    expect(el.querySelector('.bx')).toBeFalsy();
  });
});
