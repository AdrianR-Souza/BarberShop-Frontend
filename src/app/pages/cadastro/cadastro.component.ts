import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService } from '../../core/services/usuario.service';
import { ErroApi } from '../../core/models/models';
import { cpfValidator } from '../../core/utils/cpf';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  readonly carregando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  // Erros de validação que vêm por campo (ex: {"cpf": "deve ter 11 dígitos"}),
  // no mesmo formato que o GlobalExceptionHandler do backend já devolve.
  readonly errosPorCampo = signal<ErroApi>({});

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/), cpfValidator()]],
    telefone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    senha: ['', [Validators.required, Validators.minLength(8)]]
  });

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erroGeral.set(null);
    this.errosPorCampo.set({});
    this.carregando.set(true);

    const dados = this.form.getRawValue();

    this.usuarioService
      .cadastrar({
        nome: dados.nome!,
        email: dados.email!,
        cpf: dados.cpf!,
        telefone: dados.telefone!,
        senha: dados.senha!,
        role: 'ROLE_CLIENTE'
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], { queryParams: { cadastroOk: '1' } });
        },
        error: (err: HttpErrorResponse) => {
          this.carregando.set(false);

          if (err.status === 400 && err.error) {
            // Erro de validação de formato: {campo: mensagem}
            this.errosPorCampo.set(err.error as ErroApi);
          } else if (err.status === 409 && err.error?.mensagem) {
            // Erro de duplicidade: {mensagem: "..."}
            this.erroGeral.set(err.error.mensagem);
          } else {
            this.erroGeral.set('Não foi possível criar a conta agora. Tenta de novo em instantes.');
          }
        }
      });
  }
}
