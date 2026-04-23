import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../../organisms/navbar/navbar.component';
import { SidebarComponent } from '../../organisms/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [MatSidenavModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col bg-gray-50">
      <app-navbar />

      <mat-sidenav-container class="flex-1 !bg-transparent">
        <mat-sidenav mode="side" opened class="!border-none !bg-transparent !w-64 hidden lg:block">
          <app-sidebar />
        </mat-sidenav>

        <mat-sidenav-content class="!p-8">
          <div class="max-w-7xl mx-auto">
            <ng-content />
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .mat-drawer-container {
      background-color: transparent !important;
    }
  `]
})
export class DashboardLayoutComponent {}
