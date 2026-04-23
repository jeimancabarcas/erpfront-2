import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-template',
  standalone: true,
  template: `
    <div class="min-h-screen w-full bg-[#f8fafc] relative overflow-hidden flex items-center justify-center p-6">
      <!-- Abstract Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] -z-10"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] -z-10"></div>
      
      <div class="w-full max-w-6xl relative z-10">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AuthTemplateComponent {}
