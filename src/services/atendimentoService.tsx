import { apiFetch } from "./api";
import { obterUsuarioLogado } from "./authService";

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
    total_atendimento: string | number;
    descri_atendimento: string;
    ID_cliente: string | number;
    ID_pgto?: string | number | null;
    produtos?: ProdutoAtendimentoPayload[];
}

export type AtualizarAtendimentoDados = Partial<CadastroAtendimentoDados>;

export interface CadastroResponse {
    mensagem: string;
    atendimento: AtendimentoCriado;
}

export interface ListarResponse {
    total: number;
    atendimentos: Atendimento[];
}

export interface ObterResponse {
    atendimento: AtendimentoCompleto;
}

export interface AtualizarResponse {
    mensagem: string;
    id: string | number;
}

export interface DeletarResponse {
    mensagem: string;
}

export interface ClienteBuscaAtendimento {
    id: string | number;
    nome: string;
}

export interface ProdutoBuscaAtendimento {
    id: string | number;
    nome: string;
    valor: number;
}

export interface BuscarClientesResponse {
    quantidade: number;
    clientes: ClienteBuscaAtendimento[];
}

export interface BuscarProdutosResponse {
    quantidade: number;
    produtos: ProdutoBuscaAtendimento[];
}

export interface AtualizarProdutosResponse {
    mensagem: string;
    id: string | number;
    quantidadeProdutos: number;
}

interface CacheAtendimentos extends ListarResponse {
    atualizadoEm: number;
}

const ATENDIMENTOS_CACHE_PREFIX = "atendimentos_cache";

function obterChaveCache(): string | null {
    if (typeof window === "undefined") return null;

    const usuarioLogado = obterUsuarioLogado();
    return `${ATENDIMENTOS_CACHE_PREFIX}_${usuarioLogado?.id || "sem_usuario"}`;
}

export function obterAtendimentosCache(): ListarResponse | null {
    const chave = obterChaveCache();
    if (!chave) return null;

    try {
        const cacheJson = localStorage.getItem(chave);
        if (!cacheJson) return null;

        const cache = JSON.parse(cacheJson) as CacheAtendimentos;
        if (!Array.isArray(cache.atendimentos)) return null;

        return {
            total: cache.total ?? cache.atendimentos.length,
            atendimentos: cache.atendimentos,
        };
    } catch (error) {
        console.error("Erro ao ler cache de atendimentos:", error);
        localStorage.removeItem(chave);
        return null;
    }
}

function salvarAtendimentosCache(response: ListarResponse): void {
    const chave = obterChaveCache();
    if (!chave) return;

    const cache: CacheAtendimentos = {
        total: response.total ?? response.atendimentos.length,
        atendimentos: response.atendimentos,
        atualizadoEm: Date.now(),
    };

    localStorage.setItem(chave, JSON.stringify(cache));
}

export function invalidarCacheAtendimentos(): void {
    const chave = obterChaveCache();
    if (!chave) return;

    localStorage.removeItem(chave);
}

export async function cadastrarAtendimento(
    dados: CadastroAtendimentoDados
): Promise<CadastroResponse> {
    const response = await apiFetch<CadastroResponse>("/atendimentos", {
        method: "POST",
        body: JSON.stringify(dados),
    });

    invalidarCacheAtendimentos();
    return response;
}

export async function listarAtendimentos(
    forcarAtualizacao = false
): Promise<ListarResponse> {
    if (!forcarAtualizacao) {
        const cache = obterAtendimentosCache();
        if (cache) return cache;
    }

    const response = await apiFetch<ListarResponse>("/atendimentos", {
        method: "GET",
    });

    salvarAtendimentosCache(response);
    return response;
}

export function obterAtendimento(ID_atendimento: string | number): Promise<ObterResponse> {
    return apiFetch<ObterResponse>(`/atendimentos/${ID_atendimento}`, {
        method: "GET",
    });
}

export async function atualizarAtendimento(
    ID_atendimento: string | number,
    dados: AtualizarAtendimentoDados
): Promise<AtualizarResponse> {
    const response = await apiFetch<AtualizarResponse>(`/atendimentos/${ID_atendimento}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });

    invalidarCacheAtendimentos();
    return response;
}

export async function deletarAtendimento(
    ID_atendimento: string | number
): Promise<DeletarResponse> {
    const response = await apiFetch<DeletarResponse>(`/atendimentos/${ID_atendimento}`, {
        method: "DELETE",
    });

    invalidarCacheAtendimentos();
    return response;
}

export function buscarClientesAtendimento(termo: string): Promise<BuscarClientesResponse> {
    return apiFetch<BuscarClientesResponse>(
        `/atendimentos/clientes/buscar?termo=${encodeURIComponent(termo)}`,
        { method: "GET" }
    );
}

export function buscarProdutosAtendimento(termo: string): Promise<BuscarProdutosResponse> {
    return apiFetch<BuscarProdutosResponse>(
        `/atendimentos/produtos/buscar?termo=${encodeURIComponent(termo)}`,
        { method: "GET" }
    );
}

export async function atualizarProdutosAtendimento(
    ID_atendimento: string | number,
    produtos: ProdutoAtendimentoPayload[]
): Promise<AtualizarProdutosResponse> {
    const response = await apiFetch<AtualizarProdutosResponse>(
        `/atendimentos/${ID_atendimento}/produtos`,
        {
            method: "PUT",
            body: JSON.stringify({ produtos }),
        }
    );

    invalidarCacheAtendimentos();
    return response;
}
