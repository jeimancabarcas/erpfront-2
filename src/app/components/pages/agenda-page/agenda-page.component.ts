import { Component, inject } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PediatricsService, Appointment } from '../../../services/pediatrics.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';
import { AppointmentFormOrganism } from '../../organisms/appointment-form/appointment-form.component';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatDialogModule,
    StatusTagAtom
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Agenda Médica</h1>
          <p class="text-gray-500 font-medium">Programación y seguimiento de citas pediátricas.</p>
        </div>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openAppointmentForm()"
          class="!rounded-full !h-12 !px-6 !font-bold"
        >
          <mat-icon class="mr-2">add_task</mat-icon>
          Nueva Cita
        </button>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <table mat-table [dataSource]="pediatricsService.appointments()" class="w-full">
          <ng-container matColumnDef="time">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Hora</th>
            <td mat-cell *matCellDef="let a" class="font-bold text-indigo-600">{{a.time}}</td>
          </ng-container>

          <ng-container matColumnDef="patient">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Paciente</th>
            <td mat-cell *matCellDef="let a" class="font-bold text-gray-900">{{a.patientName}}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Tipo</th>
            <td mat-cell *matCellDef="let a">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {{a.type}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Estado</th>
            <td mat-cell *matCellDef="let a">
              <app-status-tag [label]="a.status" [color]="getStatusColor(a.status)" />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let a" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu" class="!text-gray-400">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu" class="!rounded-2xl !p-2">
                <button mat-menu-item (click)="updateStatus(a.id, 'Confirmed')">
                  <mat-icon class="!text-green-500">check_circle</mat-icon>
                  <span>Confirmar</span>
                </button>
                <button mat-menu-item (click)="updateStatus(a.id, 'Cancelled')">
                  <mat-icon class="!text-red-500">cancel</mat-icon>
                  <span>Cancelar</span>
                </button>
                <button mat-menu-item (click)="updateStatus(a.id, 'Completed')">
                  <mat-icon class="!text-blue-500">done_all</mat-icon>
                  <span>Completar</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
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
export class AgendaPageComponent {
  pediatricsService = inject(PediatricsService);
  private dialog = inject(MatDialog);
  displayedColumns: string[] = ['time', 'patient', 'type', 'status', 'actions'];

  getStatusColor(status: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' {
    switch (status) {
      case 'Confirmed': return 'green';
      case 'Scheduled': return 'blue';
      case 'Cancelled': return 'red';
      case 'Completed': return 'gray';
      default: return 'gray';
    }
  }

  updateStatus(id: string, status: Appointment['status']) {
    this.pediatricsService.updateAppointmentStatus(id, status);
  }

  openAppointmentForm() {
    this.dialog.open(AppointmentFormOrganism, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true
    });
  }
}
