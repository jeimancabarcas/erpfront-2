import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { TransportRoute } from '../../../models/transport.model';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface TransportSettleDialogData {
  route: TransportRoute;
}

export type TransportSettleResult = boolean | undefined;

@Component({
  selector: 'app-transport-settle-dialog',
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
      </div>
    } @else {
      <div class="p-0 overflow-hidden">
        <header class="bg-emerald-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black tracking-tight mb-1">Liquidar Servicio</h2>
            <p class="text-emerald-100 text-sm font-medium">Esta acción marcará el servicio como liquidado y liberará el vehículo.</p>
          </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
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
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Observaciones de Liquidación</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">rate_review</span>
                <textarea formControlName="notes" placeholder="Agregue comentarios sobre el cierre del servicio..." rows="4" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                Cerrar
              </button>
              <button type="submit" 
                      [disabled]="settleForm.invalid"
                      class="!rounded-full !h-14 !px-8 !font-black !bg-emerald-600 text-white flex-1 shadow-xl shadow-emerald-100 hover:scale-105 transition-all disabled:opacity-50">
                Confirmar Liquidación
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
export class TransportSettleDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportSettleDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportSettleDialogOrganism, TransportSettleResult>);
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);

  settleForm = this.fb.group({
    notes: ['']
  });

  get totalExpenses(): number {
    return this.data.route.detailedExpenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;
  }

  close(result?: TransportSettleResult) {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.settleForm.valid) {
      this.transportService.settleRoute(this.data.route.id, this.settleForm.value.notes || undefined);
      this.dialogRef.close(true);
    }
  }
}
