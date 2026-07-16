// @vitest-environment jsdom
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivitySelectionDialogComponent } from './activity-selection-dialog.component';
import { ActivityService } from '../../../services/activity.service';
import { Activity } from '../../../models/activity.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ActivitySelectionDialogComponent', () => {
  let component: ActivitySelectionDialogComponent;
  let fixture: ComponentFixture<ActivitySelectionDialogComponent>;

  const mockActivities: Activity[] = [
    { id: 'act-1', nombre: 'Masaje terapéutico', descripcion: 'Masaje', horasEstimadas: 50000, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'act-2', nombre: 'Reflexología', descripcion: 'Reflexología podal', horasEstimadas: 45000, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'act-3', nombre: 'Acupuntura', descripcion: 'Sesión de acupuntura', horasEstimadas: 60000, isActive: true, createdAt: '', updatedAt: '' },
  ];

  const mockActivityService = {
    loadData: vi.fn().mockReturnValue({
      subscribe: (cb: any) => {
        if (typeof cb === 'function') {
          cb({ data: mockActivities, meta: null });
        } else if (cb && typeof cb.next === 'function') {
          cb.next({ data: mockActivities, meta: null });
        }
        return { unsubscribe: () => {} };
      },
    }),
    data: vi.fn(() => mockActivities),
    loading: vi.fn(() => false),
  };

  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        ActivitySelectionDialogComponent,
      ],
      providers: [
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialog,
          useValue: { open: vi.fn().mockReturnValue({ afterClosed: () => ({ subscribe: () => ({}) }) }) }
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitySelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty selected activities', () => {
    expect(component.selectedActivityIds().length).toBe(0);
  });

  it('should initialize with pre-selected activity IDs from dialog data', async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MatDialogModule, ActivitySelectionDialogComponent],
      providers: [
        { provide: ActivityService, useValue: mockActivityService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { selectedActivityIds: ['act-1'] } },
        {
          provide: MatDialog,
          useValue: { open: vi.fn().mockReturnValue({ afterClosed: () => ({ subscribe: () => ({}) }) }) }
        },
      ],
    }).compileComponents();

    const preFixture = TestBed.createComponent(ActivitySelectionDialogComponent);
    const preComponent = preFixture.componentInstance;
    preFixture.detectChanges();

    expect(preComponent.selectedActivityIds()).toContain('act-1');
  });

  it('onActivitySelect should add activity to selectedActivities', () => {
    component.onActivitySelect('act-1');
    expect(component.selectedActivityIds()).toContain('act-1');
  });

  it('onActivitySelect should not add duplicate activity', () => {
    component.onActivitySelect('act-1');
    component.onActivitySelect('act-1');
    expect(component.selectedActivityIds().filter(id => id === 'act-1').length).toBe(1);
  });

  it('removeSelectedActivity should remove activity from selectedActivities', () => {
    component.selectedActivityIds.set(['act-1', 'act-2']);
    component.removeSelectedActivity('act-1');
    expect(component.selectedActivityIds()).toEqual(['act-2']);
  });

  it('onConfirm should close dialog with activity IDs', () => {
    component.selectedActivityIds.set(['act-1', 'act-2']);
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ activityIds: ['act-1', 'act-2'] });
  });

  it('onCancel should close dialog with undefined', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('availableActivityOptions should exclude already selected activities', () => {
    component.selectedActivityIds.set(['act-1']);
    const options = component.availableActivityOptions();
    const selectedLabels = options.map(o => o.value);
    expect(selectedLabels).not.toContain('act-1');
    expect(selectedLabels).toContain('act-2');
    expect(selectedLabels).toContain('act-3');
  });
});
