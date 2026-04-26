import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-orders-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule
  ],
  template: `
    <div class="p-10 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <mat-icon>assignment</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Órdenes Médicas</h2>
      </div>

      <!-- Prescriptions Section -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <mat-icon class="text-indigo-400">medication</mat-icon>
            <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Medicamentos</h3>
          </div>
          <button mat-flat-button color="primary" (click)="addMed()" class="!rounded-full !bg-indigo-600 !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100">
            <mat-icon class="!text-sm mr-2">add_circle</mat-icon>
            Añadir Medicamento
          </button>
        </div>
        
        <div class="space-y-6">
          @for (med of data.prescriptions(); track $index) {
            <div class="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 relative group animate-in zoom-in-95 duration-300">
              <button mat-icon-button (click)="removeMed($index)" class="absolute -top-3 -right-3 !bg-white !shadow-sm !text-red-400 border border-red-50 hover:!bg-red-50 transition-all">
                <mat-icon>close</mat-icon>
              </button>
              
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <mat-form-field appearance="outline" class="md:col-span-3 w-full"><mat-label>Código</mat-label><input matInput [(ngModel)]="med.code" placeholder="Cód."></mat-form-field>
                <mat-form-field appearance="outline" class="md:col-span-9 w-full">
                  <mat-label>Nombre del Medicamento</mat-label>
                  <input matInput [(ngModel)]="med.name" placeholder="Ej: Acetaminofén 500mg">
                  <mat-icon matSuffix class="text-indigo-300">search</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="md:col-span-4 w-full"><mat-label>Dosis</mat-label><input matInput [(ngModel)]="med.dose" placeholder="Ej: 5ml"></mat-form-field>
                <mat-form-field appearance="outline" class="md:col-span-4 w-full"><mat-label>Frecuencia</mat-label><input matInput [(ngModel)]="med.frequency" placeholder="Ej: Cada 8 horas"></mat-form-field>
                <mat-form-field appearance="outline" class="md:col-span-4 w-full">
                  <mat-label>Vía de Adm.</mat-label>
                  <mat-select [(ngModel)]="med.route">
                    <mat-option value="Oral">Oral</mat-option>
                    <mat-option value="Intramuscular">Intramuscular</mat-option>
                    <mat-option value="Intravenosa">Intravenosa</mat-option>
                    <mat-option value="Tópica">Tópica</mat-option>
                    <mat-option value="Inhalatoria">Inhalatoria</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="md:col-span-12 w-full"><mat-label>Observaciones</mat-label><textarea matInput rows="2" [(ngModel)]="med.observations" placeholder="Instrucciones adicionales para el paciente..."></textarea></mat-form-field>
              </div>
            </div>
          }
          @if (data.prescriptions().length === 0) {
            <div class="py-10 text-center bg-gray-50/30 rounded-[32px] border border-dashed border-gray-200">
              <mat-icon class="text-gray-200 !w-12 !h-12 !text-[48px] mb-4">healing</mat-icon>
              <p class="text-sm text-gray-400 italic">No hay medicamentos prescritos aún</p>
            </div>
          }
        </div>
      </div>

      <mat-divider class="!my-12"></mat-divider>

      <!-- Procedures Section -->
      <div>
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <mat-icon class="text-indigo-400">biotech</mat-icon>
            <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Procedimientos</h3>
          </div>
          <button mat-flat-button color="primary" (click)="addProc()" class="!rounded-full !bg-indigo-600 !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100">
            <mat-icon class="!text-sm mr-2">add_circle</mat-icon>
            Añadir Procedimiento
          </button>
        </div>
        
        <div class="space-y-4">
          @for (proc of data.procedures(); track $index) {
            <div class="p-6 bg-gray-50/50 rounded-[24px] border border-gray-100 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 group">
              <mat-form-field appearance="outline" class="w-32"><mat-label>Código</mat-label><input matInput [(ngModel)]="proc.code"></mat-form-field>
              <mat-form-field appearance="outline" class="flex-grow"><mat-label>Nombre del Procedimiento</mat-label><input matInput [(ngModel)]="proc.name"></mat-form-field>
              <button mat-icon-button (click)="removeProc($index)" class="!bg-red-50 !text-red-400 !rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"><mat-icon>delete</mat-icon></button>
            </div>
          }
          @if (data.procedures().length === 0) {
            <div class="py-10 text-center bg-gray-50/30 rounded-[24px] border border-dashed border-gray-200">
              <p class="text-xs text-gray-400 italic">No hay procedimientos ordenados aún</p>
            </div>
          }
        </div>
      </div>

      <div class="flex justify-end mt-12 pt-8 border-t border-gray-100 gap-3">
        <button mat-button class="!rounded-full !px-8" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="true" class="!rounded-full !h-12 !px-10 !bg-indigo-600 !font-black">Guardar Órdenes</button>
      </div>
    </div>
  `
})
export class OrdersDialogComponent {
  data = inject(MAT_DIALOG_DATA);

  addMed() {
    this.data.prescriptions.update((prev: any) => [...prev, { code: '', name: '', dose: '', frequency: '', route: 'Oral', duration: '', observations: '' }]);
  }

  removeMed(index: number) {
    this.data.prescriptions.update((prev: any) => prev.filter((_: any, i: number) => i !== index));
  }

  addProc() {
    this.data.procedures.update((prev: any) => [...prev, { code: '', name: '', indications: '' }]);
  }

  removeProc(index: number) {
    this.data.procedures.update((prev: any) => prev.filter((_: any, i: number) => i !== index));
  }
}
