export interface Cliente {
    ID_cliente: string;
    nome_cliente: string;
    email_cliente: string;
    telefone_cliente: string;
    endereco_cliente: string;
    bairro_cliente: string;
    tipo_contratacao_cliente: string;
    frequencia_cliente: string;
    valor_visita_cliente: string;
    status_cliente: string;
    observacao_cliente: string;
}

export interface CadastroClienteResponse {
    mensagem: string;
    cliente: Cliente;
}

export interface ListarClientesResponse {
    total: number;
    clientes: Cliente[];
}

export interface ObterClienteResponse {
    cliente: Cliente;
}

export interface AtualizarClienteResponse {
    mensagem: string;
    ID_cliente: string;
}

export interface DeletarClienteResponse {
    mensagem: string;
}
