import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransportService } from '../../../services/transport.service';

@Component({
  selector: 'app-transport-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-0 overflow-hidden">
      <header class="bg-emerald-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Gasto</h2>
          <p class="text-emerald-100 text-sm font-medium">Reporta un costo operativo de la ruta.</p>
        </div>
        <button mat-icon-button mat-dialog-close class="text-white/80 hover:text-white">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Tipo de Gasto</mat-label>
              <mat-select formControlName="type">
                @for (type of expenseTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-gray-400">category</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Monto</mat-label>
              <input matInput type="number" formControlName="amount" placeholder="0.00">
              <span matPrefix class="text-gray-400 mr-1">$</span>
              <mat-icon matSuffix class="text-gray-400">payments</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full md:col-span-2">
              <mat-label>Descripción / Observaciones</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Ej: Pago de peaje en Guaduas..."></textarea>
              <mat-icon matPrefix class="mr-2 text-gray-400">description</mat-icon>
            </mat-form-field>

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
            <button mat-button mat-dialog-close type="button" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="expenseForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-emerald-600 flex-1 shadow-xl shadow-emerald-100 hover:scale-105 transition-all">
              Registrar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { margin-bottom: 4px; }
  `]
})
export class TransportExpenseDialogOrganism {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TransportExpenseDialogOrganism>);
  public data = inject(MAT_DIALOG_DATA);
  public transportService = inject(TransportService);

  expenseTypes = ['Peaje', 'Combustible', 'Viáticos', 'Mantenimiento', 'Otros'];
  selectedFiles: string[] = [];

  expenseForm = this.fb.group({
    type: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.minLength(5)]]
  });

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
