import { TestBed } from '@angular/core/testing';
import { DataTableMolecule, ColumnDef } from './data-table.component';

describe('DataTableMolecule', () => {
  const mockColumns: ColumnDef[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', sortable: true },
  ];

  const mockData = [
    { name: 'Alice', email: 'alice@test.com', role: 'Admin' },
    { name: 'Bob', email: 'bob@test.com', role: 'User' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableMolecule],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.emptyMessage()).toBe('No se encontraron datos.');
  });

  it('should render data rows', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="table"]')).toBeTruthy();
    expect(el.textContent?.trim()).toContain('Alice');
    expect(el.textContent?.trim()).toContain('Bob');
  });

  it('should render sort indicators on sortable columns', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const sortIcons = el.querySelectorAll('.data-table__sort-icon');
    expect(sortIcons.length).toBe(2); // name and role
  });

  it('should emit sortChange when sortable header clicked', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    let emitted: any;
    fixture.componentInstance.sortChange.subscribe((v) => (emitted = v));
    // First click on name header toggles ASC
    fixture.componentInstance.onSortChange('name');
    expect(emitted).toEqual({ column: 'name', order: 'ASC' });
  });

  it('should toggle sort order on same column', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('sortBy', 'name');
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    let emitted: any;
    fixture.componentInstance.sortChange.subscribe((v) => (emitted = v));
    fixture.componentInstance.onSortChange('name');
    expect(emitted).toEqual({ column: 'name', order: 'DESC' });
  });

  it('should show loading skeleton', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const table = el.querySelector('[role="table"]');
    expect(table?.getAttribute('aria-busy')).toBe('true');
    const skeletons = el.querySelectorAll('ui-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no data', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('No se encontraron datos.');
  });

  it('should render paginator when data present', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__paginator')).toBeTruthy();
    expect(el.textContent?.trim()).toContain('Página 1 de 1');
  });

  it('should emit rowClick on row click', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    let emitted: any;
    fixture.componentInstance.rowClick.subscribe((v) => (emitted = v));
    fixture.componentInstance.onRowClick(mockData[0]);
    expect(emitted).toEqual(mockData[0]);
  });

  it('should render selection checkboxes when selectable', () => {
    const fixture = TestBed.createComponent(DataTableMolecule);
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const checkboxes = el.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3); // select all + 2 rows
  });
});
