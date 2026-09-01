import { Agendamento } from '../models/models';

const ROTULOS: Record<Agendamento['status'], string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído'
};

export function rotuloStatusAgendamento(status: Agendamento['status']): string {
  return ROTULOS[status];
}
