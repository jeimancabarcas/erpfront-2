import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PediatricsService } from '../../../services/pediatrics.service';
import { PatientRegistrationWizardOrganism } from '../../organisms/patient-registration-wizard/patient-registration-wizard.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatDialogModule,
    RouterLink
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Pacientes</h1>
          <p class="text-gray-500 font-medium">Registro y gestión de pacientes pediátricos.</p>
        </div>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openRegistrationWizard()"
          class="!rounded-full !h-12 !px-6 !font-bold"
        >
          <mat-icon class="mr-2">person_add</mat-icon>
          Nuevo Paciente
        </button>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table mat-table [dataSource]="pediatricsService.patients()" class="w-full">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">ID</th>
            <td mat-cell *matCellDef="let p" class="font-mono text-gray-400">{{p.id}}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Nombre</th>
            <td mat-cell *matCellDef="let p" class="font-bold text-gray-900">{{p.firstNames}} {{p.lastNames}}</td>
          </ng-container>

          <ng-container matColumnDef="age">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">F. Nacimiento</th>
            <td mat-cell *matCellDef="let p" class="text-gray-500">{{p.birthDate}}</td>
          </ng-container>

          <ng-container matColumnDef="idNumber">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Identificación</th>
            <td mat-cell *matCellDef="let p" class="text-gray-700">{{p.idType}} {{p.idNumber}}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p" class="text-right px-4">
              <a mat-icon-button [routerLink]="['/pediatrics/patients', p.id]" class="!text-indigo-600 !bg-indigo-50 !rounded-xl mr-2">
                <mat-icon>visibility</mat-icon>
              </a>
              <button mat-icon-button (click)="openRegistrationWizard(p)" class="!text-gray-400">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors cursor-pointer"></tr>
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    .mat-mdc-header-cell { padding: 16px; }
    .mat-mdc-cell { padding: 20px 16px; }
  `]
})
export class PatientsPageComponent {
  pediatricsService = inject(PediatricsService);
  private dialog = inject(MatDialog);
  
  displayedColumns: string[] = ['id', 'name', 'age', 'idNumber', 'actions'];

  openRegistrationWizard(patient?: any) {
    this.dialog.open(PatientRegistrationWizardOrganism, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: patient
    });
  }
}
