import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DIALOG_DEFAULTS, DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../shared/constants/dialog.config';
import { ServiceService } from '../../../services/service.service';
import { ActivityService } from '../../../services/activity.service';
import { Service, CreateServiceDto, UpdateServiceDto } from '../../../models/service.model';
import { Activity } from '../../../models/activity.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TableComponent, TableColumn } from '../../atoms/table/table.component';
import { TableCellDirective } from '../../atoms/table/table-cell.directive';
import { ActivitySelectionDialogComponent } from '../../organisms/activity-selection-dialog/activity-selection-dialog.component';
import { ActivityCreationDialogComponent } from '../../organisms/activity-creation-dialog/activity-creation-dialog.component';

export interface ServiceFormDialogData {
  service?: Service;
}

export type ServiceFormResult = boolean | undefined;

export interface ServiceActivityRow {
  actividadId: string;
  horasEstimadas?: number | null;
}

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatButtonModule,
    ButtonAtom,
    TextInputComponent,
    TextareaComponent,
    SelectAtom,
    TableComponent,
    TableCellDirective,
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="onClose()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 dark:!text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="p-8 dark:bg-gray-900">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0">
          {{ isEditMode ? 'Editar Servicio' : 'Nuevo Servicio' }}
        </h2>
        <button (click)="onClose()" aria-label="Cerrar diálogo" class="!text-gray-400 dark:!text-gray-500 w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
          <span class="material-icons">close</span>
        </button>
      </header>

      <form #serviceForm="ngForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ui-text-input label="Nombre del Servicio" icon="description" [value]="service().nombre" (valueChange)="updateField('nombre', $event)" name="nombre" [required]="true" placeholder="Ej. Masaje terapéutico" />

          <ui-text-input type="number" label="Precio Base" icon="payments" [value]="formatPrice(service().precioBase)" (valueChange)="updateField('precioBase', $event)" name="precioBase" [required]="true" placeholder="Ej. 50000" />
        </div>

        <ui-textarea label="Descripción (Opcional)" [value]="service().descripcion ?? ''" (valueChange)="updateField('descripcion', $event)" [rows]="3" placeholder="Añade una breve descripción del servicio..." />

        <!-- Actividades asociadas — tabla -->
        <div class="flex flex-col gap-3">
          <label class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actividades Asociadas</label>

          @if (serviceActivities().length > 0) {
            <ui-table
              [columns]="activityTableColumns()"
              [data]="serviceActivities()"
              [loading]="false"
              emptyMessage="Sin actividades asociadas"
              emptyIcon="add_task"
            >
              <ng-template uiTableCell="nombre" let-row>
                {{ getActivityName(row.actividadId) }}
              </ng-template>

              <ng-template uiTableCell="horasEstimadas" let-row>
                {{ getHorasEstimadasText(row.horasEstimadas) }}
              </ng-template>

              <ng-template uiTableCell="acciones" let-row>
                <button
                  type="button"
                  (click)="removeServiceActivity(row.actividadId)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Quitar actividad"
                >
                  <span class="material-icons text-base">delete</span>
                </button>
              </ng-template>
            </ui-table>
          }

          <div class="flex gap-2 items-center">
            <ui-select placeholder="Agregar actividad..." [options]="availableActivityOptions()" [value]="selectedActivity()" (valueChange)="onActivitySelect($event)" [searchable]="true" [loading]="activityLoading()" (searchChange)="onActivitySearch($event)" footerLabel="Crear nueva actividad" (footerAction)="openCreateActivityDialog()" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!serviceForm.valid"
            (clicked)="saveService()"
          >
            {{ isEditMode ? 'Guardar Cambios' : 'Crear Servicio' }}
          </ui-button>
        </div>
      </form>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ServiceFormMolecule implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);

  /** MAT_DIALOG_DATA for MatDialog.open path */
  private dialogData = inject<ServiceFormDialogData>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject(MatDialogRef<ServiceFormMolecule, ServiceFormResult>, { optional: true });

  private serviceService = inject(ServiceService);
  private activityService = inject(ActivityService);
  private dialog = inject(MatDialog);

  isEditMode = false;

  activityList = this.activityService.data;
  activityLoading = this.activityService.loading;

  serviceActivities = signal<ServiceActivityRow[]>([]);
  selectedActivity = signal<string>('');

  activityTableColumns = computed<TableColumn[]>(() => [
    { key: 'nombre', header: 'Actividad' },
    { key: 'horasEstimadas', header: 'Horas Estimadas' },
    { key: 'acciones', header: '', width: '60px' },
  ]);

  /** Available options for the select (activities not yet selected) */
  availableActivityOptions = computed<SelectOption[]>(() =>
    this.activityList()
      .filter(act => !this.serviceActivities().some(s => s.actividadId === act.id))
      .map(act => ({
        value: act.id,
        label: act.nombre
      }))
  );

  private activitySearchTimeout: ReturnType<typeof setTimeout> | null = null;

  service = signal({
    nombre: '',
    descripcion: '',
    precioBase: 0
  });

  ngOnInit() {
    const incoming = this.dialogData;

    const loadAndInit = () => {
      if (incoming?.service) {
        this.isEditMode = true;
        const service = incoming.service;
        this.service.set({
          nombre: service.nombre,
          descripcion: service.descripcion || '',
          precioBase: service.precioBase,
        });
      if (service.actividades && service.actividades.length > 0) {
        this.serviceActivities.set(
          service.actividades.map((a: any) => ({
            actividadId: a.actividad?.id ?? a.actividadId,
            horasEstimadas: a.actividad?.horasEstimadas ?? null,
          }))
        );
      }
      }
    };

    if (this.activityList().length === 0) {
      this.activityService.loadData({ limit: 100 }).subscribe({
        next: () => loadAndInit(),
        error: () => loadAndInit(),
      });
    } else {
      loadAndInit();
    }
  }

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onActivitySearch(query: string): void {
    if (this.activitySearchTimeout) clearTimeout(this.activitySearchTimeout);
    this.activitySearchTimeout = setTimeout(() => {
      this.activityService.loadData({ limit: 100, name: query || undefined }).subscribe();
    }, 300);
  }

  onActivitySelect(activityId: string): void {
    if (activityId) {
      const activity = this.activityList().find(a => a.id === activityId);
      if (activity && !this.serviceActivities().some(s => s.actividadId === activityId)) {
        this.serviceActivities.update(acts => [
          ...acts,
          {
            actividadId: activityId,
            horasEstimadas: activity.horasEstimadas ?? null,
          }
        ]);
      }
    }
    setTimeout(() => this.selectedActivity.set(''));
  }

  removeServiceActivity(actividadId: string): void {
    this.serviceActivities.update(acts => acts.filter(a => a.actividadId !== actividadId));
  }

  getActivityName(actividadId: string): string {
    const act = this.activityList().find(a => a.id === actividadId);
    return act ? act.nombre : actividadId;
  }

  getHorasEstimadasText(horasEstimadas: number | null | undefined): string {
    if (horasEstimadas == null) return '—';
    const hours = Math.floor(horasEstimadas);
    const minutes = Math.round((horasEstimadas - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  formatPrice(value: number): string {
    return String(value);
  }

  updateField(field: string, value: any): void {
    this.service.update(s => ({ ...s, [field]: value }));
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
        this.activityService.loadData({ limit: 100 }).subscribe();
        const newActivity = this.activityList().find(a => a.id === result.id);
        if (newActivity) {
          this.serviceActivities.update(acts => [
            ...acts,
            {
              actividadId: newActivity.id,
              horasEstimadas: newActivity.horasEstimadas ?? null,
            }
          ]);
        }
      }
    });
  }

  saveService() {
    const { nombre, descripcion, precioBase } = this.service();
    const dto: CreateServiceDto | UpdateServiceDto = {
      nombre,
      descripcion,
      precioBase: Number(precioBase),
      actividades: this.serviceActivities().map((a) => ({
        actividadId: a.actividadId,
      })),
    };

    const request = this.isEditMode
      ? this.serviceService.updateService(this.dialogData?.service?.id || '', dto as any)
      : this.serviceService.createService(dto as any);

    request.subscribe({
      next: () => {
        if (this.dialogRef) {
          this.dialogRef.close(true);
        }
      },
      error: (err) => console.error('Error saving service:', err)
    });
  }
}
