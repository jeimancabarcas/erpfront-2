import { TestBed } from '@angular/core/testing';
import { CardGridOrganism } from './card-grid.component';
import { CardItem } from '../../../models/organism.models';

describe('CardGridOrganism', () => {
  const mockItems: CardItem[] = [
    { title: 'Item 1', subtitle: 'Sub 1' },
    { title: 'Item 2', subtitle: 'Sub 2' },
    { title: 'Item 3', subtitle: 'Sub 3' },
    { title: 'Item 4', subtitle: 'Sub 4' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGridOrganism],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.columns()).toBe(3);
    expect(component.loading()).toBe(false);
  });

  it('should render content cards when items provided', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('ui-content-card');
    expect(cards.length).toBe(4);
  });

  it('should compute itemMaxWidth based on columns', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('columns', 2);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.itemMaxWidth()).toBe('calc((100% - 1.5rem) / 2)');
  });

  it('should render skeleton placeholders when loading', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll('ui-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    const contentCards = el.querySelectorAll('ui-content-card');
    expect(contentCards.length).toBe(0);
  });

  it('should show empty message when no items and not loading', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('emptyMessage', 'Sin resultados');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const emptyText = el.querySelector('.card-grid__empty-text');
    expect(emptyText).toBeTruthy();
    expect(emptyText?.textContent?.trim()).toBe('Sin resultados');
  });

  it('should show load more button when hasMore is true', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('hasMore', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('ui-button');
    expect(btn).toBeTruthy();
  });

  it('should emit loadMore when button clicked', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('hasMore', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let emitted = false;
    component.loadMore.subscribe(() => emitted = true);
    const btn = fixture.nativeElement.querySelector('ui-button') as HTMLElement;
    btn.click();
    expect(emitted).toBe(true);
  });

  it('should emit cardClick when card is clicked', () => {
    const fixture = TestBed.createComponent(CardGridOrganism);
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    let clickedItem: CardItem | null = null;
    component.cardClick.subscribe((item: CardItem) => clickedItem = item);
    const card = fixture.nativeElement.querySelector('ui-content-card') as HTMLElement;
    card.click();
    expect(clickedItem).toEqual(mockItems[0]);
  });
});
