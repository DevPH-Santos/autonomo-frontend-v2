'use client'

import { Icon, type IconName } from '@/components/ui/icon'
import { useState, useEffect, useCallback } from 'react'
import { LembreteModal } from '@/components/ui/LembreteModal'
import {
  listarLembretes,
  deletarLembrete as deletarLembreteService,
  concluirLembrete as concluirLembreteService,
  reabrirLembrete as reabrirLembreteService,
} from '@/services/lembreteService'
import type {
  Lembrete as LembreteAPI,
  PrioridadeLembrete,
  StatusLembrete,
  TipoLembrete,
} from '@/services/lembreteService'

// ==========================================
// CONSTANTES
// ==========================================

const ITENS_POR_PAGINA = 10

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface Lembrete {
  id: string
  titulo: string
  descricao: string
  tipo: TipoLembrete
  status: StatusLembrete
  prioridade: PrioridadeLembrete
  data: string
  dataBruta: string
}

// ==========================================
// HELPERS
// ==========================================

function formatarDataHora(dataISO: string): string {
  const dt = new Date(dataISO)
  if (Number.isNaN(dt.getTime())) return 'Sem data'

  const agora = new Date()
  const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (dt.toDateString() === agora.toDateString()) return `Hoje, ${hora}`
  const ontem = new Date(agora)
  ontem.setDate(agora.getDate() - 1)
  if (dt.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`
  const data = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return `${data}, ${hora}`
}

function mapearTipo(valor: string): TipoLembrete {
  const mapa: Record<string, TipoLembrete> = {
    Pagamento: 'Pagamento',
    Atendimento: 'Atendimento',
    Manutenção: 'Manutenção',
    Pessoal: 'Pessoal',
  }
  return mapa[valor] ?? 'Pessoal'
}

function mapearStatus(valor: string): StatusLembrete {
  const mapa: Record<string, StatusLembrete> = {
    Pendente: 'Pendente',
    Concluído: 'Concluído',
    Atrasado: 'Atrasado',
  }
  return mapa[valor] ?? 'Pendente'
}

function mapearPrioridade(valor: string): PrioridadeLembrete {
  const mapa: Record<string, PrioridadeLembrete> = {
    Alta: 'Alta',
    Média: 'Média',
    Baixa: 'Baixa',
  }
  return mapa[valor] ?? 'Média'
}

function mapearParaLocal(l: LembreteAPI): Lembrete {
  return {
    id: String(l.id),
    titulo: l.titulo || 'Lembrete sem título',
    descricao: l.descricao || 'Sem descrição',
    tipo: mapearTipo(l.tipo),
    status: mapearStatus(l.status),
    prioridade: mapearPrioridade(l.prioridade),
    data: formatarDataHora(l.data),
    dataBruta: l.data,
  }
}

function estaNoFiltro(dataBruta: string, periodo: string): boolean {
  const dt = new Date(dataBruta)
  if (Number.isNaN(dt.getTime())) return false

  const agora = new Date()
  switch (periodo) {
    case 'hoje':
      return dt.toDateString() === agora.toDateString()
    case 'semana': {
      const inicio = new Date(agora)
      inicio.setDate(agora.getDate() - agora.getDay())
      inicio.setHours(0, 0, 0, 0)
      const fim = new Date(inicio)
      fim.setDate(inicio.getDate() + 6)
      fim.setHours(23, 59, 59, 999)
      return dt >= inicio && dt <= fim
    }
    case 'mes':
      return dt.getMonth() === agora.getMonth() && dt.getFullYear() === agora.getFullYear()
    default:
      return true
  }
}

// ==========================================
// CONFIGS VISUAIS
// ==========================================

const tipoIcone: Record<TipoLembrete, IconName> = {
  Pagamento: 'payments',
  Atendimento: 'event_available',
  Manutenção: 'handyman',
  Pessoal: 'person',
}

const tipoIconeBg: Record<TipoLembrete, { bg: string; text: string }> = {
  Pagamento: { bg: 'bg-sky-100', text: 'text-sky-600' },
  Atendimento: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Manutenção: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Pessoal: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

const statusCfg: Record<StatusLembrete, { bg: string; text: string; label: string }> = {
  Pendente: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Pendente' },
  Concluído: { bg: 'bg-green-600', text: 'text-white', label: 'Concluído' },
  Atrasado: { bg: 'bg-red-600', text: 'text-white', label: 'Atrasado' },
}

const tipoBadgeCfg: Record<TipoLembrete, { bg: string; text: string }> = {
  Pagamento: { bg: 'bg-sky-100', text: 'text-sky-700' },
  Atendimento: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Manutenção: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Pessoal: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

const prioridadeCfg: Record<PrioridadeLembrete, { dot: string; text: string; label: string }> = {
  Alta: { dot: 'bg-red-500', text: 'text-red-600', label: 'Prioridade Alta' },
  Média: { dot: 'bg-amber-400', text: 'text-amber-600', label: 'Prioridade Média' },
  Baixa: { dot: 'bg-slate-400', text: 'text-slate-500', label: 'Prioridade Baixa' },
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function StatusBadge({ status }: { status: StatusLembrete }) {
  const cfg = statusCfg[status]
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function TipoBadge({ tipo }: { tipo: TipoLembrete }) {
  const cfg = tipoBadgeCfg[tipo]
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${cfg.bg} ${cfg.text}`}>
      {tipo}
    </span>
  )
}

