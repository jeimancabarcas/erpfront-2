import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivityService } from '../../../services/activity.service';
import { CreateActivityDto } from '../../../models/activity.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface ActivityCreationDialogData {}

@Component({
  selector: 'app-activity-creation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonAtom,
    TextInputComponent,
    TextareaComponent
  ],
  template: `
    <div class="p-8">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight !m-0">
          Nueva Actividad
        </h2>
        <ui-button variant="icon" (clicked)="onClose()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form #activityForm="ngForm" class="space-y-6">
        <div class="space-y-6">
          <ui-text-input
            label="Nombre de la Actividad"
            icon="self_improvement"
            [value]="activity().nombre ?? ''"
            (valueChange)="activity().nombre = $event"
            name="nombre"
            [required]="true"
            placeholder="Ej. Masaje terapéutico"
          />

          <ui-textarea
            label="Descripción (Opcional)"
            [value]="activity().descripcion ?? ''"
            (valueChange)="activity().descripcion = $event"
            [rows]="3"
            placeholder="Añade una breve descripción..."
          />

          <ui-text-input
            type="number"
            label="Horas Estimadas (Opcional)"
            icon="schedule"
            [value]="horasEstimadasDisplay"
            (valueChange)="updateHorasEstimadas($event)"
            name="horasEstimadas"
            placeholder="Ej. 1.5"
          />
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <ui-button variant="outline" (clicked)="onClose()">
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            [disabled]="!activityForm.valid"
            (clicked)="saveActivity()"
          >
            Crear Actividad
          </ui-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ActivityCreationDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ActivityCreationDialogComponent, any>);
  private dialogData = inject<ActivityCreationDialogData>(MAT_DIALOG_DATA);

  private activityService = inject(ActivityService);

  activity = signal<Partial<CreateActivityDto>>({
    nombre: '',
    descripcion: '',
    horasEstimadas: undefined
  });

  get horasEstimadasDisplay(): string {
    const he = this.activity().horasEstimadas;
    return he != null ? String(he) : '';
  }

  ngOnInit() {}

  updateHorasEstimadas(value: string): void {
    this.activity().horasEstimadas = value ? Number(value) : undefined;
  }

  onClose() {
    this.dialogRef.close(false);
  }

  saveActivity() {
    const activityData = this.activity();

    this.activityService.createActivity({
      nombre: activityData.nombre!,
      descripcion: activityData.descripcion,
      horasEstimadas: activityData.horasEstimadas
    }).subscribe({
      next: (created) => {
        this.dialogRef.close({ id: created.id, nombre: created.nombre });
      },
      error: () => {
        console.error('Error creating activity');
      }
    });
  }
}
