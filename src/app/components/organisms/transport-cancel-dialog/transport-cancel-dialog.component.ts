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
  selector: 'app-transport-cancel-dialog',
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
      <header class="bg-red-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Cancelar Servicio</h2>
          <p class="text-red-100 text-sm font-medium">Esta acción liberará el vehículo {{ data.route.vehicleId }}.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
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
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Motivo de Cancelación</mat-label>
            <textarea matInput formControlName="notes" placeholder="Explique por qué se cancela el servicio..." rows="4"></textarea>
            <mat-icon matPrefix class="mr-2 text-gray-400">event_busy</mat-icon>
            <mat-error *ngIf="cancelForm.get('notes')?.hasError('required')">El motivo es obligatorio</mat-error>
          </mat-form-field>

          <div class="flex gap-4 pt-4">
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cerrar
            </button>
            <button mat-flat-button color="warn" type="submit" 
                    [disabled]="cancelForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-red-600 flex-1 shadow-xl shadow-red-100 hover:scale-105 transition-all">
              Confirmar Cancelación
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
export class TransportCancelDialogOrganism {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportCancelDialogOrganism>);
  public data = inject<{ route: TransportRoute }>(MAT_DIALOG_DATA);
  private transportService = inject(TransportService);

  cancelForm = this.fb.group({
    notes: ['', [Validators.required, Validators.minLength(10)]]
  });

  onSubmit() {
    if (this.cancelForm.valid) {
      this.transportService.cancelRoute(this.data.route.id, this.cancelForm.value.notes!);
      this.dialogRef.close(true);
    }
  }
}
