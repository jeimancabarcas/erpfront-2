import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchBarMolecule } from './search-bar.component';

describe('SearchBarMolecule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(SearchBarMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.placeholder()).toBe('Buscar...');
  });

  it('should render search icon and role', () => {
    const fixture = TestBed.createComponent(SearchBarMolecule);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="search"]')).toBeTruthy();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('search');
  });

  it('should render keyboard hint on desktop', () => {
    const fixture = TestBed.createComponent(SearchBarMolecule);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const hint = el.querySelector('.search-bar__hint');
    expect(hint).toBeTruthy();
    expect(hint?.textContent?.trim()).toBe('⌘K');
  });

  it('should emit valueChange after debounce', fakeAsync(() => {
    const fixture = TestBed.createComponent(SearchBarMolecule);
    fixture.detectChanges();
    let emitted: string | undefined;
    fixture.componentInstance.valueChange.subscribe((v: string) => (emitted = v));
    fixture.componentInstance.onValueChange('test query');
    expect(emitted).toBeUndefined();
    tick(400);
    expect(emitted).toBe('test query');
  }));

  it('should debounce rapidly changing values', fakeAsync(() => {
    const fixture = TestBed.createComponent(SearchBarMolecule);
    fixture.detectChanges();
    const values: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v: string) => values.push(v));
    fixture.componentInstance.onValueChange('a');
    tick(100);
    fixture.componentInstance.onValueChange('ab');
    tick(100);
    fixture.componentInstance.onValueChange('abc');
    tick(400);
    expect(values).toEqual(['abc']);
  }));
});
