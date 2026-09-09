import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { AgendaService } from '../../core/services/agenda.service';
import { Agendamento, Usuario } from '../../core/models/models';
import { rotuloStatusAgendamento } from '../../core/utils/status-agendamento';
import { dataLocalISO } from '../../core/utils/data';

@Component({
  selector: 'app-agenda-geral',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './agenda-geral.component.html',
  styleUrl: './agenda-geral.component.css'
})
export class AgendaGeralComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private agendaService = inject(AgendaService);

  rotuloStatus = rotuloStatusAgendamento;

  private hoje = dataLocalISO();

  readonly carregandoAgenda = signal(false);
  readonly erroAgenda = signal<string | null>(null);
  readonly barbeiros = signal<Usuario[]>([]);
  readonly todosOsAgendamentos = signal<Agendamento[]>([]);
  readonly filtroBarbeiroId = signal<string>('');
  readonly filtroData = signal<string>(this.hoje);

  ngOnInit(): void {
    this.usuarioService.listarBarbeiros().subscribe({
      next: (barbeiros) => this.barbeiros.set(barbeiros)
    });
    this.carregarAgendaGeral();

    const params = new URLSearchParams(window.location.search);
    if (params.get('pendentes') === '1') {
      this.filtroData.set('');
    }
  }

  mudarFiltroBarbeiro(barbeiroId: string): void {
    this.filtroBarbeiroId.set(barbeiroId);
  }

  mudarFiltroData(data: string): void {
    this.filtroData.set(data);
  }

  limparFiltroData(): void {
    this.filtroData.set('');
  }

  private carregarAgendaGeral(): void {
    this.erroAgenda.set(null);
    this.carregandoAgenda.set(true);

    this.agendaService.listarTodos().subscribe({
      next: (agendamentos) => {
        this.carregandoAgenda.set(false);
        this.todosOsAgendamentos.set(agendamentos);
      },
      error: () => {
        this.carregandoAgenda.set(false);
        this.erroAgenda.set('Não deu pra carregar a agenda agora. Tenta de novo em instantes.');
      }
    });
  }

  agendaFiltrada(): Agendamento[] {
    const barbeiroId = this.filtroBarbeiroId();
    const data = this.filtroData();

    return this.todosOsAgendamentos()
      .filter((a) => !barbeiroId || String(a.barbeiro.id) === barbeiroId)
      .filter((a) => !data || a.dataHoraInicio.startsWith(data))
      .sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio));
  }

  confirmar(id: number): void {
    this.agendaService.confirmar(id).subscribe({
      next: () => this.carregarAgendaGeral(),
      error: () => this.erroAgenda.set('Não foi possível confirmar esse agendamento agora.')
    });
  }

  cancelar(id: number): void {
    this.agendaService.cancelar(id).subscribe({
      next: () => this.carregarAgendaGeral(),
      error: () => this.erroAgenda.set('Não foi possível cancelar esse agendamento agora.')
    });
  }

  concluir(id: number): void {
    this.agendaService.concluir(id).subscribe({
      next: () => this.carregarAgendaGeral(),
      error: () => this.erroAgenda.set('Não foi possível concluir esse agendamento agora.')
    });
  }
}
