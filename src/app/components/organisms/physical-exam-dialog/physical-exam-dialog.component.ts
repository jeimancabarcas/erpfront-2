import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-physical-exam-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">monitor_heart</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Examen Físico</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Peso (kg)</label>
          <div class="relative">
            <input type="number" step="0.1" [(ngModel)]="data().weight" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
            <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">monitor_weight</span>
          </div>
        </div>
        
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Talla (cm)</label>
          <div class="relative">
            <input type="number" [(ngModel)]="data().height" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
            <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">straighten</span>
          </div>
        </div>
        
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Temp (°C)</label>
          <div class="relative">
            <input type="number" step="0.1" [(ngModel)]="data().temperature" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
            <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">thermostat</span>
          </div>
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-500 mb-1.5 block">Hallazgos Clínicos Detallados</label>
        <textarea rows="6" [(ngModel)]="data().findings" placeholder="Descripción detallada de los hallazgos por sistemas..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
      </div>

      <div class="flex justify-end mt-10 gap-3">
        <button (click)="close(false)" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
        <button (click)="close(true)" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Examen</button>
      </div>
    </div>
  `
})
export class PhysicalExamDialogComponent {
  data = input<any>({});
  closed = output<any>();

  close(result: any) {
    this.closed.emit(result);
  }
}
