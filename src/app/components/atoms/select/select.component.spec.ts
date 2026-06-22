import { TestBed } from '@angular/core/testing';
import { SelectAtom, SelectOption } from './select.component';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

const testOptions: SelectOption[] = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
  { value: '3', label: 'Opción 3' },
];

// ── Test host for ngModel integration ──
@Component({
  standalone: true,
  imports: [SelectAtom, FormsModule],
  template: `<ui-select [(ngModel)]="status" name="status" [options]="options" />`,
})
class NgModelHost {
  status = '';
  options = testOptions;
}

describe('SelectAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAtom],
    }).compileComponents();
  });

  it('renders label and trigger with placeholder', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('placeholder', 'Select...');
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Status');
    expect(el.textContent).toContain('Select...');
    const trigger = el.querySelector('button');
    expect(trigger).toBeTruthy();
  });

  it('opens and closes dropdown on trigger click', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;

    // Open
    trigger.click();
    fixture.detectChanges();

    // Options panel should be visible — look for option buttons inside dropdown
    const optionButtons = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    );
    expect(optionButtons.length).toBe(3);

    // Close on second click
    trigger.click();
    fixture.detectChanges();

    const afterClose = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    );
    expect(afterClose.length).toBe(0);
  });

  it('selects option and emits valueChange', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', testOptions);
    let emitted = '';
    component.value.subscribe((v) => (emitted = v));
    fixture.detectChanges();

    // Open dropdown
    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    // Click first option
    const option = fixture.nativeElement.querySelector(
      'button[role="option"]',
    ) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(emitted).toBe('1');
  });

  it('closes dropdown after selecting option', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('button[role="option"]').length,
    ).toBe(3);

    const option = fixture.nativeElement.querySelector(
      'button[role="option"]',
    ) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('button[role="option"]').length,
    ).toBe(0);
  });

  it('searchable input filters options', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.componentRef.setInput('searchable', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    searchInput.value = 'Opción 1';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const optionButtons = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    );
    expect(optionButtons.length).toBe(1);
    expect(optionButtons[0].textContent).toContain('Opción 1');
  });

  it('shows Sin resultados when no match', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.componentRef.setInput('searchable', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    searchInput.value = 'xyz';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sin resultados');
  });

  it('displays error state with error message', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.componentRef.setInput('error', 'Campo requerido');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Campo requerido');
    const trigger = el.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
  });

  it('disables interaction when disabled', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);

    // Click should NOT open dropdown
    trigger.click();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    );
    expect(options.length).toBe(0);
  });

  it('shows required indicator on label', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const asterisk = el.querySelector('.text-red-500');
    expect(asterisk).toBeTruthy();
    expect(asterisk?.textContent).toBe('*');
  });

  it('supports ngModel two-way binding', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const option = fixture.nativeElement.querySelector(
      'button[role="option"]',
    ) as HTMLButtonElement;
    option.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.status).toBe('1');
  });

  it('supports formControl binding via writeValue', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();

    component.writeValue('2');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Opción 2');
  });

  it('closes dropdown on outside click', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    // Verify open
    expect(
      fixture.nativeElement.querySelectorAll('button[role="option"]').length,
    ).toBeGreaterThan(0);

    // Simulate outside click
    document.body.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('button[role="option"]').length,
    ).toBe(0);
  });

  it('shows helper text when no error', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('helperText', 'Selecciona una opción');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Selecciona una opción');
  });

  it('hides helper text when error is present', () => {
    const fixture = TestBed.createComponent(SelectAtom);
    fixture.componentRef.setInput('helperText', 'Some help');
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Required');
    expect(el.textContent).not.toContain('Some help');
  });
});
