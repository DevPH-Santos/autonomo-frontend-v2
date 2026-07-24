import { apiFetch } from "./api";
import { obterUsuarioLogado } from "./authService";
import type {
    Cliente,
    CadastroClienteResponse,
    ListarClientesResponse,
    ObterClienteResponse,
    AtualizarClienteResponse,
    DeletarClienteResponse,
} from "@/types/cliente";

export type { Cliente };

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
}): Promise<CadastroClienteResponse> {
    const usuarioLogado = obterUsuarioLogado();

    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    return apiFetch<CadastroClienteResponse>("/clientes", {
        method: "POST",
        body: JSON.stringify({ ...dados, fk_usuario_cliente: usuarioLogado.id }),
    });
}

export async function listarClientes(): Promise<ListarClientesResponse> {
    return apiFetch<ListarClientesResponse>("/clientes", {
        method: "GET",
    });
}

export function obterCliente(ID_cliente: string): Promise<ObterClienteResponse> {
    return apiFetch<ObterClienteResponse>(`/clientes/${ID_cliente}`, {
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
): Promise<AtualizarClienteResponse> {
    return apiFetch<AtualizarClienteResponse>(`/clientes/${ID_cliente}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });
}

export async function deletarCliente(ID_cliente: string): Promise<DeletarClienteResponse> {
    return apiFetch<DeletarClienteResponse>(`/clientes/${ID_cliente}`, {
        method: "DELETE",
    });
}
