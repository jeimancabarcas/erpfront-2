import { Component, signal } from '@angular/core';
import { ButtonAtom } from '../../atoms/button/button.component';
import { ProfilePersonalMolecule } from '../../molecules/profile-personal/profile-personal.component';
import { ProfileAccountMolecule } from '../../molecules/profile-account/profile-account.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ButtonAtom,
    ProfilePersonalMolecule, 
    ProfileAccountMolecule
  ],
  template: `
      <header class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Mi Perfil</h1>
        <p class="text-gray-500 font-medium">Gestiona tu información personal y configuración de seguridad.</p>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <!-- Tab Navigation -->
        <div class="flex border-b border-gray-100 bg-white">
          <ui-button
            [variant]="activeTab() === 0 ? 'primary' : 'ghost'"
            (clicked)="activeTab.set(0)"
            class="flex items-center gap-3 py-4 px-6 rounded-none"
          >
            <span class="material-icons text-[20px]">person</span>
            <span class="text-sm font-bold tracking-wide">Información Personal</span>
          </ui-button>
          <ui-button
            [variant]="activeTab() === 1 ? 'primary' : 'ghost'"
            (clicked)="activeTab.set(1)"
            class="flex items-center gap-3 py-4 px-6 rounded-none"
          >
            <span class="material-icons text-[20px]">security</span>
            <span class="text-sm font-bold tracking-wide">Cuenta y Seguridad</span>
          </ui-button>
        </div>

        <!-- Tab Content -->
        @if (activeTab() === 0) {
          <div class="p-8 md:p-12">
            <app-profile-personal />
          </div>
        } @else {
          <div class="p-8 md:p-12">
            <app-profile-account />
          </div>
        }
      </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProfilePageComponent {
  activeTab = signal(0);
}
