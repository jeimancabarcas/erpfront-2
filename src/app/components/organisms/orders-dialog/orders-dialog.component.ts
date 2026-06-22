import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="p-10 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">assignment</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Órdenes Médicas</h2>
      </div>

      <!-- Prescriptions Section -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <span class="material-icons text-indigo-400">medication</span>
            <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Medicamentos</h3>
          </div>
          <button (click)="addMed()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
            <span class="material-icons !text-sm mr-1 align-middle">add_circle</span>
            Añadir Medicamento
          </button>
        </div>
        
        <div class="space-y-6">
          @for (med of data().prescriptions; track $index) {
            <div class="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 relative group animate-in zoom-in-95 duration-300">
              <button (click)="removeMed($index)" class="absolute -top-3 -right-3 !bg-white !shadow-sm !text-red-400 border border-red-50 hover:!bg-red-50 transition-all rounded-2xl w-10 h-10 flex items-center justify-center">
                <span class="material-icons text-sm">close</span>
              </button>
              
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <input [(ngModel)]="med.code" placeholder="Cód." class="md:col-span-3 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                <div class="md:col-span-9 w-full relative">
                  <input [(ngModel)]="med.name" placeholder="Ej: Acetaminofén 500mg" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
                  <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 text-sm">search</span>
                </div>
                
                <input [(ngModel)]="med.dose" placeholder="Ej: 5ml" class="md:col-span-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                <input [(ngModel)]="med.frequency" placeholder="Ej: Cada 8 horas" class="md:col-span-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                <select [(ngModel)]="med.route" class="md:col-span-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                  <option value="Oral">Oral</option>
                  <option value="Intramuscular">Intramuscular</option>
                  <option value="Intravenosa">Intravenosa</option>
                  <option value="Tópica">Tópica</option>
                  <option value="Inhalatoria">Inhalatoria</option>
                </select>
                
                <textarea [(ngModel)]="med.observations" rows="2" placeholder="Instrucciones adicionales para el paciente..." class="md:col-span-12 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
              </div>
            </div>
          }
          @if (data().prescriptions.length === 0) {
            <div class="py-10 text-center bg-gray-50/30 rounded-[32px] border border-dashed border-gray-200">
              <span class="material-icons text-gray-200 !w-12 !h-12 !text-[48px] mb-4 block">healing</span>
              <p class="text-sm text-gray-400 italic">No hay medicamentos prescritos aún</p>
            </div>
          }
        </div>
      </div>

      <hr class="!my-12 border-t border-gray-100">

      <!-- Procedures Section -->
      <div>
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <span class="material-icons text-indigo-400">biotech</span>
            <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Procedimientos</h3>
          </div>
          <button (click)="addProc()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
            <span class="material-icons !text-sm mr-1 align-middle">add_circle</span>
            Añadir Procedimiento
          </button>
        </div>
        
        <div class="space-y-4">
          @for (proc of data().procedures; track $index) {
            <div class="p-6 bg-gray-50/50 rounded-[24px] border border-gray-100 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 group">
              <input [(ngModel)]="proc.code" placeholder="Código" class="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              <input [(ngModel)]="proc.name" placeholder="Nombre del Procedimiento" class="flex-grow px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              <button (click)="removeProc($index)" class="!bg-red-50 !text-red-400 !rounded-2xl w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>
          }
          @if (data().procedures.length === 0) {
            <div class="py-10 text-center bg-gray-50/30 rounded-[24px] border border-dashed border-gray-200">
              <p class="text-xs text-gray-400 italic">No hay procedimientos ordenados aún</p>
            </div>
          }
        </div>
      </div>

      <div class="flex justify-end mt-12 pt-8 border-t border-gray-100 gap-3">
        <button (click)="close(false)" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
        <button (click)="close(true)" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Órdenes</button>
      </div>
    </div>
  `
})
export class OrdersDialogComponent {
  data = input<any>({ prescriptions: [], procedures: [] });
  closed = output<any>();

  addMed() {
    this.data().prescriptions = [...this.data().prescriptions, { code: '', name: '', dose: '', frequency: '', route: 'Oral', duration: '', observations: '' }];
  }

  removeMed(index: number) {
    this.data().prescriptions = this.data().prescriptions.filter((_: any, i: number) => i !== index);
  }

  addProc() {
    this.data().procedures = [...this.data().procedures, { code: '', name: '', indications: '' }];
  }

  removeProc(index: number) {
    this.data().procedures = this.data().procedures.filter((_: any, i: number) => i !== index);
  }

  close(result: any) {
    this.closed.emit(result);
  }
}
