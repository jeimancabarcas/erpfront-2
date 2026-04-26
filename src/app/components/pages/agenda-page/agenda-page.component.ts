import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PediatricsService, Appointment } from '../../../services/pediatrics.service';
import { BillingService } from '../../../services/billing.service';
import { AppointmentFormOrganism } from '../../organisms/appointment-form/appointment-form.component';
import { AppointmentConfirmationDialogOrganism } from '../../organisms/appointment-confirmation-dialog/appointment-confirmation-dialog.component';
import { AppointmentCancellationDialogOrganism } from '../../organisms/appointment-cancellation-dialog/appointment-cancellation-dialog.component';
import { AppointmentFiltersMolecule } from '../../molecules/appointment-filters/appointment-filters.component';
import { AppointmentTableOrganism } from '../../organisms/appointment-table/appointment-table.component';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule,
    MatSnackBarModule,
    AppointmentFiltersMolecule,
    AppointmentTableOrganism
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Agenda Médica</h1>
          <p class="text-gray-500 font-medium">Programación y seguimiento de citas pediátricas.</p>
        </div>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openAppointmentForm()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100"
        >
          <mat-icon class="mr-2">add_task</mat-icon>
          Nueva Cita
        </button>
      </header>

      <!-- Filter Bar Molecule -->
      <app-appointment-filters 
        class="block mb-8"
        [(searchQuery)]="searchQuery"
        [(statusFilter)]="statusFilter"
        [(dateFilter)]="dateFilter"
        (clear)="clearFilters()"
      />

      <!-- Appointment Table Organism -->
      <app-appointment-table 
        [appointments]="filteredAppointments()"
        (statusUpdate)="onStatusUpdate($event.id, $event.status)"
        (confirmRequest)="handleConfirmRequest($event)"
        (clearFilters)="clearFilters()"
      />
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AgendaPageComponent {
  pediatricsService = inject(PediatricsService);
  billingService = inject(BillingService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  // Filter Signals
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');
  dateFilter = signal<Date | null>(null);

  // Computed Filtered List
  filteredAppointments = computed(() => {
    let appointments = this.pediatricsService.appointments();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const date = this.dateFilter();

    if (query) {
      appointments = appointments.filter(a => a.patientName.toLowerCase().includes(query));
    }
    if (status !== 'all') {
      appointments = appointments.filter(a => a.status === status);
    }
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      appointments = appointments.filter(a => a.date === dateStr);
    }
    return appointments;
  });

  onStatusUpdate(id: string, status: Appointment['status']) {
    if (status === 'Cancelled') {
      const appointment = this.pediatricsService.appointments().find(a => a.id === id);
      if (appointment?.status === 'Confirmed') {
        this.handleCancellationRequest(appointment);
        return;
      }
    }
    this.pediatricsService.updateAppointmentStatus(id, status);
  }

  handleCancellationRequest(appointment: Appointment) {
    const dialogRef = this.dialog.open(AppointmentCancellationDialogOrganism, {
      width: '400px',
      maxWidth: '95vw',
      data: { appointment },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Cancel appointment
        this.pediatricsService.updateAppointmentStatus(appointment.id, 'Cancelled');
        // Cancel associated invoice
        this.billingService.cancelInvoiceByAppointmentId(appointment.id);
        
        this.snackBar.open('Cita anulada y registros financieros reversados', 'Cerrar', { duration: 5000 });
      }
    });
  }

  handleConfirmRequest(appointment: Appointment) {
    const dialogRef = this.dialog.open(AppointmentConfirmationDialogOrganism, {
      width: '450px',
      maxWidth: '95vw',
      data: { appointment },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedAppointment: Appointment = {
          ...appointment,
          status: 'Confirmed',
          isParticular: result.isParticular,
          provider: result.provider,
          authorizationNumber: result.authorizationNumber
        };

        this.pediatricsService.updateAppointmentStatus(appointment.id, 'Confirmed');
        this.createPendingInvoice(updatedAppointment, result.patientAmount, result.totalAmount, result.markAsPaid);

        this.snackBar.open(
          result.markAsPaid ? 'Cita confirmada y copago recaudado' : 'Cita confirmada y cobro pendiente creado', 
          'Cerrar', 
          { duration: 3000 }
        );
      }
    });
  }

  private createPendingInvoice(appointment: Appointment, patientAmount: number, totalAmount: number, markAsPaid: boolean) {
    this.billingService.addInvoice({
      id: `FAC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      provider: appointment.provider || 'Particular',
      date: appointment.date,
      totalAmount: totalAmount,
      patientAmount: patientAmount,
      patientStatus: markAsPaid ? 'Paid' : 'Pending',
      providerAmount: appointment.isParticular ? 0 : (totalAmount - patientAmount),
      providerStatus: appointment.isParticular ? 'Paid' : 'Pending',
      status: markAsPaid ? (appointment.isParticular ? 'Paid' : 'Partial') : 'Pending',
      isParticular: !!appointment.isParticular,
      authorizationNumber: appointment.authorizationNumber
    });
  }

  openAppointmentForm() {
    this.dialog.open(AppointmentFormOrganism, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.dateFilter.set(null);
  }
}
