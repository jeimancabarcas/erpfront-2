import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '../../../../../models/customer.model';
import { Service, ServiceActivity } from '../../../../../models/service.model';
import { Supply } from '../../../../../models/supply.model';
import { CustomerService } from '../../../../../services/customer.service';
import { ServiceService } from '../../../../../services/service.service';
import { SupplyService } from '../../../../../services/supply.service';
import { ActivityService } from '../../../../../services/activity.service';
import { ProgrammingService } from '../../../../../services/programming.service';
import { CreateProgramadoDto } from '../../../../../models/programming.model';
import { DIALOG_DEFAULTS, DIALOG_WIDTHS, DIALOG_PANEL_CLASS } from '../../../../../shared/constants/dialog.config';
import { SelectOption, SelectAtom } from '../../../../../components/atoms/select/select.component';
import { TextInputComponent } from '../../../../../components/atoms/text-input/text-input.component';
import { DatepickerComponent } from '../../../../../components/atoms/datepicker/datepicker.component';
import { TextareaComponent } from '../../../../../components/atoms/textarea/textarea.component';
import { ButtonAtom } from '../../../../../components/atoms/button/button.component';
import { TableComponent, TableColumn } from '../../../../../components/atoms/table/table.component';
import { TableCellDirective } from '../../../../../components/atoms/table/table-cell.directive';
import { CustomerDialogOrganism } from '../../../../../components/organisms/customer-dialog/customer-dialog.component';
import { ServiceFormMolecule } from '../../../../../components/molecules/service-form/service-form.component';
import {
  SupplySelectionDialogComponent,
  SupplySelectionDialogResult,
} from '../../../../../components/organisms/supply-selection-dialog/supply-selection-dialog.component';
import {
  ActivitySelectionDialogComponent,
  ActivitySelectionDialogData,
  ActivitySelectionDialogResult,
} from '../../../../../components/organisms/activity-selection-dialog/activity-selection-dialog.component';


// ── Added Insumo Interface ──

export interface AddedInsumo {
  supplyId: string;
  name: string;
  quantity: number;
}

// ── Added Actividad Interface ──

export interface AddedActividad {
  actividadId: string;
  nombre: string;
  horasEstimadas: number | null;
}

@Component({
  selector: 'app-programming-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectAtom,
    TextInputComponent,
    DatepickerComponent,
    TextareaComponent,
    ButtonAtom,
    TableComponent,
    TableCellDirective,
  ],
  templateUrl: 'programming-form-dialog.component.html',
  styleUrl: 'programming-form-dialog.component.scss',
})
export class ProgrammingFormDialogComponent implements OnInit {
  public dialogRef = inject(MatDialogRef<ProgrammingFormDialogComponent>);
  private matDialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private programmingService = inject(ProgrammingService);
  private customerService = inject(CustomerService);
  private serviceService = inject(ServiceService);
  private supplyService = inject(SupplyService);
  private activityService = inject(ActivityService);

  formGroup!: FormGroup;

  private customerList = signal<Customer[]>([]);
  private serviceList = signal<Service[]>([]);
  private supplyList = signal<Supply[]>([]);

  // Added insumos (signal-based array, not FormArray)
  private _addedInsumos = signal<AddedInsumo[]>([]);
  addedInsumos = this._addedInsumos.asReadonly();

  // Added actividades (signal-based array, not FormArray)
  private _addedActividades = signal<AddedActividad[]>([]);
  addedActividades = this._addedActividades.asReadonly();

  // Cached raw API response for service activities
  private _lastServiceActivities = signal<ServiceActivity[]>([]);

  selectedServicioId = signal<string>('');
  totalHoras = signal<number>(0);

  // Table columns for added insumos
  protected readonly insumosColumns: TableColumn[] = [
    { key: 'name', header: 'Insumo', width: '55%' },
    { key: 'quantity', header: 'Cantidad', align: 'center', width: '120px' },
    { key: 'actions', header: '', width: '80px' },
  ];

  // Table columns for added actividades
  protected readonly actividadesColumns: TableColumn[] = [
    { key: 'nombre', header: 'Actividad', width: '55%' },
    { key: 'horasEstimadas', header: 'Horas Est.', align: 'center', width: '100px' },
    { key: 'actions', header: '', width: '80px' },
  ];

