export type StatusAtendimento = "Agendado" | "Em Andamento" | "Pendente" | "Realizado";

export interface ProdutoAtendimentoPayload {
    ID_produto: string | number;
    quantidade_utilizada?: number;
}

export interface Atendimento {
    ID_atendimento: string | number;
    data_atendimento: string;
    status_atendimento: StatusAtendimento;
    total_atendimento: string | number;
    descri_atendimento: string;
    nome_cliente: string | null;
    telefone_cliente: string | null;
    quantidade_produtos: string | number;
}

export interface AtendimentoCriado {
    id: string | number;
    data: string;
    status: StatusAtendimento;
    total: number;
    descricao: string;
    idCliente: string | number;
    idUsuario: string | number;
    quantidadeProdutos: number;
}

export interface AtendimentoCompleto {
    id: string | number;
    data: string;
    status: StatusAtendimento;
    total: number;
    descricao: string;
    cliente: {
        id: string | number;
        nome: string;
        telefone: string;
        email: string;
    };
    usuario: {
        id: string | number;
        nome: string;
    };
    produtos: Array<{
        id: string | number;
        nome: string;
        valor: number;
        quantidade: number;
        unidade: string;
    }>;
}

export interface CadastroAtendimentoDados {
    data_atendimento: string;
    status_atendimento: StatusAtendimento;
    total_atendimento: number;
    descri_atendimento: string;
    ID_cliente?: string | number;
    fk_cliente_atendimento?: string | number;
    produtos?: ProdutoAtendimentoPayload[];
}

export interface AtualizarAtendimentoDados {
    data_atendimento?: string;
    status_atendimento?: StatusAtendimento;
    total_atendimento?: number;
    descri_atendimento?: string;
    ID_cliente?: string | number;
    fk_cliente_atendimento?: string | number;
    produtos?: ProdutoAtendimentoPayload[];
}

export interface CadastroAtendimentoResponse {
    mensagem: string;
    atendimento: AtendimentoCriado;
}

export interface ListarAtendimentosResponse {
    total: number;
    atendimentos: Atendimento[];
}

export interface ObterAtendimentoResponse {
    atendimento: AtendimentoCompleto;
}

export interface AtualizarAtendimentoResponse {
    mensagem: string;
    ID_atendimento: string | number;
}

export interface DeletarAtendimentoResponse {
    mensagem: string;
}
