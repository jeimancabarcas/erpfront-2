import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
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
            routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
            [routerLinkActiveOptions]="{ exact: true }"
            class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
          >
            <div class="flex items-center gap-3 px-4">
              <mat-icon class="!text-[20px]">dashboard</mat-icon>
              <span class="text-xs font-bold tracking-wide">Inicio</span>
            </div>
          </a>
        <!-- Gestión Comercial Placeholder -->
        <div class="sidebar__placeholder mb-1">
          <div class="px-4 pt-3 pb-2">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-200">Gestión Comercial</span>
          </div>
          <div class="flex flex-col gap-1 pl-2 pr-1 pb-1">
            <a
              mat-list-item
              routerLink="/comercial/sales"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              [routerLinkActiveOptions]="{ exact: true }"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">payments</mat-icon>
                <span class="text-xs font-bold tracking-wide">Punto de venta (POS)</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/comercial/customers"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">people</mat-icon>
                <span class="text-xs font-bold tracking-wide">Clientes</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/abastecimiento/purchases"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">shopping_cart</mat-icon>
                <span class="text-xs font-bold tracking-wide">Compras</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/abastecimiento/suppliers"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">business</mat-icon>
                <span class="text-xs font-bold tracking-wide">Proveedores</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Inventario Placeholder -->
        <div class="sidebar__placeholder mb-1">
          <div class="px-4 pt-3 pb-2">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-200">Inventario</span>
          </div>
          <div class="flex flex-col gap-1 pl-2 pr-1 pb-1">
            <a
              mat-list-item
              routerLink="/inventory"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              [routerLinkActiveOptions]="{ exact: true }"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">analytics</mat-icon>
                <span class="text-xs font-bold tracking-wide">Dashboard Inventario</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/inventory/categories"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">category</mat-icon>
                <span class="text-xs font-bold tracking-wide">Categorías</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/inventory/products"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">inventory_2</mat-icon>
                <span class="text-xs font-bold tracking-wide">Productos</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Finanzas Placeholder -->
        <div class="sidebar__placeholder mb-1">
          <div class="px-4 pt-3 pb-2">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-200">Finanzas</span>
          </div>
          <div class="flex flex-col gap-1 pl-2 pr-1 pb-1">
            <a
              mat-list-item
              routerLink="/finance"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              [routerLinkActiveOptions]="{ exact: true }"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">insights</mat-icon>
                <span class="text-xs font-bold tracking-wide">Resumen</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/finance/invoicing"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">point_of_sale</mat-icon>
                <span class="text-xs font-bold tracking-wide">Facturación (Electronica)</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Pediatría Placeholder -->
        <div class="sidebar__placeholder mb-1">
          <div class="px-4 pt-3 pb-2">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-200">Pediatría</span>
          </div>
          <div class="flex flex-col gap-1 pl-2 pr-1 pb-1">
            <a
              mat-list-item
              routerLink="/pediatrics/patients"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">groups</mat-icon>
                <span class="text-xs font-bold tracking-wide">Pacientes</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/pediatrics/agenda"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">calendar_today</mat-icon>
                <span class="text-xs font-bold tracking-wide">Agenda Médica</span>
              </div>
            </a>
            <a
              mat-list-item
              routerLink="/pediatrics/billing"
              routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
              class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
            >
              <div class="flex items-center gap-3 px-4">
                <mat-icon class="!text-[20px]">receipt_long</mat-icon>
                <span class="text-xs font-bold tracking-wide">Facturación Médica</span>
              </div>
            </a>
          </div>
        </div>

        <a
          mat-list-item
          routerLink="/transport"
          routerLinkActive="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 dark:!text-indigo-300"
          class="!rounded-full !h-12 hover:!bg-gray-50 dark:hover:!bg-gray-800 transition-all flex items-center text-gray-700 dark:text-gray-300"
        >
          <div class="flex items-center gap-3 px-4">
            <mat-icon class="!text-[20px]">local_shipping</mat-icon>
            <span class="text-xs font-bold tracking-wide">Transporte</span>
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
    `,
  ],
})
export class SidebarComponent {}
