import { apiFetch } from "./api";
import type {
    StatusAtendimento,
    ProdutoAtendimentoPayload,
    Atendimento,
    AtendimentoCriado,
    AtendimentoCompleto,
    CadastroAtendimentoDados,
    AtualizarAtendimentoDados,
    CadastroAtendimentoResponse,
    ListarAtendimentosResponse,
    ObterAtendimentoResponse,
    AtualizarAtendimentoResponse,
    DeletarAtendimentoResponse,
} from "@/types/atendimento";

export type {
    StatusAtendimento,
    ProdutoAtendimentoPayload,
    Atendimento,
    AtendimentoCriado,
    AtendimentoCompleto,
};

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

export async function cadastrarAtendimento(
    dados: CadastroAtendimentoDados
): Promise<CadastroAtendimentoResponse> {
    return apiFetch<CadastroAtendimentoResponse>("/atendimentos", {
        method: "POST",
        body: JSON.stringify(dados),
    });
}

export async function listarAtendimentos(_forcarAtualizacao?: boolean): Promise<ListarAtendimentosResponse> {
    return apiFetch<ListarAtendimentosResponse>("/atendimentos", {
        method: "GET",
    });
}

export function obterAtendimento(ID_atendimento: string | number): Promise<ObterAtendimentoResponse> {
    return apiFetch<ObterAtendimentoResponse>(`/atendimentos/${ID_atendimento}`, {
        method: "GET",
    });
}

export async function atualizarAtendimento(
    ID_atendimento: string | number,
    dados: AtualizarAtendimentoDados
): Promise<AtualizarAtendimentoResponse> {
    return apiFetch<AtualizarAtendimentoResponse>(`/atendimentos/${ID_atendimento}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });
}

export async function deletarAtendimento(
    ID_atendimento: string | number
): Promise<DeletarAtendimentoResponse> {
    return apiFetch<DeletarAtendimentoResponse>(`/atendimentos/${ID_atendimento}`, {
        method: "DELETE",
    });
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
    return apiFetch<AtualizarProdutosResponse>(
        `/atendimentos/${ID_atendimento}/produtos`,
        {
            method: "PUT",
            body: JSON.stringify({ produtos }),
        }
    );
}
