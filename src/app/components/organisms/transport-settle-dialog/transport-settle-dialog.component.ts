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
  selector: 'app-transport-settle-dialog',
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
      <header class="bg-emerald-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Liquidar Servicio</h2>
          <p class="text-emerald-100 text-sm font-medium">Esta acción marcará el servicio como liquidado y liberará el vehículo.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white">
        <!-- Financial Summary -->
        <div class="mb-8 p-6 bg-gray-50 rounded-3xl border border-emerald-100">
          <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Balance Final Estimado</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">Total Facturable</p>
              <p class="text-lg font-black text-gray-900">{{ (data.route.servicePrice + data.route.standbyTotal) | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 font-bold uppercase">Utilidad Bruta</p>
              <p class="text-lg font-black text-emerald-600">{{ (data.route.servicePrice + data.route.standbyTotal - totalExpenses) | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
          </div>
        </div>

        <form [formGroup]="settleForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Observaciones de Liquidación</mat-label>
            <textarea matInput formControlName="notes" placeholder="Agregue comentarios sobre el cierre del servicio..." rows="4"></textarea>
            <mat-icon matPrefix class="mr-2 text-gray-400">rate_review</mat-icon>
          </mat-form-field>

          <div class="flex gap-4 pt-4">
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cerrar
            </button>
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="settleForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-emerald-600 flex-1 shadow-xl shadow-emerald-100 hover:scale-105 transition-all">
              Confirmar Liquidación
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
export class TransportSettleDialogOrganism {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportSettleDialogOrganism>);
  public data = inject<{ route: TransportRoute }>(MAT_DIALOG_DATA);
  private transportService = inject(TransportService);

  settleForm = this.fb.group({
    notes: ['']
  });

  get totalExpenses(): number {
    return this.data.route.detailedExpenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;
  }

  onSubmit() {
    if (this.settleForm.valid) {
      this.transportService.settleRoute(this.data.route.id, this.settleForm.value.notes || undefined);
      this.dialogRef.close(true);
    }
  }
}
