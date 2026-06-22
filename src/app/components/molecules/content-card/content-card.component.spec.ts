import { TestBed } from '@angular/core/testing';
import { ContentCardMolecule } from './content-card.component';

describe('ContentCardMolecule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCardMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(ContentCardMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.title()).toBe('');
    expect(component.subtitle()).toBe('');
  });

  it('should render title and subtitle', () => {
    const fixture = TestBed.createComponent(ContentCardMolecule);
    fixture.componentRef.setInput('title', 'Card Title');
    fixture.componentRef.setInput('subtitle', 'Card subtitle');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('Card Title');
    expect(el.textContent?.trim()).toContain('Card subtitle');
  });

  it('should render image when imageUrl provided', () => {
    const fixture = TestBed.createComponent(ContentCardMolecule);
    fixture.componentRef.setInput('title', 'With Image');
    fixture.componentRef.setInput('imageUrl', 'https://example.com/img.jpg');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/img.jpg');
  });

  it('should render placeholder when no imageUrl', () => {
    const fixture = TestBed.createComponent(ContentCardMolecule);
    fixture.componentRef.setInput('title', 'No Image');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const placeholder = el.querySelector('.content-card__placeholder');
    expect(placeholder).toBeTruthy();
  });

  it('should have role="article"', () => {
    const fixture = TestBed.createComponent(ContentCardMolecule);
    fixture.componentRef.setInput('title', 'Article');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="article"]')).toBeTruthy();
  });

  it('should emit clicked when card is clicked', () => {
    const fixture = TestBed.createComponent(ContentCardMolecule);
    fixture.componentRef.setInput('title', 'Clickable');
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    const article = fixture.nativeElement.querySelector('[role="article"]')!;
    article.dispatchEvent(new MouseEvent('click'));
    expect(emitted).toBe(true);
  });
});
