import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-operation-closure-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-6">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900">
            {{ data().status === 'Completed' ? 'Finalizar Operación' : 'Cancelar Operación' }}
          </h2>
          <p class="text-gray-400 text-sm font-medium italic">
            {{ data().status === 'Completed' ? 'Por favor ingresa una observación opcional sobre el cierre.' : 'Es obligatorio indicar el motivo de la cancelación.' }}
          </p>
        </div>
        <button (click)="close()" class="text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span class="material-icons">close</span>
        </button>
      </header>

      <form [formGroup]="closureForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Observaciones / Motivo</label>
          <div class="relative">
            <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">comment</span>
            <textarea formControlName="notes" rows="4" 
                      [placeholder]="data().status === 'Completed' ? 'Ej: Todo salió según lo planeado...' : 'Ej: El vehículo presentó fallas técnicas...'"
                      class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
          </div>
          @if (closureForm.get('notes')?.hasError('required') && closureForm.get('notes')?.touched) {
            <p class="text-red-500 text-xs mt-1 font-medium">El motivo es obligatorio para cancelar</p>
          }
          @if (closureForm.get('notes')?.hasError('minlength') && closureForm.get('notes')?.touched) {
            <p class="text-red-500 text-xs mt-1 font-medium">Debe tener al menos 10 caracteres</p>
          }
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="close()" class="!rounded-xl !h-12 !px-6 !font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Volver
          </button>
          <button type="submit" 
                  [disabled]="closureForm.invalid"
                  class="!rounded-xl !h-12 !px-8 !font-black shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  [class.!bg-emerald-600]="data().status === 'Completed'"
                  [class.!bg-red-600]="data().status === 'Cancelled'"
                  [class.text-white]="true"
                  [class.shadow-emerald-100]="data().status === 'Completed'"
                  [class.shadow-red-100]="data().status === 'Cancelled'">
            {{ data().status === 'Completed' ? 'Finalizar' : 'Confirmar Cancelación' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class TransportOperationClosureDialogOrganism implements OnInit {
  private fb = inject(FormBuilder);
  private transportService = inject(TransportService);
  data = input<any>({}); // { routeId, operationId, status: 'Completed' | 'Cancelled' }
  closed = output<boolean | undefined>();

  closureForm = this.fb.group({
    notes: ['', []]
  });

  close(result?: boolean) {
    this.closed.emit(result);
  }

  ngOnInit() {
    if (this.data().status === 'Cancelled') {
      this.closureForm.get('notes')?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      this.closureForm.get('notes')?.clearValidators();
    }
    this.closureForm.get('notes')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.closureForm.valid) {
      this.transportService.updateOperationStatus(
        this.data().routeId, 
        this.data().operationId, 
        this.data().status, 
        this.closureForm.value.notes || undefined
      );
      this.closed.emit(true);
    }
  }
}
