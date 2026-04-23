import { Component } from '@angular/core';
import { LogoComponent } from '../../atoms/logo/logo.component';
import { LoginFormComponent } from '../../molecules/login-form/login-form.component';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [LogoComponent, LoginFormComponent],
  template: `
    <div class="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 w-full max-w-md mx-auto">
      <div class="flex flex-col items-center mb-10">
        <app-logo class="mb-8" />
        <h1 class="text-[22px] leading-7 font-bold text-gray-900 tracking-tight">Bienvenido de nuevo</h1>
        <p class="text-sm text-gray-500 mt-2 font-medium">Ingresa tus credenciales para acceder</p>
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
