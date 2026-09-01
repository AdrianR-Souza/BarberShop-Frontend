import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SenhaService } from '../../core/services/senha.service';

function senhasIguaisValidator(grupo: AbstractControl): ValidationErrors | null {
  const novaSenha = grupo.get('novaSenha')?.value;
  const confirmarSenha = grupo.get('confirmarSenha')?.value;
  return novaSenha === confirmarSenha ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.css'
})
export class RedefinirSenhaComponent {
  private fb = inject(FormBuilder);
  private senhaService = inject(SenhaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly carregando = signal(false);
  readonly sucesso = signal(false);
  readonly erro = signal<string | null>(null);

  form = this.fb.group(
    {
      token: [this.route.snapshot.queryParamMap.get('token') ?? '', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(8)]],
      confirmarSenha: ['', [Validators.required]]
    },
    { validators: senhasIguaisValidator }
  );

  redefinir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    const { token, novaSenha } = this.form.getRawValue();

    this.senhaService.redefinirSenha(token!, novaSenha!).subscribe({
      next: () => {
        this.carregando.set(false);
        this.sucesso.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.erro.set(
          err.status === 429
            ? 'Muitas tentativas em pouco tempo. Aguarde um pouco antes de tentar de novo.'
            : (err.error?.mensagem ?? 'Não foi possível redefinir a senha agora. Tenta de novo em instantes.')
        );
      }
    });
  }
}
