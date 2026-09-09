import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { ServicoService } from '../../core/services/servico.service';
import { AgendaService } from '../../core/services/agenda.service';
import { AuthService } from '../../core/services/auth.service';
import { Agendamento, Servico, Usuario } from '../../core/models/models';
import { rotuloStatusAgendamento } from '../../core/utils/status-agendamento';
import { dataLocalISO } from '../../core/utils/data';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './agendar.component.html',
  styleUrl: './agendar.component.css'
})
export class AgendarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private servicoService = inject(ServicoService);
  private agendaService = inject(AgendaService);
  private auth = inject(AuthService);

  readonly ehMaster = () => this.auth.role() === 'ROLE_MASTER';
  readonly agendamentosPendentes = signal<Agendamento[]>([]);

  readonly carregandoDados = signal(true);
  readonly enviando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);

  readonly barbeiros = signal<Usuario[]>([]);
  readonly servicos = signal<Servico[]>([]);
  readonly meusAgendamentos = signal<Agendamento[]>([]);

  readonly horariosDisponiveis = signal<string[]>([]);
  readonly carregandoHorarios = signal(false);
  readonly erroHorarios = signal<string | null>(null);

  readonly dataMinima = dataLocalISO();

  private meuId: number | null = null;

  form = this.fb.group({
    barbeiroId: ['', Validators.required],
    servicoId: ['', Validators.required],
    data: ['', Validators.required],
    hora: ['', Validators.required],
    paraQuem: ['mim' as 'mim' | 'terceiro', Validators.required],
    nomeTerceiro: [''],
    idadeTerceiro: ['']
  });

  ngOnInit(): void {
    this.carregarTudo();

    this.form.controls.barbeiroId.valueChanges.subscribe(() => this.atualizarHorariosDisponiveis());
    this.form.controls.servicoId.valueChanges.subscribe(() => this.atualizarHorariosDisponiveis());
    this.form.controls.data.valueChanges.subscribe(() => this.atualizarHorariosDisponiveis());

    this.form.controls.paraQuem.valueChanges.subscribe((valor) => this.ajustarValidacaoTerceiro(valor));
    this.ajustarValidacaoTerceiro(this.form.controls.paraQuem.value);
  }

  private ajustarValidacaoTerceiro(paraQuem: 'mim' | 'terceiro' | null): void {
    const nomeCtrl = this.form.controls.nomeTerceiro;
    const idadeCtrl = this.form.controls.idadeTerceiro;

    if (paraQuem === 'terceiro') {
      nomeCtrl.setValidators([Validators.required, Validators.minLength(2)]);
      idadeCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(120)]);
    } else {
      nomeCtrl.clearValidators();
      idadeCtrl.clearValidators();
      nomeCtrl.setValue('', { emitEvent: false });
      idadeCtrl.setValue('', { emitEvent: false });
    }
    nomeCtrl.updateValueAndValidity({ emitEvent: false });
    idadeCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private carregarTudo(): void {
    this.carregandoDados.set(true);

    forkJoin({
      perfil: this.usuarioService.obterMeuPerfil(),
      barbeiros: this.usuarioService.listarBarbeiros(),
      servicos: this.servicoService.listarTodos(),
      agendamentos: this.agendaService.listarMeusAgendamentos()
    }).subscribe({
      next: ({ perfil, barbeiros, servicos, agendamentos }) => {
        this.meuId = perfil.id;
        this.barbeiros.set(barbeiros);
        this.servicos.set(servicos);
        this.meusAgendamentos.set(
          [...agendamentos].sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio))
        );
        this.carregandoDados.set(false);

        if (this.ehMaster()) {
          this.carregarPendentes();
        }
      },
      error: () => {
        this.carregandoDados.set(false);
        this.erroGeral.set('Não deu pra carregar seus dados agora. Recarrega a página em instantes.');
      }
    });
  }

  private carregarPendentes(): void {
    this.agendaService.listarTodos().subscribe({
      next: (todos) => this.agendamentosPendentes.set(todos.filter((a) => a.status === 'PENDENTE'))
    });
  }

  private atualizarHorariosDisponiveis(): void {
    this.form.controls.hora.setValue('', { emitEvent: false });
    this.horariosDisponiveis.set([]);
    this.erroHorarios.set(null);

    const { barbeiroId, servicoId, data } = this.form.getRawValue();
    if (!barbeiroId || !servicoId || !data) {
      return;
    }

    this.carregandoHorarios.set(true);

    this.agendaService.listarHorariosDisponiveis(Number(barbeiroId), Number(servicoId), data).subscribe({
      next: (horarios) => {
        this.carregandoHorarios.set(false);
        this.horariosDisponiveis.set(horarios);
      },
      error: () => {
        this.carregandoHorarios.set(false);
        this.erroHorarios.set('Não deu pra carregar os horários disponíveis agora.');
      }
    });
  }

  selecionarHorario(hora: string): void {
    this.form.controls.hora.setValue(hora);
  }

  agendar(): void {
    if (this.form.invalid || this.meuId === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.erroGeral.set(null);
    this.sucesso.set(null);
    this.enviando.set(true);

    const { barbeiroId, servicoId, data, hora, paraQuem, nomeTerceiro, idadeTerceiro } = this.form.getRawValue();

    this.agendaService
      .criar({
        barbeiroId: Number(barbeiroId),
        servicoId: Number(servicoId),
        dataHoraInicio: `${data}T${hora}:00`,
        ...(paraQuem === 'terceiro'
          ? { nomeTerceiro: nomeTerceiro!.trim(), idadeTerceiro: Number(idadeTerceiro) }
          : {})
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.sucesso.set('Agendamento marcado! Você vai ver ele na lista abaixo.');
          this.form.reset({ paraQuem: 'mim' });
          this.horariosDisponiveis.set([]);
          this.carregarTudo();
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          if (err.status === 409) {
            this.erroGeral.set('Esse horário já está ocupado para esse barbeiro. Escolhe outro.');
            this.atualizarHorariosDisponiveis();
          } else if (err.status === 404) {
            this.erroGeral.set('Barbeiro ou serviço não encontrado. Atualiza a página e tenta de novo.');
          } else {
            this.erroGeral.set('Não foi possível marcar agora. Tenta de novo em instantes.');
          }
        }
      });
  }

  cancelar(id: number): void {
    this.agendaService.cancelar(id).subscribe({
      next: () => this.carregarTudo(),
      error: () => this.erroGeral.set('Não foi possível cancelar esse agendamento agora.')
    });
  }

  rotuloStatus = rotuloStatusAgendamento;
}
