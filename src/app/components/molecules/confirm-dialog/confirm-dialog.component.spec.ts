import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConfirmDialogMolecule } from './confirm-dialog.component';

describe('ConfirmDialogMolecule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Confirmar');
    expect(component.confirmLabel()).toBe('Confirmar');
    expect(component.cancelLabel()).toBe('Cancelar');
  });

  it('should not render when closed', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.dialog-backdrop')).toBeFalsy();
  });

  it('should render backdrop and card when open', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirmación');
    fixture.componentRef.setInput('message', '¿Estás seguro?');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.dialog-backdrop')).toBeTruthy();
    expect(el.querySelector('[role="alertdialog"]')).toBeTruthy();
    expect(el.querySelector('[aria-modal="true"]')).toBeTruthy();
    expect(el.textContent?.trim()).toContain('Confirmación');
    expect(el.textContent?.trim()).toContain('¿Estás seguro?');
  });

  it('should emit confirm when confirm button clicked', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let confirmed = false;
    fixture.componentInstance.confirm.subscribe(() => (confirmed = true));
    fixture.componentInstance.onConfirm();
    expect(confirmed).toBeTrue();
  });

  it('should emit cancel when cancel button clicked', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let cancelled = false;
    fixture.componentInstance.cancel.subscribe(() => (cancelled = true));
    fixture.componentInstance.onCancel();
    expect(cancelled).toBeTrue();
  });

  it('should emit cancel on escape key', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let cancelled = false;
    fixture.componentInstance.cancel.subscribe(() => (cancelled = true));
    fixture.componentInstance.onEscape();
    expect(cancelled).toBeTrue();
  });

  it('should emit confirm on enter key', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let confirmed = false;
    fixture.componentInstance.confirm.subscribe(() => (confirmed = true));
    fixture.componentInstance.onEnter();
    expect(confirmed).toBeTrue();
  });

  it('should not close when clicking inside the dialog', () => {
    const fixture = TestBed.createComponent(ConfirmDialogMolecule);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    let cancelled = false;
    fixture.componentInstance.cancel.subscribe(() => (cancelled = true));
    const card = fixture.nativeElement.querySelector('ui-card');
    card?.dispatchEvent(new MouseEvent('click'));
    expect(cancelled).toBeFalse();
  });
});
