import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
        <span class="text-white font-bold text-xl">E</span>
      </div>
      <span class="text-2xl font-bold tracking-tight text-gray-900">ERP<span class="text-indigo-600">Core</span></span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LogoComponent {}
