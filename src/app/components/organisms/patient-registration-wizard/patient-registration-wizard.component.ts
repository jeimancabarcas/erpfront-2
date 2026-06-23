import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-registration-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatDialogModule,
    TextInputComponent,
    SelectAtom,
    TextareaComponent
  ],
  template: `
    <div class="p-2 max-w-4xl mx-auto">
      <header class="flex justify-between items-center mb-6 px-4">
        <div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight !m-0">
            {{ isEdit ? 'Editar Paciente' : 'Registro de Paciente' }}
          </h2>
          <p class="text-gray-500 font-medium">
            {{ isEdit ? 'Modifique los datos necesarios del paciente' : 'Complete los pasos para dar de alta al nuevo paciente' }}
          </p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="!text-gray-400 hover:!text-gray-600 transition-colors">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <mat-stepper [linear]="true" #stepper class="custom-stepper">
        <!-- Step 1: Personal Information -->
        <mat-step [stepControl]="personalForm">
          <form [formGroup]="personalForm" class="py-6">
            <ng-template matStepLabel>Datos Personales</ng-template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <ui-text-input label="Nombres" icon="person" placeholder="Ej. Juan Andrés" [required]="true" [formControl]="personalForm.controls.firstNames" />
              <ui-text-input label="Apellidos" icon="person" placeholder="Ej. Pérez Gómez" [required]="true" [formControl]="personalForm.controls.lastNames" />

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Fecha de Nacimiento</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="birthDate" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <ui-select label="Sexo" [options]="genderOptions" [formControl]="personalForm.controls.gender" />

              <ui-select label="Tipo de Identificación" [options]="idTypeOptions" [formControl]="personalForm.controls.idType" />

              <ui-text-input label="Identificación" icon="badge" placeholder="Número de documento" [required]="true" [formControl]="personalForm.controls.idNumber" />
            </div>

            <div class="flex justify-end mt-8">
              <button mat-flat-button color="primary" matStepperNext class="!h-12 !px-8 !rounded-xl !font-bold">
                Siguiente
                <mat-icon iconPositionEnd>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Location -->
        <mat-step [stepControl]="locationForm">
          <form [formGroup]="locationForm" class="py-6">
            <ng-template matStepLabel>Ubicación</ng-template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <ui-text-input label="Dirección" icon="home" placeholder="Ej. Calle 123 # 45-67" [required]="true" [formControl]="locationForm.controls.address" class="md:col-span-2" />
              <ui-text-input label="Ciudad" placeholder="Ej. Bogotá" [required]="true" [formControl]="locationForm.controls.city" />
              <ui-text-input label="País" placeholder="Ej. Colombia" [required]="true" [formControl]="locationForm.controls.country" />

              <ui-select label="Zona" [options]="zoneOptions" [formControl]="locationForm.controls.zone" />

              <ui-text-input label="Código Postal" placeholder="Opcional" [formControl]="locationForm.controls.postalCode" />
            </div>

            <div class="flex justify-between mt-8">
              <button mat-button matStepperPrevious class="!h-12 !px-8 !rounded-xl !font-bold">
                Anterior
              </button>
              <button mat-flat-button color="primary" matStepperNext class="!h-12 !px-8 !rounded-xl !font-bold">
                Siguiente
                <mat-icon iconPositionEnd>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Health Info -->
        <mat-step [stepControl]="healthForm">
          <form [formGroup]="healthForm" class="py-6">
            <ng-template matStepLabel>Salud</ng-template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <ui-text-input label="EPS" icon="health_and_safety" placeholder="Ej. Sanitas" [required]="true" [formControl]="healthForm.controls.eps" />

              <ui-select label="Régimen de Salud" [options]="healthRegimeOptions" [formControl]="healthForm.controls.healthRegime" />

              <ui-text-input label="Clínica o Lugar donde nació" icon="local_hospital" placeholder="Ej. Clínica del Country" [required]="true" [formControl]="healthForm.controls.birthPlace" class="md:col-span-2" />

              <ui-textarea formControlName="observations" label="Observaciones" placeholder="Cualquier información relevante..." rows="3" class="md:col-span-2" />
            </div>

            <div class="flex justify-between mt-8">
              <button mat-button matStepperPrevious class="!h-12 !px-8 !rounded-xl !font-bold">
                Anterior
              </button>
              <button mat-flat-button color="primary" matStepperNext class="!h-12 !px-8 !rounded-xl !font-bold">
                Siguiente
                <mat-icon iconPositionEnd>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Family Info -->
        <mat-step [stepControl]="familyForm">
          <form [formGroup]="familyForm" class="py-6">
            <ng-template matStepLabel>Familia</ng-template>
            
            <div class="space-y-6">
              <!-- Father Info -->
              <div class="bg-gray-50 p-4 rounded-2xl">
                <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <mat-icon class="mr-2 !w-5 !h-5 !text-lg">person</mat-icon>
                  Información del Padre
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  <ui-text-input label="Nombre del Padre" icon="person" [formControl]="familyForm.controls.fatherName" />
                  <ui-text-input label="Celular" icon="phone" [formControl]="familyForm.controls.fatherPhone" />
                  <ui-text-input label="Email" type="email" icon="email" [formControl]="familyForm.controls.fatherEmail" />
                  <ui-text-input label="Ocupación" [formControl]="familyForm.controls.fatherOccupation" />
                </div>
              </div>

              <!-- Mother Info -->
              <div class="bg-gray-50 p-4 rounded-2xl">
                <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <mat-icon class="mr-2 !w-5 !h-5 !text-lg">person</mat-icon>
                  Información de la Madre
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  <ui-text-input label="Nombre de la Madre" icon="person" [formControl]="familyForm.controls.motherName" />
                  <ui-text-input label="Celular" icon="phone" [formControl]="familyForm.controls.motherPhone" />
                  <ui-text-input label="Email" type="email" icon="email" [formControl]="familyForm.controls.motherEmail" />
                  <ui-text-input label="Ocupación" [formControl]="familyForm.controls.motherOccupation" />
                </div>
              </div>

              <ui-text-input label="Hermanos" placeholder="Nombres de los hermanos (opcional)" [formControl]="familyForm.controls.siblings" />
            </div>

            <div class="flex justify-between mt-8">
              <button mat-button matStepperPrevious class="!h-12 !px-8 !rounded-xl !font-bold">
                Anterior
              </button>
              <button mat-flat-button color="primary" matStepperNext class="!h-12 !px-8 !rounded-xl !font-bold">
                Siguiente
                <mat-icon iconPositionEnd>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 5: Birth Details -->
        <mat-step [stepControl]="birthForm">
          <form [formGroup]="birthForm" class="py-6">
            <ng-template matStepLabel>Nacimiento</ng-template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <ui-text-input label="Peso al Nacer (g)" type="number" icon="monitor_weight" placeholder="Ej. 3200" [formControl]="birthForm.controls.birthWeight" />
              <ui-text-input label="Talla al Nacer (cm)" type="number" icon="straighten" placeholder="Ej. 50" [formControl]="birthForm.controls.birthHeight" />
            </div>

            <div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl mt-8 flex gap-4">
              <div class="bg-blue-500 text-white p-2 rounded-lg h-fit">
                <mat-icon>info</mat-icon>
              </div>
              <div>
                <h4 class="font-bold text-blue-900">
                  {{ isEdit ? 'Resumen de Modificación' : 'Resumen del Registro' }}
                </h4>
                <p class="text-blue-700 text-sm">
                  {{ isEdit ? 'Al hacer clic en "Guardar Cambios", se actualizarán los datos del paciente en el sistema.' : 'Al hacer clic en "Finalizar", el paciente será registrado en el sistema y estará disponible para consultas y citas médicas.' }}
                </p>
              </div>
            </div>

            <div class="flex justify-between mt-8">
              <button mat-button matStepperPrevious class="!h-12 !px-8 !rounded-xl !font-bold">
                Anterior
              </button>
              <button 
                mat-flat-button 
                color="primary" 
                (click)="onSubmit()"
                class="!h-12 !px-12 !rounded-full !font-bold !bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-200"
              >
                {{ isEdit ? 'Guardar Cambios' : 'Finalizar Registro' }}
                <mat-icon iconPositionEnd>{{ isEdit ? 'save' : 'check' }}</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 40px !important;
      padding: 24px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    }

    .custom-stepper {
      background: transparent !important;
    }

    ::ng-deep .mat-step-header {
      background: transparent !important;
      border-radius: 12px !important;
      margin-bottom: 8px !important;
    }

    ::ng-deep .mat-step-header .mat-step-icon-selected {
      background-color: #4f46e5 !important;
    }

    ::ng-deep .mat-step-header .mat-step-label.mat-step-label-active {
      font-weight: 800 !important;
      color: #111827 !important;
    }

    ::ng-deep .mat-step-header .mat-step-label {
      font-weight: 600 !important;
      color: #6b7280 !important;
    }

    ::ng-deep .mat-horizontal-stepper-header-container {
      padding: 0 16px !important;
    }

    ::ng-deep .mat-mdc-form-field {
      --mdc-filled-tonal-container-color: transparent;
    }

    ::ng-deep .mat-mdc-form-field-focus-fill-color {
      display: none;
    }
  `]
})
export class PatientRegistrationWizardOrganism implements OnInit {
  private fb = inject(FormBuilder);
  private pediatricsService = inject(PediatricsService);
  public dialogRef = inject(MatDialogRef<PatientRegistrationWizardOrganism>);
  
