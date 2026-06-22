import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchFiltersMolecule, FilterDefinition } from './search-filters.component';

describe('SearchFiltersMolecule', () => {
  const mockFilters: FilterDefinition[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'active', label: 'Activo' }, { value: 'inactive', label: 'Inactivo' }] },
    { key: 'date', label: 'Fecha', type: 'date' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFiltersMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(SearchFiltersMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render filters based on config', () => {
    const fixture = TestBed.createComponent(SearchFiltersMolecule);
    fixture.componentRef.setInput('filters', mockFilters);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('ui-input')).toBeTruthy();
    expect(el.querySelector('ui-select')).toBeTruthy();
    expect(el.querySelector('input[type="date"]')).toBeTruthy();
  });

  it('should emit filtersChange after debounce', fakeAsync(() => {
    const fixture = TestBed.createComponent(SearchFiltersMolecule);
    fixture.componentRef.setInput('filters', mockFilters);
    fixture.detectChanges();
    let emitted: Record<string, string> | undefined;
    fixture.componentInstance.filtersChange.subscribe((v) => (emitted = v));
    fixture.componentInstance.onFilterChange('name', 'test');
    tick(400);
    expect(emitted).toEqual({ name: 'test' });
  }));

  it('should clear all filters and emit empty', () => {
    const fixture = TestBed.createComponent(SearchFiltersMolecule);
    fixture.componentRef.setInput('filters', mockFilters);
    fixture.detectChanges();
    fixture.componentInstance.onFilterChange('name', 'test');
    fixture.componentInstance.onClear();
    expect(fixture.componentInstance.filterValues()).toEqual({});
  });

  it('should show clear button when filters have values', () => {
    const fixture = TestBed.createComponent(SearchFiltersMolecule);
    fixture.componentRef.setInput('filters', mockFilters);
    fixture.detectChanges();
    fixture.componentInstance.onFilterChange('name', 'test');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('ui-button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
