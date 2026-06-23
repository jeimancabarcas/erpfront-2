import { Component, inject, signal, computed, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectAtom, SelectOption } from '../../atoms/select/select.component';
import { PediatricsService, Patient } from '../../../services/pediatrics.service';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    CommonModule,
    SelectAtom
  ],
  template: `
    <ui-select
      [searchable]="true"
      [loading]="loading()"
      [options]="patientOptions()"
      [(value)]="selectedPatientId"
      [showSubtitle]="true"
      (searchChange)="onPatientSearch($event)"
      [placeholder]="placeholder()"
      [emptyText]="emptyText()"
    />
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PatientSearchMolecule {
  private pediatricsService = inject(PediatricsService);

  label = input<string>('Buscar por nombre o documento');
  placeholder = input<string>('Buscar paciente...');
  emptyText = input<string>('No se encontraron pacientes');

  // Two-way binding for the selected patient ID
  selectedPatientId = model<string>('');

  // Loading state for async search
  loading = signal(false);

  // Search query for filtering
  searchQuery = signal('');

  // Computed patient options
  patientOptions = computed<SelectOption[]>(() => {
    const query = this.searchQuery().toLowerCase();
    const patients = this.pediatricsService.patients();

    if (!query) {
      return patients.slice(0, 5).map(p => ({
        value: p.id,
        label: `${p.firstNames} ${p.lastNames}`,
        subtitle: `${p.idType} ${p.idNumber}`
      }));
    }

    const filtered = patients.filter(p =>
      `${p.firstNames} ${p.lastNames}`.toLowerCase().includes(query) ||
      p.idNumber.includes(query)
    );

    return filtered.map(p => ({
      value: p.id,
      label: `${p.firstNames} ${p.lastNames}`,
      subtitle: `${p.idType} ${p.idNumber}`
    }));
  });

  onPatientSearch(query: string): void {
    this.searchQuery.set(query);
  }
}
