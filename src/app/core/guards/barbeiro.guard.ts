import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const barbeiroGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.role();
  if (auth.isLoggedIn() && (role === 'ROLE_BARBEIRO' || role === 'ROLE_MASTER')) {
    return true;
  }

  router.navigate(['/agendar']);
  return false;
};
