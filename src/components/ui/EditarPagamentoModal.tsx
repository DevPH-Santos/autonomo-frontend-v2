'use client'

import { Icon } from '@/components/ui/icon'
import { useState } from 'react'

interface Pagamento {
    id: string
    cliente: string
    mesRef: string
    valor: string
    vencimento: string
    status: 'pago' | 'pendente' | 'atrasado'
}

interface EditarPagamentoModalProps {
    isOpen: boolean
    onClose: () => void
    pagamento: Pagamento | null
}

function formatarDataParaInput(data: string) {
    const [dia, mes, ano] = data.split('/')
    return `${ano}-${mes}-${dia}`
}

function criarCamposIniciais(pagamento: Pagamento | null) {
    if (!pagamento) {
        return {
            cliente: '',
            mes: 'janeiro',
            valor: '',
            vencimento: '',
            forma: 'pix',
            status: 'pendente',
            observacoes: '',
        }
    }

    return {
        cliente: pagamento.cliente,
        mes: pagamento.mesRef.split(' ')[0].toLowerCase(),
        valor: pagamento.valor.replace('R$ ', ''),
        vencimento: formatarDataParaInput(pagamento.vencimento),
        forma: 'pix',
        status: pagamento.status,
        observacoes: '',
    }
}

export function EditarPagamentoModal({ isOpen, onClose, pagamento }: EditarPagamentoModalProps) {
    const camposIniciais = criarCamposIniciais(pagamento)
    const [cliente] = useState(camposIniciais.cliente)
    const [mes, setMes] = useState(camposIniciais.mes)
    const [valor, setValor] = useState(camposIniciais.valor)
    const [vencimento, setVencimento] = useState(camposIniciais.vencimento)
    const [forma, setForma] = useState(camposIniciais.forma)
    const [status, setStatus] = useState(camposIniciais.status)
    const [observacoes, setObservacoes] = useState(camposIniciais.observacoes)

    const handleSalvar = () => {
        console.log({
            cliente,
            mes,
            valor,
            vencimento,
            forma,
            status,
            observacoes,
        })
        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    if (!isOpen) return null

    const meses = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
    ]

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Editar Pagamento
                        </h2>
                        <p className="text-slate-600 text-sm font-medium mt-1">
                            Atualize as informações de faturamento do cliente.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-900 p-2 rounded-full transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                {/* Body */}
                <form className="px-8 py-4 flex-1 overflow-y-auto space-y-6">
                    {/* Cliente */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 ml-1">
                            Cliente
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cliente}
                                readOnly
                                className="w-full bg-slate-100 border-none rounded-full px-5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            <Icon name="search" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Mês e Valor */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Mês de Referência */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Mês de referência
                            </label>
                            <div className="relative">
                                <select
                                    value={mes}
                                    onChange={(e) => setMes(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-full px-5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none"
                                >
                                    {meses.map((m) => (
                                        <option key={m} value={m.toLowerCase()}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                                <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Valor */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Valor
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                    R$
                                </span>
                                <input
                                    type="text"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-full pl-12 pr-5 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vencimento e Forma */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Data de Vencimento */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Vencimento
                            </label>
                            <input
                                type="date"
                                value={vencimento}
                                onChange={(e) => setVencimento(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-full px-5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                        </div>

                        {/* Forma de Pagamento */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 ml-1">
                                Forma
                            </label>
                            <div className="relative">
                                <select
                                    value={forma}
                                    onChange={(e) => setForma(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-full px-5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none"
                                >
                                    <option value="dinheiro">Dinheiro</option>
                                    <option value="pix">PIX</option>
                                    <option value="cartao">Cartão</option>
                                    <option value="boleto">Boleto</option>
                                </select>
                                <Icon name="payments" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Status do Pagamento */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700 ml-1">
                            Status do Pagamento
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {/* Pago */}
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="pago"
                                    checked={status === 'pago'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="sr-only peer"
                                />
                                <div
                                    className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${status === 'pago'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                >
                                    <Icon name="check_circle" className="text-lg" />
                                    <span>Pago</span>
                                </div>
                            </label>

                            {/* Pendente */}
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="pendente"
                                    checked={status === 'pendente'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="sr-only peer"
                                />
                                <div
                                    className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${status === 'pendente'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                >
                                    <Icon name="schedule" className="text-lg" />
                                    <span>Pendente</span>
                                </div>
                            </label>

                            {/* Atrasado */}
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="atrasado"
                                    checked={status === 'atrasado'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="sr-only peer"
                                />
                                <div
                                    className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${status === 'atrasado'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                >
                                    <Icon name="warning" className="text-lg" />
                                    <span>Atrasado</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 ml-1">
                            Observações internas
                        </label>
                        <textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Ex: Cliente solicitou nota fiscal por e-mail..."
                            rows={3}
                            className="w-full bg-slate-100 border-none rounded-xl px-5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-100 flex items-center justify-end gap-4 border-t border-slate-200">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-3 rounded-full font-semibold text-blue-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSalvar}
                        className="px-10 py-3 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    )
}
