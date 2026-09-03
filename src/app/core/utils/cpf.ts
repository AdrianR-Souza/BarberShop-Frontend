import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) {
    return false;
  }

  if (new Set(cpf.split('')).size === 1) {
    return false;
  }

  const digito = (base: string, pesos: number[]): number => {
    const soma = base
      .split('')
      .reduce((acc, char, i) => acc + Number(char) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = digito(cpf.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (primeiroDigito !== Number(cpf[9])) {
    return false;
  }

  const segundoDigito = digito(cpf.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return segundoDigito === Number(cpf[10]);
}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (!valor) {
      return null;
    }
    return cpfValido(valor) ? null : { cpfInvalido: true };
  };
}
