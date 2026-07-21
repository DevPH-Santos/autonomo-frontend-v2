import { apiFetch } from "./api";
import { obterUsuarioLogado } from "./authService";

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

/**
 * Resposta ao cadastrar um cliente
 */
export interface CadastroResponse {
    mensagem: string;
    cliente: Cliente;
}

/**
 * Resposta ao listar clientes
 */
export interface ListarResponse {
    total: number;
    clientes: Cliente[];
}

/**
 * Resposta ao obter um cliente
 */
export interface ObterResponse {
    cliente: Cliente;
}

/**
 * Resposta ao atualizar um cliente
 */
export interface AtualizarResponse {
    mensagem: string;
    ID_cliente: string;
}

/**
 * Resposta ao deletar um cliente
 */
export interface DeletarResponse {
    mensagem: string;
}

/**
 * Cadastra um novo cliente no sistema.
 *
 * @param {Object} dados - Objeto contendo os dados do cliente
 * @returns {Promise<CadastroResponse>} Retorna mensagem e dados do cliente criado
 */
export function cadastrarCliente(dados: {
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
}): Promise<CadastroResponse> {

    const usuarioLogado = obterUsuarioLogado()

    if(!usuarioLogado){
        throw new Error("Usuário não autenticado")
    }

    return apiFetch<CadastroResponse>("/clientes", {
        method: "POST",
        body: JSON.stringify({...dados, fk_usuario_cliente: usuarioLogado.id}),
    });
}

/**
 * Lista todos os clientes cadastrados.
 *
 * @returns {Promise<ListarResponse>} Retorna lista de clientes e total
 */
export function listarClientes(): Promise<ListarResponse> {
    return apiFetch<ListarResponse>("/clientes", {
        method: "GET",
    });
}

/**
 * Obtém um cliente específico pelo ID.
 *
 * @param {string} ID_cliente - ID do cliente
 * @returns {Promise<ObterResponse>} Retorna dados do cliente
 */
export function obterCliente(ID_cliente: string): Promise<ObterResponse> {
    return apiFetch<ObterResponse>(`/clientes/${ID_cliente}`, {
        method: "GET",
    });
}

/**
 * Atualiza dados de um cliente.
 *
 * @param {string} ID_cliente - ID do cliente
 * @param {Partial<Cliente>} dados - Dados a atualizar (pode ser parcial)
 * @returns {Promise<AtualizarResponse>} Retorna mensagem de sucesso
 */
export function atualizarCliente(
    ID_cliente: string,
    dados: Partial<{
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
    }>
): Promise<AtualizarResponse> {
    return apiFetch<AtualizarResponse>(`/clientes/${ID_cliente}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });
}

/**
 * Deleta um cliente.
 *
 * @param {string} ID_cliente - ID do cliente
 * @returns {Promise<DeletarResponse>} Retorna mensagem de sucesso
 */
export function deletarCliente(ID_cliente: string): Promise<DeletarResponse> {
    return apiFetch<DeletarResponse>(`/clientes/${ID_cliente}`, {
        method: "DELETE",
    });
}
