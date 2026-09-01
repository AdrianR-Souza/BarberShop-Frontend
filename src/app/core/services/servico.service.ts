import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servico } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private readonly baseUrl = `${environment.apiUrl}/servicos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.baseUrl);
  }
}
