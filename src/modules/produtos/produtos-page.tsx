'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import { NovoProdutoModal } from '@/components/ui/NovoProdutoModal'
import { ProdutoModal } from '@/components/ui/ProdutoModal'
import { listarProdutos, type Produto } from '@/services/produtoService'
import { formatarValor } from '@/services/formatters'

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [novoModalAberto, setNovoModalAberto] = useState(false)
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

  function handleFecharNovoModal() {
    setNovoModalAberto(false)
    carregarProdutos()
  }

  function handleFecharProdutoModal() {
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
      <NovoProdutoModal
        isOpen={novoModalAberto}
        onClose={handleFecharNovoModal}
      />

      {produtoSelecionado && (
        <ProdutoModal
          isOpen={!!produtoSelecionado}
          onClose={handleFecharProdutoModal}
          produto={produtoSelecionado}
          onAtualizado={handleFecharProdutoModal}
          onExcluido={handleFecharProdutoModal}
        />
      )}

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
            onClick={() => setNovoModalAberto(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Icon name="add" />
            Novo Produto
          </button>
        </section>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Nome do Produto
                </th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Preço Unitário
                </th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Unidade
                </th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Quantidade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {carregando ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-slate-400">
                    Carregando produtos...
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-slate-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr
                    key={produto.ID_produto}
                    onClick={() => setProdutoSelecionado(produto)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6 font-semibold text-blue-600">
                      {produto.nome_produto}
                    </td>
                    <td className="px-8 py-6 text-slate-600">
                      R$ {formatarValor(produto.valor_produto)}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {produto.unidade_medida}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-600">
                      {produto.quantidade_produto}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-sky-100/30 p-8 rounded-2xl flex flex-col gap-3 border border-sky-200/50">
            <Icon name="inventory" className="text-blue-600 text-2xl w-fit" />
            <h3 className="font-bold text-3xl text-slate-900">
              {String(totalProdutos).padStart(2, '0')}
            </h3>
            <p className="text-sm font-medium text-slate-700">Produtos Cadastrados</p>
          </div>

          <div className="bg-slate-100 p-8 rounded-2xl flex flex-col gap-3 border border-slate-200">
            <Icon name="shopping_cart" className="text-slate-600 text-2xl w-fit" />
            <h3 className="font-bold text-3xl text-slate-900">{custoMedio}</h3>
            <p className="text-sm font-medium text-slate-700">Custo Médio p/ Unidade</p>
          </div>

          <div className="bg-slate-200/40 p-8 rounded-2xl flex flex-col gap-3 border border-slate-300/50">
            <Icon name="trending_up" className="text-purple-600 text-2xl w-fit" />
            <h3 className="font-bold text-3xl text-slate-900">{status}</h3>
            <p className="text-sm font-medium text-slate-700">Status do Inventário</p>
          </div>
        </div>
      </div>
    </>
  )
}
