import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-diagnostics-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="p-10 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">fact_check</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Diagnósticos (CIE-10/11)</h2>
      </div>
      
      <div class="bg-indigo-50/30 p-8 rounded-[32px] border border-indigo-100/50 mb-10">
        <label class="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-4">Diagnóstico Principal</label>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="md:col-span-3 w-full">
            <input [(ngModel)]="data().main.principalCode" placeholder="Ej: J00X" class="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
          </div>
          <div class="md:col-span-9 w-full">
            <input [(ngModel)]="data().main.principalDescription" placeholder="Descripción detallada del diagnóstico principal" class="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Diagnósticos Secundarios</h3>
          <button (click)="add()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
            <span class="material-icons !text-sm mr-1 align-middle">add_circle</span>
            Añadir Otro
          </button>
        </div>
        
        <div class="space-y-4">
          @for (diag of data().secondary; track $index) {
            <div class="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300 group">
              <input [(ngModel)]="diag.code" placeholder="Código" class="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              <input [(ngModel)]="diag.description" placeholder="Descripción del diagnóstico secundario" class="flex-grow px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              <button (click)="remove($index)" class="!bg-red-50 !text-red-400 !rounded-2xl w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
          }
          @if (data().secondary.length === 0) {
            <div class="py-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p class="text-xs text-gray-400 italic">No hay diagnósticos secundarios registrados</p>
            </div>
          }
        </div>
      </div>

      <div class="flex justify-end mt-12 pt-8 border-t border-gray-100 gap-3">
        <button (click)="close(false)" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
        <button (click)="close(true)" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Diagnósticos</button>
      </div>
    </div>
  `
})
export class DiagnosticsDialogComponent {
  data = input<any>({});
  closed = output<any>();

  add() {
    this.data().secondary = [...this.data().secondary, { code: '', description: '' }];
  }

  remove(index: number) {
    this.data().secondary = this.data().secondary.filter((_: any, i: number) => i !== index);
  }

  close(result: any) {
    this.closed.emit(result);
  }
}
