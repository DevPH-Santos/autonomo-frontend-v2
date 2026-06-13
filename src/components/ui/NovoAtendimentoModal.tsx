'use client'

import { useState } from 'react'

interface Produto {
  id: string
  nome: string
  quantidade: number
  precoUnitario: number
}

interface NovoAtendimentoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NovoAtendimentoModal({ isOpen, onClose }: NovoAtendimentoModalProps) {
  const [cliente, setCliente] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [valorServico, setValorServico] = useState('350,00')
  const [status, setStatus] = useState('Agendado')
  const [observacoes, setObservacoes] = useState('')
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: '1', nome: 'Cloro Estabilizado (kg)', quantidade: 1.5, precoUnitario: 22 },
    { id: '2', nome: 'Algicida Choque (l)', quantidade: 1, precoUnitario: 45 },
  ])

  const totalCustos = produtos.reduce((acc, p) => acc + p.quantidade * p.precoUnitario, 0)
  const valorServicoNumerico = parseFloat(valorServico.replace(',', '.'))
  const lucro = valorServicoNumerico - totalCustos

  const adicionarProduto = () => {
    const novoId = Math.max(...produtos.map((p) => parseInt(p.id)), 0) + 1
    setProdutos([
      ...produtos,
      { id: novoId.toString(), nome: '', quantidade: 0, precoUnitario: 0 },
    ])
  }

  const removerProduto = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id))
  }

  const atualizarProduto = <Campo extends keyof Produto>(
    id: string,
    campo: Campo,
    valor: Produto[Campo]
  ) => {
    setProdutos(
      produtos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    )
  }

  const handleSalvar = () => {
    console.log({
      cliente,
      data,
      valorServico,
      status,
      observacoes,
      produtos,
      lucro,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-slate-100 flex items-center justify-between shrink-0 border-b border-slate-200">
          <h3 className="font-bold text-2xl text-blue-600">Novo Atendimento</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Seção 1: Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1 block">
                Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/30 rounded-full py-3 px-4 font-medium transition-all focus:bg-white"
                />
                <span className="material-symbols-outlined absolute right-4 top-3 text-slate-400 pointer-events-none">
                  person_search
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1 block">
                Data do Serviço
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/30 rounded-full py-3 px-4 font-medium transition-all focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1 block">
                Valor do Serviço (R$)
              </label>
              <input
                type="text"
                value={valorServico}
                onChange={(e) => setValorServico(e.target.value)}
                className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/30 rounded-full py-3 px-4 font-bold text-blue-600 transition-all focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/30 rounded-full py-3 px-4 font-medium appearance-none transition-all focus:bg-white cursor-pointer"
              >
                <option>Agendado</option>
                <option>Em Andamento</option>
                <option>Pendente</option>
                <option>Realizado</option>
              </select>
            </div>
          </div>

          {/* Seção 2: Observações */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase ml-1 block">
              Observações
            </label>
            <textarea
              placeholder="Notas sobre o estado da piscina ou solicitações especiais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-blue-500/30 rounded-3xl py-4 px-6 font-medium transition-all focus:bg-white resize-none"
            />
          </div>

          {/* Seção 3: Produtos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">science</span>
                Produtos utilizados
              </h4>
              <button
                onClick={adicionarProduto}
                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline transition-colors"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                Adicionar Produto
              </button>
            </div>

            {/* Lista de Produtos */}
            <div className="space-y-3">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center gap-4 bg-slate-100 p-3 rounded-full group hover:bg-slate-200 transition-colors"
                >
                  {/* Nome do Produto */}
                  <div className="flex-1 px-2">
                    <input
                      type="text"
                      value={produto.nome}
                      onChange={(e) =>
                        atualizarProduto(produto.id, 'nome', e.target.value)
                      }
                      placeholder="Nome do produto"
                      className="w-full bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.5"
                      value={produto.quantidade}
                      onChange={(e) =>
                        atualizarProduto(
                          produto.id,
                          'quantidade',
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full bg-white border-none rounded-full py-1.5 px-3 text-center text-sm font-bold focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Preço e Total */}
                  <div className="w-40 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <label className="text-xs text-slate-600">R$</label>
                      <input
                        type="number"
                        step="0.01"
                        value={produto.precoUnitario}
                        onChange={(e) =>
                          atualizarProduto(
                            produto.id,
                            'precoUnitario',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-20 bg-white border-none rounded-full py-1.5 px-2 text-right text-xs font-bold focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      R$ {(produto.quantidade * produto.precoUnitario).toFixed(2)}
                    </p>
                  </div>

                  {/* Botão Delete */}
                  <button
                    onClick={() => removerProduto(produto.id)}
                    className="p-1.5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Seção 4: Resumo */}
          <div className="bg-blue-50 rounded-3xl p-6 space-y-3 border border-blue-100">
            <div className="flex justify-between items-center border-b border-blue-200 pb-3">
              <span className="text-slate-600 font-medium">Total de custos (Produtos)</span>
              <span className="text-slate-900 font-bold text-lg">R$ {totalCustos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-start pt-1">
              <div className="flex flex-col">
                <span className="text-blue-600 font-extrabold uppercase text-xs tracking-tight">
                  Lucro do atendimento
                </span>
                <span className="text-slate-500 text-[10px] italic">Valor serviço - Custos</span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-extrabold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {lucro.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-100 border-t border-slate-200 flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-extrabold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Salvar Atendimento
          </button>
        </div>
      </div>
    </div>
  )
}
