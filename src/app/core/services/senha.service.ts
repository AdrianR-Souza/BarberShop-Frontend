import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MensagemResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SenhaService {
  private readonly baseUrl = `${environment.apiUrl}/senha`;

  constructor(private http: HttpClient) {}

  esqueciSenha(email: string): Observable<MensagemResponse> {
    return this.http.post<MensagemResponse>(`${this.baseUrl}/esqueci`, { email });
  }

  redefinirSenha(token: string, novaSenha: string): Observable<MensagemResponse> {
    return this.http.post<MensagemResponse>(`${this.baseUrl}/redefinir`, { token, novaSenha });
  }

  redefinirSenhaPorCpf(cpf: string, telefone: string, novaSenha: string): Observable<MensagemResponse> {
    return this.http.post<MensagemResponse>(`${this.baseUrl}/redefinir-por-cpf`, { cpf, telefone, novaSenha });
  }
}
