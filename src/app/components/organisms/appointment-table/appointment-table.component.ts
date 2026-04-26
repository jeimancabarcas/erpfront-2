import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Appointment } from '../../../services/pediatrics.service';
import { StatusTagAtom } from '../../atoms/status-tag/status-tag.component';

@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    StatusTagAtom
  ],
  template: `
    <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
      @if (appointments().length > 0) {
        <table mat-table [dataSource]="appointments()" class="w-full">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-400 !uppercase !text-xs !tracking-widest">Fecha</th>
            <td mat-cell *matCellDef="let a" class="font-medium text-gray-600">{{a.date | date:'mediumDate'}}</td>
          </ng-container>

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
                <button mat-menu-item (click)="confirmRequest.emit(a)" [disabled]="a.status === 'Confirmed'">
                  <mat-icon class="!text-green-500">check_circle</mat-icon>
                  <span>Confirmar</span>
                </button>
                <button mat-menu-item (click)="statusUpdate.emit({id: a.id, status: 'Cancelled'})">
                  <mat-icon class="!text-red-500">cancel</mat-icon>
                  <span>Cancelar</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>
        </table>
      } @else {
        <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <mat-icon class="!w-10 !h-10 !text-[40px] text-gray-300">event_busy</mat-icon>
          </div>
          <h3 class="text-lg font-black text-gray-900 mb-2">No se encontraron citas</h3>
          <p class="text-gray-500 max-w-xs mx-auto">Ajusta los filtros para encontrar lo que buscas o agenda una nueva cita.</p>
          <button mat-stroked-button class="!rounded-full !mt-8 !px-8" (click)="clearFilters.emit()">
            Ver todas las citas
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .mat-mdc-header-cell { padding: 16px; }
    .mat-mdc-cell { padding: 20px 16px; }
  `]
})
export class AppointmentTableOrganism {
  appointments = input.required<Appointment[]>();
  statusUpdate = output<{id: string, status: Appointment['status']}>();
  confirmRequest = output<Appointment>();
  clearFilters = output<void>();

  displayedColumns: string[] = ['date', 'time', 'patient', 'type', 'status', 'actions'];

  getStatusColor(status: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' {
    switch (status) {
      case 'Confirmed': return 'green';
      case 'Scheduled': return 'blue';
      case 'Cancelled': return 'red';
      case 'Completed': return 'gray';
      default: return 'gray';
    }
  }
}
