import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonAtom } from '../../atoms/button/button.component';
import { TransportDashboardViewComponent } from './transport-dashboard-view/transport-dashboard-view.component';
import { TransportTrackingViewComponent } from './transport-tracking-view/transport-tracking-view.component';
import { TransportSettlementViewComponent } from './transport-settlement-view/transport-settlement-view.component';

@Component({
  selector: 'app-transport-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonAtom,
    TransportDashboardViewComponent,
    TransportTrackingViewComponent,
    TransportSettlementViewComponent
  ],
  template: `
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Gestión de Transporte</h1>
          <p class="text-gray-500 font-medium tracking-tight">Control de flota, despachos y liquidación de rutas.</p>
        </div>
        <div class="flex gap-3">
          <ui-button 
            variant="primary"
          >
            <span class="material-icons mr-2">local_shipping</span>
            Nuevo Vehículo
          </ui-button>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <div class="flex gap-2 p-2 bg-white border border-gray-100 rounded-2xl mb-8">
        <ui-button
          [variant]="activeTab() === 0 ? 'primary' : 'ghost'"
          (clicked)="activeTab.set(0)"
          class="h-12 px-6 rounded-2xl min-w-[160px]"
        >
          <span class="material-icons text-[20px] mr-2">dashboard</span>
          <span class="font-black uppercase tracking-widest text-[10px]">Tablero de Control</span>
        </ui-button>
        <ui-button
          [variant]="activeTab() === 1 ? 'primary' : 'ghost'"
          (clicked)="activeTab.set(1)"
          class="h-12 px-6 rounded-2xl min-w-[160px]"
        >
          <span class="material-icons text-[20px] mr-2">sensors</span>
          <span class="font-black uppercase tracking-widest text-[10px]">Seguimiento</span>
        </ui-button>
        <ui-button
          [variant]="activeTab() === 2 ? 'primary' : 'ghost'"
          (clicked)="activeTab.set(2)"
          class="h-12 px-6 rounded-2xl min-w-[160px]"
        >
          <span class="material-icons text-[20px] mr-2">account_balance_wallet</span>
          <span class="font-black uppercase tracking-widest text-[10px]">Liquidación</span>
        </ui-button>
      </div>

      <!-- Tab Content -->
      @switch (activeTab()) {
        @case (0) {
          <div class="pt-4">
            <app-transport-dashboard-view />
          </div>
        }
        @case (1) {
          <div class="pt-4">
            <app-transport-tracking-view />
          </div>
        }
        @case (2) {
          <div class="pt-4">
            <app-transport-settlement-view />
          </div>
        }
      }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportPageComponent {
  activeTab = signal(0);
}
