import { Component, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatDialogModule
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
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nombres</mat-label>
                <input matInput formControlName="firstNames" placeholder="Ej. Juan Andrés" required>
                <mat-icon matPrefix class="mr-2 text-gray-400">person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Apellidos</mat-label>
                <input matInput formControlName="lastNames" placeholder="Ej. Pérez Gómez" required>
                <mat-icon matPrefix class="mr-2 text-gray-400">person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Fecha de Nacimiento</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="birthDate" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Sexo</mat-label>
                <mat-select formControlName="gender" required>
                  <mat-option value="M">Masculino</mat-option>
                  <mat-option value="F">Femenino</mat-option>
                  <mat-option value="O">Otro</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Tipo de Identificación</mat-label>
                <mat-select formControlName="idType" required>
                  <mat-option value="RC">Registro Civil</mat-option>
                  <mat-option value="TI">Tarjeta de Identidad</mat-option>
                  <mat-option value="CC">Cédula de Ciudadanía</mat-option>
                  <mat-option value="CE">Cédula de Extranjería</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Identificación</mat-label>
                <input matInput formControlName="idNumber" placeholder="Número de documento" required>
                <mat-icon matPrefix class="mr-2 text-gray-400">badge</mat-icon>
              </mat-form-field>
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
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Dirección</mat-label>
                <input matInput formControlName="address" placeholder="Ej. Calle 123 # 45-67" required>
                <mat-icon matPrefix class="mr-2 text-gray-400">home</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Ciudad</mat-label>
                <input matInput formControlName="city" placeholder="Ej. Bogotá" required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>País</mat-label>
                <input matInput formControlName="country" placeholder="Ej. Colombia" required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Zona</mat-label>
                <mat-select formControlName="zone" required>
                  <mat-option value="Urbana">Urbana</mat-option>
                  <mat-option value="Rural">Rural</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Código Postal</mat-label>
                <input matInput formControlName="postalCode" placeholder="Opcional">
              </mat-form-field>
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
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>EPS</mat-label>
                <input matInput formControlName="eps" placeholder="Ej. Sanitas" required>
                <mat-icon matPrefix class="mr-2 text-gray-400">health_and_safety</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Régimen de Salud</mat-label>
                <mat-select formControlName="healthRegime" required>
                  <mat-option value="Contributivo">Contributivo</mat-option>
                  <mat-option value="Subsidiado">Subsidiado</mat-option>
                  <mat-option value="Especial">Especial</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Clínica o Lugar donde nació</mat-label>
                <input matInput formControlName="birthPlace" placeholder="Ej. Clínica del Country" required>
                <mat-icon matPrefix class="mr-2 text-gray-400">local_hospital</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full md:col-span-2">
                <mat-label>Observaciones</mat-label>
                <textarea matInput formControlName="observations" placeholder="Cualquier información relevante..." rows="3"></textarea>
              </mat-form-field>
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Nombre del Padre</mat-label>
                    <input matInput formControlName="fatherName">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Celular</mat-label>
                    <input matInput formControlName="fatherPhone">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="fatherEmail">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Ocupación</mat-label>
                    <input matInput formControlName="fatherOccupation">
                  </mat-form-field>
                </div>
              </div>

              <!-- Mother Info -->
              <div class="bg-gray-50 p-4 rounded-2xl">
                <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <mat-icon class="mr-2 !w-5 !h-5 !text-lg">person</mat-icon>
                  Información de la Madre
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Nombre de la Madre</mat-label>
                    <input matInput formControlName="motherName">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Celular</mat-label>
                    <input matInput formControlName="motherPhone">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="motherEmail">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Ocupación</mat-label>
                    <input matInput formControlName="motherOccupation">
                  </mat-form-field>
                </div>
              </div>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Hermanos</mat-label>
                <input matInput formControlName="siblings" placeholder="Nombres de los hermanos (opcional)">
              </mat-form-field>
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
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Peso al Nacer (g)</mat-label>
                <input matInput type="number" formControlName="birthWeight" placeholder="Ej. 3200">
                <span matSuffix class="pr-2">g</span>
                <mat-icon matPrefix class="mr-2 text-gray-400">monitor_weight</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Talla al Nacer (cm)</mat-label>
                <input matInput type="number" formControlName="birthHeight" placeholder="Ej. 50">
                <span matSuffix class="pr-2">cm</span>
                <mat-icon matPrefix class="mr-2 text-gray-400">straighten</mat-icon>
              </mat-form-field>
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
