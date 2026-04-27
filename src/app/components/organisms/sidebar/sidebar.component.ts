import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatButtonModule, MatExpansionModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-full bg-white border-r border-gray-100 w-64 flex flex-col py-6 overflow-y-auto">
      <div class="px-6 mb-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
        Menú Principal
      </div>

      <nav class="flex-1 px-3 space-y-1">
        <a 
          mat-list-item 
          routerLink="/dashboard" 
          routerLinkActive="!bg-indigo-100 !text-indigo-900" 
          [routerLinkActiveOptions]="{exact: true}"
          class="!rounded-full !h-14 hover:!bg-gray-100 transition-all flex items-center group mb-1"
        >
          <div class="flex items-center gap-4 px-4">
            <mat-icon class="!text-gray-500 group-[.active]:!text-indigo-900 !text-[24px]">dashboard</mat-icon>
            <span class="text-sm font-bold tracking-wide">Inicio</span>
          </div>
        </a>

        <a 
          mat-list-item 
          routerLink="/inventory" 
          routerLinkActive="!bg-indigo-100 !text-indigo-900" 
          class="!rounded-full !h-14 hover:!bg-gray-100 transition-all flex items-center group mb-1"
        >
          <div class="flex items-center gap-4 px-4">
            <mat-icon class="!text-gray-500 group-[.active]:!text-indigo-900 !text-[24px]">inventory_2</mat-icon>
            <span class="text-sm font-bold tracking-wide">Inventario</span>
          </div>
        </a>

        <!-- Finance Module Collapsible -->
        <mat-accordion class="sidebar-accordion" multi>
          <mat-expansion-panel 
            class="!shadow-none !bg-transparent !border-none mb-1"
            [expanded]="isFinanceActive()"
          >
            <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 !rounded-full group">
              <mat-panel-title class="flex items-center gap-4">
                <mat-icon 
                  class="!text-gray-500 group-[.active]:!text-indigo-900 !text-[24px]"
                  [class.!text-indigo-900]="isFinanceActive()"
                >account_balance</mat-icon>
                <span 
                  class="text-sm font-bold tracking-wide text-gray-700"
                  [class.text-indigo-900]="isFinanceActive()"
                >Finanzas</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <nav class="flex flex-col gap-2 mt-2 pl-4">
              <a 
                mat-list-item 
                routerLink="/finance" 
                routerLinkActive="!bg-indigo-50 !text-indigo-600" 
                [routerLinkActiveOptions]="{exact: true}"
                class="!rounded-full !h-12 hover:!bg-gray-50 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 !text-[20px]">insights</mat-icon>
                  <span class="text-xs font-bold tracking-wide">Resumen</span>
                </div>
              </a>
              <a 
                mat-list-item 
                routerLink="/finance/invoicing" 
                routerLinkActive="!bg-indigo-50 !text-indigo-600" 
                class="!rounded-full !h-12 hover:!bg-gray-50 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 !text-[20px]">point_of_sale</mat-icon>
                  <span class="text-xs font-bold tracking-wide">Facturación</span>
                </div>
              </a>
              <a 
                mat-list-item 
                routerLink="/finance/adjustments" 
                routerLinkActive="!bg-indigo-50 !text-indigo-600" 
                class="!rounded-full !h-12 hover:!bg-gray-50 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 !text-[20px]">request_quote</mat-icon>
                  <span class="text-xs font-bold tracking-wide">Notas Crédito/Débito</span>
                </div>
              </a>
            </nav>
          </mat-expansion-panel>

          <!-- Pediatric Module Collapsible -->
          <mat-expansion-panel 
            class="!shadow-none !bg-transparent !border-none mb-1"
            [expanded]="isPediatricsActive()"
          >
            <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 !rounded-full group">
              <mat-panel-title class="flex items-center gap-4">
                <mat-icon 
                  class="!text-gray-500 group-[.active]:!text-indigo-900 !text-[24px]"
                  [class.!text-indigo-900]="isPediatricsActive()"
                >child_care</mat-icon>
                <span 
                  class="text-sm font-bold tracking-wide text-gray-700"
                  [class.text-indigo-900]="isPediatricsActive()"
                >Pediatría</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <nav class="flex flex-col gap-2 mt-2 pl-4">
              <a 
                mat-list-item 
                routerLink="/pediatrics/patients" 
                routerLinkActive="!bg-indigo-50 !text-indigo-600" 
                class="!rounded-full !h-12 hover:!bg-gray-50 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 !text-[20px]">groups</mat-icon>
                  <span class="text-xs font-bold tracking-wide">Pacientes</span>
                </div>
              </a>
              <a 
                mat-list-item 
                routerLink="/pediatrics/agenda" 
                routerLinkActive="!bg-indigo-50 !text-indigo-600" 
                class="!rounded-full !h-12 hover:!bg-gray-50 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 !text-[20px]">calendar_today</mat-icon>
                  <span class="text-xs font-bold tracking-wide">Agenda Médica</span>
                </div>
              </a>
              <a 
                mat-list-item 
                routerLink="/pediatrics/billing" 
                routerLinkActive="!bg-indigo-50 !text-indigo-600" 
                class="!rounded-full !h-12 hover:!bg-gray-50 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 !text-[20px]">receipt_long</mat-icon>
                  <span class="text-xs font-bold tracking-wide">Facturación Médica</span>
                </div>
              </a>
            </nav>
          </mat-expansion-panel>
        </mat-accordion>
      </nav>

      <div class="px-6 mt-auto pt-6">
        <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Plan</p>
          <p class="text-sm font-bold text-gray-900 mb-2">Empresarial PRO</p>
          <div class="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
            <div class="bg-indigo-600 h-full w-[75%]"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    ::ng-deep .sidebar-accordion .mat-expansion-panel-body { padding: 0 !important; }
    ::ng-deep .sidebar-accordion .mat-expansion-indicator::after { color: #94a3b8; }
    ::ng-deep .sidebar-accordion .mat-expansion-panel-header-title { margin-right: 0; }
  `]
})
export class SidebarComponent {
  private router = inject(Router);

  isPediatricsActive(): boolean {
    return this.router.url.includes('/pediatrics');
  }

  isFinanceActive(): boolean {
    return this.router.url.includes('/finance');
  }
}
