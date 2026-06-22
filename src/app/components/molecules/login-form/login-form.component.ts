import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [MatButtonModule, TextInputComponent],
  template: `
    <div class="flex flex-col gap-5 w-full">
      <ui-text-input type="email" label="Correo Electrónico" icon="email" [value]="email()" (valueChange)="email.set($event)" placeholder="ejemplo@correo.com" />
      
      <ui-text-input type="password" label="Contraseña" icon="lock" [value]="password()" (valueChange)="password.set($event)" placeholder="••••••••" />

      <div class="pt-2">
        <button 
          mat-flat-button 
          color="primary"
          class="w-full !py-6 !text-lg !font-bold !rounded-full transition-all duration-200 active:scale-[0.98]"
          [disabled]="isLoading()"
          (click)="handleLogin()"
        >
          Iniciar Sesión
        </button>
      </div>
      
      @if (error()) {
        <p class="text-red-500 text-sm text-center font-medium mt-2">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  error = signal('');

  handleLogin() {
    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (response) => {
        const user = response.user;
        if (user.role === 'admin' && !user.isProfileCompleted) {
          this.router.navigate(['/complete-profile']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          this.error.set('Credenciales inválidas. Por favor intenta de nuevo.');
        } else {
          this.error.set('Error de conexión con el servidor. Inténtalo más tarde.');
        }
        this.isLoading.set(false);
      }
    });
  }
}
