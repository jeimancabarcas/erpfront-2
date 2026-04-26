import { Component, inject, signal, computed, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  template: `
    <mat-form-field appearance="outline" class="w-full !m-0">
      <mat-label>{{ label() }}</mat-label>
      <input 
        type="text" 
        matInput 
        [placeholder]="placeholder()"
        [(ngModel)]="searchQuery"
        [matAutocomplete]="auto"
      >
      <mat-icon matPrefix class="mr-2 text-gray-400">person_search</mat-icon>
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayPatient" class="!rounded-2xl !mt-2 !shadow-2xl" (optionSelected)="onSelect($event.option.value)">
        @for (patient of filteredPatients(); track patient.id) {
          <mat-option [value]="patient" class="!h-16 border-b border-gray-50 last:border-none">
            <div class="flex flex-col py-2">
              <span class="text-sm font-black text-gray-900">{{patient.firstNames}} {{patient.lastNames}}</span>
              <span class="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">{{patient.idType}} {{patient.idNumber}}</span>
            </div>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    ::ng-deep .mat-mdc-autocomplete-panel { border-radius: 20px !important; padding: 8px !important; }
  `]
})
export class PatientSearchMolecule {
  private pediatricsService = inject(PediatricsService);

  label = input<string>('Buscar por nombre o documento');
  placeholder = input<string>('Escriba para buscar...');
  
  // Two-way binding for the selected patient
  selectedPatient = model<Patient | null>(null);

  // Internal search query signal
  searchQuery = signal<string | Patient>('');

  // Computed Filtered List
  filteredPatients = computed(() => {
    const value = this.searchQuery();
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    const patients = this.pediatricsService.patients();
    
    if (!filterValue && typeof value !== 'object') return patients.slice(0, 5);

    return patients.filter(p => 
      `${p.firstNames} ${p.lastNames}`.toLowerCase().includes(filterValue) || 
      p.idNumber.includes(filterValue)
    );
  });

  displayPatient(patient: Patient): string {
    return patient ? `${patient.firstNames} ${patient.lastNames}` : '';
  }

  onSelect(patient: Patient) {
    this.selectedPatient.set(patient);
  }
}
