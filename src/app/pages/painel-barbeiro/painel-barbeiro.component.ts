import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AgendaService } from '../../core/services/agenda.service';
import { Agendamento, BloqueioAgenda } from '../../core/models/models';
import { rotuloStatusAgendamento } from '../../core/utils/status-agendamento';
import { dataLocalISO } from '../../core/utils/data';
import { formatarTelefone } from '../../core/utils/telefone';

@Component({
  selector: 'app-painel-barbeiro',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './painel-barbeiro.component.html',
  styleUrl: './painel-barbeiro.component.css'
})
export class PainelBarbeiroComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private fb = inject(FormBuilder);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly agenda = signal<Agendamento[]>([]);
  readonly data = signal(dataLocalISO());

  rotuloStatus = rotuloStatusAgendamento;
  formatarTelefone = formatarTelefone;

  readonly bloqueios = signal<BloqueioAgenda[]>([]);
  readonly cadastrandoBloqueio = signal(false);
  readonly erroBloqueio = signal<string | null>(null);

  formBloqueio = this.fb.group({
    dataInicio: ['', Validators.required],
    horaInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
    horaFim: ['', Validators.required],
    motivo: ['']
  });

  ngOnInit(): void {
    this.carregarAgenda();
    this.carregarBloqueios();
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

  private carregarBloqueios(): void {
    this.agendaService.listarMeusBloqueios().subscribe({
      next: (bloqueios) => this.bloqueios.set(bloqueios)
    });
  }

  criarBloqueio(): void {
    if (this.formBloqueio.invalid) {
      this.formBloqueio.markAllAsTouched();
      return;
    }

    this.erroBloqueio.set(null);
    this.cadastrandoBloqueio.set(true);

    const { dataInicio, horaInicio, dataFim, horaFim, motivo } = this.formBloqueio.getRawValue();

    this.agendaService
      .criarBloqueio({
        dataHoraInicio: `${dataInicio}T${horaInicio}:00`,
        dataHoraFim: `${dataFim}T${horaFim}:00`,
        motivo: motivo || undefined
      })
      .subscribe({
        next: () => {
          this.cadastrandoBloqueio.set(false);
          this.formBloqueio.reset();
          this.carregarBloqueios();
        },
        error: (err: HttpErrorResponse) => {
          this.cadastrandoBloqueio.set(false);
          if (err.status === 409 && err.error?.mensagem) {
            this.erroBloqueio.set(err.error.mensagem);
          } else {
            this.erroBloqueio.set('Não foi possível fechar a agenda nesse período agora.');
          }
        }
      });
  }

  removerBloqueio(id: number): void {
    this.agendaService.removerBloqueio(id).subscribe({
      next: () => this.carregarBloqueios(),
      error: () => this.erroBloqueio.set('Não foi possível remover esse bloqueio agora.')
    });
  }
}
