import { Routes } from '@angular/router';
import { PatientsPageComponent } from './components/pages/patients-page/patients-page.component';
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
    path: 'pediatrics/patients/:id', 
    loadComponent: () => import('./components/pages/patient-detail-page/patient-detail-page.component').then(m => m.PatientDetailPageComponent) 
  },
  { 
    path: 'pediatrics/patients/:id/consultation/new', 
    loadComponent: () => import('./components/pages/consultation-page/consultation-page.component').then(m => m.ConsultationPageComponent) 
  },
  { 
    path: 'pediatrics/agenda', 
    loadComponent: () => import('./components/pages/agenda-page/agenda-page.component').then(m => m.AgendaPageComponent) 
  },
  { 
    path: 'pediatrics/billing', 
    loadComponent: () => import('./components/pages/billing-page/billing-page.component').then(m => m.BillingPageComponent) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
