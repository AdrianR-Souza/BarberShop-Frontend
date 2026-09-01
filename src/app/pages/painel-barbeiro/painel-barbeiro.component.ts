import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AgendaService } from '../../core/services/agenda.service';
import { Agendamento } from '../../core/models/models';
import { rotuloStatusAgendamento } from '../../core/utils/status-agendamento';
import { dataLocalISO } from '../../core/utils/data';

@Component({
  selector: 'app-painel-barbeiro',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './painel-barbeiro.component.html',
  styleUrl: './painel-barbeiro.component.css'
})
export class PainelBarbeiroComponent implements OnInit {
  private agendaService = inject(AgendaService);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly agenda = signal<Agendamento[]>([]);
  readonly data = signal(dataLocalISO());

  rotuloStatus = rotuloStatusAgendamento;

  ngOnInit(): void {
    this.carregarAgenda();
  }

  mudarData(novaData: string): void {
    this.data.set(novaData);
    this.carregarAgenda();
  }

  carregarAgenda(): void {
    this.erro.set(null);
    this.carregando.set(true);

    this.agendaService.listarMinhaAgendaDoDia(this.data()).subscribe({
      next: (agendamentos) => {
        this.carregando.set(false);
        this.agenda.set([...agendamentos].sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio)));
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Não deu pra carregar a agenda desse dia agora. Tenta de novo em instantes.');
      }
    });
  }

  confirmar(id: number): void {
    this.agendaService.confirmar(id).subscribe({
      next: () => this.carregarAgenda(),
      error: () => this.erro.set('Não foi possível confirmar esse agendamento agora.')
    });
  }

  cancelar(id: number): void {
    this.agendaService.cancelar(id).subscribe({
      next: () => this.carregarAgenda(),
      error: () => this.erro.set('Não foi possível cancelar esse agendamento agora.')
    });
  }

  concluir(id: number): void {
    this.agendaService.concluir(id).subscribe({
      next: () => this.carregarAgenda(),
      error: () => this.erro.set('Não foi possível concluir esse agendamento agora.')
    });
  }
}
