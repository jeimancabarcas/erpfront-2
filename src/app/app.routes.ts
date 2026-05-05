import { Routes } from '@angular/router';
import { authGuard, profileGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    canActivate: [publicGuard],
    loadComponent: () => import('./components/pages/login-page/login-page.component').then(m => m.LoginPageComponent) 
  },
  {
    path: 'complete-profile',
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/complete-profile-page/complete-profile-page.component').then(m => m.CompleteProfilePageComponent)
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent) 
  },
  { 
    path: 'profile', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent) 
  },
  {
    path: 'inventory', 
    canActivate: [authGuard, profileGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/pages/inventory-page/inventory-page.component').then(m => m.InventoryPageComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/pages/inventory-page/inventory-categories-page/inventory-categories-page.component').then(m => m.InventoryCategoriesPageComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./components/pages/inventory-page/inventory-products-page/inventory-products-page.component').then(m => m.InventoryProductsPageComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./components/pages/inventory-page/inventory-suppliers-page/inventory-suppliers-page.component').then(m => m.InventorySuppliersPageComponent)
      },
      {
        path: 'purchases',
        loadComponent: () => import('./components/pages/inventory-page/inventory-purchases-page/inventory-purchases-page.component').then(m => m.InventoryPurchasesPageComponent)
      }
    ]
  },
  { 
    path: 'sales', 
    canActivate: [authGuard, profileGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/pages/sales-page/sales-page.component').then(m => m.SalesPageComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./components/pages/sales-page/sales-customers-page/sales-customers-page.component').then(m => m.SalesCustomersPageComponent)
      }
    ]
  },
  { 
    path: 'finance',
    canActivate: [authGuard, profileGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/pages/finance-page/finance-page.component').then(m => m.FinancePageComponent)
      },
      {
        path: 'invoicing',
        loadComponent: () => import('./components/pages/finance-page/finance-invoicing-view/finance-invoicing-view.component').then(m => m.FinanceInvoicingViewComponent)
      },
      {
        path: 'adjustments',
        loadComponent: () => import('./components/pages/finance-page/finance-adjustments-view/finance-adjustments-view.component').then(m => m.FinanceAdjustmentsViewComponent)
      }
    ]
  },
  { 
    path: 'pediatrics/patients', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/patients-page/patients-page.component').then(m => m.PatientsPageComponent) 
  },
  { 
    path: 'pediatrics/patients/:id', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/patient-detail-page/patient-detail-page.component').then(m => m.PatientDetailPageComponent) 
  },
  { 
    path: 'pediatrics/patients/:id/consultation/new', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/consultation-page/consultation-page.component').then(m => m.ConsultationPageComponent) 
  },
  { 
    path: 'pediatrics/agenda', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/agenda-page/agenda-page.component').then(m => m.AgendaPageComponent) 
  },
  { 
    path: 'pediatrics/billing', 
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/billing-page/billing-page.component').then(m => m.BillingPageComponent) 
  },
  {
    path: 'transport',
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/transport-page/transport-page.component').then(m => m.TransportPageComponent)
  },
  {
    path: 'transport/vehicle/:id',
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/transport-page/vehicle-detail-page/vehicle-detail-page.component').then(m => m.TransportVehicleDetailPageComponent)
  },
  {
    path: 'transport/service/:id',
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./components/pages/transport-page/service-detail-page/service-detail-page.component').then(m => m.TransportServiceDetailPageComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
