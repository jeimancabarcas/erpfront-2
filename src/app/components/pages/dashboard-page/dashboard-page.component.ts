import { Component } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DashboardLayoutComponent, MatCardModule, MatIconModule],
  template: `
    <app-dashboard-layout>
      <header class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Bienvenido al Panel de Control</h1>
        <p class="text-gray-500 font-medium">Gestiona todos tus módulos y servicios desde aquí.</p>
      </header>

      <!-- Modules Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (module of modules; track module.title) {
          <mat-card class="!rounded-[28px] !border-none !shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:!shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer group overflow-hidden bg-white">
            <div class="p-8">
              <div class="w-14 h-14 [background:{{module.color}}15] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300">
                <mat-icon class="!text-[28px]" [style.color]="module.color">{{module.icon}}</mat-icon>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">{{module.title}}</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-6">{{module.description}}</p>
              
              <div class="flex items-center text-xs font-bold uppercase tracking-wider" [style.color]="module.color">
                Acceder al módulo
                <mat-icon class="!text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_forward</mat-icon>
              </div>
            </div>
          </mat-card>
        }
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardPageComponent {
  modules = [
    { 
      title: 'Ventas', 
      description: 'Gestión de facturación, pedidos y clientes potenciales.', 
      icon: 'shopping_cart', 
      color: '#4f46e5' 
    },
    { 
      title: 'Inventario', 
      description: 'Control de stock, almacenes y movimientos de mercancía.', 
      icon: 'inventory_2', 
      color: '#0891b2' 
    },
    { 
      title: 'Finanzas', 
      description: 'Contabilidad general, cuentas por cobrar y pagar.', 
      icon: 'account_balance', 
      color: '#059669' 
    },
    { 
      title: 'RRHH', 
      description: 'Gestión de empleados, nóminas y contrataciones.', 
      icon: 'people', 
      color: '#d97706' 
    },
    { 
      title: 'Producción', 
      description: 'Planificación de órdenes de trabajo y control de calidad.', 
      icon: 'factory', 
      color: '#be185d' 
    }
  ];
}
