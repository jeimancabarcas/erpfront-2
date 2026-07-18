import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Customer } from '../../../../../models/customer.model';
import { Service } from '../../../../../models/service.model';
import { Supply } from '../../../../../models/supply.model';
import { CustomerService } from '../../../../../services/customer.service';
import { ServiceService } from '../../../../../services/service.service';
import { SupplyService } from '../../../../../services/supply.service';
import { ProgrammingService } from '../../../../../services/programming.service';
import { CreateProgramadoDto, CreateProgramadoInsumoDto } from '../../../../../models/programming.model';
import { DIALOG_WIDTHS, DIALOG_PANEL_CLASS, DIALOG_DEFAULTS } from '../../../../../shared/constants/dialog.config';

@Component({
  selector: 'app-programming-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  templateUrl: 'programming-form-dialog.component.html',
  styleUrl: 'programming-form-dialog.component.scss',
})
export class ProgrammingFormDialogComponent {
  public dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private programmingService = inject(ProgrammingService);
  private customerService = inject(CustomerService);
  private serviceService = inject(ServiceService);
  private supplyService = inject(SupplyService);

  formGroup!: FormGroup;
  clientes: Customer[] = [];
  servicios: Service[] = [];
  insumos: Supply[] = [];

  ngOnInit() {
    // Load customers, services, and supplies
    this.customerService.loadCustomers().subscribe({
      next: () => {
        this.clientes = this.customerService.customers();
      },
      error: () => {
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      },
    });

    this.serviceService.loadServices().subscribe({
      next: () => {
        this.servicios = this.serviceService.services();
      },
      error: () => {
        this.snackBar.open('Error al cargar servicios', 'Cerrar', { duration: 3000 });
      },
    });

    this.supplyService.loadSupplies().subscribe({
      next: () => {
        this.insumos = this.supplyService.supplies();
      },
      error: () => {
        this.snackBar.open('Error al cargar insumos', 'Cerrar', { duration: 3000 });
      },
    });

    // Initialize form
    this.formGroup = this.fb.group({
      customerId: ['', Validators.required],
      servicioId: ['', Validators.required],
      insumos: this.fb.array([this.createInsumoRow()]),
      fechaInicioEstimada: ['', [Validators.required]],
      notas: ['', [Validators.maxLength(2000)]],
    });

    // Set default fechaInicio to today 08:00
    const today = new Date();
    today.setHours(8, 0, 0, 0);
    const isoString = today.toISOString().slice(0, 16);
    this.formGroup.get('fechaInicioEstimada')?.setValue(isoString);
  }

  get insumosArray(): FormArray {
    return this.formGroup.get('insumos') as FormArray;
  }

  createInsumoRow(): FormGroup {
    return this.fb.group({
      insumoId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  addInsumoRow(): void {
    this.insumosArray.push(this.createInsumoRow());
  }

  removeInsumoRow(index: number): void {
    if (this.insumosArray.length > 1) {
      this.insumosArray.removeAt(index);
    }
  }

  getSelectedServicio(): Service | undefined {
    const servicioId = this.formGroup.get('servicioId')?.value;
    return this.servicios.find(s => s.id === servicioId);
  }

  getTotalHorasPreview(): number {
    const servicio = this.getSelectedServicio();
    if (!servicio) return 0;
    return servicio.totalHoras || 0;
  }

  getFechaFinPreview(): string {
    const inicio = this.formGroup.get('fechaInicioEstimada')?.value;
    const totalHoras = this.getTotalHorasPreview();

    if (!inicio || !totalHoras) return '';

    const startDate = new Date(inicio);
    const result = this.calculateEndDatePreview(totalHoras, startDate);
    return result.toLocaleString('es-CO');
  }

  /**
   * Frontend date calculation (mirrors backend logic for preview)
   */
  private calculateEndDatePreview(totalHours: number, startDateTime: Date): Date {
    if (!totalHours || totalHours <= 0) {
      return new Date(startDateTime);
    }

    const BUSINESS_DAY_HOURS = 8;
    const DAY_START_HOUR = 8;
    const DAY_END_HOUR = 17;

    const current = new Date(startDateTime);
    let hoursRemaining = totalHours;

    while (hoursRemaining > 0) {
      const dayOfWeek = current.getDay();

      if (dayOfWeek === 0) {
        const monday = new Date(current);
        monday.setDate(monday.getDate() + (1 - dayOfWeek));
        current.setHours(DAY_START_HOUR, 0, 0, 0);
        continue;
      }
      if (dayOfWeek === 6) {
        const monday = new Date(current);
        monday.setDate(monday.getDate() + (1 - dayOfWeek));
        current.setHours(DAY_START_HOUR, 0, 0, 0);
        continue;
      }

      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

      if (current.getHours() < DAY_START_HOUR) {
        dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
      }

      const availableMs = dayEnd.getTime() - dayStart.getTime();
      const availableHours = availableMs / (1000 * 60 * 60);

      if (availableHours <= 0) {
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(DAY_START_HOUR, 0, 0, 0);
        current.setTime(nextDay.getTime());
        continue;
      }

      if (hoursRemaining <= availableHours) {
        const endMs = current.getTime() + hoursRemaining * 60 * 60 * 1000;
        return new Date(endMs);
      }

      hoursRemaining -= availableHours;
      const nextDay = new Date(current);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(DAY_START_HOUR, 0, 0, 0);
      current.setTime(nextDay.getTime());
    }

    return new Date(current);
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

    // Transform insumos
    if (value.insumos && value.insumos.length > 0) {
      dto.insumos = value.insumos.map((row: any) => ({
        insumoId: row.insumoId,
        cantidad: parseFloat(row.cantidad),
      }));
    }

    this.programmingService.createProgramado(dto).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.snackBar.open('Servicio programado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        const message = err?.error?.message || 'Error al crear el servicio programado';
        this.snackBar.open(typeof message === 'string' ? message : 'Error al crear el servicio', 'Cerrar', { duration: 5000 });
      },
    });
  }
}
