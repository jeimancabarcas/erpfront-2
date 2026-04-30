import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-operation-closure-dialog',
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
    <div class="p-6">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">
            {{ data.status === 'Completed' ? 'Finalizar Operación' : 'Cancelar Operación' }}
          </h2>
          <p class="text-gray-400 text-sm font-medium italic">
            {{ data.status === 'Completed' ? 'Por favor ingresa una observación opcional sobre el cierre.' : 'Es obligatorio indicar el motivo de la cancelación.' }}
          </p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="text-gray-400 hover:text-gray-600">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="closureForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Observaciones / Motivo</mat-label>
          <textarea matInput formControlName="notes" rows="4" 
                    [placeholder]="data.status === 'Completed' ? 'Ej: Todo salió según lo planeado...' : 'Ej: El vehículo presentó fallas técnicas...'"></textarea>
          <mat-icon matPrefix class="mr-2 text-gray-400">comment</mat-icon>
          <mat-error *ngIf="closureForm.get('notes')?.hasError('required')">El motivo es obligatorio para cancelar</mat-error>
          <mat-error *ngIf="closureForm.get('notes')?.hasError('minlength')">Debe tener al menos 10 caracteres</mat-error>
        </mat-form-field>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" mat-button (click)="dialogRef.close()" class="!rounded-xl !h-12 !px-6 !font-bold">
            Volver
          </button>
          <button type="submit" mat-flat-button 
                  [color]="data.status === 'Completed' ? 'primary' : 'warn'"
                  [disabled]="closureForm.invalid"
                  class="!rounded-xl !h-12 !px-8 !font-black shadow-lg transition-all hover:scale-105 active:scale-95"
                  [class.!bg-emerald-600]="data.status === 'Completed'"
                  [class.shadow-emerald-100]="data.status === 'Completed'"
                  [class.shadow-red-100]="data.status === 'Cancelled'">
            {{ data.status === 'Completed' ? 'Finalizar' : 'Confirmar Cancelación' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class TransportOperationClosureDialogOrganism implements OnInit {
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  dialogRef = inject(MatDialogRef<TransportOperationClosureDialogOrganism>);
  data = inject(MAT_DIALOG_DATA); // { routeId, operationId, status: 'Completed' | 'Cancelled' }

  closureForm = this.fb.group({
    notes: ['', []]
  });

  ngOnInit() {
    if (this.data.status === 'Cancelled') {
      this.closureForm.get('notes')?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      this.closureForm.get('notes')?.clearValidators();
    }
    this.closureForm.get('notes')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.closureForm.valid) {
      this.transportService.updateOperationStatus(
        this.data.routeId, 
        this.data.operationId, 
        this.data.status, 
        this.closureForm.value.notes || undefined
      );
      this.dialogRef.close(true);
    }
  }
}
