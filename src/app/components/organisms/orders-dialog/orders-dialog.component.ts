import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface PrescriptionData {
  code: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  observations: string;
}

export interface ProcedureData {
  code: string;
  name: string;
}

export interface OrdersDialogData {
  prescriptions: PrescriptionData[];
  procedures: ProcedureData[];
}

export interface OrdersDialogResult {
  prescriptions: PrescriptionData[];
  procedures: ProcedureData[];
}

@Component({
  selector: 'app-orders-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="p-10 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <mat-icon>assignment</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Órdenes Médicas</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Prescriptions Section -->
        <div class="mb-12">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <mat-icon class="text-indigo-400">medication</mat-icon>
              <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Medicamentos</h3>
            </div>
            <button type="button" (click)="addMed()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
              <mat-icon class="!text-sm mr-1 align-middle">add_circle</mat-icon>
              Añadir Medicamento
            </button>
          </div>
          
          <div class="space-y-6">
            @for (med of prescriptions.controls; track $index) {
              <div class="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 relative group animate-in zoom-in-95 duration-300" [formGroup]="getPrescriptionGroup($index)">
                <button type="button" (click)="removeMed($index)" class="absolute -top-3 -right-3 !bg-white !shadow-sm !text-red-400 border border-red-50 hover:!bg-red-50 transition-all rounded-2xl w-10 h-10 flex items-center justify-center">
                  <mat-icon class="text-sm">close</mat-icon>
                </button>
                
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <input formControlName="code" placeholder="Cód." class="md:col-span-3 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                  <div class="md:col-span-9 w-full relative">
                    <input formControlName="name" placeholder="Ej: Acetaminofén 500mg" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm pr-10">
                    <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 text-sm">search</mat-icon>
                  </div>
                  
                  <input formControlName="dose" placeholder="Ej: 5ml" class="md:col-span-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                  <input formControlName="frequency" placeholder="Ej: Cada 8 horas" class="md:col-span-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                  <select formControlName="route" class="md:col-span-4 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm bg-white">
                    <option value="Oral">Oral</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Intravenosa">Intravenosa</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Inhalatoria">Inhalatoria</option>
                  </select>
                  
                  <textarea formControlName="observations" rows="2" placeholder="Instrucciones adicionales para el paciente..." class="md:col-span-12 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"></textarea>
                </div>
              </div>
            }
            @if (prescriptions.controls.length === 0) {
              <div class="py-10 text-center bg-gray-50/30 rounded-[32px] border border-dashed border-gray-200">
                <mat-icon class="text-gray-200 !w-12 !h-12 !text-[48px] mb-4 block">healing</mat-icon>
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
              <mat-icon class="text-indigo-400">biotech</mat-icon>
              <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Procedimientos</h3>
            </div>
            <button type="button" (click)="addProc()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
              <mat-icon class="!text-sm mr-1 align-middle">add_circle</mat-icon>
              Añadir Procedimiento
            </button>
          </div>
          
          <div class="space-y-4">
            @for (proc of procedures.controls; track $index) {
              <div class="p-6 bg-gray-50/50 rounded-[24px] border border-gray-100 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 group" [formGroup]="getProcedureGroup($index)">
                <input formControlName="code" placeholder="Código" class="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                <input formControlName="name" placeholder="Nombre del Procedimiento" class="flex-grow px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
                <button type="button" (click)="removeProc($index)" class="!bg-red-50 !text-red-400 !rounded-2xl w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                  <mat-icon class="text-sm">delete</mat-icon>
                </button>
              </div>
            }
            @if (procedures.controls.length === 0) {
              <div class="py-10 text-center bg-gray-50/30 rounded-[24px] border border-dashed border-gray-200">
                <p class="text-xs text-gray-400 italic">No hay procedimientos ordenados aún</p>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end mt-12 pt-8 border-t border-gray-100 gap-3">
          <button type="button" (click)="close()" class="!rounded-full !px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" class="!rounded-full !h-12 !px-10 !bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">Guardar Órdenes</button>
        </div>
      </form>
    </div>
  `
})
export class OrdersDialogComponent implements OnInit {
  readonly data = inject<OrdersDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<OrdersDialogComponent, OrdersDialogResult>);
  private fb = inject(FormBuilder);

  form = this.fb.group({});

  prescriptions = new FormArray<FormGroup<{
    code: FormControl<string | null>;
    name: FormControl<string | null>;
    dose: FormControl<string | null>;
    frequency: FormControl<string | null>;
    route: FormControl<string | null>;
    observations: FormControl<string | null>;
  }>>([]);

  procedures = new FormArray<FormGroup<{
    code: FormControl<string | null>;
    name: FormControl<string | null>;
  }>>([]);

  private createPrescriptionGroup(item?: PrescriptionData) {
    return this.fb.group({
      code: [item?.code ?? ''],
      name: [item?.name ?? ''],
      dose: [item?.dose ?? ''],
      frequency: [item?.frequency ?? ''],
      route: [item?.route ?? 'Oral'],
      observations: [item?.observations ?? '']
    });
  }

  private createProcedureGroup(item?: ProcedureData) {
    return this.fb.group({
      code: [item?.code ?? ''],
      name: [item?.name ?? '']
    });
  }

  getPrescriptionGroup(index: number): FormGroup {
    return this.prescriptions.at(index) as FormGroup;
  }

  getProcedureGroup(index: number): FormGroup {
    return this.procedures.at(index) as FormGroup;
  }

  ngOnInit() {
    if (this.data.prescriptions?.length) {
      this.data.prescriptions.forEach(item => {
        this.prescriptions.push(this.createPrescriptionGroup(item));
      });
    }
    if (this.data.procedures?.length) {
      this.data.procedures.forEach(item => {
        this.procedures.push(this.createProcedureGroup(item));
      });
    }
  }

  addMed() {
    this.prescriptions.push(this.createPrescriptionGroup());
  }

  removeMed(index: number) {
    this.prescriptions.removeAt(index);
  }

  addProc() {
    this.procedures.push(this.createProcedureGroup());
  }

  removeProc(index: number) {
    this.procedures.removeAt(index);
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close({
      prescriptions: this.prescriptions.value as PrescriptionData[],
      procedures: this.procedures.value as ProcedureData[]
    } as OrdersDialogResult);
  }
}
