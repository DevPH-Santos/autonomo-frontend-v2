'use client'

import { Icon } from '@/components/ui/icon'
import { useState } from 'react'
import { Cliente, deletarCliente } from '@/services/clienteService'
import { ClienteModal } from '@/components/ui/ClienteModal'

interface VisualizarClienteModalProps {
    isOpen: boolean
    onClose: () => void
    onClienteAtualizado?: () => void
    cliente: Cliente | null
}

export function VisualizarClienteModal({
    isOpen,
    onClose,
    onClienteAtualizado,
    cliente,
}: VisualizarClienteModalProps) {
    const [confirmarDelecao, setConfirmarDelecao] = useState(false)
    const [deletando, setDeletando] = useState(false)
    const [erroServidor, setErroServidor] = useState<string | null>(null)
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)

    const handleDelete = async () => {
        if (!cliente) return
        try {
            setDeletando(true)
            setErroServidor(null)
            await deletarCliente(cliente.ID_cliente)
            setConfirmarDelecao(false)
            if (onClienteAtualizado) onClienteAtualizado()
            onClose()
        } catch (erro: any) {
            setErroServidor(erro.message || 'Erro ao deletar cliente. Tente novamente.')
        } finally {
            setDeletando(false)
        }
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !deletando) {
            setConfirmarDelecao(false)
            onClose()
        }
    }

    const formatarValorExibicao = (valor: number | string | undefined): string => {
        if (!valor) return '—'
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
                                                {formatarValorExibicao(cliente.valor_visita_cliente)}
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
                                    <p className="text-sm text-slate-700">{cliente.endereco_cliente || '—'}</p>
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
                                        {formatarValorExibicao(cliente.valor_visita_cliente)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                                    <p
                                        className={`text-sm font-semibold ${cliente.status_cliente === 'Ativo' ? 'text-green-600' : 'text-slate-500'
                                            }`}
                                    >
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

                        {/* Confirmação de Deleção (inline) */}
                        {confirmarDelecao && (
                            <section>
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
                                                    onClick={() => setConfirmarDelecao(false)}
                                                    disabled={deletando}
                                                    className="px-4 py-2 rounded-lg text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            onClick={() => setConfirmarDelecao(true)}
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