  public isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Patient | null) {
    if (this.data) {
      this.isEdit = true;
    }
  }

  ngOnInit(): void {
    if (this.data) {
      this.patchFormValues();
    }
  }

  genderOptions: SelectOption[] = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  idTypeOptions: SelectOption[] = [
    { value: 'RC', label: 'Registro Civil' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
  ];

  zoneOptions: SelectOption[] = [
    { value: 'Urbana', label: 'Urbana' },
    { value: 'Rural', label: 'Rural' },
  ];

  healthRegimeOptions: SelectOption[] = [
    { value: 'Contributivo', label: 'Contributivo' },
    { value: 'Subsidiado', label: 'Subsidiado' },
    { value: 'Especial', label: 'Especial' },
  ];

  personalForm = this.fb.group({
    firstNames: ['', Validators.required],
    lastNames: ['', Validators.required],
    birthDate: ['', Validators.required],
    gender: ['', Validators.required],
    idType: ['', Validators.required],
    idNumber: ['', Validators.required]
  });

  locationForm = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    country: ['Colombia', Validators.required],
    zone: ['Urbana', Validators.required],
    postalCode: ['']
  });

  healthForm = this.fb.group({
    eps: ['', Validators.required],
    healthRegime: ['', Validators.required],
    birthPlace: ['', Validators.required],
    observations: ['']
  });

  familyForm = this.fb.group({
    fatherName: [''],
    fatherPhone: [''],
    fatherEmail: ['', Validators.email],
    fatherOccupation: [''],
    motherName: [''],
    motherPhone: [''],
    motherEmail: ['', Validators.email],
    motherOccupation: [''],
    siblings: ['']
  });

  birthForm = this.fb.group({
    birthWeight: [null as number | null],
    birthHeight: [null as number | null]
  });

  private patchFormValues() {
    if (!this.data) return;
    
    this.personalForm.patchValue({
      firstNames: this.data.firstNames,
      lastNames: this.data.lastNames,
      birthDate: this.data.birthDate as any,
      gender: this.data.gender,
      idType: this.data.idType,
      idNumber: this.data.idNumber
    });

    this.locationForm.patchValue({
      address: this.data.address,
      city: this.data.city,
      country: this.data.country,
      zone: this.data.zone,
      postalCode: this.data.postalCode
    });

    this.healthForm.patchValue({
      eps: this.data.eps,
      healthRegime: this.data.healthRegime,
      birthPlace: this.data.birthPlace,
      observations: this.data.observations
    });

    this.familyForm.patchValue({
      fatherName: this.data.fatherName,
      fatherPhone: this.data.fatherPhone,
      fatherEmail: this.data.fatherEmail,
      fatherOccupation: this.data.fatherOccupation,
      motherName: this.data.motherName,
      motherPhone: this.data.motherPhone,
      motherEmail: this.data.motherEmail,
      motherOccupation: this.data.motherOccupation,
      siblings: this.data.siblings
    });

    this.birthForm.patchValue({
      birthWeight: this.data.birthWeight,
      birthHeight: this.data.birthHeight
    });
  }

  onSubmit() {
    if (this.isFormValid()) {
      const patientData: Patient = {
        id: this.isEdit ? this.data!.id : `P-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...this.personalForm.value,
        ...this.locationForm.value,
        ...this.healthForm.value,
        ...this.familyForm.value,
        ...this.birthForm.value
      } as Patient;

      if (this.isEdit) {
        this.pediatricsService.updatePatient(patientData);
      } else {
        this.pediatricsService.addPatient(patientData);
      }
      
      this.dialogRef.close(true);
    } else {
      this.markAllAsTouched();
    }
  }

  private isFormValid(): boolean {
    return this.personalForm.valid && 
           this.locationForm.valid && 
           this.healthForm.valid && 
           this.familyForm.valid && 
           this.birthForm.valid;
  }

  private markAllAsTouched() {
    this.personalForm.markAllAsTouched();
    this.locationForm.markAllAsTouched();
    this.healthForm.markAllAsTouched();
    this.familyForm.markAllAsTouched();
    this.birthForm.markAllAsTouched();
  }
}
