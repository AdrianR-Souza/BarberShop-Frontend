import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servico, ServicoCadastro } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private readonly baseUrl = `${environment.apiUrl}/servicos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.baseUrl);
  }

  cadastrar(servico: ServicoCadastro): Observable<Servico> {
    return this.http.post<Servico>(this.baseUrl, servico);
  }

  atualizar(id: number, servico: ServicoCadastro): Observable<Servico> {
    return this.http.put<Servico>(`${this.baseUrl}/${id}`, servico);
  }
}
