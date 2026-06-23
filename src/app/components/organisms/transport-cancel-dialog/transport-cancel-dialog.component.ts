import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TransportRoute } from '../../../models/transport.model';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface TransportCancelDialogData {
  route: TransportRoute;
}

export type TransportCancelResult = boolean | undefined;

@Component({
  selector: 'app-transport-cancel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    ButtonAtom,
    TextareaComponent
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
    <div class="p-0 overflow-hidden">
      <header class="bg-red-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Cancelar Servicio</h2>
          <p class="text-red-100 text-sm font-medium">Esta acción liberará el vehículo {{ data.route.vehicleId }}.</p>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="p-10 bg-white">
        <!-- Service Summary -->
        <div class="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumen del Servicio</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">Cliente</p>
              <p class="text-sm font-black text-gray-800">{{ data.route.customerName }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">Ruta</p>
              <p class="text-sm font-black text-gray-800">{{ data.route.origin }} → {{ data.route.destination }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">Vehículo</p>
              <p class="text-sm font-black text-indigo-600">{{ data.route.vehicleId }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">Valor</p>
              <p class="text-sm font-black text-gray-800">{{ data.route.servicePrice | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
          </div>
        </div>

        <form [formGroup]="cancelForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <ui-textarea formControlName="notes" label="Motivo de Cancelación" placeholder="Explique por qué se cancela el servicio..." rows="4" />
          @if (cancelForm.get('notes')?.hasError('required') && cancelForm.get('notes')?.touched) {
            <p class="text-red-500 text-xs mt-1 font-medium">El motivo es obligatorio</p>
          }

          <div class="flex gap-4 pt-4">
            <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cerrar
            </button>
            <button type="submit" 
                    [disabled]="cancelForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-red-600 text-white flex-1 shadow-xl shadow-red-100 hover:scale-105 transition-all disabled:opacity-50">
              Confirmar Cancelación
            </button>
          </div>
        </form>
      </div>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportCancelDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportCancelDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportCancelDialogOrganism, TransportCancelResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  cancelForm = this.fb.group({
    notes: ['', [Validators.required, Validators.minLength(10)]]
  });

  close(result?: TransportCancelResult) {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.cancelForm.valid) {
      this.transportService.cancelRoute(this.data.route.id, this.cancelForm.value.notes!);
      this.dialogRef.close(true);
    }
  }
}
