import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { DashboardPageComponent } from './components/pages/dashboard-page/dashboard-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
