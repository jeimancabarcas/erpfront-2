import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const profileGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Si el usuario es admin y no ha completado su perfil, redirigir a completar perfil
  if (user.role === 'admin' && !user.isProfileCompleted) {
    if (state.url === '/complete-profile') {
      return true;
    }
    router.navigate(['/complete-profile']);
    return false;
  }

  // Si ya completó perfil e intenta ir a /complete-profile, redirigir al dashboard
  if (user.isProfileCompleted && state.url === '/complete-profile') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
