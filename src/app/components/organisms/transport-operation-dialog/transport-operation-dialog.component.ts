import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportService } from '../../../services/transport.service';
import { OperationType } from '../../../models/transport.model';

@Component({
  selector: 'app-transport-operation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="p-0 overflow-hidden">
      <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Operación</h2>
          <p class="text-indigo-100 text-sm font-medium">Define la actividad logística realizada.</p>
        </div>
        <button (click)="close()" class="text-white/80 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-indigo-500 transition-colors">
          <span class="material-icons">close</span>
        </button>
      </header>

      <div class="p-10 bg-white">
        <form [formGroup]="operationForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Tipo de Operación</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">settings_suggest</span>
                <select formControlName="type" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                  @for (type of operationTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Fecha de Operación</label>
              <input type="date" formControlName="timestamp" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Hora de Operación</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">schedule</span>
                <input type="time" formControlName="operationTime" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Vehículo Responsable</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm">local_shipping</span>
                <select formControlName="vehicleId" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                  @for (v of transportService.vehicles(); track v.id) {
                    <option [value]="v.id">{{ v.id }} - {{ v.driverName }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">Descripción / Observaciones</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-4 text-gray-400 text-sm">description</span>
                <textarea formControlName="description" rows="3" placeholder="Ej: Cargue de contenedor de 40 pies..." class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
              </div>
            </div>

            <div class="md:col-span-2 space-y-4">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archivos Adjuntos (Evidencia)</p>
              <div class="flex flex-wrap gap-3">
                @for (file of selectedFiles; track $index) {
                  <div class="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl border border-indigo-100 text-xs font-bold animate-in zoom-in-95">
                    <span class="material-icons !text-sm !w-4 !h-4">attach_file</span>
                    {{ file }}
                    <button type="button" (click)="removeFile($index)" class="hover:text-red-500 transition-colors">
                      <span class="material-icons !text-sm !w-4 !h-4">close</span>
                    </button>
                  </div>
                }
                <button type="button" (click)="fileInput.click()" 
                        class="flex items-center gap-2 bg-white text-gray-400 px-4 py-2 rounded-2xl border border-dashed border-gray-200 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all">
                  <span class="material-icons !text-sm !w-4 !h-4">add</span>
                  Adjuntar Archivo
                </button>
                <input #fileInput type="file" (change)="onFileSelected($event)" multiple class="hidden">
              </div>
            </div>

          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" (click)="close()" class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="operationForm.invalid"
                    class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 text-white flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all disabled:opacity-50">
              Registrar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportOperationDialogOrganism implements OnInit {
  private fb = inject(FormBuilder);
  data = input<any>({});
  closed = output<boolean | undefined>();
  public transportService = inject(TransportService);

  operationTypes: OperationType[] = ['Cargue', 'Descargue', 'Consolidacion', 'Desconsolidacion'];
  showVehicleSelect = false;
  selectedFiles: string[] = [];

  operationForm = this.fb.group({
    type: ['', Validators.required],
    vehicleId: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    timestamp: [new Date().toISOString().split('T')[0], Validators.required],
    operationTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required],
    status: ['InProcess']
  });

  close(result?: boolean) {
    this.closed.emit(result);
  }

  ngOnInit() {
    // If we have a vehicleId from context, pre-select it
    if (this.data().vehicleId) {
      this.operationForm.patchValue({ vehicleId: this.data().vehicleId });
    }
  }

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
    if (this.operationForm.valid) {
      const val = this.operationForm.value;
      
      // Combine date and time
      const date = new Date(val.timestamp as string);
      const [hours, minutes] = (val.operationTime as string).split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      this.transportService.addOperation(this.data().routeId, {
        type: val.type as OperationType,
        vehicleId: val.vehicleId!,
        description: val.description!,
        status: val.status as any,
        timestamp: date.toISOString(),
        attachments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      });
      this.closed.emit(true);
    }
  }
}
