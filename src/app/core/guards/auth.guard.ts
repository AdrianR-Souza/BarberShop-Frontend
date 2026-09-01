import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard funcional: roda antes de entrar numa rota protegida.
// Equivalente, do lado do frontend, ao ".anyRequest().authenticated()" do SecurityConfig:
// sem estar logado, nem chega a ver a tela — é redirecionado pro login.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
