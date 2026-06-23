import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <div class="h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 w-64 flex flex-col py-6 overflow-y-auto">
      <div class="px-6 mb-8 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Menú Principal
      </div>

      <nav class="flex-1 px-3 space-y-1">
          <a
            mat-list-item
            routerLink="/dashboard"
            routerLinkActive="!bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-900 dark:!text-indigo-200"
            [routerLinkActiveOptions]="{ exact: true }"
            class="!rounded-full !h-14 hover:!bg-gray-100 dark:hover:!bg-gray-800 transition-all flex items-center group mb-1"
          >
            <div class="flex items-center gap-4 px-4">
              <mat-icon class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200 !text-[24px]"
                >dashboard</mat-icon
              >
              <span class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200">Inicio</span>
            </div>
          </a>
          <!-- Gestión Comercial Collapsible -->
          <mat-accordion class="sidebar-accordion" multi>
            <mat-expansion-panel
              class="!shadow-none !bg-transparent !border-none mb-1"
              [expanded]="sidebarService.comercialExpanded"
              (opened)="sidebarService.comercialExpanded = true"
              (closed)="sidebarService.comercialExpanded = false"
            >
              <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 dark:hover:!bg-gray-800 !rounded-full group">
                <mat-panel-title class="flex items-center gap-4">
                  <mat-icon
                    class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 !text-[24px]"
                    [class.!text-indigo-900]="sidebarService.isComercialActive()"
                    >store</mat-icon
                  >
                  <span
                    class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200"
                    [class.!text-indigo-900]="sidebarService.isComercialActive()"
                    >Gestión Comercial</span
                  >
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="flex flex-col gap-1 pl-2 pr-1 pt-1">
                <a
                  mat-list-item
                  routerLink="/sales"
                  routerLinkActive="!bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-900 dark:!text-indigo-200"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="!rounded-full !h-12 hover:!bg-gray-100 dark:hover:!bg-gray-800 transition-all flex items-center group mb-0.5"
                >
                  <div class="flex items-center gap-4 px-4">
                    <mat-icon class="!text-gray-400 dark:!text-gray-500 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200 !text-[20px]"
                      >payments</mat-icon
                    >
                    <span class="text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200">Ventas</span>
                  </div>
                </a>
                <a
                  mat-list-item
                  routerLink="/sales/customers"
                  routerLinkActive="!bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-900 dark:!text-indigo-200"
                  class="!rounded-full !h-12 hover:!bg-gray-100 dark:hover:!bg-gray-800 transition-all flex items-center group mb-0.5"
                >
                  <div class="flex items-center gap-4 px-4">
                    <mat-icon class="!text-gray-400 dark:!text-gray-500 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200 !text-[20px]"
                      >people</mat-icon
                    >
                    <span class="text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200">Clientes</span>
                  </div>
                </a>
              </div>
            </mat-expansion-panel>
          </mat-accordion>

          <!-- Abastecimiento Collapsible -->
          <mat-accordion class="sidebar-accordion" multi>
            <mat-expansion-panel
              class="!shadow-none !bg-transparent !border-none mb-1"
              [expanded]="sidebarService.abastecimientoExpanded"
              (opened)="sidebarService.abastecimientoExpanded = true"
              (closed)="sidebarService.abastecimientoExpanded = false"
            >
              <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 dark:hover:!bg-gray-800 !rounded-full group">
                <mat-panel-title class="flex items-center gap-4">
                  <mat-icon
                    class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 !text-[24px]"
                    [class.!text-indigo-900]="sidebarService.isAbastecimientoActive()"
                    >local_shipping</mat-icon
                  >
                  <span
                    class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200"
                    [class.!text-indigo-900]="sidebarService.isAbastecimientoActive()"
                    >Abastecimiento</span
                  >
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="flex flex-col gap-1 pl-2 pr-1 pt-1">
                <a
                  mat-list-item
                  routerLink="/inventory/purchases"
                  routerLinkActive="!bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-900 dark:!text-indigo-200"
                  class="!rounded-full !h-12 hover:!bg-gray-100 dark:hover:!bg-gray-800 transition-all flex items-center group mb-0.5"
                >
                  <div class="flex items-center gap-4 px-4">
                    <mat-icon class="!text-gray-400 dark:!text-gray-500 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200 !text-[20px]"
                      >shopping_cart</mat-icon
                    >
                    <span class="text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200">Compras</span>
                  </div>
                </a>
                <a
                  mat-list-item
                  routerLink="/inventory/suppliers"
                  routerLinkActive="!bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-900 dark:!text-indigo-200"
                  class="!rounded-full !h-12 hover:!bg-gray-100 dark:hover:!bg-gray-800 transition-all flex items-center group mb-0.5"
                >
                  <div class="flex items-center gap-4 px-4">
                    <mat-icon class="!text-gray-400 dark:!text-gray-500 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200 !text-[20px]"
                      >business</mat-icon
                    >
                    <span class="text-sm font-bold tracking-wide text-gray-600 dark:text-gray-300 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200">Proveedores</span>
                  </div>
                </a>
              </div>
            </mat-expansion-panel>
          </mat-accordion>

        <!-- Inventory Module Collapsible -->
        <mat-accordion class="sidebar-accordion" multi>
          <mat-expansion-panel
            class="!shadow-none !bg-transparent !border-none mb-1"
            [expanded]="sidebarService.inventoryExpanded"
            (opened)="sidebarService.inventoryExpanded = true"
            (closed)="sidebarService.inventoryExpanded = false"
          >
            <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 dark:hover:!bg-gray-800 !rounded-full group">
              <mat-panel-title class="flex items-center gap-4">
                <mat-icon
                  class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 !text-[24px]"
                  [class.!text-indigo-900]="isInventoryActive()"
                  >inventory_2</mat-icon
                >
                <span
                  class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200"
                  [class.text-indigo-900]="isInventoryActive()"
                  >Inventario</span
                >
              </mat-panel-title>
            </mat-expansion-panel-header>

            <nav class="flex flex-col gap-2 mt-2 pl-4">
              <a
                mat-list-item
                routerLink="/inventory"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                [routerLinkActiveOptions]="{ exact: true }"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">analytics</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Resumen</span>
                </div>
              </a>

              <a
                mat-list-item
                routerLink="/inventory/categories"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">category</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Categorías</span>
                </div>
              </a>

              <a
                mat-list-item
                routerLink="/inventory/products"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">inventory_2</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Productos</span>
                </div>
              </a>
            </nav>
          </mat-expansion-panel>
        </mat-accordion>

        <!-- Finance Module Collapsible -->
        <mat-accordion class="sidebar-accordion" multi>
          <mat-expansion-panel
            class="!shadow-none !bg-transparent !border-none mb-1"
            [expanded]="sidebarService.financeExpanded"
            (opened)="sidebarService.financeExpanded = true"
            (closed)="sidebarService.financeExpanded = false"
          >
            <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 dark:hover:!bg-gray-800 !rounded-full group">
              <mat-panel-title class="flex items-center gap-4">
                <mat-icon
                  class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 !text-[24px]"
                  [class.!text-indigo-900]="isFinanceActive()"
                  >account_balance</mat-icon
                >
                <span
                  class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200"
                  [class.text-indigo-900]="isFinanceActive()"
                  >Finanzas</span
                >
              </mat-panel-title>
            </mat-expansion-panel-header>

            <nav class="flex flex-col gap-2 mt-2 pl-4">
              <a
                mat-list-item
                routerLink="/finance"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                [routerLinkActiveOptions]="{ exact: true }"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">insights</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Resumen</span>
                </div>
              </a>
              <a
                mat-list-item
                routerLink="/finance/invoicing"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">point_of_sale</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Facturación</span>
                </div>
              </a>
              <a
                mat-list-item
                routerLink="/finance/adjustments"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">request_quote</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Notas Crédito/Débito</span>
                </div>
              </a>
            </nav>
          </mat-expansion-panel>

          <!-- Pediatric Module Collapsible -->
          <mat-expansion-panel
            class="!shadow-none !bg-transparent !border-none mb-1"
            [expanded]="sidebarService.pediatricsExpanded"
            (opened)="sidebarService.pediatricsExpanded = true"
            (closed)="sidebarService.pediatricsExpanded = false"
          >
            <mat-expansion-panel-header class="!h-14 !px-4 hover:!bg-gray-100 dark:hover:!bg-gray-800 !rounded-full group">
              <mat-panel-title class="flex items-center gap-4">
                <mat-icon
                  class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 !text-[24px]"
                  [class.!text-indigo-900]="isPediatricsActive()"
                  >child_care</mat-icon
                >
                <span
                  class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200"
                  [class.text-indigo-900]="isPediatricsActive()"
                  >Pediatría</span
                >
              </mat-panel-title>
            </mat-expansion-panel-header>

            <nav class="flex flex-col gap-2 mt-2 pl-4">
              <a
                mat-list-item
                routerLink="/pediatrics/patients"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">groups</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Pacientes</span>
                </div>
              </a>
              <a
                mat-list-item
                routerLink="/pediatrics/agenda"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">calendar_today</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Agenda Médica</span>
                </div>
              </a>
              <a
                mat-list-item
                routerLink="/pediatrics/billing"
                routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
                class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center group"
              >
                <div class="flex items-center gap-3 px-4">
                  <mat-icon class="!text-gray-400 dark:!text-gray-500 !text-[20px]">receipt_long</mat-icon>
                  <span class="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Facturación Médica</span>
                </div>
              </a>
            </nav>
          </mat-expansion-panel>
        </mat-accordion>

        <a
          mat-list-item
          routerLink="/transport"
          routerLinkActive="!bg-indigo-100 dark:!bg-indigo-900/30 !text-indigo-900 dark:!text-indigo-200"
          class="!rounded-full !h-14 hover:!bg-gray-100 dark:hover:!bg-gray-800 transition-all flex items-center group mb-1"
        >
          <div class="flex items-center gap-4 px-4">
            <mat-icon class="!text-gray-500 dark:!text-gray-400 group-[.active]:!text-indigo-900 dark:group-[.active]:!text-indigo-200 !text-[24px]"
              >local_shipping</mat-icon
            >
            <span class="text-sm font-bold tracking-wide text-gray-700 dark:text-gray-200">Transporte</span>
          </div>
        </a>
      </nav>

      <div class="px-6 mt-auto pt-6">
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Plan</p>
          <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Empresarial PRO</p>
          <div class="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
            <div class="bg-indigo-600 h-full w-[75%]"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      ::ng-deep .sidebar-accordion .mat-expansion-panel-body {
        padding: 0 !important;
      }
      ::ng-deep .sidebar-accordion .mat-expansion-indicator::after {
        color: #94a3b8;
      }
      ::ng-deep .sidebar-accordion .mat-expansion-panel-header-title {
        margin-right: 0;
      }
    `,
  ],
})
export class SidebarComponent {
  private router = inject(Router);
  protected sidebarService = inject(SidebarService);

  isInventoryActive(): boolean {
    const url = this.router.url;
    const paths = [
      '/inventory',
      '/inventory/categories',
      '/inventory/products',
      '/inventory/suppliers',
    ];
    return (
      paths.some((path) => url === path || url.startsWith(path + '/')) &&
      !url.includes('/inventory/purchases')
    );
  }

  isPediatricsActive(): boolean {
    return this.router.url.includes('/pediatrics');
  }

  isFinanceActive(): boolean {
    return this.router.url.includes('/finance');
  }
}
