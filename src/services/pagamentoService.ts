import { apiFetch } from "./api";
import type {
    StatusPagamento,
    Pagamento,
    AtualizarPagamentoDados,
    ListarPagamentosResponse,
    ObterPagamentoResponse,
    AtualizarPagamentoResponse,
    DeletarPagamentoResponse,
    AtualizarStatusPagamentoResponse,
} from "@/types/pagamento";

export type {
    StatusPagamento,
    Pagamento,
};

export async function listarPagamentos(): Promise<ListarPagamentosResponse> {
    return apiFetch<ListarPagamentosResponse>("/pagamentos", {
        method: "GET",
    });
}

export function obterPagamento(
    ID_pgto: string | number
): Promise<ObterPagamentoResponse> {
    return apiFetch<ObterPagamentoResponse>(`/pagamentos/${ID_pgto}`, {
        method: "GET",
    });
}

export async function atualizarPagamento(
    ID_pgto: string | number,
    dados: AtualizarPagamentoDados
): Promise<AtualizarPagamentoResponse> {
    return apiFetch<AtualizarPagamentoResponse>(`/pagamentos/${ID_pgto}`, {
        method: "PUT",
        body: JSON.stringify(dados),
    });
}

export async function deletarPagamento(
    ID_pgto: string | number
): Promise<DeletarPagamentoResponse> {
    return apiFetch<DeletarPagamentoResponse>(`/pagamentos/${ID_pgto}`, {
        method: "DELETE",
    });
}

export async function atualizarStatusPagamento(
    ID_pgto: string | number,
    status: StatusPagamento
): Promise<AtualizarStatusPagamentoResponse> {
    return apiFetch<AtualizarStatusPagamentoResponse>(`/pagamentos/${ID_pgto}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status_pgto: status }),
    });
}
