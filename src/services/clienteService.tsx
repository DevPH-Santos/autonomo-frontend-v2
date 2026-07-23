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

export interface CadastroResponse {
    mensagem: string;
    cliente: Cliente;
}

export interface ListarResponse {
    total: number;
    clientes: Cliente[];
}

export interface ObterResponse {
    cliente: Cliente;
}

export interface AtualizarResponse {
    mensagem: string;
    ID_cliente: string;
}

export interface DeletarResponse {
    mensagem: string;
}

interface CacheClientes extends ListarResponse {
    atualizadoEm: number;
}

const CLIENTES_CACHE_PREFIX = "clientes_cache";

function obterChaveCache(): string | null {
    if (typeof window === "undefined") return null;

    const usuarioLogado = obterUsuarioLogado();
    return `${CLIENTES_CACHE_PREFIX}_${usuarioLogado?.id || "sem_usuario"}`;
}

export function obterClientesCache(): ListarResponse | null {
    const chave = obterChaveCache();
    if (!chave) return null;

    try {
        const cacheJson = localStorage.getItem(chave);
        if (!cacheJson) return null;

        const cache = JSON.parse(cacheJson) as CacheClientes;
        if (!Array.isArray(cache.clientes)) return null;

        return {
            total: cache.total ?? cache.clientes.length,
            clientes: cache.clientes,
        };
    } catch (error) {
        console.error("Erro ao ler cache de clientes:", error);
        localStorage.removeItem(chave);
        return null;
    }
}

function salvarClientesCache(response: ListarResponse): void {
    const chave = obterChaveCache();
    if (!chave) return;

    const cache: CacheClientes = {
        total: response.total ?? response.clientes.length,
        clientes: response.clientes,
        atualizadoEm: Date.now(),
    };

    localStorage.setItem(chave, JSON.stringify(cache));
}

export function invalidarCacheClientes(): void {
    const chave = obterChaveCache();
    if (!chave) return;

    localStorage.removeItem(chave);
}

export async function cadastrarCliente(dados: {
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
    const usuarioLogado = obterUsuarioLogado();

    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    const response = await apiFetch<CadastroResponse>("/clientes", {
        method: "POST",
        body: JSON.stringify({ ...dados, fk_usuario_cliente: usuarioLogado.id }),
    });

    invalidarCacheClientes();
    return response;
}

export async function listarClientes(forcarAtualizacao = false): Promise<ListarResponse> {
    if (!forcarAtualizacao) {
        const cache = obterClientesCache();
        if (cache) return cache;
    }

    const response = await apiFetch<ListarResponse>("/clientes", {
        method: "GET",
    });

    salvarClientesCache(response);
    return response;
}

export function obterCliente(ID_cliente: string): Promise<ObterResponse> {
    return apiFetch<ObterResponse>(`/clientes/${ID_cliente}`, {
        method: "GET",
    });
}

export async function atualizarCliente(
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
    const response = await apiFetch<AtualizarResponse>(`/clientes/${ID_cliente}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });

    invalidarCacheClientes();
    return response;
}

export async function deletarCliente(ID_cliente: string): Promise<DeletarResponse> {
    const response = await apiFetch<DeletarResponse>(`/clientes/${ID_cliente}`, {
        method: "DELETE",
    });

    invalidarCacheClientes();
    return response;
}