  ngOnInit(): void {
    this.customerService.loadCustomers().subscribe({
      next: () => {
        this.customerList.set(this.customerService.customers());
      },
      error: () => {
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      },
    });

    this.serviceService.loadServices().subscribe({
      next: () => {
        this.serviceList.set(this.serviceService.services());
      },
      error: () => {
        this.snackBar.open('Error al cargar servicios', 'Cerrar', { duration: 3000 });
      },
    });

    this.supplyService.loadSupplies().subscribe({
      next: () => {
        this.supplyList.set(this.supplyService.supplies());
      },
      error: () => {
        this.snackBar.open('Error al cargar insumos', 'Cerrar', { duration: 3000 });
      },
    });

    this.activityService.loadData({ limit: 100 }).subscribe({
      next: () => {
        // Activities available for selection in the dialog
      },
      error: () => {
        this.snackBar.open('Error al cargar actividades', 'Cerrar', { duration: 3000 });
      },
    });

    this.formGroup = this.fb.group({
      customerId: ['', Validators.required],
      servicioId: ['', Validators.required],
      fechaInicioEstimada: ['', [Validators.required]],
      notas: ['', [Validators.maxLength(2000)]],
    });

    const today = new Date();
    today.setHours(8, 0, 0, 0);
    const isoString = today.toISOString().slice(0, 16);
    this.formGroup.get('fechaInicioEstimada')?.setValue(isoString);

    this.formGroup.get('servicioId')?.valueChanges.subscribe((servicioId: string) => {
      this.selectedServicioId.set(servicioId);
      const servicio = this.serviceList().find(s => s.id === servicioId);
      const baseHoras = servicio?.totalHoras ?? 0;
      this.totalHoras.set(this.computeTotalHoras(baseHoras));

      // Auto-load activities for selected service
      if (servicioId) {
        this.loadActivitiesForService(servicioId);
      } else {
        this._addedActividades.set([]);
        this._lastServiceActivities.set([]);
      }
    });
  }

  insumosCount = computed(() => this._addedInsumos().length);
  actividadesCount = computed(() => this._addedActividades().length);

