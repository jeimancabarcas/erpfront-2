import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PediatricsService } from '../../../services/pediatrics.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';

@Component({
  selector: 'app-consultations-page',
  standalone: true,
  imports: [DashboardLayoutComponent, MatTableModule, MatButtonModule, MatIconModule, StatusTagAtom],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Consultas Médicas</h1>
          <p class="text-gray-500 font-medium">Gestión de atención y triaje pediátrico.</p>
        </div>
        <button mat-flat-button color="primary" class="!rounded-full !h-12 !px-6 !font-bold">
          <mat-icon class="mr-2">medical_services</mat-icon>
          Nueva Consulta
        </button>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table mat-table [dataSource]="pediatricsService.consultations()" class="w-full">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Fecha</th>
            <td mat-cell *matCellDef="let c" class="text-gray-500">{{c.date}}</td>
          </ng-container>

          <ng-container matColumnDef="patient">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Paciente</th>
            <td mat-cell *matCellDef="let c" class="font-bold text-gray-900">{{c.patientName}}</td>
          </ng-container>

          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Motivo</th>
            <td mat-cell *matCellDef="let c" class="text-gray-600">{{c.reason}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Estado</th>
            <td mat-cell *matCellDef="let c">
              <app-status-tag [label]="c.status" [color]="c.status === 'Completed' ? 'green' : 'amber'" />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c" class="text-right">
              <button mat-flat-button color="accent" class="!rounded-xl !text-xs !font-bold">
                Atender
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
export class ConsultationsPageComponent {
  pediatricsService = inject(PediatricsService);
  displayedColumns: string[] = ['date', 'patient', 'reason', 'status', 'actions'];
}
