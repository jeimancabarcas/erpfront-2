import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface TransportIncidentDialogData {
  routeId: string;
}

export type TransportIncidentResult = boolean | undefined;

@Component({
  selector: 'app-transport-incident-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    ButtonAtom
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-2 text-red-500 py-12">
        <span class="material-icons text-5xl">error_outline</span>
        <p>{{ error() }}</p>
        <button (click)="close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="p-8">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">Reportar Novedad</h2>
          <p class="text-gray-400 text-sm font-medium italic">Registro de incidencias o eventos relevantes en ruta.</p>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <form [formGroup]="incidentForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block">Tipo de Novedad</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">category</span>
              <select formControlName="type" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                <option value="Retraso">Retraso</option>
                <option value="Accidente">Accidente</option>
                <option value="Clima">Clima</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            @if (incidentForm.get('type')?.hasError('required') && incidentForm.get('type')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">El tipo es obligatorio</p>
            }
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Fecha</label>
              <input type="date" formControlName="timestamp" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Hora</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">schedule</span>
                <input type="time" formControlName="incidentTime" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="text-xs font-medium text-gray-500 mb-1.5 block">Descripción de la Novedad</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">description</span>
              <textarea formControlName="description" rows="4" placeholder="Describa lo sucedido detalladamente..." class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
            </div>
            @if (incidentForm.get('description')?.hasError('required') && incidentForm.get('description')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">La descripción es obligatoria</p>
            }
            @if (incidentForm.get('description')?.hasError('minlength') && incidentForm.get('description')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">Debe tener al menos 10 caracteres</p>
            }
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="close()" class="!rounded-xl !h-12 !px-6 !font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" 
                  [disabled]="incidentForm.invalid"
                  class="!rounded-xl !h-12 !px-8 !font-black !bg-red-600 text-white shadow-lg shadow-red-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
            Reportar Novedad
          </button>
        </div>
      </form>
    </div>
    }
  `
})
export class TransportIncidentDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportIncidentDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportIncidentDialogOrganism, TransportIncidentResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  incidentForm = this.fb.group({
    type: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    timestamp: [new Date().toISOString().split('T')[0], Validators.required],
    incidentTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required]
  });

  close(result?: TransportIncidentResult) {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.incidentForm.valid) {
      const val = this.incidentForm.value;
      
      const date = new Date(val.timestamp as string);
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
