import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Telas só pra quem NÃO está logado (login, cadastro, recuperar senha):
// quem já tem sessão válida vai direto pro Agendar em vez de ver o formulário.
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? router.createUrlTree(['/agendar']) : true;
};
