import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ButtonAtom } from '../../atoms/button/button.component';
import { PediatricsService, Appointment } from '../../../services/pediatrics.service';
import { BillingService } from '../../../services/billing.service';
import { AppointmentFiltersMolecule } from '../../molecules/appointment-filters/appointment-filters.component';
import { AppointmentTableOrganism } from '../../organisms/appointment-table/appointment-table.component';
import { AppointmentFormOrganism } from '../../organisms/appointment-form/appointment-form.component';
import { AppointmentConfirmationDialogOrganism } from '../../organisms/appointment-confirmation-dialog/appointment-confirmation-dialog.component';
import { AppointmentCancellationDialogOrganism } from '../../organisms/appointment-cancellation-dialog/appointment-cancellation-dialog.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../shared/constants/dialog.config';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonAtom,
    AppointmentFiltersMolecule,
    AppointmentTableOrganism
  ],
  template: `
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Agenda Médica</h1>
          <p class="text-gray-500 font-medium">Programación y seguimiento de citas pediátricas.</p>
        </div>
        <ui-button 
          variant="primary" 
          (clicked)="openAppointmentForm()"
          class="rounded-full h-12 px-6 font-bold shadow-xl shadow-indigo-100"
        >
          <span class="material-icons mr-2">add_task</span>
          Nueva Cita
        </ui-button>
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
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AgendaPageComponent {
  pediatricsService = inject(PediatricsService);
  billingService = inject(BillingService);
  private dialog = inject(MatDialog);

  notification = signal<{message: string; type: 'success' | 'error'} | null>(null);
  private notifTimeout: ReturnType<typeof setTimeout> | null = null;

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification.set({ message, type });
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    this.notifTimeout = setTimeout(() => this.notification.set(null), 3000);
  }
  
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
    const ref = this.dialog.open(AppointmentCancellationDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      data: { appointment },
      panelClass: DIALOG_PANEL_CLASS
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.pediatricsService.updateAppointmentStatus(appointment.id, 'Cancelled');
        this.billingService.cancelInvoiceByAppointmentId(appointment.id);
        this.showNotification('Cita anulada y registros financieros reversados');
      }
    });
  }

  handleConfirmRequest(appointment: Appointment) {
    const ref = this.dialog.open(AppointmentConfirmationDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      data: { appointment },
      panelClass: DIALOG_PANEL_CLASS
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.pediatricsService.updateAppointmentStatus(appointment.id, 'Confirmed');
        this.showNotification('Cita confirmada exitosamente');
      }
    });
  }

  openAppointmentForm() {
    const ref = this.dialog.open(AppointmentFormOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.showNotification('Cita creada exitosamente');
      }
    });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.dateFilter.set(null);
  }
}
