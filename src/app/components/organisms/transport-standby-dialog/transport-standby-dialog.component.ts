import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransportService } from '../../../services/transport.service';
import { TransportRoute } from '../../../models/transport.model';

@Component({
  selector: 'app-transport-standby-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-0 overflow-hidden">
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Standby</h2>
          <p class="text-indigo-100 text-sm font-medium">Añada tiempo muerto o esperas adicionales al servicio.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="standbyForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Horas de Espera</mat-label>
              <input matInput type="number" formControlName="hours" placeholder="0">
              <mat-icon matPrefix class="mr-2 text-gray-400">schedule</mat-icon>
              <mat-error *ngIf="standbyForm.get('hours')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Valor Adicional</mat-label>
              <input matInput type="number" formControlName="amount" placeholder="0">
              <span matPrefix class="text-gray-400 mr-1">$</span>
              <mat-icon matSuffix class="text-gray-400">payments</mat-icon>
              <mat-error *ngIf="standbyForm.get('amount')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Observaciones / Justificación</mat-label>
            <textarea matInput formControlName="notes" placeholder="Describa el motivo de la espera..." rows="4"></textarea>
            <mat-icon matPrefix class="mr-2 text-gray-400">notes</mat-icon>
            <mat-error *ngIf="standbyForm.get('notes')?.hasError('required')">Las observaciones son obligatorias</mat-error>
          </mat-form-field>

          <div class="flex gap-4 pt-4">
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cerrar
            </button>
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="standbyForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
              Guardar Standby
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class TransportStandbyDialogOrganism {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportStandbyDialogOrganism>);
  public data = inject<{ route: TransportRoute }>(MAT_DIALOG_DATA);
  private transportService = inject(TransportService);

  standbyForm = this.fb.group({
    hours: [0, [Validators.required, Validators.min(0.5)]],
    amount: [0, [Validators.required, Validators.min(0)]],
    notes: ['', [Validators.required, Validators.minLength(5)]]
  });

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
