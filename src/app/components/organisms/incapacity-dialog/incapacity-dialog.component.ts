import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incapacity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="p-10">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">event_busy</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Incapacidad Médica</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Días de Incapacidad</label>
          <div class="relative">
            <input type="number" [(ngModel)]="data().days" placeholder="Ej: 3" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
            <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">calendar_today</span>
          </div>
        </div>
        
        <div>
          <label class="text-xs font-medium text-gray-500 mb-1.5 block">Tipo de Incapacidad</label>
          <select [(ngModel)]="data().type" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
            <option value="Enfermedad General">Enfermedad General</option>
            <option value="Accidente de Trabajo">Accidente de Trabajo</option>
            <option value="Enfermedad Profesional">Enfermedad Profesional</option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <label class="text-xs font-medium text-gray-500 mb-1.5 block">Licencias Especiales</label>
        <select [(ngModel)]="data().specialLicense" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
          <option value="Ninguna">Ninguna</option>
          <option value="Maternidad">Licencia de Maternidad</option>
          <option value="Paternidad">Licencia de Paternidad</option>
          <option value="Luto">Licencia por Luto</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-medium text-gray-500 mb-1.5 block">Recomendaciones Médicas</label>
        <textarea rows="5" [(ngModel)]="data().recommendations" placeholder="Instrucciones para el reposo y cuidados del paciente..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
      </div>

      <div class="flex justify-end mt-10 gap-3">
        <button (click)="close(false)" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
        <button (click)="close(true)" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Incapacidad</button>
      </div>
    </div>
  `
})
export class IncapacityDialogComponent {
  data = input<any>({});
  closed = output<any>();

  close(result: any) {
    this.closed.emit(result);
  }
}
