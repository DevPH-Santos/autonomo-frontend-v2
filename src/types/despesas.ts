export interface Despesa {
    id: number
    descricao: string
    categoria: string | null
    valor: number
    data: string
    observacao: string | null
}

export interface CadastroDespesaResponse {
    mensagem: string
    despesa: Despesa
}

export interface ListarDespesasResponse {
    total: number
    despesas: Despesa[]
}

export interface ObterDespesaResponse {
    despesa: Despesa
}

export interface AtualizarDespesaResponse {
    mensagem: string
    id: string
}

export interface DeletarDespesaResponse {
    mensagem: string
}
