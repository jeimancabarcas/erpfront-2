import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { TransportService } from '../../../services/transport.service';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

export interface TransportExpenseDialogData {
  routeId: string;
}

export type TransportExpenseResult = boolean | undefined;

@Component({
  selector: 'app-transport-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    TextInputComponent,
    ButtonAtom,
    SelectAtom,
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
      <header class="bg-emerald-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Gasto</h2>
          <p class="text-emerald-100 text-sm font-medium">Reporta un costo operativo de la ruta.</p>
        </div>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
          <span class="material-icons">close</span>
        </ui-button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <ui-select label="Tipo de Gasto" [options]="expenseTypeOptions" [formControl]="expenseForm.controls.type" />

            <ui-text-input label="Monto" type="number" icon="attach_money" placeholder="0.00" [formControl]="expenseForm.controls.amount" />

            <div class="md:col-span-2">
              <ui-textarea formControlName="description" label="Descripción / Observaciones" placeholder="Ej: Pago de peaje en Guaduas..." [rows]="3" />
            </div>

            <div class="md:col-span-2 space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soportes y Adjuntos</p>
              <div class="flex flex-wrap gap-3">
                @for (file of selectedFiles; track $index) {
                  <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-xs font-bold animate-in zoom-in-95">
                    <span class="material-icons !text-sm !w-4 !h-4">receipt_long</span>
                    {{ file }}
                    <button type="button" (click)="removeFile($index)" class="hover:text-red-500 transition-colors">
                      <span class="material-icons !text-sm !w-4 !h-4">close</span>
                    </button>
                  </div>
                }
                <button type="button" (click)="fileInput.click()" 
                        class="flex items-center gap-2 bg-white text-gray-400 px-4 py-2 rounded-2xl border border-dashed border-gray-200 text-xs font-bold hover:border-emerald-400 hover:text-emerald-600 transition-all">
                  <span class="material-icons !text-sm !w-4 !h-4">add</span>
                  Adjuntar Soporte
                </button>
                <input #fileInput type="file" (change)="onFileSelected($event)" multiple class="hidden">
              </div>
            </div>

          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="expenseForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-emerald-600 text-white flex-1 shadow-xl shadow-emerald-100 hover:scale-105 transition-all disabled:opacity-50">
              Registrar Gasto
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
export class TransportExpenseDialogOrganism {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportExpenseDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportExpenseDialogOrganism, TransportExpenseResult>);
  private fb = inject(FormBuilder);
  public transportService = inject(TransportService);

  expenseTypes = ['Peaje', 'Combustible', 'Viáticos', 'Mantenimiento', 'Otros'];
  expenseTypeOptions: SelectOption[] = this.expenseTypes.map(t => ({ value: t, label: t }));
  selectedFiles: string[] = [];

  expenseForm = this.fb.group({
    type: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.minLength(5)]]
  });

  close(result?: TransportExpenseResult) {
    this.dialogRef.close(result);
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i].name);
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const val = this.expenseForm.value;
      this.transportService.addExpense(this.data.routeId, {
        type: val.type as any,
        amount: val.amount!,
        description: val.description!,
        attachments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      });
      this.dialogRef.close(true);
    }
  }
}
