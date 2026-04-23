import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-full bg-white border-r border-gray-100 w-64 flex flex-col py-6">
      <div class="px-6 mb-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
        Menú Principal
      </div>

      <nav class="flex-1 px-4 space-y-1">
        <a 
          mat-list-item 
          routerLink="/dashboard" 
          routerLinkActive="!bg-indigo-50 !text-indigo-700" 
          [routerLinkActiveOptions]="{exact: true}"
          class="!rounded-xl !h-12 hover:!bg-gray-50 transition-all flex items-center group"
        >
          <div class="flex items-center gap-3">
            <mat-icon class="!text-gray-400 group-[.active]:!text-indigo-600">dashboard</mat-icon>
            <span class="font-medium">Inicio</span>
          </div>
        </a>
      </nav>

      <div class="px-6 mt-auto">
        <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Plan</p>
          <p class="text-sm font-bold text-gray-900 mb-2">Empresarial PRO</p>
          <div class="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
            <div class="bg-indigo-600 h-full w-[75%]"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    ::ng-deep .mat-mdc-list-item {
      padding: 0 12px !important;
    }
  `]
})
export class SidebarComponent {}
