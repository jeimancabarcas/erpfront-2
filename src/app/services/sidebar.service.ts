import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private router = inject(Router);

  inventoryExpanded = false;
  financeExpanded = false;
  pediatricsExpanded = false;
  comercialExpanded = false;
  abastecimientoExpanded = false;

  constructor() {
    // Listen to router events to auto-expand the section corresponding to the active route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.autoExpandActiveRoute();
      });

    // Check immediately on service initialization
    this.autoExpandActiveRoute();
  }

  private autoExpandActiveRoute() {
    if (this.isInventoryActive()) {
      this.inventoryExpanded = true;
    }
    if (this.isFinanceActive()) {
      this.financeExpanded = true;
    }
    if (this.isPediatricsActive()) {
      this.pediatricsExpanded = true;
    }
    if (this.isComercialActive()) {
      this.comercialExpanded = true;
    }
    if (this.isAbastecimientoActive()) {
      this.abastecimientoExpanded = true;
    }
  }

  private isInventoryActive(): boolean {
    const url = this.router.url;
    const paths = [
      '/inventory',
      '/inventory/categories',
      '/inventory/products',
    ];
    return paths.some((path) => url === path || url.startsWith(path + '/'));
  }

  isAbastecimientoActive(): boolean {
    return this.router.url.startsWith('/abastecimiento');
  }

  isComercialActive(): boolean {
    return this.router.url.startsWith('/comercial');
  }

  private isPediatricsActive(): boolean {
    return this.router.url.includes('/pediatrics');
  }

  private isFinanceActive(): boolean {
    return this.router.url.includes('/finance');
  }
}
