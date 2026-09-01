import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { AgendaService } from '../../core/services/agenda.service';
import { Agendamento, ErroApi, RelatorioServicos, Usuario } from '../../core/models/models';
import { rotuloStatusAgendamento } from '../../core/utils/status-agendamento';
import { dataLocalISO } from '../../core/utils/data';

@Component({
  selector: 'app-painel-master',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './painel-master.component.html',
  styleUrl: './painel-master.component.css'
})
export class PainelMasterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private agendaService = inject(AgendaService);

  rotuloStatus = rotuloStatusAgendamento;

  readonly cadastrandoBarbeiro = signal(false);
  readonly erroCadastroBarbeiro = signal<string | null>(null);
  readonly sucessoCadastroBarbeiro = signal<string | null>(null);
  readonly errosPorCampoBarbeiro = signal<ErroApi>({});

  formBarbeiro = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    telefone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    senha: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly carregandoRelatorio = signal(false);
  readonly erroRelatorio = signal<string | null>(null);
  readonly relatorio = signal<RelatorioServicos | null>(null);

  private hoje = dataLocalISO();
  private primeiroDiaDoMes = dataLocalISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  formRelatorio = this.fb.group({
    inicio: [this.primeiroDiaDoMes, Validators.required],
    fim: [this.hoje, Validators.required]
  });

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
    this.gerarRelatorio();
  }

  cadastrarBarbeiro(): void {
    if (this.formBarbeiro.invalid) {
      this.formBarbeiro.markAllAsTouched();
      return;
    }

    this.erroCadastroBarbeiro.set(null);
    this.sucessoCadastroBarbeiro.set(null);
    this.errosPorCampoBarbeiro.set({});
    this.cadastrandoBarbeiro.set(true);

    const dados = this.formBarbeiro.getRawValue();

    this.usuarioService
      .cadastrarBarbeiro({
        nome: dados.nome!,
        email: dados.email!,
        cpf: dados.cpf!,
        telefone: dados.telefone!,
        senha: dados.senha!,
        role: 'ROLE_BARBEIRO'
      })
      .subscribe({
        next: (barbeiro) => {
          this.cadastrandoBarbeiro.set(false);
          this.sucessoCadastroBarbeiro.set(`Barbeiro "${barbeiro.nome}" cadastrado com sucesso.`);
          this.formBarbeiro.reset();
          this.usuarioService.listarBarbeiros().subscribe({ next: (b) => this.barbeiros.set(b) });
        },
        error: (err: HttpErrorResponse) => {
          this.cadastrandoBarbeiro.set(false);
          if (err.status === 400 && err.error) {
            this.errosPorCampoBarbeiro.set(err.error as ErroApi);
          } else if (err.status === 409 && err.error?.mensagem) {
            this.erroCadastroBarbeiro.set(err.error.mensagem);
          } else {
            this.erroCadastroBarbeiro.set('Não foi possível cadastrar agora. Tenta de novo em instantes.');
          }
        }
      });
  }

  gerarRelatorio(): void {
    if (this.formRelatorio.invalid) {
      return;
    }

    this.erroRelatorio.set(null);
    this.carregandoRelatorio.set(true);

    const { inicio, fim } = this.formRelatorio.getRawValue();

    this.agendaService.gerarRelatorio(inicio!, fim!).subscribe({
      next: (relatorio) => {
        this.carregandoRelatorio.set(false);
        this.relatorio.set(relatorio);
      },
      error: () => {
        this.carregandoRelatorio.set(false);
        this.erroRelatorio.set('Não deu pra gerar o relatório agora. Tenta de novo em instantes.');
      }
    });
  }

  mudarFiltroBarbeiro(barbeiroId: string): void {
    this.filtroBarbeiroId.set(barbeiroId);
  }

  mudarFiltroData(data: string): void {
    this.filtroData.set(data);
    this.carregarAgendaGeral();
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
