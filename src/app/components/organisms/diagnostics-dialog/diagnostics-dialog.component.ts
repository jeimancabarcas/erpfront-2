import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-diagnostics-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="p-10 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <mat-icon>fact_check</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Diagnósticos (CIE-10/11)</h2>
      </div>
      
      <div class="bg-indigo-50/30 p-8 rounded-[32px] border border-indigo-100/50 mb-10">
        <label class="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-4">Diagnóstico Principal</label>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <mat-form-field appearance="outline" class="md:col-span-3 w-full">
            <mat-label>Código</mat-label>
            <input matInput [(ngModel)]="data.main.principalCode" placeholder="Ej: J00X">
          </mat-form-field>
          <mat-form-field appearance="outline" class="md:col-span-9 w-full">
            <mat-label>Descripción Principal</mat-label>
            <input matInput [(ngModel)]="data.main.principalDescription" placeholder="Descripción detallada del diagnóstico principal">
          </mat-form-field>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Diagnósticos Secundarios</h3>
          <button mat-flat-button color="primary" (click)="add()" class="!rounded-full !bg-indigo-600 !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100">
            <mat-icon class="!text-sm mr-2">add_circle</mat-icon>
            Añadir Otro
          </button>
        </div>
        
        <div class="space-y-4">
          @for (diag of data.secondary(); track $index) {
            <div class="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300 group">
              <mat-form-field appearance="outline" class="w-32">
                <mat-label>Código</mat-label>
                <input matInput [(ngModel)]="diag.code" placeholder="Código">
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-grow">
                <mat-label>Descripción</mat-label>
                <input matInput [(ngModel)]="diag.description" placeholder="Descripción del diagnóstico secundario">
              </mat-form-field>
              <button mat-icon-button (click)="remove($index)" class="!bg-red-50 !text-red-400 !rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
          @if (data.secondary().length === 0) {
            <div class="py-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p class="text-xs text-gray-400 italic">No hay diagnósticos secundarios registrados</p>
            </div>
          }
        </div>
      </div>

      <div class="flex justify-end mt-12 pt-8 border-t border-gray-100 gap-3">
        <button mat-button class="!rounded-full !px-8" [mat-dialog-close]="false">Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="true" class="!rounded-full !h-12 !px-10 !bg-indigo-600 !font-black">Guardar Diagnósticos</button>
      </div>
    </div>
  `
})
export class DiagnosticsDialogComponent {
  data = inject(MAT_DIALOG_DATA);

  add() {
    this.data.secondary.update((prev: any) => [...prev, { code: '', description: '' }]);
  }

  remove(index: number) {
    this.data.secondary.update((prev: any) => prev.filter((_: any, i: number) => i !== index));
  }
}
