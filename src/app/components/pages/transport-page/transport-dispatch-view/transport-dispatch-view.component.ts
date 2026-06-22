import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportService } from '../../../../services/transport.service';
import { FinanceService } from '../../../../services/finance.service';
import { TransportRoute } from '../../../../models/transport.model';
import { ButtonAtom } from '../../../../components/atoms/button/button.component';

@Component({
  selector: 'app-transport-dispatch-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonAtom
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
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Cliente / Empresa</label>
                <div class="relative">
                  <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">business</span>
                  <select formControlName="customerName" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
                    <option value="" disabled>Seleccionar cliente</option>
                    @for (c of financeService.customers(); track c.id) {
                      <option [value]="c.name">{{ c.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Origin -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Origen</label>
                <div class="relative">
                  <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
                  <input type="text" formControlName="origin" placeholder="Ej: Bogotá, DC" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
                </div>
              </div>

              <!-- Destination -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Destino</label>
                <div class="relative">
                  <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">flag</span>
                  <input type="text" formControlName="destination" placeholder="Ej: Medellín, ANT" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
                </div>
              </div>

              <!-- Vehicle Selection -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Vehículo Disponible</label>
                <div class="relative">
                  <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">local_shipping</span>
                  <select formControlName="vehicleId" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all appearance-none">
                    <option value="" disabled>Seleccionar vehículo</option>
                    @for (v of availableVehicles(); track v.id) {
                      <option [value]="v.id">{{ v.id }} — {{ v.driverName }} (Standby: {{ v.standbyRate | currency:'USD':'symbol':'1.0-0' }}/h)</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Date -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Fecha de Inicio</label>
                <div class="relative">
                  <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">calendar_today</span>
                  <input type="date" formControlName="departureDate" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
                </div>
              </div>

              <!-- Time -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Hora de Inicio</label>
                <div class="relative">
                  <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">schedule</span>
                  <input type="time" formControlName="departureTime" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
                </div>
              </div>

              <!-- Service Price -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest">Precio del Servicio</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">$</span>
                  <input type="number" formControlName="servicePrice" class="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
                </div>
              </div>
            </div>

            <div class="pt-4">
              <ui-button variant="primary" type="submit"
                      [disabled]="dispatchForm.invalid"
                      class="!rounded-full !h-16 !px-10 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto">
                Confirmar y Despachar
              </ui-button>
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
