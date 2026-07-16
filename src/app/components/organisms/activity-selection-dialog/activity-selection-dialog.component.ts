import { Component, inject, signal, computed, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Subject, type Subscription, distinctUntilChanged, debounceTime } from 'rxjs';

import { ActivityService } from '../../../services/activity.service';
import type { Activity } from '../../../models/activity.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, type SelectOption } from '../../atoms/select/select.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { ActivityCreationDialogComponent } from '../activity-creation-dialog/activity-creation-dialog.component';
import { DIALOG_DEFAULTS, DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../shared/constants/dialog.config';

// ── Interfaces ──

export interface ActivitySelectionDialogData {
  /** IDs of activities already selected (to exclude from options) */
  selectedActivityIds?: string[];
}

export interface ActivitySelectionDialogResult {
  activityIds: string[];
}

@Component({
  selector: 'app-activity-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    ButtonAtom,
    SelectAtom,
    TextInputComponent,
  ],
  template: `
    <div class="flex flex-col h-full max-h-[90vh] p-8 bg-white dark:bg-gray-900">
      <!-- Header -->
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
            <span class="material-icons !text-3xl">self_improvement</span>
          </div>
          <div>
            <h2
              class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0"
            >
              Seleccionar Actividades
            </h2>
            <p
              class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1"
            >
              Busca y selecciona las actividades para el servicio
            </p>
          </div>
        </div>
        <ui-button variant="icon" (clicked)="onCancel()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        } @else {
          <!-- Already selected activities -->
          @if (selectedActivities().length > 0) {
            <div class="mb-6">
              <label class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 block">
                Actividades seleccionadas
              </label>
              <div class="flex flex-wrap gap-2">
                @for (act of selectedActivities(); track act.id) {
                  <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                    {{ act.nombre }}
                    <button type="button" (click)="removeSelectedActivity(act.id)" class="hover:text-indigo-900 dark:hover:text-indigo-300 text-base leading-none">&times;</button>
                  </span>
                }
              </div>
            </div>
          }

          <!-- Activity selector -->
          <div class="flex flex-col gap-1.5">
            <ui-select
              label="Actividad"
              placeholder="Seleccionar actividad..."
              [options]="availableActivityOptions()"
              [value]="selectedActivityId()"
              (valueChange)="onActivitySelect($event)"
              [searchable]="true"
              [loading]="isLoadingActivities()"
              emptyText="No se encontraron actividades"
              (searchChange)="onActivitySearch($event)"
              footerLabel="Crear nueva actividad"
              (footerAction)="openCreateActivityDialog()"
            />
          </div>
        }
      </div>

      <!-- Footer -->
      <footer
        class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <ui-button variant="outline" (clicked)="onCancel()">Cancelar</ui-button>
        <ui-button
          variant="primary"
          [disabled]="selectedActivities().length === 0"
          (clicked)="onConfirm()"
        >
          Confirmar
        </ui-button>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f8fafc;
        border-radius: 10px;
      }
      :host-context(.dark) .custom-scrollbar::-webkit-scrollbar-track {
        background: #1f2937;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }
    `,
  ],
})
export class ActivitySelectionDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<ActivitySelectionDialogComponent, ActivitySelectionDialogResult | undefined>);
  protected dialogData = inject<ActivitySelectionDialogData>(MAT_DIALOG_DATA, { optional: true });
  private activityService = inject(ActivityService);
  private dialog = inject(MatDialog);

  // State signals
  loading = signal(false);
  isLoadingActivities = signal(false);

  // Search
  private activitySearch$ = new Subject<string>();
  private activitySearchSub: Subscription | null = null;

  // Computed: activity options from service reactive signal, excluding already selected
  availableActivityOptions = computed<SelectOption[]>(() =>
    this.activityService.data()
      .filter(act => !this.selectedActivityIds().includes(act.id))
      .map(act => ({
        value: act.id,
        label: act.nombre
      }))
  );

  // Selected activity IDs (includes pre-selected from dialog data)
  selectedActivityIds = signal<string[]>(this.dialogData?.selectedActivityIds || []);

  // Currently selected activity for the dropdown
  selectedActivityId = signal<string>('');

  // Computed: selected activity objects
  selectedActivities = computed<Activity[]>(() =>
    this.activityService.data()
      .filter(act => this.selectedActivityIds().includes(act.id))
  );

  ngOnInit() {
    // Activity search with debounce
    this.activitySearchSub = this.activitySearch$.pipe(debounceTime(300)).subscribe((query) => {
      this.isLoadingActivities.set(true);
      this.activityService.loadData({ name: query || undefined, limit: 50 }).subscribe({
        next: () => this.isLoadingActivities.set(false),
        error: () => this.isLoadingActivities.set(false),
      });
    });

    // Initial load
    this.loading.set(true);
    this.activityService.loadData({ limit: 100 }).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy() {
    this.activitySearchSub?.unsubscribe();
  }

  onActivitySelect(activityId: string): void {
    if (activityId && !this.selectedActivityIds().includes(activityId)) {
      this.selectedActivityIds.update(ids => [...ids, activityId]);
    }
    // Reset select value after adding
    setTimeout(() => this.selectedActivityId.set(''));
  }

  removeSelectedActivity(activityId: string): void {
    this.selectedActivityIds.update(ids => ids.filter(id => id !== activityId));
  }

  onActivitySearch(query: string): void {
    this.activitySearch$.next(query);
  }

  openCreateActivityDialog() {
    const ref = this.dialog.open(ActivityCreationDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {},
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        // Reload activities
        this.activityService.loadData({ limit: 100 }).subscribe();
        // Auto-select the newly created activity
        if (result.id && !this.selectedActivityIds().includes(result.id)) {
          this.selectedActivityIds.update(ids => [...ids, result.id]);
        }
      }
    });
  }

  onConfirm() {
    this.dialogRef.close({ activityIds: this.selectedActivityIds() });
  }

  onCancel() {
    this.dialogRef.close(undefined);
  }
}
