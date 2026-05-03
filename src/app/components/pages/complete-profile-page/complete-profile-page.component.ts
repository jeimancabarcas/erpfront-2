import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complete-profile-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <mat-card class="max-w-md w-full !rounded-[40px] border-none shadow-2xl shadow-indigo-100 overflow-hidden">
        <div class="bg-indigo-600 p-10 text-white text-center">
          <div class="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <mat-icon class="!text-[40px] !w-10 !h-10">admin_panel_settings</mat-icon>
          </div>
          <h1 class="text-2xl font-black tracking-tight mb-2">Completar Perfil</h1>
          <p class="text-indigo-100 text-sm font-medium">Configuración inicial requerida para administradores.</p>
        </div>
        
        <mat-card-content class="p-10 text-center">
          <p class="text-gray-500 mb-8 leading-relaxed">
            Bienvenido, <span class="text-indigo-600 font-bold">{{ currentUser()?.email }}</span>. 
            Como administrador, debes completar tu perfil antes de acceder al ERP.
          </p>
          
          <button mat-flat-button color="primary" (click)="complete()"
                  class="!w-full !h-14 !rounded-2xl !font-black !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
            Completar Ahora
          </button>
          
          <button mat-button (click)="logout()"
                  class="!w-full !h-12 !rounded-2xl !font-bold !text-gray-400 mt-4">
            Cerrar Sesión
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CompleteProfilePageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser = this.authService.currentUser;

  complete() {
    // Simulación de completar perfil
    const user = this.currentUser();
    if (user) {
      const updatedUser = { ...user, isProfileCompleted: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // En un caso real, haríamos un PATCH al backend y luego actualizaríamos el estado
      // Aquí forzamos la recarga o actualizamos el signal si tuviéramos un método
      window.location.href = '/dashboard';
    }
  }

  logout() {
    this.authService.logout();
  }
}
