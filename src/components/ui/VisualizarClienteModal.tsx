'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect, useCallback } from 'react'
import { Cliente, deletarCliente } from '@/services/clienteService'
import { ClienteModal } from '@/components/ui/ClienteModal'
import { listarAtendimentos, type Atendimento } from '@/services/atendimentoService'
import { listarPagamentos, type Pagamento } from '@/services/pagamentoService'

interface VisualizarClienteModalProps {
    isOpen: boolean
    onClose: () => void
    onClienteAtualizado?: () => void
    cliente: Cliente | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatarData = (data: string | null | undefined): string => {
    if (!data) return '—'
    try {
        return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    } catch {
        return '—'
    }
}

const formatarValorExibicao = (valor: number | string | undefined): string => {
    if (valor === undefined || valor === null || valor === '') return '—'
    const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor
    if (isNaN(num)) return '—'
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// "Agendado" | "Em Andamento" | "Pendente" | "Realizado"
const badgeAtendimento = (status: Atendimento['status_atendimento']): string => {
    switch (status) {
        case 'Realizado':    return 'bg-green-100 text-green-700'
        case 'Em Andamento': return 'bg-blue-100 text-blue-700'
        case 'Agendado':     return 'bg-sky-100 text-sky-700'
        case 'Pendente':     return 'bg-amber-100 text-amber-700'
    }
}

// "Pago" | "Pendente" | "Atrasado"
const badgePagamento = (status: Pagamento['status']): string => {
    switch (status) {
        case 'Pago':     return 'bg-green-100 text-green-700'
        case 'Atrasado': return 'bg-red-100 text-red-700'
        case 'Pendente': return 'bg-amber-100 text-amber-700'
    }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function VisualizarClienteModal({
    isOpen,
    onClose,
    onClienteAtualizado,
    cliente,
}: VisualizarClienteModalProps) {
    const [confirmarDelecao, setConfirmarDelecao] = useState(false)
    const [deletando, setDeletando] = useState(false)
    const [erroServidor, setErroServidor] = useState<string | null>(null)
    const [erroDependencia, setErroDependencia] = useState(false)
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)

    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
    const [carregandoHistorico, setCarregandoHistorico] = useState(false)
    const [exibirTodosAtendimentos, setExibirTodosAtendimentos] = useState(false)
    const [exibirTodosPagamentos, setExibirTodosPagamentos] = useState(false)

    // ── Carrega histórico ───────────────────────────────────────────────────
    const carregarHistorico = useCallback(async () => {
        if (!cliente) return
        setCarregandoHistorico(true)
        try {
            const [resA, resP] = await Promise.all([
                listarAtendimentos(),
                listarPagamentos(),
            ])

            // Atendimento não expõe ID_cliente na listagem — filtra por nome
            const atendimentosCliente = (resA.atendimentos ?? [])
                .filter((a) => a.nome_cliente === cliente.nome_cliente)
                .sort(
                    (a, b) =>
                        new Date(b.data_atendimento).getTime() -
                        new Date(a.data_atendimento).getTime()
                )

            // Pagamento referencia o atendimento pelo id — cruza com os IDs acima
            const idsAtendimento = new Set(
                atendimentosCliente.map((a) => String(a.ID_atendimento))
            )

            const pagamentosCliente = (resP.pagamentos ?? [])
                .filter((p) => idsAtendimento.has(String(p.atendimento.id)))
                .sort(
                    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
                )

            setAtendimentos(atendimentosCliente)
            setPagamentos(pagamentosCliente)
        } catch {
            // falha silenciosa — não bloqueia exibição do modal
        } finally {
            setCarregandoHistorico(false)
        }
    }, [cliente])

    useEffect(() => {
        if (isOpen && cliente) {
            setExibirTodosAtendimentos(false)
            setExibirTodosPagamentos(false)
            carregarHistorico()
        } else {
            setAtendimentos([])
            setPagamentos([])
        }
    }, [isOpen, cliente, carregarHistorico])

    // ── Derivados ───────────────────────────────────────────────────────────
    const totalRecebido = pagamentos
        .filter((p) => p.status === 'Pago')
        .reduce((acc, p) => acc + (p.valor ?? 0), 0)

    const temPagamentoAtrasado = pagamentos.some((p) => p.status === 'Atrasado')

    const totalAtrasado = pagamentos
        .filter((p) => p.status === 'Atrasado')
        .reduce((acc, p) => acc + (p.valor ?? 0), 0)

    const atendimentosVisiveis = exibirTodosAtendimentos
        ? atendimentos
        : atendimentos.slice(0, 5)

    const pagamentosVisiveis = exibirTodosPagamentos
        ? pagamentos
        : pagamentos.slice(0, 5)

    // ── Helper para gerar link WhatsApp ─────────────────────────────────────
    const gerarLinkWhatsApp = (): string => {
        if (!cliente?.telefone_cliente) return ''
        // Remove caracteres especiais do telefone
        const telefone = cliente.telefone_cliente.replace(/\D/g, '')
        // Se não começar com 55, adiciona código do Brasil
        const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`
        const mensagem = encodeURIComponent(
            `Olá *${cliente.nome_cliente}*! 👋\n\nVi que há pagamento(s) em atraso na sua conta. Podemos conversar sobre isso?\n\nTotal atrasado: ${formatarValorExibicao(totalAtrasado)}`
        )
        return `https://wa.me/${numeroFormatado}?text=${mensagem}`
    }

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!cliente) return
        try {
            setDeletando(true)
            setErroServidor(null)
            setErroDependencia(false)
            await deletarCliente(cliente.ID_cliente)
            setConfirmarDelecao(false)
            if (onClienteAtualizado) onClienteAtualizado()
            onClose()
        } catch (erro: any) {
            // Se já temos registros vinculados carregados, o erro é de dependência —
            // mostramos o aviso específico em vez da mensagem genérica do servidor.
            if (atendimentos.length > 0 || pagamentos.length > 0) {
                setErroDependencia(true)
            } else {
                setErroServidor(erro.message || 'Erro ao deletar cliente. Tente novamente.')
            }
        } finally {
            setDeletando(false)
        }
    }

