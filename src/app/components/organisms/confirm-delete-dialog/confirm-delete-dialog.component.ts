import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData {
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-2 text-center">
      <div class="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <mat-icon class="!text-[40px] !w-10 !h-10">delete_forever</mat-icon>
      </div>
      
      <h2 class="text-2xl font-black text-gray-900 mb-2">{{ data.title }}</h2>
      <p class="text-gray-500 font-medium mb-8 leading-relaxed">
        {{ data.message }} 
        <span *ngIf="data.itemName" class="text-gray-900 font-bold">"{{ data.itemName }}"</span>. 
        Esta acción no se puede deshacer.
      </p>

      <div class="flex flex-col gap-3">
        <button 
          mat-flat-button 
          color="warn" 
          (click)="dialogRef.close(true)"
          class="!h-14 !rounded-2xl !font-bold !bg-red-600 shadow-xl shadow-red-100 hover:scale-105 transition-transform"
        >
          {{ data.confirmText || 'Sí, eliminar definitivamente' }}
        </button>
        <button 
          mat-button 
          (click)="dialogRef.close(false)"
          class="!h-14 !rounded-2xl !font-bold text-gray-400 hover:bg-gray-50"
        >
          {{ data.cancelText || 'No, mantener' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ConfirmDeleteDialogOrganism {
  public dialogRef = inject(MatDialogRef<ConfirmDeleteDialogOrganism>);
  public data = inject<ConfirmDeleteData>(MAT_DIALOG_DATA);
}
