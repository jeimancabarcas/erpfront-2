import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { TransportService } from '../../../services/transport.service';
import { TransportRoute } from '../../../models/transport.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface TransportStandbyDialogData {
  route: TransportRoute;
}

export type TransportStandbyResult = boolean | undefined;

@Component({
  selector: 'app-transport-standby-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    TextInputComponent,
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
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Standby</h2>
          <p class="text-indigo-100 text-sm font-medium">Añada tiempo muerto o esperas adicionales al servicio.</p>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="standbyForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <ui-text-input label="Horas de Espera" type="number" icon="schedule" placeholder="0" [formControl]="standbyForm.controls.hours" />
            <ui-text-input label="Valor Adicional" type="number" icon="attach_money" placeholder="0" [formControl]="standbyForm.controls.amount" />
          </div>

          <ui-textarea formControlName="notes" label="Observaciones / Justificación" placeholder="Describa el motivo de la espera..." [rows]="4" />
          @if (standbyForm.get('notes')?.hasError('required') && standbyForm.get('notes')?.touched) {
            <p class="text-red-500 text-xs mt-1 font-medium">Las observaciones son obligatorias</p>
          }

          <div class="flex gap-4 pt-4">
            <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cerrar
            </button>
            <button type="submit" 
                    [disabled]="standbyForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 text-white flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all disabled:opacity-50">
              Guardar Standby
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
export class TransportStandbyDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportStandbyDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportStandbyDialogOrganism, TransportStandbyResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  standbyForm = this.fb.group({
    hours: [0, [Validators.required, Validators.min(0.5)]],
    amount: [0, [Validators.required, Validators.min(0)]],
    notes: ['', [Validators.required, Validators.minLength(5)]]
  });

  close(result?: TransportStandbyResult) {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.standbyForm.valid) {
      const val = this.standbyForm.value;
      this.transportService.addStandby(
        this.data.route.id, 
        val.hours!, 
        val.amount!, 
        val.notes!
      );
      this.dialogRef.close(true);
    }
  }
}
