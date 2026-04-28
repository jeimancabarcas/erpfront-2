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
            <p class="text-gray-400 text-sm font-medium tracking-tight">Asigna un vehículo a un cliente para un servicio de X días con tarifa definida.</p>
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

              <!-- Service Selection -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Servicio Configurado</mat-label>
                <mat-select formControlName="serviceId" (selectionChange)="onServiceChange($event.value)">
                  @for (s of transportService.catalog(); track s.id) {
                    <mat-option [value]="s.id">{{ s.name }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix class="mr-2 text-gray-400">map</mat-icon>
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
                <mat-label>Duración (Días)</mat-label>
                <input matInput type="number" formControlName="durationDays">
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
              <span class="text-sm font-bold text-indigo-400">Tarifa por Día</span>
              <span class="text-sm font-black text-indigo-900">
                {{ (dispatchForm.value.servicePrice || 0) / (dispatchForm.value.durationDays || 1) | currency:'USD':'symbol':'1.0-0' }}
              </span>
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
    serviceId: ['', Validators.required],
    vehicleId: ['', Validators.required],
    departureDate: [new Date(), Validators.required],
    durationDays: [1, [Validators.required, Validators.min(1)]],
    servicePrice: [0, [Validators.required, Validators.min(0)]]
  });

  onServiceChange(serviceId: string) {
    const service = this.transportService.catalog().find(s => s.id === serviceId);
    if (service) {
      this.dispatchForm.patchValue({
        durationDays: service.expectedDays,
        servicePrice: service.basePrice
      });
    }
  }

  onSubmit() {
    if (this.dispatchForm.valid) {
      const val = this.dispatchForm.value;
      const vehicle = this.transportService.vehicles().find(v => v.id === val.vehicleId);
      const service = this.transportService.catalog().find(s => s.id === val.serviceId);
      
      const newRoute: TransportRoute = {
        id: `RT-${Math.floor(Math.random() * 900 + 100)}`,
        serviceId: val.serviceId!,
        origin: service?.name.split(' ').pop() || 'Origen', // Simplified for mock
        destination: service?.name.split(' ').pop() || 'Destino',
        vehicleId: val.vehicleId!,
        driverName: vehicle?.driverName || 'N/A',
        customerName: val.customerName!,
        durationDays: val.durationDays!,
        servicePrice: val.servicePrice!,
        standbyHours: 0,
        standbyTotal: 0,
        departureDate: val.departureDate!.toISOString(),
        expectedArrival: new Date(val.departureDate!.getTime() + (val.durationDays! * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'Active',
        milestones: [
          { id: '1', name: 'Salida de Patio', timestamp: new Date().toISOString(), status: 'Completed' as const },
          { id: '2', name: 'En Tránsito', timestamp: '', status: 'Pending' as const },
          { id: '3', name: 'Entrega Final', timestamp: '', status: 'Pending' as const }
        ],
        currentMilestone: 'Salida de Patio',
        expenses: { tolls: 0, fuel: 0, allowances: 0 }
      };

      this.transportService.addRoute(newRoute);
      this.dispatchForm.reset({ departureDate: new Date(), durationDays: 1, servicePrice: 0 });
    }
  }
}
