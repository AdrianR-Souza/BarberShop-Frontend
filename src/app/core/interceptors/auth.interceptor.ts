import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Interceptor funcional: roda antes de TODA requisição HTTP que sai do app.
// Equivalente, do lado do frontend, ao que o JwtAuthFilter faz no backend:
// intercepta, e se tiver token, anexa no header Authorization.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) {
    return next(req);
  }

  const requisicaoComToken = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(requisicaoComToken);
};
