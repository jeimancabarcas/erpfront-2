import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TransportService } from '../../../services/transport.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-transport-incident-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="p-6">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">Reportar Novedad</h2>
          <p class="text-gray-400 text-sm font-medium italic">Registro de incidencias o eventos relevantes en ruta.</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="text-gray-400 hover:text-gray-600">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="incidentForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Tipo de Novedad</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Retraso">Retraso</mat-option>
              <mat-option value="Accidente">Accidente</mat-option>
              <mat-option value="Clima">Clima</mat-option>
              <mat-option value="Otros">Otros</mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2 text-gray-400">category</mat-icon>
            <mat-error *ngIf="incidentForm.get('type')?.hasError('required')">El tipo es obligatorio</mat-error>
          </mat-form-field>

          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Fecha</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="timestamp">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Hora</mat-label>
              <input matInput type="time" formControlName="incidentTime">
              <mat-icon matPrefix class="mr-2 text-gray-400">schedule</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full md:col-span-2">
            <mat-label>Descripción de la Novedad</mat-label>
            <textarea matInput formControlName="description" rows="4" placeholder="Describa lo sucedido detalladamente..."></textarea>
            <mat-icon matPrefix class="mr-2 text-gray-400">description</mat-icon>
            <mat-error *ngIf="incidentForm.get('description')?.hasError('required')">La descripción es obligatoria</mat-error>
            <mat-error *ngIf="incidentForm.get('description')?.hasError('minlength')">Debe tener al menos 10 caracteres</mat-error>
          </mat-form-field>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" mat-button (click)="dialogRef.close()" class="!rounded-xl !h-12 !px-6 !font-bold">
            Cancelar
          </button>
          <button type="submit" mat-flat-button color="warn" 
                  [disabled]="incidentForm.invalid"
                  class="!rounded-xl !h-12 !px-8 !font-black shadow-lg shadow-red-100 transition-all hover:scale-105 active:scale-95">
            Reportar Novedad
          </button>
        </div>
      </form>
    </div>
  `
})
export class TransportIncidentDialogOrganism {
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  dialogRef = inject(MatDialogRef<TransportIncidentDialogOrganism>);
  data = inject(MAT_DIALOG_DATA);

  incidentForm = this.fb.group({
    type: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    timestamp: [new Date(), Validators.required],
    incidentTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required]
  });

  onSubmit() {
    if (this.incidentForm.valid) {
      const val = this.incidentForm.value;
      
      // Combine date and time
      const date = new Date(val.timestamp as Date);
      const [hours, minutes] = (val.incidentTime as string).split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      this.transportService.addIncident(this.data.routeId, {
        type: val.type as any,
        description: val.description!,
        reportedBy: 'Operaciones',
        timestamp: date.toISOString()
      } as any);
      this.dialogRef.close(true);
    }
  }
}
