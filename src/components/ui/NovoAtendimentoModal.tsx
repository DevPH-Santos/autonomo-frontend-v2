'use client'

import { Icon } from '@/components/ui/icon'
import {
  buscarClientesAtendimento,
  buscarProdutosAtendimento,
  cadastrarAtendimento,
  type ClienteBuscaAtendimento,
  type ProdutoBuscaAtendimento,
  type StatusAtendimento,
} from '@/services/atendimentoService'
import { useState, useRef, useEffect } from 'react'
import { obterClientesCache } from '@/services/clienteService'
import { obterProdutosCache } from '@/services/produtoService'
import { formatarInteiroComoMoeda } from '@/services/formatters'

interface Produto {
  id: string
  ID_produto: string
  nome: string
  quantidade: number
  precoUnitario: number
}

interface NovoAtendimentoModalProps {
  isOpen: boolean
  onClose: () => void
  onAtendimentoSalvo?: () => void
}

function obterDataHoje() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function converterMoedaParaNumero(valor: string) {
  const valorLimpo = valor.trim()
  if (!valorLimpo) return NaN

  if (valorLimpo.includes(',')) {
    return Number(valorLimpo.replace(/\./g, '').replace(',', '.'))
  }

  return Number(valorLimpo)
}

export function NovoAtendimentoModal({
  isOpen,
  onClose,
  onAtendimentoSalvo,
}: NovoAtendimentoModalProps) {
  const [cliente, setCliente] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [data, setData] = useState(obterDataHoje())
  const [valorServico, setValorServico] = useState('')
  const [status, setStatus] = useState<StatusAtendimento>('Agendado')
  const [descricao, setDescricao] = useState('')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [clienteAberto, setClienteAberto] = useState(false)
  const [clientesOpcoes, setClientesOpcoes] = useState<ClienteBuscaAtendimento[]>([])
  const refClienteAberto = useRef<HTMLDivElement>(null)

  const [produtoEmEdicao, setProdutoEmEdicao] = useState<string | null>(null)
  const [buscarProduto, setBuscarProduto] = useState('')
  const [produtosOpcoes, setProdutosOpcoes] = useState<ProdutoBuscaAtendimento[]>([])
  const [produtoAberto, setProdutoAberto] = useState(false)
  const refProdutoAberto = useRef<HTMLDivElement>(null)

  const totalCustos = produtos.reduce((acc, p) => acc + p.quantidade * p.precoUnitario, 0)
  const valorServicoNumerico = converterMoedaParaNumero(valorServico) || 0
  const lucro = valorServicoNumerico > totalCustos ? valorServicoNumerico - totalCustos : 0

  function resetarFormulario() {
    setCliente('')
    setClienteId('')
    setData(obterDataHoje())
    setValorServico('')
    setStatus('Agendado')
    setDescricao('')
    setProdutos([])
    setErro('')
    setClienteAberto(false)
    setClientesOpcoes([])
    setProdutoEmEdicao(null)
    setBuscarProduto('')
    setProdutosOpcoes([])
    setProdutoAberto(false)
  }

  function handleFechar() {
    if (salvando) return
    resetarFormulario()
    onClose()
  }

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (refClienteAberto.current && !refClienteAberto.current.contains(e.target as Node)) {
        setClienteAberto(false)
      }
      if (refProdutoAberto.current && !refProdutoAberto.current.contains(e.target as Node)) {
        setProdutoAberto(false)
      }
    }

    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  useEffect(() => {
    if (!isOpen) resetarFormulario()
  }, [isOpen])

  const handleBuscaCliente = async (termo: string) => {
    setCliente(termo)
    setClienteId('')
    setErro('')

    const cache = obterClientesCache()
    const fonte = cache?.clientes ?? []

    const termoLimpo = termo.trim().toLowerCase()

    if (!termoLimpo) {
      if (fonte.length > 0) {
        setClientesOpcoes(fonte.map((c) => ({ id: c.ID_cliente, nome: c.nome_cliente })))
      } else {
        setClientesOpcoes([])
      }
      setClienteAberto(true)
      return
    }

    const filtrados = fonte.filter((c) =>
      c.nome_cliente.toLowerCase().includes(termoLimpo)
    )

    if (filtrados.length > 0) {
      setClientesOpcoes(filtrados.map((c) => ({ id: c.ID_cliente, nome: c.nome_cliente })))
      setClienteAberto(true)
      return
    }

    try {
      const response = await buscarClientesAtendimento(termoLimpo)
      setClientesOpcoes(response.clientes)
      setClienteAberto(response.clientes.length > 0)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setClientesOpcoes([])
      setClienteAberto(false)
    }
  }

  const selecionarCliente = (opcao: ClienteBuscaAtendimento) => {
    setCliente(opcao.nome)
    setClienteId(String(opcao.id))
    setClienteAberto(false)
  }

  const handleBuscaProduto = async (termo: string) => {
    setBuscarProduto(termo)

    const cache = obterProdutosCache()
    const fonte = cache?.produtos ?? []

    const termoLimpo = termo.trim().toLowerCase()

    if (!termoLimpo) {
      if (fonte.length > 0) {
        setProdutosOpcoes(fonte.map((p) => ({ id: p.ID_produto, nome: p.nome_produto, valor: p.valor_produto })))
      } else {
        setProdutosOpcoes([])
      }
      setProdutoAberto(true)
      return
    }

    const filtrados = fonte.filter((p) =>
      p.nome_produto.toLowerCase().includes(termoLimpo)
    )

    if (filtrados.length > 0) {
      setProdutosOpcoes(filtrados.map((p) => ({ id: p.ID_produto, nome: p.nome_produto, valor: p.valor_produto })))
      setProdutoAberto(true)
      return
    }

    try {
      const response = await buscarProdutosAtendimento(termoLimpo)
      setProdutosOpcoes(response.produtos)
      setProdutoAberto(response.produtos.length > 0)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setProdutosOpcoes([])
      setProdutoAberto(false)
    }
  }

  const selecionarProduto = (opcao: ProdutoBuscaAtendimento) => {
    if (produtoEmEdicao) {
      setProdutos(
        produtos.map((p) =>
          p.id === produtoEmEdicao
            ? {
              ...p,
              ID_produto: String(opcao.id),
              nome: opcao.nome,
              precoUnitario: Number(opcao.valor) || 0,
            }
            : p
        )
      )
    }

    setBuscarProduto('')
    setProdutoAberto(false)
    setProdutoEmEdicao(null)
  }

  const adicionarProduto = () => {
    const novoId = Math.max(...produtos.map((p) => parseInt(p.id)), 0) + 1
    setProdutos([
      ...produtos,
      { id: novoId.toString(), ID_produto: '', nome: '', quantidade: 1, precoUnitario: 0 },
    ])
    setProdutoEmEdicao(novoId.toString())
    setBuscarProduto('')
  }

  const removerProduto = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id))
    if (produtoEmEdicao === id) {
      setProdutoEmEdicao(null)
    }
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

  const handleSalvar = async () => {
    const total = converterMoedaParaNumero(valorServico)

    if (!clienteId) {
      setErro('Selecione um cliente da lista para salvar o atendimento.')
      return
    }

    if (!data || !descricao.trim() || Number.isNaN(total) || total < 0) {
      setErro('Preencha data, valor e descrição do atendimento.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      await cadastrarAtendimento({
        data_atendimento: `${data} 00:00:00`,
        status_atendimento: status,
        total_atendimento: total,
        descri_atendimento: descricao.trim(),
        ID_cliente: clienteId,
        ID_pgto: null,
        produtos: produtos
          .filter((produto) => produto.ID_produto)
          .map((produto) => ({
            ID_produto: produto.ID_produto,
            quantidade_utilizada: produto.quantidade,
          })),
      })

      onAtendimentoSalvo?.()
      resetarFormulario()
      onClose()
    } catch (error) {
      console.error('Erro ao cadastrar atendimento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao cadastrar atendimento.')
    } finally {
      setSalvando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
      onClick={handleFechar}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <Icon name="assignment" className="text-blue-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Novo Atendimento
            </h2>
          </div>
          <button
            onClick={handleFechar}
            disabled={salvando}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="close" />
          </button>
        </div>

        {erro && (
          <div className="mx-6 mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{erro}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Informações do Atendimento
            </p>
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
              <div className="md:col-span-2" ref={refClienteAberto}>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Cliente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite o nome do cliente"
                    value={cliente}
                    onChange={(e) => handleBuscaCliente(e.target.value)}
                    onFocus={() => handleBuscaCliente(cliente)}
                    disabled={salvando}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors disabled:opacity-50"
                  />
                  {clienteAberto && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-20">
                      {clientesOpcoes.length > 0 ? (
                        clientesOpcoes.map((opcao) => (
                          <button
                            key={opcao.id}
                            type="button"
                            onClick={() => selecionarCliente(opcao)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-slate-900 transition-colors"
                          >
                            <p className="font-medium">{opcao.nome}</p>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-slate-500">Nenhum cliente encontrado.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Data do Serviço
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  disabled={salvando}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Valor do Serviço
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                    R$
                  </span>
                  <input
                    type="text"
                    value={valorServico}
                    onChange={(e) => setValorServico(formatarInteiroComoMoeda(e.target.value))}
                    disabled={salvando}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusAtendimento)}
                  disabled={salvando}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors disabled:opacity-50"
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Realizado">Realizado</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Descrição do Serviço
            </p>
            <textarea
              placeholder="Descreva o serviço realizado..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={salvando}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white resize-none transition-colors disabled:opacity-50"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Produtos Utilizados
              </p>
              <button
                type="button"
                onClick={adicionarProduto}
                disabled={salvando}
                className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline transition-colors disabled:opacity-50"
              >
                <Icon name="add_circle" className="text-base" />
                Adicionar Produto
              </button>
            </div>

            <div className="space-y-2" ref={refProdutoAberto}>
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="grid grid-cols-12 gap-2 items-end p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors group"
                >
                  <div className="col-span-5 relative">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Produto
                    </label>
                    <input
                      type="text"
                      value={produtoEmEdicao === produto.id ? buscarProduto : produto.nome}
                      onChange={(e) => handleBuscaProduto(e.target.value)}
                      onFocus={() => {
                        setProdutoEmEdicao(produto.id)
                        setBuscarProduto(produto.nome)
                        handleBuscaProduto(produto.nome)
                      }}
                      disabled={salvando}
                      placeholder="Buscar produto..."
                      className="w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                    {produtoAberto && produtoEmEdicao === produto.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-20">
                        {produtosOpcoes.length > 0 ? (
                          produtosOpcoes.map((opcao) => (
                            <button
                              key={opcao.id}
                              type="button"
                              onClick={() => selecionarProduto(opcao)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-slate-900 transition-colors"
                            >
                              <p className="text-sm font-medium">{opcao.nome}</p>
                              <p className="text-xs text-slate-500">
                                R$ {Number(opcao.valor || 0).toFixed(2)}
                              </p>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-2.5 text-sm text-slate-500">Nenhum produto encontrado.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Qtd
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={produto.quantidade}
                      onChange={(e) =>
                        atualizarProduto(
                          produto.id,
                          'quantidade',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={salvando}
                      className="w-full bg-white border-2 border-slate-200 rounded-lg px-2 py-2 text-sm font-medium text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      R$
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={produto.precoUnitario}
                      onChange={(e) =>
                        atualizarProduto(
                          produto.id,
                          'precoUnitario',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={salvando}
                      className="w-full bg-white border-2 border-slate-200 rounded-lg px-2 py-2 text-sm font-medium text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <p className="text-xs font-medium text-slate-600 mb-1">Total</p>
                    <p className="text-sm font-bold text-slate-900">
                      R$ {(produto.quantidade * produto.precoUnitario).toFixed(2)}
                    </p>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removerProduto(produto.id)}
                      disabled={salvando}
                      className="p-2 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Resumo Financeiro
            </p>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                <span className="text-sm font-medium text-slate-600">
                  Total de custos
                </span>
                <span className="text-sm font-bold text-slate-900">
                  R$ {totalCustos.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-blue-600">
                    Lucro do Atendimento
                  </p>
                  <p className="text-xs text-slate-500">
                    Valor serviço - Custos
                  </p>
                </div>
                <span
                  className={`text-lg font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}
                >
                  R$ {lucro.toFixed(2)}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={handleFechar}
            disabled={salvando}
            className="px-6 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? (
              'Salvando...'
            ) : (
              <>
                <Icon name="save" />
                Salvar Atendimento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
