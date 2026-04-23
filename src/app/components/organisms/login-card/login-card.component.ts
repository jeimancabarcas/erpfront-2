import { Component } from '@angular/core';
import { LogoComponent } from '../../atoms/logo/logo.component';
import { LoginFormComponent } from '../../molecules/login-form/login-form.component';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [LogoComponent, LoginFormComponent],
  template: `
    <div class="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-md mx-auto">
      <div class="flex flex-col items-center mb-10">
        <app-logo class="mb-6" />
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Bienvenido de nuevo</h1>
        <p class="text-gray-500 mt-2 font-medium">Ingresa tus credenciales para acceder</p>
      </div>
      
      <app-login-form />
      
      <div class="mt-8 pt-8 border-t border-gray-100 flex justify-center">
        <p class="text-xs text-gray-400 font-medium tracking-wider uppercase">© 2026 ERP Systems</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class LoginCardComponent {}
