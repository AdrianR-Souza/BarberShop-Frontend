import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agendamento, AgendamentoRequest, RelatorioServicos } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly baseUrl = `${environment.apiUrl}/agenda`;

  constructor(private http: HttpClient) {}

  criar(request: AgendamentoRequest): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.baseUrl, request);
  }

  listarHorariosDisponiveis(barbeiroId: number, servicoId: number, data: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/horarios-disponiveis`, {
      params: { barbeiroId, servicoId, data }
    });
  }

  listarTodos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos`);
  }

  listarMeusAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/meus-agendamentos`);
  }

  listarMinhaAgendaDoDia(data: string): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/minha-agenda`, { params: { data } });
  }

  cancelar(id: number): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  confirmar(id: number): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.baseUrl}/${id}/confirmar`, {});
  }

  concluir(id: number): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.baseUrl}/${id}/concluido`, {});
  }

  gerarRelatorio(inicio: string, fim: string): Observable<RelatorioServicos> {
    return this.http.get<RelatorioServicos>(`${this.baseUrl}/relatorio`, { params: { inicio, fim } });
  }
}