interface LembreteCardProps {
  lembrete: Lembrete
  onConcluir: (id: string) => void
  onReabrir: (id: string) => void
  onEditar: (lembrete: Lembrete) => void
  onDeletar: (id: string) => void
}

function LembreteCard({ lembrete: l, onConcluir, onReabrir, onEditar, onDeletar }: LembreteCardProps) {
  const iconeCfg = tipoIconeBg[l.tipo]
  const prioCfg = prioridadeCfg[l.prioridade]
  const concluido = l.status === 'Concluído'

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5 group ${concluido ? 'opacity-70' : ''
        }`}
    >
      {/* Ícone tipo */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconeCfg.bg} ${iconeCfg.text}`}
      >
        <Icon name={tipoIcone[l.tipo]} className="text-[28px]" />
      </div>

      {/* Conteúdo */}
      <div className="w-full min-w-0 sm:flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3
            className={`font-bold text-slate-900 truncate ${concluido ? 'line-through decoration-slate-400' : ''
              }`}
          >
            {l.titulo}
          </h3>
          <StatusBadge status={l.status} />
          <TipoBadge tipo={l.tipo} />
        </div>
        <p className="text-sm text-slate-500 truncate">{l.descricao}</p>
      </div>

      {/* Meta */}
      <div className="flex w-full shrink-0 flex-row items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end sm:gap-1.5 sm:pr-12">
        <div className={`flex items-center gap-1.5 text-xs font-bold ${prioCfg.text}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${prioCfg.dot}`} />
          {prioCfg.label}
        </div>
        <p className="text-sm text-slate-500 font-medium whitespace-nowrap">{l.data}</p>
      </div>

      {/* Ações (hover) */}
      <div className="flex w-full items-center justify-end gap-1 bg-white transition-opacity sm:absolute sm:right-5 sm:top-1/2 sm:w-auto sm:-translate-y-1/2 sm:pl-4 sm:opacity-0 sm:group-hover:opacity-100">
        {concluido ? (
          <button
            onClick={() => onReabrir(l.id)}
            title="Reabrir lembrete"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Icon name="undo" className="text-lg" />
          </button>
        ) : (
          <>
            <button
              onClick={() => onConcluir(l.id)}
              title="Marcar como concluído"
              className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
            >
              <Icon name="check_circle" className="text-lg" />
            </button>
            <button
              onClick={() => onEditar(l)}
              title="Editar lembrete"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Icon name="edit" className="text-lg" />
            </button>
          </>
        )}
        <button
          onClick={() => onDeletar(l.id)}
          title="Excluir lembrete"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <Icon name="delete" className="text-lg" />
        </button>
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function LembretesPage() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)
  const [lembreteSelecionado, setLembreteSelecionado] = useState<Lembrete | null>(null)

  // ===== FILTROS =====
  const [filtroTipo, setFiltroTipo] = useState<TipoLembrete | ''>('')
  const [filtroStatus, setFiltroStatus] = useState<StatusLembrete | ''>('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')

  // ===== DADOS DERIVADOS =====

  const lembretesFiltrados = lembretes.filter((l) => {
    if (filtroTipo && l.tipo !== filtroTipo) return false
    if (filtroStatus && l.status !== filtroStatus) return false
    if (filtroPeriodo && !estaNoFiltro(l.dataBruta, filtroPeriodo)) return false
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(lembretesFiltrados.length / ITENS_POR_PAGINA))
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  const lembretesPagina = lembretesFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA)

  const botoesVisiveis = (): number[] => {
    const delta = 2
    const left = Math.max(1, paginaAtual - delta)
    const right = Math.min(totalPaginas, paginaAtual + delta)
    const range: number[] = []
    for (let i = left; i <= right; i++) range.push(i)
    return range
  }

  // ===== BUSCA DE DADOS =====

  const carregarLembretes = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      const resposta = await listarLembretes()
      setLembretes(resposta.lembretes.map(mapearParaLocal))
    } catch {
      setErro('Não foi possível carregar os lembretes.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(carregarLembretes)
  }, [carregarLembretes])

  // ===== MÉTRICAS =====

  const agora = new Date()

  const totalAtivos = lembretes.filter((l) => l.status !== 'Concluído').length

  const totalHoje = lembretes.filter((l) => {
    const dt = new Date(l.dataBruta)
    return dt.toDateString() === agora.toDateString() && l.status !== 'Concluído'
  }).length

  const totalAtrasado = lembretes.filter((l) => l.status === 'Atrasado').length

  // ===== HANDLERS =====

  const handleConcluir = async (id: string) => {
    try {
      await concluirLembreteService(id)
      await carregarLembretes()
    } catch {
      setErro('Erro ao concluir lembrete.')
    }
  }

  const handleReabrir = async (id: string) => {
    try {
      await reabrirLembreteService(id)
      await carregarLembretes()
    } catch {
      setErro('Erro ao reabrir lembrete.')
    }
  }

  const handleEditar = (lembrete: Lembrete) => {
    setLembreteSelecionado(lembrete)
    setModalAberto(true)
  }

  const handleDeletar = async (id: string) => {
    try {
      await deletarLembreteService(id)
      await carregarLembretes()
    } catch {
      setErro('Erro ao deletar lembrete.')
    }
  }

  // ===== LOADING / ERRO =====

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Icon name="refresh" className="animate-spin mr-2" />
        Carregando lembretes...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Icon name="warning" className="text-red-400 text-4xl" />
        <p className="text-sm font-medium">{erro}</p>
        <button onClick={carregarLembretes} className="text-xs font-bold text-blue-600 underline">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ===== MÉTRICAS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-sky-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
              <Icon name="notifications_active" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total de lembretes ativos</p>
          <h3 className="text-2xl font-black text-slate-900">{totalAtivos}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Icon name="today" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-sky-100/60 px-2 py-1 rounded-lg">
              Hoje
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Lembretes para hoje</p>
          <h3 className="text-2xl font-black text-slate-900">{totalHoje}</h3>
        </div>

        <div
          className={`p-6 rounded-2xl shadow-sm border transition-colors ${totalAtrasado > 0
              ? 'bg-red-50/50 border-red-100 hover:bg-red-50/80'
              : 'bg-white border-slate-200 hover:bg-slate-50/50'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${totalAtrasado > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}
            >
              <Icon name="warning" />
            </div>
            {totalAtrasado > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                Ação requerida
              </span>
            )}
          </div>
          <p
            className={`text-sm font-semibold mb-1 ${totalAtrasado > 0 ? 'text-red-600 font-bold' : 'text-slate-600'
              }`}
          >
            Lembretes em atraso
          </p>
          <h3
            className={`text-2xl font-black ${totalAtrasado > 0 ? 'text-red-600' : 'text-slate-900'}`}
          >
            {totalAtrasado}
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
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value as typeof filtroTipo)
              setPaginaAtual(1)
            }}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Tipo: Todos</option>
            <option value="Pagamento">Pagamento</option>
            <option value="Atendimento">Atendimento</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Pessoal">Pessoal</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value as typeof filtroStatus)
              setPaginaAtual(1)
            }}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Status: Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
            <option value="Atrasado">Atrasado</option>
          </select>

          <select
            value={filtroPeriodo}
            onChange={(e) => {
              setFiltroPeriodo(e.target.value)
              setPaginaAtual(1)
            }}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Período: Todos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
        <button
          onClick={() => {
            setLembreteSelecionado(null)
            setModalAberto(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Icon name="add" className="text-sm" />
          Novo Lembrete
        </button>
      </section>

      {/* ===== CARDS ===== */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        {lembretesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Icon name="notifications_off" className="text-4xl" />
            <p className="text-sm font-medium">Nenhum lembrete encontrado.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {lembretesPagina.map((l) => (
              <LembreteCard
                key={l.id}
                lembrete={l}
                onConcluir={handleConcluir}
                onReabrir={handleReabrir}
                onEditar={handleEditar}
                onDeletar={handleDeletar}
              />
            ))}
          </div>
        )}

        {/* ===== PAGINAÇÃO ===== */}
        {lembretesFiltrados.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 bg-white">
            <p className="text-xs text-slate-600 font-medium">
              {inicio + 1}–{Math.min(inicio + ITENS_POR_PAGINA, lembretesFiltrados.length)} de{' '}
              {lembretesFiltrados.length} lembrete
              {lembretesFiltrados.length !== 1 ? 's' : ''}
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
      <LembreteModal
        key={lembreteSelecionado?.id ?? 'novo-lembrete'}
        isOpen={modalAberto}
        lembrete={lembreteSelecionado}
        onClose={() => {
          setModalAberto(false)
          setLembreteSelecionado(null)
          carregarLembretes()
        }}
      />
    </div>
  )
}
