'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import { ProdutoModal } from '@/components/ui/ProdutoModal'
import { listarProdutos } from '@/services/produtoService'
import type { Produto } from '@/types/produto'
import { formatarValor } from '@/services/formatters'

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarProdutos() {
    try {
      const { produtos } = await listarProdutos()
      setProdutos(produtos)
    } catch (err) {
      console.error('Erro ao listar produtos:', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  function handleAbrirNovoModal() {
    setProdutoSelecionado(null)
    setModalAberto(true)
  }

  function handleAbrirEditarModal(produto: Produto) {
    setProdutoSelecionado(produto)
    setModalAberto(true)
  }

  function handleFecharModal() {
    setModalAberto(false)
    setProdutoSelecionado(null)
    carregarProdutos()
  }

  const totalProdutos = produtos.length

  const custoMedio =
    totalProdutos > 0
      ? (
        produtos.reduce((acc, p) => acc + p.valor_produto, 0) /
        totalProdutos
      ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'R$ 0,00'

  const status = totalProdutos > 0 ? 'Ativo' : 'Vazio'

  return (
    <>
      <ProdutoModal
        isOpen={modalAberto}
        onClose={handleFecharModal}
        produto={produtoSelecionado}
        onAtualizado={handleFecharModal}
        onExcluido={handleFecharModal}
      />

      <div className="space-y-8">
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Produtos
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Gerenciamento de produtos utilizados nos serviços
            </p>
          </div>

          <button
            onClick={handleAbrirNovoModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20"
          >
            <Icon name="add" />
            Novo Produto
          </button>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Icon name="inventory_2" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total de Produtos
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalProdutos}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <Icon name="payments" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Preço Médio
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {custoMedio}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Icon name="check_circle" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Status do Estoque
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {status}
              </h3>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Catálogo de Produtos</h2>
          </div>

          {carregando ? (
            <div className="p-12 text-center text-slate-500">
              Carregando produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Nenhum produto cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/50 text-slate-600 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Preço Unitário</th>
                    <th className="px-6 py-4">Quantidade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {produtos.map((produto) => (
                    <tr
                      key={produto.ID_produto}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {produto.nome_produto}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        R$ {formatarValor(produto.valor_produto)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {produto.quantidade_produto} {produto.unidade_medida}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleAbrirEditarModal(produto)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg font-semibold text-xs transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
