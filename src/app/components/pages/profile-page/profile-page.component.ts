import { Component } from '@angular/core';
import { DashboardLayoutComponent } from '../../templates/dashboard-layout/dashboard-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ProfilePersonalMolecule } from '../../molecules/profile-personal/profile-personal.component';
import { ProfileAccountMolecule } from '../../molecules/profile-account/profile-account.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent, 
    MatTabsModule, 
    MatIconModule, 
    ProfilePersonalMolecule, 
    ProfileAccountMolecule
  ],
  template: `
    <app-dashboard-layout>
      <header class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Mi Perfil</h1>
        <p class="text-gray-500 font-medium">Gestiona tu información personal y configuración de seguridad.</p>
      </header>

      <div class="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <mat-tab-group class="profile-tabs" animationDuration="0ms">
          <!-- Personal Info Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="flex items-center gap-3 py-4 px-2">
                <mat-icon class="!text-[20px]">person</mat-icon>
                <span class="text-sm font-bold tracking-wide">Información Personal</span>
              </div>
            </ng-template>
            <div class="p-8 md:p-12">
              <app-profile-personal />
            </div>
          </mat-tab>

          <!-- Account Settings Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="flex items-center gap-3 py-4 px-2">
                <mat-icon class="!text-[20px]">security</mat-icon>
                <span class="text-sm font-bold tracking-wide">Cuenta y Seguridad</span>
              </div>
            </ng-template>
            <div class="p-8 md:p-12">
              <app-profile-account />
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .profile-tabs .mat-mdc-tab-body-wrapper {
      padding: 0;
    }
    ::ng-deep .profile-tabs .mat-mdc-tab-header {
      background-color: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }
    ::ng-deep .profile-tabs .mat-mdc-tab {
      height: 64px;
      opacity: 0.5;
    }
    ::ng-deep .profile-tabs .mat-mdc-tab.mdc-tab--active {
      opacity: 1;
    }
    ::ng-deep .profile-tabs .mat-mdc-tab .mdc-tab__text-label {
      color: inherit !important;
    }
  `]
})
export class ProfilePageComponent {}
