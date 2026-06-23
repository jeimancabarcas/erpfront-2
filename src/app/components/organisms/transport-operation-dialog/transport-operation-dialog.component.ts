import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { TransportService } from '../../../services/transport.service';
import { OperationType } from '../../../models/transport.model';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { DatepickerComponent } from '../../atoms/datepicker/datepicker.component';

export interface TransportOperationDialogData {
  routeId: string;
  vehicleId: string;
}

export type TransportOperationResult = boolean | undefined;

@Component({
  selector: 'app-transport-operation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    ButtonAtom,
    SelectAtom,
    TextareaComponent,
    DatepickerComponent,
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
        <button
          (click)="close()"
          class="!rounded-full !px-6 !h-10 !text-sm !font-bold text-gray-500 hover:bg-gray-100 transition-colors mt-4"
        >
          Cerrar
        </button>
      </div>
    } @else {
      <div class="p-0 overflow-hidden">
        <header class="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black tracking-tight mb-1">Registrar Operación</h2>
            <p class="text-indigo-100 text-sm font-medium">
              Define la actividad logística realizada.
            </p>
          </div>
          <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo">
            <span class="material-icons">close</span>
          </ui-button>
        </header>

        <div class="p-10 bg-white">
          <form [formGroup]="operationForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ui-select
                label="Tipo de Operación"
                [options]="operationTypeOptions"
                [formControl]="operationForm.controls.type"
              />

              <ui-datepicker
                label="Fecha de Operación"
                [formControl]="operationForm.controls.timestamp"
              />

              <div>
                <label class="text-xs font-medium text-gray-500 mb-1.5 block"
                  >Hora de Operación</label
                >
                <div class="relative">
                  <span class="material-icons absolute left-3 top-3.5 text-gray-400 text-sm"
                    >schedule</span
                  >
                  <input
                    type="time"
                    formControlName="operationTime"
                    class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <ui-select
                label="Vehículo Responsable"
                [options]="vehicleOptions()"
                [formControl]="operationForm.controls.vehicleId"
                class="md:col-span-2"
              />

              <div class="md:col-span-2">
                <ui-textarea
                  formControlName="description"
                  label="Descripción / Observaciones"
                  placeholder="Ej: Cargue de contenedor de 40 pies..."
                  [rows]="3"
                />
              </div>

              <div class="md:col-span-2 space-y-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Archivos Adjuntos (Evidencia)
                </p>
                <div class="flex flex-wrap gap-3">
                  @for (file of selectedFiles; track $index) {
                    <div
                      class="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl border border-indigo-100 text-xs font-bold animate-in zoom-in-95"
                    >
                      <span class="material-icons !text-sm !w-4 !h-4">attach_file</span>
                      {{ file }}
                      <button
                        type="button"
                        (click)="removeFile($index)"
                        class="hover:text-red-500 transition-colors"
                      >
                        <span class="material-icons !text-sm !w-4 !h-4">close</span>
                      </button>
                    </div>
                  }
                  <button
                    type="button"
                    (click)="fileInput.click()"
                    class="flex items-center gap-2 bg-white text-gray-400 px-4 py-2 rounded-2xl border border-dashed border-gray-200 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all"
                  >
                    <span class="material-icons !text-sm !w-4 !h-4">add</span>
                    Adjuntar Archivo
                  </button>
                  <input
                    #fileInput
                    type="file"
                    (change)="onFileSelected($event)"
                    multiple
                    class="hidden"
                  />
                </div>
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                (click)="close()"
                class="!rounded-full !h-14 !px-8 !font-bold flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="operationForm.invalid"
                class="!rounded-full !h-14 !px-8 !font-black !bg-indigo-600 text-white flex-1 shadow-xl shadow-indigo-100 hover:scale-105 transition-all disabled:opacity-50"
              >
                Registrar Operación
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TransportOperationDialogOrganism implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<TransportOperationDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(
    MatDialogRef<TransportOperationDialogOrganism, TransportOperationResult>,
  );
  private fb = inject(FormBuilder);
  public transportService = inject(TransportService);

  operationTypes: OperationType[] = ['Cargue', 'Descargue', 'Consolidacion', 'Desconsolidacion'];
  operationTypeOptions: SelectOption[] = this.operationTypes.map((t) => ({ value: t, label: t }));
  selectedFiles: string[] = [];

  vehicleOptions = computed<SelectOption[]>(() =>
    this.transportService
      .vehicles()
      .map((v) => ({ value: v.id, label: `${v.id} - ${v.driverName}` })),
  );

  operationForm = this.fb.group({
    type: ['', Validators.required],
    vehicleId: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
    timestamp: [new Date(), Validators.required],
    operationTime: [
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      Validators.required,
    ],
    status: ['InProcess'],
  });

  close(result?: TransportOperationResult) {
    this.dialogRef.close(result);
  }

  ngOnInit() {
    if (this.data.vehicleId) {
      this.operationForm.patchValue({ vehicleId: this.data.vehicleId });
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

      const date = new Date(val.timestamp!);
      const [hours, minutes] = (val.operationTime as string).split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      this.transportService.addOperation(this.data.routeId, {
        type: val.type as OperationType,
        vehicleId: val.vehicleId!,
        description: val.description!,
        status: val.status as any,
        timestamp: date.toISOString(),
        attachments: this.selectedFiles.length > 0 ? this.selectedFiles : undefined,
      });
      this.dialogRef.close(true);
    }
  }
}
