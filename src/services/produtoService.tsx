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

export interface CadastroResponse {
    mensagem: string;
    produto: Produto;
}

export interface ListarResponse {
    total: number;
    produtos: Produto[];
}

export interface ObterResponse {
    produto: Produto;
}

export interface AtualizarResponse {
    mensagem: string;
    ID_produto: string;
}

export interface DeletarResponse {
    mensagem: string;
}

interface CacheProdutos extends ListarResponse {
    atualizadoEm: number;
}

const PRODUTOS_CACHE_PREFIX = "produtos_cache";

function obterChaveCache(): string | null {
    if (typeof window === "undefined") return null;

    const usuarioLogado = obterUsuarioLogado();
    return `${PRODUTOS_CACHE_PREFIX}_${usuarioLogado?.id || "sem_usuario"}`;
}

export function obterProdutosCache(): ListarResponse | null {
    const chave = obterChaveCache();
    if (!chave) return null;

    try {
        const cacheJson = localStorage.getItem(chave);
        if (!cacheJson) return null;

        const cache = JSON.parse(cacheJson) as CacheProdutos;
        if (!Array.isArray(cache.produtos)) return null;

        return {
            total: cache.total ?? cache.produtos.length,
            produtos: cache.produtos,
        };
    } catch (error) {
        console.error("Erro ao ler cache de produtos:", error);
        localStorage.removeItem(chave);
        return null;
    }
}

function salvarProdutosCache(response: ListarResponse): void {
    const chave = obterChaveCache();
    if (!chave) return;

    const cache: CacheProdutos = {
        total: response.total ?? response.produtos.length,
        produtos: response.produtos,
        atualizadoEm: Date.now(),
    };

    localStorage.setItem(chave, JSON.stringify(cache));
}

export function invalidarCacheProdutos(): void {
    const chave = obterChaveCache();
    if (!chave) return;

    localStorage.removeItem(chave);
}

export async function cadastrarProduto(dados: {
    nome_produto: string;
    quantidade_produto: string;
    valor_produto: string;
    unidade_medida: string;
}): Promise<CadastroResponse> {
    const usuarioLogado = obterUsuarioLogado();

    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    const response = await apiFetch<CadastroResponse>("/produtos", {
        method: "POST",
        body: JSON.stringify({ ...dados, fk_usuario_produto: usuarioLogado.id }),
    });

    invalidarCacheProdutos();
    return response;
}

export async function listarProdutos(forcarAtualizacao = false): Promise<ListarResponse> {
    if (!forcarAtualizacao) {
        const cache = obterProdutosCache();
        if (cache) return cache;
    }

    const response = await apiFetch<ListarResponse>("/produtos", {
        method: "GET",
    });

    salvarProdutosCache(response);
    return response;
}

export function obterProduto(ID_produto: string): Promise<ObterResponse> {
    return apiFetch<ObterResponse>(`/produtos/${ID_produto}`, {
        method: "GET",
    });
}

export async function atualizarProduto(
    ID_produto: string,
    dados: Partial<{
        nome_produto: string;
        quantidade_produto: string;
        valor_produto: string;
        unidade_medida: string;
    }>
): Promise<AtualizarResponse> {
    const response = await apiFetch<AtualizarResponse>(`/produtos/${ID_produto}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });

    invalidarCacheProdutos();
    return response;
}

export async function deletarProduto(ID_produto: string): Promise<DeletarResponse> {
    const response = await apiFetch<DeletarResponse>(`/produtos/${ID_produto}`, {
        method: "DELETE",
    });

    invalidarCacheProdutos();
    return response;
}
