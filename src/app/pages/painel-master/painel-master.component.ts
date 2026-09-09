import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService } from '../../core/services/usuario.service';
import { AgendaService } from '../../core/services/agenda.service';
import { ServicoService } from '../../core/services/servico.service';
import { ErroApi, RelatorioServicos, Servico } from '../../core/models/models';
import { dataLocalISO } from '../../core/utils/data';
import { cpfValidator } from '../../core/utils/cpf';

@Component({
  selector: 'app-painel-master',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './painel-master.component.html',
  styleUrl: './painel-master.component.css'
})
export class PainelMasterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private agendaService = inject(AgendaService);
  private servicoService = inject(ServicoService);

  readonly cadastrandoBarbeiro = signal(false);
  readonly erroCadastroBarbeiro = signal<string | null>(null);
  readonly sucessoCadastroBarbeiro = signal<string | null>(null);
  readonly errosPorCampoBarbeiro = signal<ErroApi>({});

  formBarbeiro = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/), cpfValidator()]],
    telefone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    senha: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly cadastrandoServico = signal(false);
  readonly erroCadastroServico = signal<string | null>(null);
  readonly sucessoCadastroServico = signal<string | null>(null);
  readonly errosPorCampoServico = signal<ErroApi>({});
  readonly servicos = signal<Servico[]>([]);

  formServico = this.fb.group({
    nomeServico: ['', [Validators.required, Validators.minLength(2)]],
    duracaoServico: ['', [Validators.required, Validators.min(1)]],
    precoServico: ['', [Validators.required, Validators.min(0)]]
  });

  readonly editandoServicoId = signal<number | null>(null);
  readonly salvandoServico = signal(false);
  readonly erroEditarServico = signal<string | null>(null);

  formEditarServico = this.fb.group({
    nomeServico: ['', [Validators.required, Validators.minLength(2)]],
    duracaoServico: ['', [Validators.required, Validators.min(1)]],
    precoServico: ['', [Validators.required, Validators.min(0)]]
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

  ngOnInit(): void {
    this.carregarServicos();
    this.gerarRelatorio();
  }

  private carregarServicos(): void {
    this.servicoService.listarTodos().subscribe({
      next: (servicos) => this.servicos.set(servicos)
    });
  }

  cadastrarServico(): void {
    if (this.formServico.invalid) {
      this.formServico.markAllAsTouched();
      return;
    }

    this.erroCadastroServico.set(null);
    this.sucessoCadastroServico.set(null);
    this.errosPorCampoServico.set({});
    this.cadastrandoServico.set(true);

    const dados = this.formServico.getRawValue();

    this.servicoService
      .cadastrar({
        nomeServico: dados.nomeServico!,
        duracaoServico: Number(dados.duracaoServico),
        precoServico: Number(dados.precoServico)
      })
      .subscribe({
        next: (servico) => {
          this.cadastrandoServico.set(false);
          this.sucessoCadastroServico.set(`Serviço "${servico.nomeServico}" cadastrado com sucesso.`);
          this.formServico.reset();
          this.carregarServicos();
        },
        error: (err: HttpErrorResponse) => {
          this.cadastrandoServico.set(false);
          if (err.status === 400 && err.error) {
            this.errosPorCampoServico.set(err.error as ErroApi);
          } else {
            this.erroCadastroServico.set('Não foi possível cadastrar agora. Tenta de novo em instantes.');
          }
        }
      });
  }

  editarServico(servico: Servico): void {
    this.editandoServicoId.set(servico.id);
    this.erroEditarServico.set(null);
    this.formEditarServico.setValue({
      nomeServico: servico.nomeServico,
      duracaoServico: String(servico.duracaoServico),
      precoServico: String(servico.precoServico)
    });
  }

  cancelarEdicaoServico(): void {
    this.editandoServicoId.set(null);
    this.erroEditarServico.set(null);
  }

  salvarEdicaoServico(id: number): void {
    if (this.formEditarServico.invalid) {
      this.formEditarServico.markAllAsTouched();
      return;
    }

    this.erroEditarServico.set(null);
    this.salvandoServico.set(true);

    const dados = this.formEditarServico.getRawValue();

    this.servicoService
      .atualizar(id, {
        nomeServico: dados.nomeServico!,
        duracaoServico: Number(dados.duracaoServico),
        precoServico: Number(dados.precoServico)
      })
      .subscribe({
        next: () => {
          this.salvandoServico.set(false);
          this.editandoServicoId.set(null);
          this.carregarServicos();
        },
        error: () => {
          this.salvandoServico.set(false);
          this.erroEditarServico.set('Não foi possível salvar agora. Tenta de novo em instantes.');
        }
      });
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
        senha: dados.senha!
      })
      .subscribe({
        next: (barbeiro) => {
          this.cadastrandoBarbeiro.set(false);
          this.sucessoCadastroBarbeiro.set(`Barbeiro "${barbeiro.nome}" cadastrado com sucesso.`);
          this.formBarbeiro.reset();
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
}
