import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';

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
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="p-0 overflow-hidden">
      <header class="bg-emerald-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Gasto</h2>
          <p class="text-emerald-100 text-sm font-medium">Reporta un costo operativo de la ruta.</p>
        </div>
        <button mat-icon-button (click)="close()" aria-label="Cerrar diálogo">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Tipo de Gasto</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-3.5 text-gray-400 text-sm">category</mat-icon>
                <select formControlName="type" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                  @for (type of expenseTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Monto</label>
              <div class="relative">
                <span class="text-gray-400 absolute left-3 top-3.5 text-sm font-medium">$</span>
                <input type="number" formControlName="amount" placeholder="0.00" class="w-full pl-8 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm">
                <mat-icon class="absolute right-3 top-3.5 text-gray-400 text-sm">payments</mat-icon>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Descripción / Observaciones</label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-4 text-gray-400 text-sm">description</mat-icon>
                <textarea formControlName="description" rows="3" placeholder="Ej: Pago de peaje en Guaduas..." class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
              </div>
            </div>

            <div class="md:col-span-2 space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soportes y Adjuntos</p>
              <div class="flex flex-wrap gap-3">
                @for (file of selectedFiles; track $index) {
                  <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 text-xs font-bold animate-in zoom-in-95">
                    <mat-icon class="!text-sm !w-4 !h-4">receipt_long</mat-icon>
                    {{ file }}
                    <button type="button" (click)="removeFile($index)" class="hover:text-red-500 transition-colors">
                      <mat-icon class="!text-sm !w-4 !h-4">close</mat-icon>
                    </button>
                  </div>
                }
                <button type="button" (click)="fileInput.click()" 
                        class="flex items-center gap-2 bg-white text-gray-400 px-4 py-2 rounded-2xl border border-dashed border-gray-200 text-xs font-bold hover:border-emerald-400 hover:text-emerald-600 transition-all">
                  <mat-icon class="!text-sm !w-4 !h-4">add</mat-icon>
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
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportExpenseDialogOrganism {
  readonly data = inject<TransportExpenseDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<TransportExpenseDialogOrganism, TransportExpenseResult>);
  private fb = inject(FormBuilder);
  public transportService = inject(TransportService);

  expenseTypes = ['Peaje', 'Combustible', 'Viáticos', 'Mantenimiento', 'Otros'];
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
