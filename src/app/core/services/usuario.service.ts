import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CadastroBarbeiro, Usuario, UsuarioCadastro } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  cadastrar(usuario: UsuarioCadastro): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  cadastrarBarbeiro(barbeiro: CadastroBarbeiro): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/barbeiro`, barbeiro);
  }

  listarBarbeiros(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/barbeiros`);
  }

  // Requer o endpoint GET /usuarios/me no backend — ver instruções de handoff.
  obterMeuPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/me`);
  }
}
