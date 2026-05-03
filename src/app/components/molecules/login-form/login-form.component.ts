import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-5 w-full">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Correo Electrónico</mat-label>
        <input 
          matInput 
          type="email" 
          placeholder="ejemplo@correo.com" 
          [(ngModel)]="email"
          name="email"
          required
        />
      </mat-form-field>
      
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Contraseña</mat-label>
        <input 
          matInput 
          type="password" 
          placeholder="••••••••" 
          [(ngModel)]="password"
          name="password"
          required
        />
      </mat-form-field>

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
    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
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
