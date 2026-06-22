import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportService } from '../../../services/transport.service';
import { TransportRoute } from '../../../models/transport.model';

@Component({
  selector: 'app-transport-standby-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-0 overflow-hidden">
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Standby</h2>
          <p class="text-indigo-100 text-sm font-medium">Añada tiempo muerto o esperas adicionales al servicio.</p>
        </div>
        <button (click)="close()" class="text-white/80 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-indigo-500 transition-colors">
          <span class="material-icons">close</span>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="standbyForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Horas de Espera</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">schedule</span>
                <input type="number" formControlName="hours" placeholder="0" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
              @if (standbyForm.get('hours')?.hasError('required') && standbyForm.get('hours')?.touched) {
                <p class="text-red-500 text-xs mt-1 font-medium">Requerido</p>
              }
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Valor Adicional</label>
              <div class="relative">
                <span class="text-gray-400 absolute left-3 top-3.5 text-sm font-medium">$</span>
                <input type="number" formControlName="amount" placeholder="0" class="w-full pl-8 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                <span class="material-icons absolute right-3 top-3.5 text-gray-400 text-sm">payments</span>
              </div>
              @if (standbyForm.get('amount')?.hasError('required') && standbyForm.get('amount')?.touched) {
                <p class="text-red-500 text-xs mt-1 font-medium">Requerido</p>
              }
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 mb-1.5 block">Observaciones / Justificación</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">notes</span>
              <textarea formControlName="notes" placeholder="Describa el motivo de la espera..." rows="4" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
            </div>
            @if (standbyForm.get('notes')?.hasError('required') && standbyForm.get('notes')?.touched) {
              <p class="text-red-500 text-xs mt-1 font-medium">Las observaciones son obligatorias</p>
            }
          </div>

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
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportStandbyDialogOrganism {
  private fb = inject(FormBuilder);
  data = input<{ route: TransportRoute }>({} as { route: TransportRoute });
  closed = output<boolean | undefined>();
  private transportService = inject(TransportService);

  standbyForm = this.fb.group({
    hours: [0, [Validators.required, Validators.min(0.5)]],
    amount: [0, [Validators.required, Validators.min(0)]],
    notes: ['', [Validators.required, Validators.minLength(5)]]
  });

  close(result?: boolean) {
    this.closed.emit(result);
  }

  onSubmit() {
    if (this.standbyForm.valid) {
      const val = this.standbyForm.value;
      this.transportService.addStandby(
        this.data().route.id, 
        val.hours!, 
        val.amount!, 
        val.notes!
      );
      this.closed.emit(true);
    }
  }
}
