'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import {
    cadastrarProduto,
    atualizarProduto,
    deletarProduto,
} from '@/services/produtoService'
import type { Produto } from '@/types/produto'
import { formatarInteiroComoMoeda, formatarValor } from '@/services/formatters'

interface ProdutoModalProps {
    isOpen: boolean
    onClose: () => void
    produto?: Produto | null
    onAtualizado?: () => void
    onExcluido?: () => void
}

type DialogType = 'confirmDelete' | 'unsavedChanges' | null

export function ProdutoModal({
    isOpen,
    onClose,
    produto,
    onAtualizado,
    onExcluido,
}: ProdutoModalProps) {
    const isEditing = Boolean(produto)
    const [nome, setNome] = useState('')
    const [preco, setPreco] = useState('')
    const [quantidade, setQuantidade] = useState('')
    const [unidade, setUnidade] = useState('kg')
    const [salvando, setSalvando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)
    const [erro, setErro] = useState('')
    const [dialog, setDialog] = useState<DialogType>(null)

    useEffect(() => {
        if (isOpen) {
            if (produto) {
                setNome(produto.nome_produto)
                setPreco(String(formatarValor(produto.valor_produto)))
                setQuantidade(String(produto.quantidade_produto))
                setUnidade(produto.unidade_medida)
            } else {
                setNome('')
                setPreco('')
                setQuantidade('')
                setUnidade('kg')
            }
            setErro('')
        }
    }, [isOpen, produto])

    const temAlteracoes = isEditing
        ? produto &&
          (nome !== produto.nome_produto ||
              preco !== String(formatarValor(produto.valor_produto)) ||
              quantidade !== String(produto.quantidade_produto) ||
              unidade !== produto.unidade_medida)
        : Boolean(nome || preco || quantidade)

    function handleTentarFechar() {
        if (temAlteracoes) {
            setDialog('unsavedChanges')
        } else {
            onClose()
        }
    }

    function handleDescartarAlteracoes() {
        setDialog(null)
        onClose()
    }

    async function handleSalvar() {
        if (!nome.trim() || !preco.trim() || !quantidade.trim()) {
            setErro('Preencha todos os campos obrigatórios.')
            return
        }

        setSalvando(true)
        setErro('')

        try {
            const valorNumerico = Number(
                preco.replace(/\D/g, '').replace(/(\d+)(\d{2})$/, '$1.$2')
            )
            const quantidadeNumerica = Number(quantidade)

            if (isEditing && produto) {
                await atualizarProduto(produto.ID_produto, {
                    nome_produto: nome,
                    valor_produto: valorNumerico,
                    quantidade_produto: quantidadeNumerica,
                    unidade_medida: unidade,
                })
            } else {
                await cadastrarProduto({
                    nome_produto: nome,
                    valor_produto: valorNumerico,
                    quantidade_produto: quantidadeNumerica,
                    unidade_medida: unidade,
                })
            }

            onAtualizado?.()
            onClose()
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Erro ao salvar produto.')
        } finally {
            setSalvando(false)
        }
    }

    async function handleSalvarDoDialog() {
        setDialog(null)
        await handleSalvar()
    }

    async function handleExcluir() {
        if (!produto) return

        setExcluindo(true)
        setErro('')

        try {
            await deletarProduto(produto.ID_produto)
            setDialog(null)
            onExcluido?.()
            onClose()
        } catch (err) {
            setErro(err instanceof Error ? err.message : 'Erro ao excluir produto.')
            setDialog(null)
        } finally {
            setExcluindo(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Overlay principal */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                onClick={handleTentarFechar}
            >
                <div
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-200 flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {isEditing ? 'Editar Produto' : 'Novo Produto'}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {isEditing
                                    ? 'Edite os campos para atualizar'
                                    : 'Preencha os dados do novo produto'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <button
                                    onClick={() => setDialog('confirmDelete')}
                                    title="Excluir produto"
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Icon name="delete" />
                                </button>
                            )}
                            <button
                                onClick={handleTentarFechar}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <Icon name="close" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        {erro && (
                            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                                {erro}
                            </p>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                                Nome do Produto
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                                placeholder="Ex: Cloro Granulado"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                                    Preço Unitário (R$)
                                </label>
                                <input
                                    type="text"
                                    value={preco}
                                    onChange={(e) => setPreco(formatarInteiroComoMoeda(e.target.value))}
                                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                                    placeholder="R$ 0,00"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                                    Unidade de Medida
                                </label>
                                <select
                                    value={unidade}
                                    onChange={(e) => setUnidade(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all appearance-none cursor-pointer"
                                >
                                    <option value="kg">kg</option>
                                    <option value="l">l</option>
                                    <option value="un">un</option>
                                    <option value="galão">galão</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                                Quantidade
                            </label>
                            <input
                                type="text"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                                placeholder="Ex: 10"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
                        <button
                            onClick={handleTentarFechar}
                            disabled={salvando}
                            className="px-6 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSalvar}
                            disabled={salvando}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {salvando ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Dialog: confirmar exclusão */}
            {dialog === 'confirmDelete' && produto && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div
                        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-slate-900">
                                Excluir produto?
                            </h4>
                            <p className="text-sm text-slate-500">
                                Esta ação não pode ser desfeita. O produto{' '}
                                <span className="font-semibold text-slate-700">
                                    {produto.nome_produto}
                                </span>{' '}
                                será removido permanentemente.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDialog(null)}
                                disabled={excluindo}
                                className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleExcluir}
                                disabled={excluindo}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {excluindo ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog: alterações não salvas */}
            {dialog === 'unsavedChanges' && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div
                        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-slate-900">
                                Salvar alterações?
                            </h4>
                            <p className="text-sm text-slate-500">
                                Você fez alterações que ainda não foram salvas.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleDescartarAlteracoes}
                                disabled={salvando}
                                className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                                Descartar
                            </button>
                            <button
                                onClick={handleSalvarDoDialog}
                                disabled={salvando}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
