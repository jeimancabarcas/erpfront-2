import { Component, signal, inject, computed } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { DashboardLayoutComponent } from './components/templates/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DashboardLayoutComponent],
  template: `
    @if (isAuthRoute()) {
      <app-dashboard-layout />
    } @else {
      <router-outlet />
    }
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('erpfrontend');
  private router = inject(Router);

  private readonly urlSignal = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isAuthRoute = computed(() => {
    return !this.urlSignal().startsWith('/login');
  });
}
