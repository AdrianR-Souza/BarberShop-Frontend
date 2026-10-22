import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/models';

const TOKEN_KEY = 'barbearia_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // signal reativo: componentes podem "ler" isLoggedIn() e a tela atualiza sozinha
  // quando o valor muda (login/logout), sem precisar de subscribe manual.
  readonly isLoggedIn = signal<boolean>(this.temTokenValido());

  readonly role = signal<string | null>(this.extrairRole(this.getToken()));

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, request)
      .pipe(
        tap((resposta) => {
          localStorage.setItem(TOKEN_KEY, resposta.token);
          this.isLoggedIn.set(true);
          this.role.set(this.extrairRole(resposta.token));
        })
      );
  }

  // O token guardado no navegador pode ter sido forjado (qualquer um consegue gravar um
  // JWT falso no localStorage pelo console). A assinatura só é conferida pelo servidor,
  // então a sessão só é considerada válida depois que o backend confirma quem é o usuário.
  // O backend já barrava os dados de qualquer jeito; isso evita mostrar telas de admin
  // (e links no menu) pra quem tem um token falso.
  validarSessao(): Observable<boolean> {
    if (!this.temTokenValido()) {
      this.logout();
      return of(false);
    }

    return this.http.get<{ role: string }>(`${environment.apiUrl}/usuarios/me`).pipe(
      tap((perfil) => {
        this.isLoggedIn.set(true);
        this.role.set(perfil.role);
      }),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.logout();
          return of(false);
        }
        // sem conexão / servidor fora: não derruba a sessão; o backend segue protegendo os dados
        return of(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.role.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Extrai o email de dentro do token (o "subject" que o JwtService coloca lá),
  // sem precisar de biblioteca extra: um JWT é 3 partes em Base64 separadas por ".".
  getEmailLogado(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  private extrairRole(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  private temTokenValido(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // "exp" vem em segundos desde 1970; Date.now() é em milissegundos.
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
