import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAuthenticated is a signal, so we need to call it to get its value
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page if not authenticated
  return router.parseUrl('/auth');
};