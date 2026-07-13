import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusTagAtom } from './status-tag.component';

describe('StatusTagAtom', () => {
  let component: StatusTagAtom;
  let fixture: ComponentFixture<StatusTagAtom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTagAtom]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusTagAtom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('colorClasses computed', () => {
    it('should return green light mode classes', () => {
      component.color = 'green';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('bg-green-100');
      expect(component.colorClasses()).toContain('text-green-700');
    });

    it('should return green dark mode classes', () => {
      component.color = 'green';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('dark:bg-green-900/30');
      expect(component.colorClasses()).toContain('dark:text-green-400');
    });

    it('should return amber light mode classes', () => {
      component.color = 'amber';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('bg-amber-100');
      expect(component.colorClasses()).toContain('text-amber-700');
    });

    it('should return amber dark mode classes', () => {
      component.color = 'amber';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('dark:bg-amber-900/30');
      expect(component.colorClasses()).toContain('dark:text-amber-300');
    });

    it('should return red light mode classes', () => {
      component.color = 'red';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('bg-red-100');
      expect(component.colorClasses()).toContain('text-red-700');
    });

    it('should return red dark mode classes', () => {
      component.color = 'red';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('dark:bg-red-900/30');
      expect(component.colorClasses()).toContain('dark:text-red-300');
    });

    it('should return blue light mode classes', () => {
      component.color = 'blue';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('bg-blue-100');
      expect(component.colorClasses()).toContain('text-blue-700');
    });

    it('should return blue dark mode classes', () => {
      component.color = 'blue';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('dark:bg-blue-900/30');
      expect(component.colorClasses()).toContain('dark:text-blue-300');
    });

    it('should return gray light mode classes', () => {
      component.color = 'gray';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('bg-gray-100');
      expect(component.colorClasses()).toContain('text-gray-700');
    });

    it('should return gray dark mode classes', () => {
      component.color = 'gray';
      fixture.detectChanges();
      expect(component.colorClasses()).toContain('dark:bg-gray-700/50');
      expect(component.colorClasses()).toContain('dark:text-gray-400');
    });

    it('should support all 5 status types with dark mode variants', () => {
      const statuses = ['green', 'amber', 'red', 'blue', 'gray'];
      statuses.forEach(status => {
        component.color = status;
        fixture.detectChanges();
        const classes = component.colorClasses();
        expect(classes).toContain('dark:bg-');
        expect(classes).toContain('dark:text-');
      });
    });
  });

  it('should render label correctly', () => {
    component.label = 'Active';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Active');
  });

  it('should render uppercase label', () => {
    component.label = 'active';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ACTIVE');
  });
});
