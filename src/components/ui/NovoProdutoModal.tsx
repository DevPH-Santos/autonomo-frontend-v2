'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import {
  cadastrarProduto,
  atualizarProduto,
  type Produto,
} from '@/services/produtoService'

interface NovoProdutoModalProps {
  isOpen: boolean
  onClose: () => void
  produtoEditando?: Produto | null
}

export function NovoProdutoModal({
  isOpen,
  onClose,
  produtoEditando,
}: NovoProdutoModalProps) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('kg')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (produtoEditando) {
      setNome(produtoEditando.nome_produto)
      setPreco(String(produtoEditando.valor_produto))
      setQuantidade(String(produtoEditando.quantidade_produto))
      setUnidade(produtoEditando.unidade_medida)
    } else {
      resetarCampos()
    }
  }, [produtoEditando, isOpen])

  function resetarCampos() {
    setNome('')
    setPreco('')
    setQuantidade('')
    setUnidade('kg')
    setErro('')
  }

  async function handleSalvar() {
    if (!nome.trim() || !preco.trim() || !quantidade.trim()) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    setSalvando(true)
    setErro('')

    try {
      if (produtoEditando) {
        await atualizarProduto(produtoEditando.ID_produto, {
          nome_produto: nome,
          valor_produto: preco,
          quantidade_produto: quantidade,
          unidade_medida: unidade,
        })
      } else {
        await cadastrarProduto({
          nome_produto: nome,
          valor_produto: preco,
          quantidade_produto: quantidade,
          unidade_medida: unidade,
        })
      }
      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar produto.')
    } finally {
      setSalvando(false)
    }
  }

  function handleCancel() {
    resetarCampos()
    onClose()
  }

  if (!isOpen) return null

  const titulo = produtoEditando ? 'Editar Produto' : 'Novo Produto'
  const subtitulo = produtoEditando
    ? 'Atualize os dados do produto'
    : 'Adicione um novo item ao seu catálogo'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{titulo}</h3>
            <p className="text-sm text-slate-600 mt-1">{subtitulo}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <Icon name="close" />
          </button>
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
              placeholder="Ex: Cloro Estabilizado"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Preço Unitário (R$)
              </label>
              <input
                type="text"
                placeholder="0.00"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
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
              placeholder="Ex: 10"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-100 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={handleCancel}
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
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
