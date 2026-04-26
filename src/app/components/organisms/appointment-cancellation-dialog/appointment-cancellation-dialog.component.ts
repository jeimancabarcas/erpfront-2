import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-appointment-cancellation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="relative overflow-hidden rounded-[32px] bg-white max-w-sm">
      <!-- Warning Background Pattern -->
      <div class="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-60"></div>

      <div class="p-8 relative z-10">
        <header class="flex flex-col items-center text-center mb-8">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 mb-6">
            <mat-icon class="!text-[32px] !w-8 !h-8">warning_amber</mat-icon>
          </div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0 leading-tight">¿Anular Cita Confirmada?</h2>
          <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Acción Irreversible</p>
        </header>

        <div class="space-y-4 mb-8">
          <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <div class="flex gap-3">
              <mat-icon class="text-red-500 !text-[20px] !w-5 !h-5">monetization_on</mat-icon>
              <p class="text-xs text-gray-600 leading-relaxed font-medium">
                Se deberá realizar la **devolución de dinero** al paciente por concepto de copago/consulta.
              </p>
            </div>
            <div class="flex gap-3">
              <mat-icon class="text-amber-500 !text-[20px] !w-5 !h-5">receipt_long</mat-icon>
              <p class="text-xs text-gray-600 leading-relaxed font-medium">
                La factura asociada será **cancelada** automáticamente y no aparecerá en los cierres de facturación activos.
              </p>
            </div>
            @if (!data.appointment.isParticular) {
              <div class="flex gap-3">
                <mat-icon class="text-blue-500 !text-[20px] !w-5 !h-5">outbox</mat-icon>
                <p class="text-xs text-gray-600 leading-relaxed font-medium">
                  El cobro al prestador **no será enviado** a la entidad responsable.
                </p>
              </div>
            }
          </div>
          <p class="text-[10px] text-gray-400 text-center font-bold px-4 italic">
            Al confirmar, el estado de la cita pasará a "Cancelado" y se reversarán los registros financieros vinculados.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            mat-flat-button 
            color="warn" 
            class="!rounded-full !h-14 !font-black !bg-red-600 shadow-xl shadow-red-100"
            (click)="dialogRef.close(true)"
          >
            Sí, Anular y Devolver
          </button>
          <button 
            mat-button 
            class="!rounded-full !h-12 !font-bold text-gray-500"
            (click)="dialogRef.close(false)"
          >
            Mantener Cita
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AppointmentCancellationDialogOrganism {
  public dialogRef = inject(MatDialogRef<AppointmentCancellationDialogOrganism>);
  public data = inject<{ appointment: Appointment }>(MAT_DIALOG_DATA);
}
