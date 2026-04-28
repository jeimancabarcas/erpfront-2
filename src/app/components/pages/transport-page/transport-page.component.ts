import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TransportDashboardViewComponent } from './transport-dashboard-view/transport-dashboard-view.component';
import { TransportDispatchViewComponent } from './transport-dispatch-view/transport-dispatch-view.component';
import { TransportTrackingViewComponent } from './transport-tracking-view/transport-tracking-view.component';
import { TransportSettlementViewComponent } from './transport-settlement-view/transport-settlement-view.component';

@Component({
  selector: 'app-transport-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TransportDashboardViewComponent,
    TransportDispatchViewComponent,
    TransportTrackingViewComponent,
    TransportSettlementViewComponent
  ],
  template: `
    <app-dashboard-layout>
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">Gestión de Transporte</h1>
          <p class="text-gray-500 font-medium tracking-tight">Control de flota, despachos y liquidación de rutas.</p>
        </div>
        <div class="flex gap-3">
          <button 
            mat-flat-button 
            color="primary" 
            class="!rounded-full !h-12 !px-8 !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
          >
            <mat-icon class="mr-2">local_shipping</mat-icon>
            Nuevo Vehículo
          </button>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <mat-tab-group 
        class="custom-tabs" 
        animationDuration="500ms"
        (selectedIndexChange)="activeTab.set($event)"
      >
        <mat-tab>
          <ng-template mat-tab-label>
            <div class="flex items-center gap-2 py-2">
              <mat-icon class="!text-[20px]">dashboard</mat-icon>
              <span class="font-black uppercase tracking-widest text-[10px]">Tablero de Control</span>
            </div>
          </ng-template>
          <div class="pt-8">
            <app-transport-dashboard-view />
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <div class="flex items-center gap-2 py-2">
              <mat-icon class="!text-[20px]">map</mat-icon>
              <span class="font-black uppercase tracking-widest text-[10px]">Planeación</span>
            </div>
          </ng-template>
          <div class="pt-8">
            <app-transport-dispatch-view />
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <div class="flex items-center gap-2 py-2">
              <mat-icon class="!text-[20px]">sensors</mat-icon>
              <span class="font-black uppercase tracking-widest text-[10px]">Seguimiento</span>
            </div>
          </ng-template>
          <div class="pt-8">
            <app-transport-tracking-view />
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <div class="flex items-center gap-2 py-2">
              <mat-icon class="!text-[20px]">account_balance_wallet</mat-icon>
              <span class="font-black uppercase tracking-widest text-[10px]">Liquidación</span>
            </div>
          </ng-template>
          <div class="pt-8">
            <app-transport-settlement-view />
          </div>
        </mat-tab>
      </mat-tab-group>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .custom-tabs .mat-mdc-tab-header {
      background: white;
      border-radius: 24px;
      padding: 8px;
      border: 1px solid #f1f5f9;
      margin-bottom: 24px;
    }
    ::ng-deep .custom-tabs .mat-mdc-tab-labels { gap: 8px; }
    ::ng-deep .custom-tabs .mdc-tab {
      height: 48px;
      border-radius: 16px;
      transition: all 0.3s ease;
      min-width: 160px;
    }
    ::ng-deep .custom-tabs .mdc-tab--active {
      background: #f8fafc;
    }
    ::ng-deep .custom-tabs .mat-mdc-tab-indicator .mdc-tab-indicator__content--underline {
      display: none;
    }
    ::ng-deep .custom-tabs .mdc-tab__text-label {
      color: #94a3b8 !important;
    }
    ::ng-deep .custom-tabs .mdc-tab--active .mdc-tab__text-label {
      color: #1e293b !important;
    }
  `]
})
export class TransportPageComponent {
  activeTab = signal(0);
}
