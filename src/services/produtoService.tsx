import { apiFetch } from "./api";
import { obterUsuarioLogado } from "./authService";

export interface Produto {
    ID_produto: string;
    nome_produto: string;
    quantidade_produto: number;
    valor_produto: number;
    unidade_medida: string;
    fk_usuario_produto: string;
}

/**
 * Resposta ao cadastrar um produto
 */
export interface CadastroResponse {
    mensagem: string;
    produto: Produto;
}

/**
 * Resposta ao listar produtos
 */
export interface ListarResponse {
    total: number;
    produtos: Produto[];
}

/**
 * Resposta ao obter um produto
 */
export interface ObterResponse {
    produto: Produto;
}

/**
 * Resposta ao atualizar um produto
 */
export interface AtualizarResponse {
    mensagem: string;
    ID_produto: string;
}

/**
 * Resposta ao deletar um produto
 */
export interface DeletarResponse {
    mensagem: string;
}

/**
 * Cadastra um novo produto no sistema.
 *
 * @param {Object} dados - Objeto contendo os dados do produto
 * @returns {Promise<CadastroResponse>} Retorna mensagem e dados do produto criado
 */
export function cadastrarProduto(dados: {
    nome_produto: string;
    quantidade_produto: string;
    valor_produto: string;
    unidade_medida: string;
}): Promise<CadastroResponse> {

    const usuarioLogado = obterUsuarioLogado()

    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado")
    }

    return apiFetch<CadastroResponse>("/produtos", {
        method: "POST",
        body: JSON.stringify({ ...dados, fk_usuario_produto: usuarioLogado.id }),
    });
}

/**
 * Lista todos os produtos cadastrados.
 *
 * @returns {Promise<ListarResponse>} Retorna lista de produtos e total
 */
export function listarProdutos(): Promise<ListarResponse> {
    return apiFetch<ListarResponse>("/produtos", {
        method: "GET",
    });
}

/**
 * Obtém um produto específico pelo ID.
 *
 * @param {string} ID_produto - ID do produto
 * @returns {Promise<ObterResponse>} Retorna dados do produto
 */
export function obterProduto(ID_produto: string): Promise<ObterResponse> {
    return apiFetch<ObterResponse>(`/produtos/${ID_produto}`, {
        method: "GET",
    });
}

/**
 * Atualiza dados de um produto.
 *
 * @param {string} ID_produto - ID do produto
 * @param {Partial<produto>} dados - Dados a atualizar (pode ser parcial)
 * @returns {Promise<AtualizarResponse>} Retorna mensagem de sucesso
 */
export function atualizarProduto(
    ID_produto: string,
    dados: Partial<{
        nome_produto: string;
        quantidade_produto: string;
        valor_produto: string;
        unidade_medida: string;
    }>
): Promise<AtualizarResponse> {
    return apiFetch<AtualizarResponse>(`/produtos/${ID_produto}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });
}

/**
 * Deleta um produto.
 *
 * @param {string} ID_produto - ID do produto
 * @returns {Promise<DeletarResponse>} Retorna mensagem de sucesso
 */
export function deletarProduto(ID_produto: string): Promise<DeletarResponse> {
    return apiFetch<DeletarResponse>(`/produtos/${ID_produto}`, {
        method: "DELETE",
    });
}
