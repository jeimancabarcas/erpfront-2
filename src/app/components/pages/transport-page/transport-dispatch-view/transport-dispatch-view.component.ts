import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TransportService } from '../../../../services/transport.service';
import { FinanceService } from '../../../../services/finance.service';
import { TransportRoute } from '../../../../models/transport.model';

@Component({
  selector: 'app-transport-dispatch-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Dispatch Form -->
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
          <header class="mb-8">
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Programar Servicio de Transporte</h2>
            <p class="text-gray-400 text-sm font-medium tracking-tight">Define el punto de origen, destino y la hora exacta de salida para el nuevo despacho.</p>
          </header>

          <form [formGroup]="dispatchForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Customer Selection -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Cliente / Empresa</mat-label>
                <mat-select formControlName="customerName">
                  @for (c of financeService.customers(); track c.id) {
                    <mat-option [value]="c.name">{{ c.name }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">business</mat-icon>
              </mat-form-field>

              <!-- Origin & Destination -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Origen</mat-label>
                <input matInput formControlName="origin" placeholder="Ej: Bogotá, DC">
                <mat-icon matPrefix class="mr-2 text-gray-400">location_on</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Destino</mat-label>
                <input matInput formControlName="destination" placeholder="Ej: Medellín, ANT">
                <mat-icon matPrefix class="mr-2 text-gray-400">flag</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Vehículo Disponible</mat-label>
                <mat-select formControlName="vehicleId">
                  @for (v of availableVehicles(); track v.id) {
                    <mat-option [value]="v.id">
                      <div class="flex items-center gap-3">
                        <span class="font-black text-indigo-600">{{ v.id }}</span>
                        <span class="text-xs text-gray-400">— {{ v.driverName }} (Standby: {{ v.standbyRate | currency:'USD':'symbol':'1.0-0' }}/h)</span>
                      </div>
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">local_shipping</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Fecha de Inicio</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="departureDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Hora de Inicio</mat-label>
                <input matInput type="time" formControlName="departureTime">
                <mat-icon matPrefix class="mr-2 text-gray-400">schedule</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Precio del Servicio</mat-label>
                <input matInput type="number" formControlName="servicePrice">
                <span matPrefix class="text-gray-400 mr-1">$</span>
                <mat-icon matSuffix class="text-gray-400">payments</mat-icon>
              </mat-form-field>
            </div>

            <div class="pt-4">
              <button mat-flat-button color="primary" type="submit" 
                      [disabled]="dispatchForm.invalid"
                      class="!rounded-full !h-16 !px-10 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto">
                Confirmar y Despachar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Summary Info -->
      <div class="space-y-6">
        <div class="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100/50">
          <h3 class="text-xl font-black text-indigo-900 mb-4 tracking-tight">Resumen de Cargo</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-indigo-400">Estado Inicial</span>
              <span class="text-sm font-black text-indigo-900">Programado</span>
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-indigo-100">
              <span class="text-lg font-black text-indigo-900">Total Servicio</span>
              <span class="text-2xl font-black text-indigo-600">
                {{ (dispatchForm.value.servicePrice || 0) | currency:'USD':'symbol':'1.0-0' }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class TransportDispatchViewComponent {
  private fb = inject(FormBuilder);
  public transportService = inject(TransportService);
  public financeService = inject(FinanceService);

  availableVehicles = computed(() => 
    this.transportService.vehicles().filter(v => v.status === 'Available')
  );

  dispatchForm = this.fb.group({
    customerName: ['', Validators.required],
    origin: ['', Validators.required],
    destination: ['', Validators.required],
    vehicleId: [''],
    departureDate: [new Date(), Validators.required],
    departureTime: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), Validators.required],
    servicePrice: [0, [Validators.required, Validators.min(0)]]
  });

  onServiceChange(serviceId: string) {
    // Removed
  }

  onSubmit() {
    if (this.dispatchForm.valid) {
      const val = this.dispatchForm.value;
      const date = val.departureDate as Date;
      const [hours, minutes] = (val.departureTime as string).split(':');
      date.setHours(parseInt(hours), parseInt(minutes));

      const vehicle = this.transportService.vehicles().find(v => v.id === val.vehicleId);
      
      this.transportService.addRoute({
        id: `RT-${Math.floor(Math.random() * 10000)}`,
        origin: val.origin!,
        destination: val.destination!,
        customerName: val.customerName!,
        vehicleId: val.vehicleId || '',
        driverName: vehicle?.driverName || '',
        departureDate: date.toISOString(),
        servicePrice: val.servicePrice!,
        standbyHours: 0,
        standbyTotal: 0,
        status: 'Planning',
        milestones: [],
        operations: [],
        detailedExpenses: [],
        incidents: []
      });
      this.dispatchForm.reset({ 
        departureDate: new Date(), 
        departureTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
        servicePrice: 0 
      });
    }
  }
}
