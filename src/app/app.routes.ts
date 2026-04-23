import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { DashboardPageComponent } from './components/pages/dashboard-page/dashboard-page.component';
import { ProfilePageComponent } from './components/pages/profile-page/profile-page.component';
import { InventoryPageComponent } from './components/pages/inventory-page/inventory-page.component';
import { SalesPageComponent } from './components/pages/sales-page/sales-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'inventory', component: InventoryPageComponent },
  { path: 'sales', component: SalesPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
