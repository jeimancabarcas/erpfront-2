import { Component, inject, viewChild, signal, computed } from '@angular/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NavbarComponent } from '../../organisms/navbar/navbar.component';
import { SidebarComponent } from '../../organisms/sidebar/sidebar.component';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [MatSidenavModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <app-navbar (toggleSidebar)="sideNav.toggle()" [showMenuButton]="isMobile()" />

      <mat-sidenav-container class="flex-1 !bg-transparent" autosize>
        <mat-sidenav 
          #sideNav
          [mode]="isMobile() ? 'over' : 'side'" 
          [opened]="!isMobile()"
          class="!border-none !bg-white !w-64 shadow-xl lg:shadow-none"
        >
          <app-sidebar />
        </mat-sidenav>

        <mat-sidenav-content class="!p-6 md:!p-10 overflow-y-auto">
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
    ::ng-deep .mat-drawer-backdrop.mat-drawer-shown {
      background-color: rgba(0, 0, 0, 0.15) !important;
      backdrop-filter: blur(4px);
    }
  `]
})
export class DashboardLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  
  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );
}
