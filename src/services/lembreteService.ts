import { apiFetch } from "./api";
import type {
  AtualizarLembreteDados,
  AtualizarLembreteResponse,
  AtualizarStatusLembreteResponse,
  CadastroLembreteResponse,
  DeletarLembreteResponse,
  Lembrete,
  LembretePayload,
  ListarLembretesResponse,
  ObterLembreteResponse,
  PrioridadeLembrete,
  StatusLembrete,
  TipoLembrete,
} from "@/types/lembrete";

export type {
  AtualizarLembreteDados,
  Lembrete,
  LembretePayload,
  PrioridadeLembrete,
  StatusLembrete,
  TipoLembrete,
};

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstValue(record: ApiRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function firstString(record: ApiRecord, keys: string[], fallback = ""): string {
  const value = firstValue(record, keys);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizarTipo(value: string): TipoLembrete {
  const token = normalizeToken(value);

  if (token === "pagamento") return "Pagamento";
  if (token === "atendimento") return "Atendimento";
  if (token === "manutencao") return "Manutenção";

  return "Pessoal";
}

function normalizarStatus(value: string): StatusLembrete {
  const token = normalizeToken(value);

  if (token === "concluido" || token === "concluida") return "Concluído";
  if (token === "atrasado" || token === "atrasada") return "Atrasado";

  return "Pendente";
}

function normalizarPrioridade(value: string): PrioridadeLembrete {
  const token = normalizeToken(value);

  if (token === "alta") return "Alta";
  if (token === "baixa") return "Baixa";

  return "Média";
}

function normalizarLembrete(value: unknown): Lembrete {
  const record = isRecord(value) ? value : {};
  const id = firstValue(record, ["id", "ID_lembrete", "id_lembrete", "ID"]);

  return {
    id: typeof id === "string" || typeof id === "number" ? id : "",
    titulo: firstString(record, ["titulo", "titulo_lembrete", "nome", "nome_lembrete"]),
    descricao: firstString(record, [
      "descricao",
      "descri_lembrete",
      "descricao_lembrete",
      "observacao",
      "observacao_lembrete",
    ]),
    tipo: normalizarTipo(firstString(record, ["tipo", "tipo_lembrete"], "Pessoal")),
    status: normalizarStatus(firstString(record, ["status", "status_lembrete"], "Pendente")),
    prioridade: normalizarPrioridade(
      firstString(record, ["prioridade", "prioridade_lembrete"], "Média")
    ),
    data: firstString(record, [
      "data",
      "data_lembrete",
      "data_vencimento",
      "data_hora",
      "dataHora",
    ]),
  };
}

function extrairLista(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  if (!isRecord(response)) return [];

  const lembretes = response.lembretes;
  if (Array.isArray(lembretes)) return lembretes;

  const data = response.data;
  if (Array.isArray(data)) return data;

  return [];
}

function extrairItem(response: unknown): Lembrete {
  if (!isRecord(response)) return normalizarLembrete(response);

  return normalizarLembrete(response.lembrete ?? response.data ?? response);
}

export async function listarLembretes(): Promise<ListarLembretesResponse> {
  const response = await apiFetch<unknown>("/lembretes", {
    method: "GET",
  });

  const lembretes = extrairLista(response).map(normalizarLembrete);
  const total =
    isRecord(response) && typeof response.total === "number" ? response.total : lembretes.length;

  return { total, lembretes };
}

export async function cadastrarLembrete(
  dados: LembretePayload
): Promise<CadastroLembreteResponse> {
  const response = await apiFetch<unknown>("/lembretes", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return {
    mensagem: isRecord(response) ? firstString(response, ["mensagem", "message"]) : undefined,
    lembrete: extrairItem(response),
  };
}

export async function obterLembrete(
  id: string | number
): Promise<ObterLembreteResponse> {
  const response = await apiFetch<unknown>(`/lembretes/${id}`, {
    method: "GET",
  });

  return { lembrete: extrairItem(response) };
}

export async function atualizarLembrete(
  id: string | number,
  dados: AtualizarLembreteDados
): Promise<AtualizarLembreteResponse> {
  const response = await apiFetch<unknown>(`/lembretes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  return {
    mensagem: isRecord(response) ? firstString(response, ["mensagem", "message"]) : undefined,
    lembrete: isRecord(response) ? extrairItem(response) : undefined,
    id,
  };
}

export async function deletarLembrete(
  id: string | number
): Promise<DeletarLembreteResponse> {
  const response = await apiFetch<unknown>(`/lembretes/${id}`, {
    method: "DELETE",
  });

  return {
    mensagem: isRecord(response) ? firstString(response, ["mensagem", "message"]) : undefined,
  };
}

export async function atualizarStatusLembrete(
  id: string | number,
  status: StatusLembrete
): Promise<AtualizarStatusLembreteResponse> {
  try {
    await apiFetch<unknown>(`/lembretes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, status_lembrete: status }),
    });
  } catch {
    await atualizarLembrete(id, { status });
  }

  return { id, status };
}

export function concluirLembrete(
  id: string | number
): Promise<AtualizarStatusLembreteResponse> {
  return atualizarStatusLembrete(id, "Concluído");
}

export function reabrirLembrete(
  id: string | number
): Promise<AtualizarStatusLembreteResponse> {
  return atualizarStatusLembrete(id, "Pendente");
}
