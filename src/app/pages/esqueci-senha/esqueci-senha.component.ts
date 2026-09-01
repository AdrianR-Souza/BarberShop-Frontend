import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SenhaService } from '../../core/services/senha.service';

function senhasIguaisValidator(grupo: AbstractControl): ValidationErrors | null {
  const novaSenha = grupo.get('novaSenha')?.value;
  const confirmarSenha = grupo.get('confirmarSenha')?.value;
  return novaSenha === confirmarSenha ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.css'
})
export class EsqueciSenhaComponent {
  private fb = inject(FormBuilder);
  private senhaService = inject(SenhaService);
  private router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  form = this.fb.group(
    {
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
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

    const { cpf, telefone, novaSenha } = this.form.getRawValue();

    this.senhaService.redefinirSenhaPorCpf(cpf!, telefone!, novaSenha!).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { senhaRedefinida: '1' } });
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        if (err.status === 429) {
          this.erro.set('Muitas tentativas em pouco tempo. Aguarde um pouco antes de tentar de novo.');
        } else if (err.status === 400 && err.error?.mensagem) {
          this.erro.set(err.error.mensagem);
        } else {
          this.erro.set('Não foi possível redefinir a senha agora. Tenta de novo em instantes.');
        }
      }
    });
  }
}
