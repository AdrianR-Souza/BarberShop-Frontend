export type Role = 'ROLE_CLIENTE' | 'ROLE_BARBEIRO' | 'ROLE_MASTER';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  role: Role;
}

// Corpo enviado ao POST /usuarios
export interface UsuarioCadastro {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export interface Servico {
  id: number;
  nomeServico: string;
  duracaoServico: number;
  precoServico: number;
}

// Corpo enviado ao POST /agenda
export interface AgendamentoRequest {
  clienteId: number;
  barbeiroId: number;
  servicoId: number;
  dataHoraInicio: string; // formato ISO, ex: "2026-08-20T14:30:00"
}

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';

export interface Agendamento {
  id: number;
  cliente: Usuario;
  barbeiro: Usuario;
  servico: Servico;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: StatusAgendamento;
}

// Mensagem de erro padrão devolvida pelo GlobalExceptionHandler:
// tanto os erros de validação ({campo: mensagem}) quanto os de negócio ({mensagem: "..."})
export interface ErroApi {
  [chave: string]: string;
}

export interface EsqueciSenhaRequest {
  email: string;
}

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
}

export interface RedefinirSenhaPorCpfRequest {
  cpf: string;
  telefone: string;
  novaSenha: string;
}

export interface MensagemResponse {
  mensagem: string;
}

export interface CadastroBarbeiro {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface ResumoServico {
  nomeServico: string;
  quantidade: number;
  valorTotal: number;
}

export interface ResumoBarbeiro {
  nomeBarbeiro: string;
  quantidade: number;
}

export interface RelatorioServicos {
  periodoInicio: string;
  periodoFim: string;
  totalConcluidos: number;
  valorTotal: number;
  porServico: ResumoServico[];
  porBarbeiro: ResumoBarbeiro[];
}
