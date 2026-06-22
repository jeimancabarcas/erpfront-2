import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { ButtonAtom } from '../../atoms/button/button.component';

export interface AnamnesisDialogData {
  reason: string;
  currentIllness: string;
}

export interface AnamnesisDialogResult {
  reason: string;
  currentIllness: string;
}

@Component({
  selector: 'app-anamnesis-dialog',
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
        <button (click)="close()" class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4">Cerrar</button>
      </div>
    } @else {
    <div class="p-10 rounded-[32px]">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">psychology</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Anamnesis</h2>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo" class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
      </div>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="relative">
          <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="reason">Motivo de Consulta</label>
          <textarea formControlName="reason" id="reason" rows="3" placeholder="Describa el motivo principal de la consulta..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
        </div>
        
        <div class="relative">
          <label class="text-xs font-medium text-gray-500 mb-1.5 block" for="currentIllness">Enfermedad Actual</label>
          <textarea formControlName="currentIllness" id="currentIllness" rows="6" placeholder="Evolución detallada de los síntomas y signos..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
        </div>
      
        <div class="flex justify-end mt-10 gap-3">
          <button type="button" (click)="close()" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" class="!rounded-full !px-10 h-12 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Sección</button>
        </div>
      </form>
    </div>
    }
  `
})
export class AnamnesisDialogComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<AnamnesisDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AnamnesisDialogComponent, AnamnesisDialogResult>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    reason: ['', Validators.required],
    currentIllness: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue(this.data);
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as AnamnesisDialogResult);
    }
  }
}
