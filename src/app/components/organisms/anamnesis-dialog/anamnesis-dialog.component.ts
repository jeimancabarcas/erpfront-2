import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-anamnesis-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="p-10 rounded-[32px]">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">psychology</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Anamnesis</h2>
      </div>
      
      <div class="space-y-6">
        <div class="relative">
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Motivo de Consulta</label>
          <textarea [(ngModel)]="data().reason" rows="3" placeholder="Describa el motivo principal de la consulta..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
        </div>
        
        <div class="relative">
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Enfermedad Actual</label>
          <textarea [(ngModel)]="data().currentIllness" rows="6" placeholder="Evolución detallada de los síntomas y signos..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
        </div>
      </div>
      
      <div class="flex justify-end mt-10 gap-3">
        <button (click)="close(false)" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
        <button (click)="close(true)" class="!rounded-full !px-10 h-12 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Sección</button>
      </div>
    </div>
  `
})
export class AnamnesisDialogComponent {
  data = input<any>({});
  closed = output<any>();

  close(result: any) {
    this.closed.emit(result);
  }
}
