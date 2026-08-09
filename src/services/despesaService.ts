import { apiFetch } from '@/services/api'

// ==========================================
// TIPOS
// ==========================================

export interface Despesa {
    id: number
    descricao: string
    categoria: string
    valor: number
    data: string
    observacao?: string | null
}

interface ListarDespesasResponse {
    despesas: Despesa[]
}

interface DespesaPayload {
    descricao: string
    categoria?: string | null   //nullable
    valor: number
    data: string
    observacao?: string | null
}

// ==========================================
// CACHE
// ==========================================

const CACHE_KEY = 'autonomo_despesas_cache'
const CACHE_TTL = 5 * 60 * 1000

interface CacheEntry {
    dados: Despesa[]
    timestamp: number
}

function lerCache(): Despesa[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const entry: CacheEntry = JSON.parse(raw)
        if (Date.now() - entry.timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_KEY)
            return null
        }
        return entry.dados
    } catch {
        return null
    }
}

function salvarCache(despesas: Despesa[]): void {
    try {
        const entry: CacheEntry = { dados: despesas, timestamp: Date.now() }
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
        // ignora falha de storage
    }
}

function invalidarCache(): void {
    localStorage.removeItem(CACHE_KEY)
}

// ==========================================
// FUNÇÕES DE SERVIÇO
// ==========================================

export async function listarDespesas(
    forcarAtualizacao = false,
): Promise<ListarDespesasResponse> {
    if (!forcarAtualizacao) {
        const cached = lerCache()
        if (cached) return { despesas: cached }
    }

    const resposta = await apiFetch<ListarDespesasResponse>('/despesas')
    salvarCache(resposta.despesas)
    return resposta
}

export async function criarDespesa(payload: DespesaPayload): Promise<Despesa> {
    const nova = await apiFetch<Despesa>('/despesas', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    invalidarCache()
    return nova
}

export async function atualizarDespesa(
    id: string,
    payload: Partial<DespesaPayload>,
): Promise<Despesa> {
    const atualizada = await apiFetch<Despesa>(`/despesas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    invalidarCache()
    return atualizada
}

export async function deletarDespesa(id: string): Promise<void> {
    await apiFetch<void>(`/despesas/${id}`, { method: 'DELETE' })
    invalidarCache()
}