    const fecharConfirmacao = () => {
        setConfirmarDelecao(false)
        setErroDependencia(false)
        setErroServidor(null)
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !deletando) {
            setConfirmarDelecao(false)
            onClose()
        }
    }

    const formatarValorLocal = (valor: number | string | undefined): string => {
        if (!valor && valor !== 0) return '—'
        const num = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor
        if (isNaN(num)) return '—'
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    if (!isOpen || !cliente) return null

    return (
        <>
            {/* Modal de Visualização */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
                onClick={handleOverlayClick}
            >
                <div
                    className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100">
                                <Icon name="person" className="text-sky-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Detalhes do Cliente</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Visão geral e histórico do proprietário.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={deletando}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Icon name="close" />
                        </button>
                    </div>

                    {/* Erro de servidor */}
                    {erroServidor && (
                        <div className="mx-6 mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-700 font-medium">{erroServidor}</p>
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Perfil */}
                        <section className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                Informações Pessoais
                            </p>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                    <Icon name="person" className="text-sky-600 text-3xl" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{cliente.nome_cliente}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cliente.status_cliente === 'Ativo'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                >
                                                    {cliente.status_cliente}
                                                </span>
                                                <span className="text-slate-400 text-xs">{cliente.tipo_contratacao_cliente}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor por visita</p>
                                            <p className="text-xl font-extrabold text-blue-600">
                                                {formatarValorLocal(cliente.valor_visita_cliente)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                        <div className="flex items-center gap-2">
                                            <Icon name="call" className="text-slate-400 text-base shrink-0" />
                                            <span className="text-sm text-slate-700">{cliente.telefone_cliente || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="mail" className="text-slate-400 text-base shrink-0" />
                                            <span className="text-sm text-slate-700 truncate">{cliente.email_cliente || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="calendar_today" className="text-slate-400 text-base shrink-0" />
                                            <span className="text-sm text-slate-700">
                                                Frequência:{' '}
                                                <span className="font-semibold">{cliente.frequencia_cliente || '—'}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="location_on" className="text-slate-400 text-base shrink-0" />
                                            <span className="text-sm text-slate-700">
                                                Bairro:{' '}
                                                <span className="font-semibold">{cliente.bairro_cliente || '—'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Localização */}
                        <section className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                Localização
                            </p>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start gap-2">
                                    <Icon name="location_on" className="text-slate-400 text-base mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-700">{`${cliente.endereco_cliente} - ${cliente.bairro_cliente}` || '—'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Configuração de Serviço */}
                        <section className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                Configuração de Serviço
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tipo</p>
                                    <p className="text-sm font-semibold text-slate-800">{cliente.tipo_contratacao_cliente || '—'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Frequência</p>
                                    <p className="text-sm font-semibold text-slate-800">{cliente.frequencia_cliente || '—'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Valor/Visita</p>
                                    <p className="text-sm font-semibold text-blue-600">
                                        {formatarValorLocal(cliente.valor_visita_cliente)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                                    <p className={`text-sm font-semibold ${cliente.status_cliente === 'Ativo' ? 'text-green-600' : 'text-slate-500'}`}>
                                        {cliente.status_cliente || '—'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Observações */}
                        {cliente.observacao_cliente && (
                            <section className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    Observações
                                </p>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{cliente.observacao_cliente}</p>
                                </div>
                            </section>
                        )}

                        {/* ── HISTÓRICO ────────────────────────────────────────── */}
                        {carregandoHistorico ? (
                            <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                                <span className="animate-spin text-lg">⏳</span>
                                <span className="text-sm">Carregando histórico…</span>
                            </div>
                        ) : (
                            <>
                                {/* Banner total recebido */}
                                {pagamentos.length > 0 && (
                                    <div className="rounded-xl bg-linear-to-r from-blue-600 to-blue-500 p-5 flex items-center justify-between shadow-md shadow-blue-200">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                                Total recebido
                                            </p>
                                            <p className="text-2xl font-black text-white mt-0.5">
                                                {formatarValorExibicao(totalRecebido)}
                                            </p>
                                            <p className="text-[10px] text-blue-200 mt-1">
                                                {pagamentos.filter((p) => p.status === 'Pago').length} pagamento(s) confirmado(s)
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">
                                            <Icon name="payments" className="text-white text-2xl" />
                                        </div>
                                    </div>
                                )}

                                {/* Alerta de Pagamento Atrasado com Link WhatsApp */}
                                {temPagamentoAtrasado && cliente.telefone_cliente && (
                                    <div className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 p-5 flex items-center justify-between shadow-md shadow-red-200 border border-red-400/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 shrink-0">
                                                <Icon name="warning" className="text-white text-lg" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-wider text-red-100">
                                                    Pagamento atrasado
                                                </p>
                                                <p className="text-sm font-semibold text-white mt-0.5">
                                                    {formatarValorExibicao(totalAtrasado)} em atraso
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={gerarLinkWhatsApp()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/95 hover:bg-white text-green-600 font-bold text-xs transition-all duration-200 shrink-0 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap ml-3"
                                        >
                                            <Icon name="chat" className="text-base" />
                                            WhatsApp
                                        </a>
                                    </div>
                                )}

                                {/* Histórico de Atendimentos */}
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Histórico de Atendimentos
                                        </p>
                                        <span className="text-xs text-slate-400">
                                            {atendimentos.length} registro{atendimentos.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {atendimentos.length === 0 ? (
                                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                                            <Icon name="event_busy" className="text-slate-300 text-3xl" />
                                            <p className="text-sm text-slate-400 mt-2">Nenhum atendimento registrado.</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Data</th>
                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Descrição</th>
                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Total</th>
                                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {atendimentosVisiveis.map((a) => (
                                                        <tr key={a.ID_atendimento} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                                                                {formatarData(a.data_atendimento)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-700 max-w-45 truncate" title={a.descri_atendimento}>
                                                                {a.descri_atendimento || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right whitespace-nowrap">
                                                                {formatarValorExibicao(a.total_atendimento)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeAtendimento(a.status_atendimento)}`}>
                                                                    {a.status_atendimento}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {atendimentos.length > 5 && (
                                                <button
                                                    onClick={() => setExibirTodosAtendimentos((v) => !v)}
                                                    className="w-full py-2.5 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors border-t border-slate-200 flex items-center justify-center gap-1"
                                                >
                                                    <Icon name={exibirTodosAtendimentos ? 'expand_less' : 'expand_more'} className="text-sm" />
                                                    {exibirTodosAtendimentos
                                                        ? 'Mostrar menos'
                                                        : `Ver todos (${atendimentos.length})`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* Histórico de Pagamentos */}
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                            Histórico de Pagamentos
                                        </p>
                                        <span className="text-xs text-slate-400">
                                            {pagamentos.length} registro{pagamentos.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {pagamentos.length === 0 ? (
                                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                                            <Icon name="receipt_long" className="text-slate-300 text-3xl" />
                                            <p className="text-sm text-slate-400 mt-2">Nenhum pagamento encontrado.</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                                            <div className="divide-y divide-slate-100">
                                                {pagamentosVisiveis.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors gap-3"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 shrink-0">
                                                                <Icon name="receipt" className="text-slate-500 text-base" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {formatarData(p.data)}
                                                                </p>
                                                                <p className="text-xs text-slate-400 truncate">
                                                                    {p.forma || '—'}
                                                                    {p.atendimento?.descricao
                                                                        ? ` · ${p.atendimento.descricao}`
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgePagamento(p.status)}`}>
                                                                {p.status}
                                                            </span>
                                                            <p className="text-sm font-bold text-slate-800 tabular-nums">
                                                                {formatarValorExibicao(p.valor)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {pagamentos.length > 5 && (
                                                <button
                                                    onClick={() => setExibirTodosPagamentos((v) => !v)}
                                                    className="w-full py-2.5 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors border-t border-slate-200 flex items-center justify-center gap-1"
                                                >
                                                    <Icon name={exibirTodosPagamentos ? 'expand_less' : 'expand_more'} className="text-sm" />
                                                    {exibirTodosPagamentos
                                                        ? 'Mostrar menos'
                                                        : `Ver todos (${pagamentos.length})`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {/* Confirmação de Deleção (inline) */}
                        {confirmarDelecao && (
                            <section>
                                {erroDependencia ? (
                                    /* ── Estado: erro de dependência ── */
                                    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 shrink-0">
                                                <Icon name="link" className="text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-amber-900">
                                                    Não é possível excluir este cliente
                                                </p>
                                                <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                                                    <strong>{cliente.nome_cliente}</strong> possui registros vinculados que
                                                    impedem a exclusão:
                                                </p>

                                                {/* Contadores de dependências */}
                                                <div className="flex items-center gap-3 mt-3">
                                                    {atendimentos.length > 0 && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-200 text-xs font-bold text-amber-800">
                                                            <Icon name="handyman" className="text-sm" />
                                                            {atendimentos.length} atendimento{atendimentos.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                    {pagamentos.length > 0 && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-200 text-xs font-bold text-amber-800">
                                                            <Icon name="receipt" className="text-sm" />
                                                            {pagamentos.length} pagamento{pagamentos.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-amber-600 mt-3">
                                                    Role para cima para visualizar o histórico completo.
                                                </p>

                                                {/* TODO: futuramente adicionar botão "Deletar tudo" aqui */}

                                                <div className="mt-4">
                                                    <button
                                                        onClick={fecharConfirmacao}
                                                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                                                    >
                                                        Entendido
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Estado: confirmação padrão ── */
                                    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 shrink-0">
                                                <Icon name="warning" className="text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-red-800">Excluir cliente permanentemente?</p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    Esta ação não pode ser desfeita. Todos os dados de{' '}
                                                    <strong>{cliente.nome_cliente}</strong> serão removidos.
                                                </p>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <button
                                                        onClick={handleDelete}
                                                        disabled={deletando}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deletando ? (
                                                            <>
                                                                <span className="animate-spin">⏳</span>
                                                                Excluindo...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icon name="delete" className="text-sm" />
                                                                Confirmar exclusão
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={fecharConfirmacao}
                                                        disabled={deletando}
                                                        className="px-4 py-2 rounded-lg text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            onClick={() => { setErroDependencia(false); setConfirmarDelecao(true) }}
                            disabled={deletando || confirmarDelecao}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-600 font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Icon name="delete" className="text-lg" />
                            Excluir
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                disabled={deletando}
                                className="px-6 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => setModalEdicaoAberto(true)}
                                disabled={deletando}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icon name="edit" className="text-lg" />
                                Editar Dados
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Edição (ClienteModal) */}
            <ClienteModal
                isOpen={modalEdicaoAberto}
                onClose={() => setModalEdicaoAberto(false)}
                onClienteSalvo={() => {
                    setModalEdicaoAberto(false)
                    if (onClienteAtualizado) onClienteAtualizado()
                    onClose()
                }}
                clienteParaEditar={cliente}
            />
        </>
    )
}
