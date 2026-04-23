import { Routes } from '@angular/router';
import { PatientsPageComponent } from './components/pages/patients-page/patients-page.component';
import { ConsultationsPageComponent } from './components/pages/consultations-page/consultations-page.component';
import { AgendaPageComponent } from './components/pages/agenda-page/agenda-page.component';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/pages/login-page/login-page.component').then(m => m.LoginPageComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent) 
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent) 
  },
  { 
    path: 'inventory', 
    loadComponent: () => import('./components/pages/inventory-page/inventory-page.component').then(m => m.InventoryPageComponent) 
  },
  { 
    path: 'sales', 
    loadComponent: () => import('./components/pages/sales-page/sales-page.component').then(m => m.SalesPageComponent) 
  },
  { 
    path: 'pediatrics/patients', 
    loadComponent: () => import('./components/pages/patients-page/patients-page.component').then(m => m.PatientsPageComponent) 
  },
  { 
    path: 'pediatrics/consultations', 
    loadComponent: () => import('./components/pages/consultations-page/consultations-page.component').then(m => m.ConsultationsPageComponent) 
  },
  { 
    path: 'pediatrics/agenda', 
    loadComponent: () => import('./components/pages/agenda-page/agenda-page.component').then(m => m.AgendaPageComponent) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
