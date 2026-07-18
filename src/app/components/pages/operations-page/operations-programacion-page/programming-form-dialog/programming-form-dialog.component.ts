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
import { Service } from '../../../../../models/service.model';
import { Supply } from '../../../../../models/supply.model';
import { CustomerService } from '../../../../../services/customer.service';
import { ServiceService } from '../../../../../services/service.service';
import { SupplyService } from '../../../../../services/supply.service';
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
import { calculateBusinessHoursEnd } from '../../../../../shared/utils/business-hours.utils';

// ── Added Insumo Interface ──

export interface AddedInsumo {
  supplyId: string;
  name: string;
  quantity: number;
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

  formGroup!: FormGroup;

  private customerList = signal<Customer[]>([]);
  private serviceList = signal<Service[]>([]);
  private supplyList = signal<Supply[]>([]);

  // Added insumos (signal-based array, not FormArray)
  private _addedInsumos = signal<AddedInsumo[]>([]);
  addedInsumos = this._addedInsumos.asReadonly();

  selectedServicioId = signal<string>('');
  totalHoras = signal<number>(0);

  // Table columns for added insumos
  protected readonly insumosColumns: TableColumn[] = [
    { key: 'name', header: 'Insumo', width: '55%' },
    { key: 'quantity', header: 'Cantidad', align: 'center', width: '120px' },
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
      this.totalHoras.set(servicio?.totalHoras ?? 0);
    });
  }

  insumosCount = computed(() => this._addedInsumos().length);

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

  getTotalHorasPreview(): number {
    return this.totalHoras();
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
