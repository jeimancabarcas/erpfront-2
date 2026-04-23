import { Component, inject, input, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { LogoComponent } from '../../atoms/logo/logo.component';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule, 
    MatBadgeModule,
    LogoComponent,
    RouterLink
  ],
  template: `
    <mat-toolbar class="!bg-white !border-b !border-gray-100 !px-4 md:!px-6 flex justify-between items-center !h-[64px] shadow-sm sticky top-0 z-50">
      <div class="flex items-center gap-2 md:gap-4">
        @if (showMenuButton()) {
          <button mat-icon-button (click)="toggleSidebar.emit()" class="!text-gray-600">
            <mat-icon>menu</mat-icon>
          </button>
        }
        <app-logo />
      </div>

      <div class="flex items-center gap-1 md:gap-2">
        <!-- Notifications -->
        <button mat-icon-button class="!text-gray-600 hover:!bg-gray-100 transition-colors">
          <mat-icon matBadge="3" matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
        </button>

        <!-- User Menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="!px-2 md:!px-3 !h-10 !rounded-full hover:!bg-gray-100 transition-colors">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <span class="hidden sm:block text-sm font-medium text-gray-700">John Doe</span>
            <mat-icon class="!text-gray-400 !m-0 !w-5 !h-5 !text-[20px]">expand_more</mat-icon>
          </div>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before" class="!rounded-[28px] !mt-2 !shadow-2xl !border !border-gray-100">
          <div class="px-6 py-4 border-b border-gray-100">
            <p class="text-sm font-bold text-gray-900">John Doe</p>
            <p class="text-xs text-gray-500">admin@erp.com</p>
          </div>
          <button mat-menu-item class="!py-2" routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Mi Perfil</span>
          </button>
          <button mat-menu-item class="!py-2">
            <mat-icon>settings</mat-icon>
            <span>Configuración</span>
          </button>
          <div class="border-t border-gray-100 my-1"></div>
          <button mat-menu-item class="!text-red-600 !py-2" (click)="logout()">
            <mat-icon class="!text-red-600">logout</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .mat-mdc-menu-panel {
      min-width: 200px !important;
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  showMenuButton = input<boolean>(false);
  toggleSidebar = output<void>();

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
