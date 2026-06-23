import { TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

// ── Test host for ngModel integration ──
@Component({
  standalone: true,
  imports: [TextareaComponent, FormsModule],
  template: `<ui-textarea [(ngModel)]="notes" name="notes" />`
})
class NgModelHost {
  notes = '';
}

describe('TextareaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent]
    }).compileComponents();
  });

  it('renders label and textarea with linked for/id', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('label', 'Notes');
    fixture.componentRef.setInput('placeholder', 'Enter notes');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label')!;
    const textarea = el.querySelector('textarea')!;
    expect(label.textContent).toContain('Notes');
    expect(textarea.placeholder).toBe('Enter notes');
    expect(label.getAttribute('for')).toBe(textarea.id);
  });

  it('emits valueChange on input', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    const component = fixture.componentInstance;
    let emitted = '';
    component.value.subscribe(v => emitted = v);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'test content';
    textarea.dispatchEvent(new Event('input'));
    expect(emitted).toBe('test content');
  });

  it('applies resize-y class by default', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.className).toContain('resize-y');
  });

  it('supports custom rows and minHeight', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('rows', 6);
    fixture.componentRef.setInput('minHeight', '200px');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(6);
    expect(textarea.style.minHeight).toBe('200px');
  });

  it('shows error with aria-invalid and aria-describedby', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const textarea = el.querySelector('textarea')!;
    expect(el.textContent).toContain('Required');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toContain('error');
  });

  it('disables textarea when disabled is true', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('shows required indicator asterisk', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('label', 'Reason');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const asterisk = el.querySelector('.text-red-500');
    expect(asterisk).toBeTruthy();
    expect(asterisk?.textContent).toBe('*');
    const textarea = el.querySelector('textarea')!;
    expect(textarea.required).toBe(true);
  });

  it('supports ngModel two-way binding', async () => {
    const fixture = TestBed.createComponent(NgModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Patient update';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.notes).toBe('Patient update');
  });

  it('supports formControl binding via CVA', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentInstance.writeValue('written value');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('written value');
  });

  it('renders placeholder text', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('placeholder', 'Describe the issue...');
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Describe the issue...');
  });

  it('shows helper text when no error', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('helperText', 'Enter your notes');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Enter your notes');
  });

  it('hides helper text when error is present', () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput('helperText', 'Some help');
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Required');
    expect(el.textContent).not.toContain('Some help');
  });
});