  loadActivitiesForService(servicioId: string): void {
    if (!servicioId) {
      this._addedActividades.set([]);
      this._lastServiceActivities.set([]);
      return;
    }

    // First check if the service is already loaded in the list (with activities eager-loaded)
    const servicio = this.serviceList().find(s => s.id === servicioId);
    if (servicio?.actividades && servicio.actividades.length > 0) {
      this._lastServiceActivities.set(servicio.actividades);
      this._addedActividades.set(
        servicio.actividades.map(sa => ({
          actividadId: sa.actividad?.id ?? sa.actividadId ?? '',
          nombre: sa.actividad?.nombre ?? '',
          horasEstimadas: sa.actividad?.horasEstimadas ?? null,
        }))
      );
    } else {
      // Fallback: fetch from API if not in local list
      this.serviceService.getServiceActivities(servicioId).subscribe({
        next: (activities: ServiceActivity[]) => {
          this._lastServiceActivities.set(activities);
          this._addedActividades.set(
            activities.map(sa => ({
              actividadId: sa.actividad?.id ?? sa.actividadId ?? '',
              nombre: sa.actividad?.nombre ?? '',
              horasEstimadas: sa.actividad?.horasEstimadas ?? null,
            }))
          );
        },
        error: () => {
          this.snackBar.open('Error al cargar actividades del servicio', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  openAddInsumoDialog(): void {
    const ref = this.matDialog.open(SupplySelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { mode: 'add' },
    });

    ref.afterClosed().subscribe((result: SupplySelectionDialogResult | undefined) => {
      if (!result) return;

      this._addedInsumos.update(items => {
        return [...items, {
          supplyId: result.supplyId,
          name: result.name,
          quantity: result.quantity,
        }];
      });
    });
  }

  openEditInsumoDialog(index: number): void {
    const currentInsumo = this._addedInsumos()[index];
    const ref = this.matDialog.open(SupplySelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {
        mode: 'edit',
        lineItem: {
          supplyId: currentInsumo.supplyId,
          name: currentInsumo.name,
          quantity: currentInsumo.quantity,
        },
        index,
      },
    });

    ref.afterClosed().subscribe((result: SupplySelectionDialogResult | undefined) => {
      if (!result) return;

      this._addedInsumos.update(items => {
        const updated = [...items];
        updated[index] = {
          supplyId: result.supplyId,
          name: result.name,
          quantity: result.quantity,
        };
        return updated;
      });
    });
  }

  removeInsumo(index: number): void {
    this._addedInsumos.update(items => items.filter((_, i) => i !== index));
  }

  openAddActividadesDialog(): void {
    const currentActivityIds = this._addedActividades().map(a => a.actividadId);
    const ref = this.matDialog.open(ActivitySelectionDialogComponent, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: { selectedActivityIds: currentActivityIds } as ActivitySelectionDialogData,
    });

    ref.afterClosed().subscribe((result: ActivitySelectionDialogResult | undefined) => {
      if (!result) return;

      this._addedActividades.update(items => {
        const existing = [...items];
        const existingIds = new Set(existing.map(a => a.actividadId));

        // Use ActivityService.data() to resolve activity details from the ID list
        const allActivities = this.activityService.data();
        result.activityIds.forEach(activityId => {
          if (!existingIds.has(activityId)) {
            const activity = allActivities.find(a => a.id === activityId);
            if (activity) {
              existing.push({
                actividadId: activity.id,
                nombre: activity.nombre,
                horasEstimadas: activity.horasEstimadas ?? null,
              });
            }
          }
        });

        return existing;
      });
    });
  }

  removeActividad(index: number): void {
    this._addedActividades.update(items => items.filter((_, i) => i !== index));
  }

  getSelectedServicio(): Service | undefined {
    const servicioId = this.formGroup.get('servicioId')?.value;
    return this.serviceList().find(s => s.id === servicioId);
  }

  get servicioOptions(): SelectOption[] {
    return this.serviceList().map(s => ({
      value: s.id,
      label: s.nombre,
    }));
  }

  get clienteOptions(): SelectOption[] {
    return this.customerList().map(c => ({
      value: c.id,
      label: c.name,
    }));
  }

  private computeTotalHoras(baseHoras: number): number {
    const activities = this._addedActividades();
    const activitiesHours = activities.reduce(
      (sum, act) => sum + (act.horasEstimadas ?? 0),
      0
    );
    return baseHoras + activitiesHours;
  }

  getTotalHorasPreview(): number {
    const servicioId = this.formGroup.get('servicioId')?.value;
    const servicio = this.serviceList().find(s => s.id === servicioId);
    const baseHoras = servicio?.totalHoras ?? 0;
    return this.computeTotalHoras(baseHoras);
  }

  openCreateCustomerDialog(): void {
    const ref = this.matDialog.open(CustomerDialogOrganism, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.md,
      panelClass: DIALOG_PANEL_CLASS,
      data: {},
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        const allCustomers = this.customerService.customers();
        if (allCustomers.length > 0) {
          this.customerList.set(allCustomers);
          this.formGroup.patchValue({ customerId: allCustomers[0].id });
        }
      }
    });
  }

  openCreateServiceDialog(): void {
    const ref = this.matDialog.open(ServiceFormMolecule, {
      ...DIALOG_DEFAULTS,
      width: DIALOG_WIDTHS.lg,
      panelClass: DIALOG_PANEL_CLASS,
      data: {},
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        const allServices = this.serviceService.services();
        if (allServices.length > 0) {
          this.serviceList.set(allServices);
          this.formGroup.patchValue({ servicioId: allServices[0].id });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const value = this.formGroup.value;

    const dto: CreateProgramadoDto = {
      customerId: value.customerId,
      servicioId: value.servicioId,
      fechaInicioEstimada: new Date(value.fechaInicioEstimada).toISOString(),
      notas: value.notas,
    };

    const addedInsumos = this._addedInsumos();
    if (addedInsumos.length > 0) {
      dto.insumos = addedInsumos.map(insumo => ({
        insumoId: insumo.supplyId,
        cantidad: insumo.quantity,
      }));
    }

    const addedActividades = this._addedActividades();
    if (addedActividades.length > 0) {
      dto.actividades = addedActividades.map(act => ({
        actividadId: act.actividadId,
      }));
    }

    this.programmingService.createProgramado(dto).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        const message = err?.error?.message || 'Error al crear el servicio programado';
        this.snackBar.open(typeof message === 'string' ? message : 'Error al crear el servicio', 'Cerrar', { duration: 5000 });
      },
    });
  }
}
