import { TestBed } from '@angular/core/testing';
import { DatepickerComponent } from './datepicker.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendarModule } from '@angular/material/datepicker';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

// ── Test host for ngModel integration ──
@Component({
  standalone: true,
  imports: [DatepickerComponent, FormsModule],
  template: `<ui-datepicker label="Fecha" [(ngModel)]="myDate" />`
})
class NgModelHost {
  myDate: Date | null = null;
}

// ── Test host for formControl integration ──
@Component({
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule],
  template: `<ui-datepicker label="Fecha" [formControl]="dateCtrl" />`
})
class FormControlHost {
  dateCtrl = new FormControl<Date | null>(null);
}

describe('DatepickerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DatepickerComponent,
        OverlayModule,
        MatNativeDateModule,
        MatCalendarModule,
        NoopAnimationsModule,
      ]
    }).compileComponents();
  });

  // ── Render and Display ──

  it('renders label and placeholder', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.componentRef.setInput('placeholder', 'Seleccionar fecha');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label')!;
    expect(label.textContent).toContain('Fecha');
    expect(el.textContent).toContain('Seleccionar fecha');
  });

  it('shows calendar_today icon', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.material-icons');
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain('calendar_today');
  });

  it('displays formatted date as DD/MM/YYYY', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    const date = new Date(2025, 2, 15); // 15 March 2025
    fixture.componentRef.setInput('value', date);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]');
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain('15/03/2025');
  });

  // ── Calendar Overlay ──

  it('opens overlay when trigger is clicked', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    // After click, the overlay panel should be present with mat-calendar
    const calendar = document.querySelector('.mat-calendar');
    expect(calendar).toBeTruthy();
  });

  it('closes overlay on date selection', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]') as HTMLElement;
    trigger.click();
    fixture.detectChanges();

    // Find a date cell and click it
    const cells = document.querySelectorAll('.mat-calendar-body-cell');
    expect(cells.length).toBeGreaterThan(0);
    (cells[10] as HTMLElement).click();
    fixture.detectChanges();

    // Overlay should be closed
    const calendarAfter = document.querySelector('.mat-calendar');
    expect(calendarAfter).toBeNull();
  });

  it('emits value when date is selected', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    const component = fixture.componentInstance;
    let emitted: Date | null = null;
    component.valueChange.subscribe((v: Date | null) => emitted = v);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]') as HTMLElement;
    trigger.click();
    fixture.detectChanges();

    const cells = document.querySelectorAll('.mat-calendar-body-cell');
    (cells[10] as HTMLElement).click();
    fixture.detectChanges();

    expect(emitted).toBeTruthy();
    expect(emitted instanceof Date).toBe(true);
  });

  it('closes overlay on click-outside', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]') as HTMLElement;
    trigger.click();
    fixture.detectChanges();

    expect(document.querySelector('.mat-calendar')).toBeTruthy();

    // Click outside
    document.body.click();
    fixture.detectChanges();

    expect(document.querySelector('.mat-calendar')).toBeFalsy();
  });

  // ── Validation States ──

  it('shows red border and error text when error is set', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('error', 'Campo requerido');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Campo requerido');
    const trigger = el.querySelector('[data-testid="datepicker-trigger"]');
    expect(trigger).toBeTruthy();
    // Trigger should have error border class
    expect(trigger.classList.contains('border-red-500')).toBe(true);
  });

  it('shows required indicator', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('label', 'Fecha');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const asterisk = el.querySelector('.text-red-500');
    expect(asterisk).toBeTruthy();
    expect(asterisk?.textContent).toBe('*');
  });

  it('does not open overlay when disabled', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    const calendar = document.querySelector('.mat-calendar');
    expect(calendar).toBeFalsy();
  });

  it('shows disabled styling when disabled', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]') as HTMLElement;
    expect(trigger.classList.contains('opacity-50')).toBe(true);
    expect(trigger.classList.contains('cursor-not-allowed')).toBe(true);
  });

  // ── CVA writeValue ──

  it('writeValue sets displayed date', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.detectChanges();
    const date = new Date(2025, 5, 1); // 1 June 2025
    fixture.componentInstance.writeValue(date);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]');
    expect(trigger.textContent).toContain('01/06/2025');
  });

  it('writeValue(null) clears display', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('placeholder', 'Seleccionar');
    fixture.componentRef.setInput('value', new Date(2025, 2, 15));
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]');
    expect(trigger.textContent).toContain('Seleccionar');
  });

  // ── ngModel binding ──

  it('supports ngModel two-way binding', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.debugElement.query(By.directive(DatepickerComponent)).componentInstance as DatepickerComponent;
    const date = new Date(2025, 2, 15);
    component.writeValue(date);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.myDate).toEqual(date);
  });

  // ── formControl binding ──

  it('supports formControl binding', async () => {
    const fixture = TestBed.createComponent(FormControlHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.componentInstance;
    host.dateCtrl.setValue(new Date(2025, 5, 15));
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('[data-testid="datepicker-trigger"]');
    expect(trigger.textContent).toContain('15/06/2025');
  });

  // ── Helper text ──

  it('shows helper text when no error', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('helperText', 'Seleccione una fecha');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Seleccione una fecha');
  });

  it('hides helper text when error is present', () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('helperText', 'Some help');
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Required');
    expect(el.textContent).not.toContain('Some help');
  });
});
