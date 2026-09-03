'use client'

import { Icon } from '@/components/ui/icon'
import { useState } from 'react'
import { deletarPagamento } from '@/services/pagamentoService'

interface DeletarPagamentoModalProps {
    isOpen: boolean
    onClose: () => void
    pagamento: {
        id: string | number
        cliente: string
        valor: string
        vencimento: string
    } | null
    onExcluido?: () => void
}

export function DeletarPagamentoModal({
    isOpen,
    onClose,
    pagamento,
    onExcluido,
}: DeletarPagamentoModalProps) {
    const [excluindo, setExcluindo] = useState(false)
    const [erro, setErro] = useState('')

    async function handleExcluir() {
        if (!pagamento) return

        setExcluindo(true)
        setErro('')

        try {
            await deletarPagamento(pagamento.id)
            onExcluido?.()
            onClose()
        } catch (err) {
            setErro(
                err instanceof Error
                    ? err.message
                    : 'Erro ao excluir pagamento.'
            )
        } finally {
            setExcluindo(false)
        }
    }

    if (!isOpen || !pagamento) return null

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ícone de alerta */}
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Icon name="warning" className="text-red-600 text-xl" />
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="space-y-2 text-center">
                    <h4 className="text-lg font-bold text-slate-900">
                        Excluir pagamento?
                    </h4>
                    <p className="text-sm text-slate-500">
                        Esta ação não pode ser desfeita. O pagamento de{' '}
                        <span className="font-semibold text-slate-700">
                            {pagamento.cliente}
                        </span>{' '}
                        será removido permanentemente.
                    </p>
                </div>

                {/* Detalhes do pagamento */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Valor:</span>
                        <span className="font-semibold text-slate-900">
                            {pagamento.valor}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Vencimento:</span>
                        <span className="font-semibold text-slate-900">
                            {pagamento.vencimento}
                        </span>
                    </div>
                </div>

                {/* Erro */}
                {erro && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        {erro}
                    </p>
                )}

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={excluindo}
                        className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExcluir}
                        disabled={excluindo}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {excluindo ? (
                            <>
                                <Icon name="refresh" className="animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Icon name="delete" className="text-lg" />
                                Excluir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
