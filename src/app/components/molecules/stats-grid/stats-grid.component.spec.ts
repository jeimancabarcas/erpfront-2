import { TestBed } from '@angular/core/testing';
import { StatsGridMolecule, StatItem } from './stats-grid.component';

describe('StatsGridMolecule', () => {
  const mockStats: StatItem[] = [
    { label: 'Ventas', value: 15000, icon: 'trending_up', trend: 'up', trendValue: 12 },
    { label: 'Usuarios', value: 3420, icon: 'people', trend: 'down', trendValue: 3 },
    { label: 'Pedidos', value: 856, icon: 'shopping_cart' },
    { label: 'Ingresos', value: 45000, icon: 'attach_money', trend: 'up', trendValue: 8 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsGridMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(StatsGridMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.stats()).toEqual([]);
  });

  it('should render stat cards', () => {
    const fixture = TestBed.createComponent(StatsGridMolecule);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('ui-card');
    expect(cards.length).toBe(4);
  });

  it('should render icons for stats', () => {
    const fixture = TestBed.createComponent(StatsGridMolecule);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icons = el.querySelectorAll('mat-icon');
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it('should render values and labels', () => {
    const fixture = TestBed.createComponent(StatsGridMolecule);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('15000');
    expect(el.textContent?.trim()).toContain('Ventas');
  });

  it('should render trend indicators', () => {
    const fixture = TestBed.createComponent(StatsGridMolecule);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const trends = el.querySelectorAll('.stats-grid__trend');
    expect(trends.length).toBe(3); // 3 out of 4 have trends
  });

  it('should emit cardClick with index', () => {
    const fixture = TestBed.createComponent(StatsGridMolecule);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
    let emittedIndex: number | undefined;
    fixture.componentInstance.cardClick.subscribe((i) => (emittedIndex = i));
    fixture.componentInstance.onCardClick(2);
    expect(emittedIndex).toBe(2);
  });
});
