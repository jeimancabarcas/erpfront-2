import { Component } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { CardAtom } from '../../atoms/card/card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DashboardLayoutComponent, CardAtom],
  template: `
    <app-dashboard-layout>
      <header class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">Bienvenido al Panel de Control</h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Gestiona todos tus módulos y servicios desde aquí.</p>
      </header>

      <!-- Modules Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (module of modules; track module.title) {
          <ui-card padding="0" class="rounded-[28px] border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer group overflow-hidden bg-white dark:bg-gray-800/80">
            <div class="p-8">
              <div class="w-14 h-14 [background:{{module.color}}15] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300">
                <span class="material-icons text-[28px]" [style.color]="module.color">{{module.icon}}</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{{module.title}}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{{module.description}}</p>
              
              <div class="flex items-center text-xs font-bold uppercase tracking-wider" [style.color]="module.color">
                Acceder al módulo
                <span class="material-icons text-sm ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </div>
          </ui-card>
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
