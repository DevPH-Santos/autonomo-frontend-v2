export type TipoLembrete = "Pagamento" | "Atendimento" | "Manutenção" | "Pessoal";
export type StatusLembrete = "Pendente" | "Concluído" | "Atrasado";
export type PrioridadeLembrete = "Alta" | "Média" | "Baixa";

export interface Lembrete {
  id: string | number;
  titulo: string;
  descricao: string;
  tipo: TipoLembrete;
  status: StatusLembrete;
  prioridade: PrioridadeLembrete;
  data: string;
}

export interface LembretePayload {
  titulo: string;
  descricao: string;
  tipo: TipoLembrete;
  status?: StatusLembrete;
  prioridade: PrioridadeLembrete;
  data: string;
}

export interface AtualizarLembreteDados {
  titulo?: string;
  descricao?: string;
  tipo?: TipoLembrete;
  status?: StatusLembrete;
  prioridade?: PrioridadeLembrete;
  data?: string;
}

export interface ListarLembretesResponse {
  total: number;
  lembretes: Lembrete[];
}

export interface ObterLembreteResponse {
  lembrete: Lembrete;
}

export interface CadastroLembreteResponse {
  mensagem?: string;
  lembrete: Lembrete;
}

export interface AtualizarLembreteResponse {
  mensagem?: string;
  lembrete?: Lembrete;
  id?: string | number;
}

export interface DeletarLembreteResponse {
  mensagem?: string;
}

export interface AtualizarStatusLembreteResponse {
  mensagem?: string;
  id: string | number;
  status: StatusLembrete;
}
