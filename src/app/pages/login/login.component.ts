import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly mensagemSucesso = signal(this.calcularMensagemSucesso());

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    this.auth.login(this.form.getRawValue() as { email: string; senha: string }).subscribe({
      next: () => {
        this.router.navigate(['/agendar']);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        // Login com credenciais erradas hoje volta um corpo "cru" do Spring Security
        // (ver pendência no backlog: customizar essa mensagem no GlobalExceptionHandler).
        this.erro.set(
          err.status === 401 || err.status === 403
            ? 'Email ou senha incorretos.'
            : 'Não foi possível entrar agora. Tenta de novo em instantes.'
        );
      }
    });
  }

  private calcularMensagemSucesso(): string | null {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('senhaRedefinida') === '1') {
      return 'Senha redefinida com sucesso! Entra com a sua senha nova.';
    }
    if (params.get('cadastroOk') === '1') {
      return 'Conta criada com sucesso! Já pode entrar.';
    }
    return null;
  }
}
