export type StatusPagamento = "Pago" | "Pendente" | "Atrasado";

export interface Pagamento {
    id: string | number;
    valor: number;
    data: string;
    status: StatusPagamento;
    forma: string;
    observacao: string | null;
    cliente: string;
    telefoneCliente: string;
    atendimento: {
        id: string | number;
        descricao: string;
    };
}

export interface AtualizarPagamentoDados {
    valor_pgto?: number;
    data_pgto?: string;
    status_pgto?: StatusPagamento;
    forma_pgto?: string;
    obs_pgto?: string | null;
}

export interface ListarPagamentosResponse {
    total: number;
    pagamentos: Pagamento[];
}

export interface ObterPagamentoResponse {
    pagamento: Pagamento;
}

export interface AtualizarPagamentoResponse {
    mensagem: string;
    id: string | number;
}

export interface DeletarPagamentoResponse {
    mensagem: string;
}

export interface AtualizarStatusPagamentoResponse {
    mensagem: string;
    id: string | number;
    status: StatusPagamento;
}
