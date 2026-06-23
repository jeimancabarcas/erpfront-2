import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';

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
    MatButtonModule,
    TextInputComponent,
    ButtonAtom,
    SelectAtom,
    TextareaComponent
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
    <div class="p-10 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <span class="material-icons">assignment</span>
        </div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight !m-0">Órdenes Médicas</h2>
        <ui-button variant="icon" (clicked)="close()" ariaLabel="Cerrar diálogo" class="ml-auto">
          <span class="material-icons">close</span>
        </ui-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Prescriptions Section -->
        <div class="mb-12">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="material-icons text-indigo-400">medication</span>
              <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest">Medicamentos</h3>
            </div>
            <button type="button" (click)="addMed()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
              <span class="material-icons !text-sm mr-1 align-middle">add_circle</span>
              Añadir Medicamento
            </button>
          </div>
          
          <div class="space-y-6">
            @for (med of prescriptions.controls; track $index) {
              <div class="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 relative group animate-in zoom-in-95 duration-300" [formGroup]="getPrescriptionGroup($index)">
                <button type="button" (click)="removeMed($index)" class="absolute -top-3 -right-3 !bg-white !shadow-sm !text-red-400 border border-red-50 hover:!bg-red-50 transition-all rounded-2xl w-10 h-10 flex items-center justify-center">
                  <span class="material-icons text-sm">close</span>
                </button>
                
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <ui-text-input placeholder="Cód." [formControl]="$any(getPrescriptionGroup($index)).controls.code" class="md:col-span-3" />
                  <div class="md:col-span-9 w-full relative">
                    <ui-text-input placeholder="Ej: Acetaminofén 500mg" icon="search" [formControl]="$any(getPrescriptionGroup($index)).controls.name" />
                  </div>
                  
                  <ui-text-input placeholder="Ej: 5ml" [formControl]="$any(getPrescriptionGroup($index)).controls.dose" class="md:col-span-4" />
                  <ui-text-input placeholder="Ej: Cada 8 horas" [formControl]="$any(getPrescriptionGroup($index)).controls.frequency" class="md:col-span-4" />
                  <ui-select placeholder="Vía" [options]="routeOptions" [formControl]="$any(getPrescriptionGroup($index)).controls.route" class="md:col-span-4" />
                  
                  <ui-textarea formControlName="observations" rows="2" placeholder="Instrucciones adicionales para el paciente..." class="md:col-span-12" />
                </div>
              </div>
            }
            @if (prescriptions.controls.length === 0) {
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
            <button type="button" (click)="addProc()" class="!rounded-full !bg-indigo-600 text-white !text-[10px] !font-black !h-10 !px-6 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
              <span class="material-icons !text-sm mr-1 align-middle">add_circle</span>
              Añadir Procedimiento
            </button>
          </div>
          
          <div class="space-y-4">
            @for (proc of procedures.controls; track $index) {
              <div class="p-6 bg-gray-50/50 rounded-[24px] border border-gray-100 flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 group" [formGroup]="getProcedureGroup($index)">
                <ui-text-input placeholder="Código" [formControl]="$any(getProcedureGroup($index)).controls.code" class="!w-32" />
                <ui-text-input placeholder="Nombre del Procedimiento" [formControl]="$any(getProcedureGroup($index)).controls.name" class="flex-grow" />
                <button type="button" (click)="removeProc($index)" class="!bg-red-50 !text-red-400 !rounded-2xl w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                  <span class="material-icons text-sm">delete</span>
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
    }
  `
})
export class OrdersDialogComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  readonly data = inject<OrdersDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<OrdersDialogComponent, OrdersDialogResult>);
  private fb = inject(FormBuilder);

  routeOptions: SelectOption[] = [
    { value: 'Oral', label: 'Oral' },
    { value: 'Intramuscular', label: 'Intramuscular' },
    { value: 'Intravenosa', label: 'Intravenosa' },
    { value: 'Tópica', label: 'Tópica' },
    { value: 'Inhalatoria', label: 'Inhalatoria' },
  ];

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
