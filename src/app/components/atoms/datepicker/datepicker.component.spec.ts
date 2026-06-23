import { TestBed } from '@angular/core/testing';
import { DatepickerComponent } from './datepicker.component';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [DatepickerComponent, FormsModule],
  template: `<ui-datepicker label="Fecha" [(ngModel)]="myDate" />`,
})
class NgModelHost {
  myDate = '';
}

@Component({
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule],
  template: `<ui-datepicker label="Fecha" [formControl]="dateCtrl" />`,
})
class FormControlHost {
  dateCtrl = new FormControl('');
}

describe('DatepickerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerComponent],
    }).compileComponents();
  });

  it('renders label and date input', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label');
    const input = el.querySelector('input[type="date"]');
    expect(label).toBeTruthy();
    expect(label!.textContent).toContain('Fecha');
    expect(input).toBeTruthy();
  });

  it('emits value on input change', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    const component = fixture.componentInstance;
    let emitted = '';
    component.registerOnChange((v: string) => (emitted = v));
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    input.value = '2026-06-23';
    input.dispatchEvent(new Event('input'));
    expect(emitted).toBe('2026-06-23');
  });

  it('shows error with aria-invalid', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('error', 'Requerido');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Requerido');
  });

  it('disables input', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('shows required indicator', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label') as HTMLElement;
    expect(label.textContent).toContain('*');
  });

  it('supports ngModel binding', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    input.value = '2026-06-23';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.myDate).toBe('2026-06-23');
  });

  it('supports formControl binding', () => {
    const fixture = TestBed.createComponent(FormControlHost);
    fixture.componentInstance.dateCtrl.setValue('2026-06-23');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe('2026-06-23');
  });
});
