import { TestBed } from '@angular/core/testing';
import { CardAtom } from './card.component';

describe('CardAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(CardAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.padding()).toBe('var(--spacing-6)');
  });

  it('should render card container', () => {
    const fixture = TestBed.createComponent(CardAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const card = el.querySelector('.card');
    expect(card).toBeTruthy();
  });

  it('should have header section', () => {
    const fixture = TestBed.createComponent(CardAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const header = el.querySelector('.card__header');
    expect(header).toBeTruthy();
  });

  it('should have body section', () => {
    const fixture = TestBed.createComponent(CardAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.card__body');
    expect(body).toBeTruthy();
  });

  it('should have footer section', () => {
    const fixture = TestBed.createComponent(CardAtom);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const footer = el.querySelector('.card__footer');
    expect(footer).toBeTruthy();
  });
});
