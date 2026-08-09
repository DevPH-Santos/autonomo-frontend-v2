'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect, useCallback } from 'react'
import { DespesaModal } from '@/components/ui/DespesaModal'
import {
  listarDespesas,
  deletarDespesa as deletarDespesaService,
} from '@/services/despesaService'
import type { Despesa as DespesaAPI } from '@/services/despesaService'

// ==========================================
// CONSTANTES
// ==========================================

const ITENS_POR_PAGINA = 10

// ==========================================
// TIPOS E INTERFACES
// ==========================================

type Categoria = 'Produto' | 'Transporte' | 'Manutenção' | 'Outros'

interface Despesa {
  id: string
  descricao: string
  observacao: string | null
  categoria: Categoria
  valor: string
  valorNumerico: number
  data: string
  dataBruta: string
  periodoRef: string
}

// ==========================================
// HELPERS
// ==========================================

function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarData(dataISO: string): string {
  return new Date(dataISO).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatarPeriodo(dataISO: string): string {
  const str = new Date(dataISO).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function mapearCategoria(valor: string): Categoria {
  const mapa: Record<string, Categoria> = {
    Produto: 'Produto',
    Transporte: 'Transporte',
    Manutenção: 'Manutenção',
    Outros: 'Outros',
  }
  return mapa[valor] ?? 'Outros'
}

function mapearParaLocal(d: DespesaAPI): Despesa {
  return {
    id: String(d.id),
    descricao: d.descricao,
    observacao: d.observacao ?? null,
    categoria: mapearCategoria(d.categoria),
    valor: formatarValor(d.valor),
    valorNumerico: d.valor,
    data: formatarData(d.data),
    dataBruta: d.data,
    periodoRef: formatarPeriodo(d.data),
  }
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

const categoriaCfg: Record<Categoria, { bg: string; text: string }> = {
  Produto: { bg: 'bg-sky-100', text: 'text-sky-700' },
  Transporte: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Manutenção: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Outros: { bg: 'bg-slate-200', text: 'text-slate-700' },
}

function CategoriaBadge({ categoria }: { categoria: Categoria }) {
  const cfg = categoriaCfg[categoria]
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${cfg.bg} ${cfg.text}`}
    >
      {categoria}
    </span>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null)

  // ===== FILTROS =====
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | ''>('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')

  // ===== DADOS DERIVADOS =====

  const periodosDisponiveis = [...new Set(despesas.map((d) => d.periodoRef))]

  const despesasFiltradas = despesas.filter((d) => {
    if (filtroCategoria && d.categoria !== filtroCategoria) return false
    if (filtroPeriodo && d.periodoRef !== filtroPeriodo) return false
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(despesasFiltradas.length / ITENS_POR_PAGINA))
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  const despesasPagina = despesasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA)

  const botoesVisiveis = (): number[] => {
    const delta = 2
    const left = Math.max(1, paginaAtual - delta)
    const right = Math.min(totalPaginas, paginaAtual + delta)
    const range: number[] = []
    for (let i = left; i <= right; i++) range.push(i)
    return range
  }

  useEffect(() => {
    setPaginaAtual(1)
  }, [filtroCategoria, filtroPeriodo])

  // ===== BUSCA DE DADOS =====

  const carregarDespesas = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      const resposta = await listarDespesas()
      setDespesas(resposta.despesas.map(mapearParaLocal))
    } catch {
      setErro('Não foi possível carregar as despesas.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDespesas()
  }, [carregarDespesas])

  // ===== MÉTRICAS =====

  const agora = new Date()
  const mesAtual = agora.getMonth()
  const anoAtual = agora.getFullYear()

  const totalMesAtual = despesas
    .filter((d) => {
      const dt = new Date(d.dataBruta)
      return dt.getMonth() === mesAtual && dt.getFullYear() === anoAtual
    })
    .reduce((acc, d) => acc + d.valorNumerico, 0)

  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual

  const totalMesAnterior = despesas
    .filter((d) => {
      const dt = new Date(d.dataBruta)
      return dt.getMonth() === mesAnterior && dt.getFullYear() === anoAnterior
    })
    .reduce((acc, d) => acc + d.valorNumerico, 0)

  const variacao =
    totalMesAnterior > 0
      ? ((totalMesAtual - totalMesAnterior) / totalMesAnterior) * 100
      : null

  const totalPorCategoria = despesas.reduce(
    (acc, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + d.valorNumerico
      return acc
    },
    {} as Record<string, number>,
  )

  const [maiorCategoriaNome, maiorCategoriaValor] = Object.entries(totalPorCategoria).sort(
    (a, b) => b[1] - a[1],
  )[0] ?? ['—', 0]

  // ===== HANDLERS =====

  const handleEditar = (despesa: Despesa) => {
    setDespesaSelecionada(despesa)
    setModalAberto(true)
  }

  const handleDeletar = async (id: string) => {
    try {
      await deletarDespesaService(id)
      await carregarDespesas()
    } catch {
      setErro('Erro ao deletar despesa.')
    }
  }

  // ===== ESTADOS DE LOADING / ERRO =====

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Icon name="refresh" className="animate-spin mr-2" />
        Carregando despesas...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Icon name="warning" className="text-red-400 text-4xl" />
        <p className="text-sm font-medium">{erro}</p>
        <button onClick={carregarDespesas} className="text-xs font-bold text-blue-600 underline">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ===== MÉTRICAS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-red-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <Icon name="payments" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total gasto no mês</p>
          <h3 className="text-2xl font-black text-slate-900">{formatarValor(totalMesAtual)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-sky-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
              <Icon name="inventory_2" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Maior categoria</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">{maiorCategoriaNome}</h3>
            <span className="text-sm font-medium text-slate-400">
              {formatarValor(maiorCategoriaValor)}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-green-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${variacao !== null && variacao < 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-amber-100 text-amber-600'
                }`}
            >
              <Icon name={variacao !== null && variacao < 0 ? 'trending_down' : 'trending_up'} />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
              vs. mês anterior
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Comparação</p>
          <h3
            className={`text-2xl font-black ${variacao === null
                ? 'text-slate-900'
                : variacao < 0
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}
          >
            {variacao === null
              ? '—'
              : `${variacao > 0 ? '+' : ''}${variacao.toFixed(0)}%`}
          </h3>
        </div>
      </section>

      {/* ===== FILTROS ===== */}
      <section className="bg-slate-100 p-5 rounded-2xl flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Icon name="filter_list" className="text-slate-600 text-lg" />
          <span className="text-sm font-semibold text-slate-600 mr-2">Filtros:</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value as typeof filtroCategoria)}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Categoria: Todas</option>
            <option value="Produto">Produto</option>
            <option value="Transporte">Transporte</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Outros">Outros</option>
          </select>

          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Período: Todos</option>
            {periodosDisponiveis.map((periodo) => (
              <option key={periodo} value={periodo}>
                {periodo}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setDespesaSelecionada(null)
            setModalAberto(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Icon name="add" className="text-sm" />
          Nova Despesa
        </button>
      </section>

      {/* ===== TABELA ===== */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        {despesasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Icon name="receipt_long" className="text-4xl" />
            <p className="text-sm font-medium">Nenhuma despesa encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {despesasPagina.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{d.descricao}</span>
                        {d.observacao && (
                          <span className="text-xs text-slate-500">{d.observacao}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoriaBadge categoria={d.categoria} />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{d.valor}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.data}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditar(d)}
                          className="text-slate-500 hover:text-blue-600 transition-colors"
                          title="Editar despesa"
                        >
                          <Icon name="edit" className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeletar(d.id)}
                          className="text-slate-500 hover:text-red-600 transition-colors"
                          title="Deletar despesa"
                        >
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== PAGINAÇÃO ===== */}
        {despesasFiltradas.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 bg-white">
            <p className="text-xs text-slate-600 font-medium">
              {inicio + 1}–{Math.min(inicio + ITENS_POR_PAGINA, despesasFiltradas.length)} de{' '}
              {despesasFiltradas.length} despesa
              {despesasFiltradas.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                disabled={paginaAtual === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="chevron_left" className="text-lg" />
              </button>

              {botoesVisiveis().map((num) => (
                <button
                  key={num}
                  onClick={() => setPaginaAtual(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${paginaAtual === num
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                disabled={paginaAtual === totalPaginas}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="chevron_right" className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      <DespesaModal
        key={despesaSelecionada?.id ?? 'nova-despesa'}
        isOpen={modalAberto}
        despesa={despesaSelecionada}
        onClose={() => {
          setModalAberto(false)
          setDespesaSelecionada(null)
          carregarDespesas()
        }}
      />
    </div>
  )
}
