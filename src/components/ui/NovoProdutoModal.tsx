'use client'

import { useState } from 'react'

interface NovoProdutoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NovoProdutoModal({ isOpen, onClose }: NovoProdutoModalProps) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [unidade, setUnidade] = useState('kg')
  const [observacao, setObservacao] = useState('')

  const handleSalvar = () => {
    console.log({
      nome,
      preco,
      unidade,
      observacao,
    })
    setNome('')
    setPreco('')
    setUnidade('kg')
    setObservacao('')
    onClose()
  }

  const handleCancel = () => {
    setNome('')
    setPreco('')
    setUnidade('kg')
    setObservacao('')
    onClose()
  }

  if (!isOpen) return null

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
            <h3 className="text-xl font-bold text-slate-900">Novo Produto</h3>
            <p className="text-sm text-slate-600 mt-1">Adicione um novo item ao seu catálogo</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Nome do Produto */}
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

          {/* Preço e Unidade */}
          <div className="grid grid-cols-2 gap-4">
            {/* Preço Unitário */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Preço Unitário (R$)
              </label>
              <input
                type="text"
                placeholder="0,00"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
              />
            </div>

            {/* Unidade de Medida */}
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

          {/* Observação */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 tracking-wide">
              Observação
            </label>
            <textarea
              placeholder="Informações adicionais sobre o produto..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-100 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
