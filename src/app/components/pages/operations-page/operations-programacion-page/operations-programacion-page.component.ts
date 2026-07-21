import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { ProgrammingService } from '../../../../services/programming.service';
import { CustomerService } from '../../../../services/customer.service';
import { ServiceService } from '../../../../services/service.service';
import { Customer } from '../../../../models/customer.model';
import { Service } from '../../../../models/service.model';
import {
  ServicioProgramado,
  ChangeStateDto,
  CancelDto,
} from '../../../../models/programming.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { QueryParams } from '../../../../models/pagination.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';
import { TableComponent, TableColumn } from '../../../../components/atoms/table/table.component';
import { TableCellDirective } from '../../../../components/atoms/table/table-cell.directive';
import { SelectAtom, type SelectOption } from '../../../../components/atoms/select/select.component';
import { DatepickerComponent } from '../../../../components/atoms/datepicker/datepicker.component';
import { ProgrammingFormDialogComponent } from './programming-form-dialog/programming-form-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../shared/constants/dialog.config';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-operations-programming-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbMolecule,
    ButtonAtom,
    TableComponent,
    TableCellDirective,
    SelectAtom,
    DatepickerComponent,
  ],
  templateUrl: 'operations-programacion-page.component.html',
  styleUrl: 'operations-programacion-page.component.scss',
})
export class OperationsProgrammingPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private programmingService = inject(ProgrammingService);
  private customerService = inject(CustomerService);
  private serviceService = inject(ServiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Señales de datos
  programados = this.programmingService.data;
  meta = this.programmingService.meta;
  loading = this.programmingService.loading;

  // Clientes y servicios para los filtros
  clientes = this.customerService.customers;
  servicios = this.serviceService.services;

  // Opciones de cliente mapeadas para el select
  clienteOptions: SelectOption[] = [];

  // Efecto para mantener las opciones actualizadas cuando cambian los clientes
  constructor() {
    effect(() => {
      const customers = this.clientes();
      this.clienteOptions = customers.map(c => ({
        value: c.id,
        label: c.name,
        subtitle: c.email
      }));
    });
  }

  // Filtros
  estadoFilter = signal('');
  clienteFilter = signal('');
  dateFromFilter = signal('');
  dateToFilter = signal('');

  // Validación de rango de fechas
  dateRangeError = computed(() => {
    const from = this.dateFromFilter();
    const to = this.dateToFilter();
    if (!from || !to) return '';
    const dateFrom = new Date(from);
    const dateTo = new Date(to);
    if (dateFrom > dateTo) {
      return 'La fecha fin no puede ser anterior a la fecha inicio';
    }
    return '';
  });

  // Paginación
  pageSize = signal(10);
  pageIndex = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil((this.meta()?.total || 0) / this.pageSize())));

  // Opciones de estado
  estadoOptions = [
    { value: '', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'INICIADO', label: 'Iniciado' },
    { value: 'PAUSADO', label: 'Pausado' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  // Color map for estado badges
  estadoColors: Record<string, string> = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'INICIADO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'PAUSADO': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'FINALIZADO': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'CANCELADO': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  // ui-table columns definition
  tableColumns: TableColumn[] = [
    { key: 'estado', header: 'Estado' },
    { key: 'cliente', header: 'Cliente' },
    { key: 'fechaInicio', header: 'Fecha Inicio Est.' },
    { key: 'actividades', header: 'Actividades' },
    { key: 'totalHoras', header: 'Total Horas' },
    { key: 'acciones', header: 'Acciones' },
  ];

  private filterTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    // Load customers and services for filters
    this.customerService.loadCustomers().subscribe();
    this.serviceService.loadServices().subscribe();

    // Load programados
    this.loadData();
  }

  loadData() {
    // Validate date range before loading
    if (this.dateRangeError()) {
      this.snackBar.open('Rango de fechas inválido', 'Cerrar', { duration: 3000 });
      return;
    }

    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: 'createdAt',
      order: 'DESC',
    };

    if (this.estadoFilter()) params['estado'] = this.estadoFilter();
    if (this.clienteFilter()) params['customerId'] = this.clienteFilter();
    if (this.dateFromFilter()) params['dateFrom'] = this.dateFromFilter();
    if (this.dateToFilter()) params['dateTo'] = this.dateToFilter();

    this.programmingService.loadProgramados(params).subscribe({
      error: (err) => {
        this.snackBar.open('Error al cargar la programación', 'Cerrar', { duration: 3000 });
      }
    });
  }

  applyFilters() {
    this.pageIndex.set(1);
    this.loadData();
  }

  clearFilters() {
    this.estadoFilter.set('');
    this.clienteFilter.set('');
    this.dateFromFilter.set('');
    this.dateToFilter.set('');
    this.pageIndex.set(1);
    this.loadData();
  }

  /**
   * Debounces filter changes with 400ms delay to avoid excessive API calls.
   * Clears any existing timer before starting a new one.
   */
  debouncedFilter() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.pageIndex.set(1);
      this.loadData();
    }, 400);
  }

  /**
   * Validates that the date range is correct (end date >= start date).
   * @returns true if the date range is valid or no dates are set, false otherwise.
   */
  isDateRangeValid(): boolean {
    const from = this.dateFromFilter();
    const to = this.dateToFilter();
    if (!from || !to) return true;
    return new Date(from) <= new Date(to);
  }

  onPageChange(event: any) {
    if (event.pageSize) this.pageSize.set(event.pageSize);
    if (event.pageIndex !== undefined) this.pageIndex.set(event.pageIndex + 1);
    this.loadData();
  }

  onPageSizeChange(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.pageSize.set(parseInt(size));
    this.pageIndex.set(1);
    this.loadData();
  }

  openScheduleDialog() {
    const ref = this.dialog.open(ProgrammingFormDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  changeEstado(programado: ServicioProgramado, nuevoEstado: string) {
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: `¿Cambiar a ${nuevoEstado}?`,
        message: `Estás a punto de cambiar el estado del servicio`,
        itemName: programado.customer?.name || 'Servicio',
        confirmText: 'Sí, cambiar estado'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const dto: ChangeStateDto = { estado: nuevoEstado };
        this.programmingService.changeState(programado.id, dto).subscribe({
          next: () => {},
          error: () => this.snackBar.open('Error al cambiar el estado', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  cancelProgramado(programado: ServicioProgramado) {
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: '¿Cancelar servicio?',
        message: 'Estás a punto de cancelar el servicio programado',
        itemName: programado.customer?.name || 'Servicio',
        confirmText: 'Sí, cancelar'
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const dto: CancelDto = { motivo: 'Cancelado desde la interfaz' };
        this.programmingService.cancelProgramado(programado.id, dto).subscribe({
          next: () => {},
          error: () => this.snackBar.open('Error al cancelar el servicio', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  deleteProgramado(programado: ServicioProgramado) {
    const ref = this.dialog.open(ConfirmDeleteDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.sm,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        title: '¿Eliminar servicio?',
        message: 'Esta acción eliminará permanentemente el servicio cancelado. No se puede deshacer.',
        itemName: programado.customer?.name || 'Servicio',
        confirmText: 'Sí, eliminar',
      } as ConfirmDeleteData,
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const url = `${environment.apiUrl}/operational/servicio-programados/${programado.id}`;
        this.http.delete(url).subscribe({
          next: () => {
            this.snackBar.open('Servicio eliminado correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Error al eliminar el servicio', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  getTotalHorasText(totalHoras: number): string {
    if (!totalHoras) return '—';
    const hours = Math.floor(totalHoras);
    const minutes = Math.round((totalHoras - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getEstadoBadgeClass(estado: string): string {
    return this.estadoColors[estado] || 'bg-gray-100 text-gray-800';
  }

  getActivityCount(programado: ServicioProgramado): number {
    return programado.actividades?.length ?? 0;
  }
}
