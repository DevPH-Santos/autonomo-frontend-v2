'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect, useCallback } from 'react'
import { EditarPagamentoModal } from '@/components/ui/EditarPagamentoModal'
import {
  listarPagamentos,
  deletarPagamento as deletarPagamentoService,
  atualizarStatusPagamento,
} from '@/services/pagamentoService'
import type { Pagamento as PagamentoAPI } from '@/services/pagamentoService'

// ==========================================
// CONSTANTES
// ==========================================

const ITENS_POR_PAGINA = 10

// ==========================================
// TIPOS E INTERFACES
// ==========================================

interface Pagamento {
  id: string
  iniciais: string
  cliente: string
  descricaoAtendimento: string
  mesRef: string
  valor: string
  valorNumerico: number
  vencimento: string
  status: 'pago' | 'pendente' | 'atrasado'
  forma: string
  observacao: string | null
}

// ==========================================
// HELPERS
// ==========================================

function obterIniciais(nome: string): string {
  return nome
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function formatarData(dataISO: string): string {
  return new Date(dataISO).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatarMesRef(dataISO: string): string {
  const str = new Date(dataISO).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatarValor(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function mapearStatus(status: string): 'pago' | 'pendente' | 'atrasado' {
  const mapa: Record<string, 'pago' | 'pendente' | 'atrasado'> = {
    Pago: 'pago',
    Pendente: 'pendente',
    Atrasado: 'atrasado',
  }
  return mapa[status] ?? 'pendente'
}

function mapearParaLocal(pag: PagamentoAPI): Pagamento {
  return {
    id: String(pag.id),
    iniciais: obterIniciais(pag.cliente),
    cliente: pag.cliente,
    descricaoAtendimento: pag.atendimento.descricao,
    mesRef: formatarMesRef(pag.data),
    valor: formatarValor(pag.valor),
    valorNumerico: pag.valor,
    vencimento: formatarData(pag.data),
    status: mapearStatus(pag.status),
    forma: pag.forma,
    observacao: pag.observacao,
  }
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function StatusBadge({ status }: { status: 'pago' | 'pendente' | 'atrasado' }) {
  const statusConfig = {
    pago: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'PAGO', dot: 'bg-emerald-600' },
    pendente: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'PENDENTE', dot: 'bg-slate-500' },
    atrasado: { bg: 'bg-red-100', text: 'text-red-700', label: 'ATRASADO', dot: 'bg-red-600' },
  }
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function ClientAvatar({ iniciais }: { iniciais: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
      {iniciais}
    </div>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)

  // ===== FILTROS =====
  const [filtroStatus, setFiltroStatus] = useState<'pago' | 'pendente' | 'atrasado' | ''>('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  // ===== DADOS DERIVADOS =====

  const mesesDisponiveis = [...new Set(pagamentos.map((p) => p.mesRef))]
  const clientesDisponiveis = [...new Set(pagamentos.map((p) => p.cliente))]

  const pagamentosFiltrados = pagamentos.filter((p) => {
    if (filtroStatus && p.status !== filtroStatus) return false
    if (filtroCliente && p.cliente !== filtroCliente) return false
    if (filtroMes && p.mesRef !== filtroMes) return false
    return true
  })

  const totalPaginas = Math.max(1, Math.ceil(pagamentosFiltrados.length / ITENS_POR_PAGINA))
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  const pagamentosPagina = pagamentosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA)

  // Botões de página visíveis: até 5 centrados na página atual
  const botoesVisiveis = (): number[] => {
    const delta = 2
    const left = Math.max(1, paginaAtual - delta)
    const right = Math.min(totalPaginas, paginaAtual + delta)
    const range: number[] = []
    for (let i = left; i <= right; i++) range.push(i)
    return range
  }

  // Reseta para página 1 sempre que um filtro mudar
  useEffect(() => {
    setPaginaAtual(1)
  }, [filtroStatus, filtroCliente, filtroMes])

  // ===== BUSCA DE DADOS =====

  const carregarPagamentos = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)
      const resposta = await listarPagamentos()
      setPagamentos(resposta.pagamentos.map(mapearParaLocal))
    } catch {
      setErro('Não foi possível carregar os pagamentos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarPagamentos()
  }, [carregarPagamentos])

  // ===== MÉTRICAS =====

  const totalRecebido = pagamentos
    .filter((p) => p.status === 'pago')
    .reduce((acc, p) => acc + p.valorNumerico, 0)

  const totalAReceber = pagamentos
    .filter((p) => p.status === 'pendente')
    .reduce((acc, p) => acc + p.valorNumerico, 0)

  const totalAtrasado = pagamentos
    .filter((p) => p.status === 'atrasado')
    .reduce((acc, p) => acc + p.valorNumerico, 0)

  // ===== HANDLERS =====

  const handleEditarPagamento = (pagamento: Pagamento) => {
    setPagamentoSelecionado(pagamento)
    setModalAberto(true)
  }

  const handleMarcarPago = async (id: string) => {
    try {
      await atualizarStatusPagamento(id, 'Pago')
      await carregarPagamentos()
    } catch {
      setErro('Erro ao atualizar status do pagamento.')
    }
  }

  const handleDeletar = async (id: string) => {
    try {
      await deletarPagamentoService(id)
      await carregarPagamentos()
    } catch {
      setErro('Erro ao deletar pagamento.')
    }
  }

  // ===== ESTADOS DE LOADING / ERRO =====

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Icon name="refresh" className="animate-spin mr-2" />
        Carregando pagamentos...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Icon name="warning" className="text-red-400 text-4xl" />
        <p className="text-sm font-medium">{erro}</p>
        <button onClick={carregarPagamentos} className="text-xs font-bold text-blue-600 underline">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ===== MÉTRICAS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-emerald-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
              <Icon name="account_balance_wallet" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total recebido</p>
          <h3 className="text-2xl font-black text-slate-900">{formatarValor(totalRecebido)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-sky-100 text-blue-600 rounded-full flex items-center justify-center">
              <Icon name="pending_actions" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-sky-100/60 px-2 py-1 rounded-lg">
              Este Mês
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total a receber no mês</p>
          <h3 className="text-2xl font-black text-slate-900">{formatarValor(totalAReceber)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-red-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <Icon name="warning" />
            </div>
            {totalAtrasado > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                Atenção
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total em atraso</p>
          <h3 className={`text-2xl font-black ${totalAtrasado > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatarValor(totalAtrasado)}
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
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Status: Todos</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
          </select>

          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Cliente: Todos</option>
            {clientesDisponiveis.map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
          </select>

          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900"
          >
            <option value="">Mês: Todos</option>
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setPagamentoSelecionado(null); setModalAberto(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Icon name="add" className="text-sm" />
          Novo Lançamento
        </button>
      </section>

      {/* ===== TABELA ===== */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        {pagamentosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Icon name="receipt_long" className="text-4xl" />
            <p className="text-sm font-medium">Nenhum pagamento encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Mês Ref.</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Valor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagamentosPagina.map((pag) => (
                  <tr key={pag.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ClientAvatar iniciais={pag.iniciais} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{pag.cliente}</p>
                          <p className="text-xs text-slate-500">{pag.descricaoAtendimento}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{pag.mesRef}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{pag.valor}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{pag.vencimento}</td>
                    <td className="px-6 py-4"><StatusBadge status={pag.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pag.status === 'pendente' && (
                          <button
                            onClick={() => handleMarcarPago(pag.id)}
                            className="text-blue-600 hover:underline text-xs font-bold px-3 py-1 rounded-lg bg-blue-50"
                          >
                            Marcar Pago
                          </button>
                        )}
                        {pag.status === 'atrasado' && (
                          <button className="text-red-600 hover:underline text-xs font-bold px-3 py-1 rounded-lg border border-red-200">
                            Cobrar Cliente
                          </button>
                        )}
                        <button
                          onClick={() => handleEditarPagamento(pag)}
                          className="text-slate-500 hover:text-blue-600 transition-colors"
                          title="Editar pagamento"
                        >
                          <Icon name="edit" className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeletar(pag.id)}
                          className="text-slate-500 hover:text-red-600 transition-colors"
                          title="Deletar pagamento"
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
        {pagamentosFiltrados.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 bg-white">
            <p className="text-xs text-slate-600 font-medium">
              {inicio + 1}–{Math.min(inicio + ITENS_POR_PAGINA, pagamentosFiltrados.length)} de {pagamentosFiltrados.length} pagamento{pagamentosFiltrados.length !== 1 ? 's' : ''}
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
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    paginaAtual === num
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
      <EditarPagamentoModal
        key={pagamentoSelecionado?.id ?? 'novo-pagamento'}
        isOpen={modalAberto}
        pagamento={pagamentoSelecionado}
        onClose={() => {
          setModalAberto(false)
          setPagamentoSelecionado(null)
          carregarPagamentos()
        }}
      />
    </div>
  )
}
