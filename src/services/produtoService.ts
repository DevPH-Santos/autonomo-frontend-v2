import { apiFetch } from "./api";
import { obterUsuarioLogado } from "./authService";
import type {
    Produto,
    CadastroProdutoResponse,
    ListarProdutosResponse,
    ObterProdutoResponse,
    AtualizarProdutoResponse,
    DeletarProdutoResponse,
} from "@/types/produto";

export type { Produto };

export async function cadastrarProduto(dados: {
    nome_produto: string;
    quantidade_produto: number;
    valor_produto: number;
    unidade_medida: string;
}): Promise<CadastroProdutoResponse> {
    const usuarioLogado = obterUsuarioLogado();

    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    return apiFetch<CadastroProdutoResponse>("/produtos", {
        method: "POST",
        body: JSON.stringify({ ...dados, fk_usuario_produto: usuarioLogado.id }),
    });
}

export async function listarProdutos(): Promise<ListarProdutosResponse> {
    return apiFetch<ListarProdutosResponse>("/produtos", {
        method: "GET",
    });
}

export function obterProduto(ID_produto: string): Promise<ObterProdutoResponse> {
    return apiFetch<ObterProdutoResponse>(`/produtos/${ID_produto}`, {
        method: "GET",
    });
}

export async function atualizarProduto(
    ID_produto: string,
    dados: Partial<{
        nome_produto: string;
        quantidade_produto: number;
        valor_produto: number;
        unidade_medida: string;
    }>
): Promise<AtualizarProdutoResponse> {
    return apiFetch<AtualizarProdutoResponse>(`/produtos/${ID_produto}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });
}

export async function deletarProduto(ID_produto: string): Promise<DeletarProdutoResponse> {
    return apiFetch<DeletarProdutoResponse>(`/produtos/${ID_produto}`, {
        method: "DELETE",
    });
}
