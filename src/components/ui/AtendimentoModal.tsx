'use client'

import { Icon } from '@/components/ui/icon'
import {
  cadastrarAtendimento,
  atualizarAtendimento,
  atualizarProdutosAtendimento,
  buscarClientesAtendimento,
  buscarProdutosAtendimento,
  deletarAtendimento,
  obterAtendimento,
  type AtendimentoCompleto,
  type ClienteBuscaAtendimento,
  type ProdutoBuscaAtendimento,
  type StatusAtendimento,
} from '@/services/atendimentoService'
import { formatarInteiroComoMoeda, formatarValor } from '@/services/formatters'
import { listarClientes } from '@/services/clienteService'
import { listarProdutos } from '@/services/produtoService'
import { useEffect, useRef, useState } from 'react'

interface ProdutoAtendimentoForm {
  id: string
  ID_produto: string
  nome: string
  quantidade: number
  precoUnitario: number
  unidade: string
}

interface AtendimentoModalProps {
  isOpen: boolean
  onClose: () => void
  atendimentoId: string | number | null
  onAtualizado?: () => void
  onExcluido?: () => void
}

type DialogType = 'confirmDelete' | 'unsavedChanges' | null
type ProdutoBuscaComUnidade = ProdutoBuscaAtendimento & { unidade?: string }

const STATUS_OPTIONS: StatusAtendimento[] = [
  'Agendado',
  'Em Andamento',
  'Pendente',
  'Realizado',
]

function converterMoedaParaNumero(valor: string) {
  const valorLimpo = valor.trim().replace(/[^\d,.-]/g, '')
  if (!valorLimpo) return NaN

  if (valorLimpo.includes(',')) {
    return Number(valorLimpo.replace(/\./g, '').replace(',', '.'))
  }

  return Number(valorLimpo)
}

function formatarDataParaDatetimeLocal(valor: string) {
  const texto = String(valor || '')
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/)

  if (!match) return ''

  const [, ano, mes, dia, hora = '00', minuto = '00'] = match
  return `${ano}-${mes}-${dia}T${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`
}

function converterDatetimeLocalParaApi(valor: string) {
  if (!valor) return ''
  const limpo = valor.replace('T', ' ')
  if (limpo.length === 16) return `${limpo}:00`
  return limpo
}

function criarSnapshot({
  cliente,
  clienteId,
  data,
  valorServico,
  status,
  descricao,
  produtos,
}: {
  cliente: string
  clienteId: string
  data: string
  valorServico: string
  status: StatusAtendimento
  descricao: string
  produtos: ProdutoAtendimentoForm[]
}) {
  const valorNumerico = converterMoedaParaNumero(valorServico)

  return JSON.stringify({
    cliente: cliente.trim(),
    clienteId,
    data,
    valorServico: Number.isNaN(valorNumerico) ? valorServico.trim() : valorNumerico.toFixed(2),
    status,
    descricao,
    produtos: produtos.map((produto) => ({
      ID_produto: produto.ID_produto,
      nome: produto.nome.trim(),
      quantidade: Number(produto.quantidade) || 0,
      precoUnitario: Number(produto.precoUnitario) || 0,
      unidade: produto.unidade.trim(),
    })),
  })
}

function mapearProdutosDoAtendimento(atendimento: AtendimentoCompleto) {
  return atendimento.produtos.map((produto, index) => ({
    id: `${produto.id}-${index}`,
    ID_produto: String(produto.id),
    nome: produto.nome,
    quantidade: Number(produto.quantidade) || 1,
    precoUnitario: Number(produto.valor) || 0,
    unidade: produto.unidade || '',
  }))
}

export function AtendimentoModal({
  isOpen,
  onClose,
  atendimentoId,
  onAtualizado,
  onExcluido,
}: AtendimentoModalProps) {
  const [cliente, setCliente] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [data, setData] = useState('')
  const [valorServico, setValorServico] = useState('')
  const [status, setStatus] = useState<StatusAtendimento>('Agendado')
  const [descricao, setDescricao] = useState('')
  const [produtos, setProdutos] = useState<ProdutoAtendimentoForm[]>([])

  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')
  const [dialog, setDialog] = useState<DialogType>(null)
  const [snapshotOriginal, setSnapshotOriginal] = useState('')

  const [clienteAberto, setClienteAberto] = useState(false)
  const [clientesOpcoes, setClientesOpcoes] = useState<ClienteBuscaAtendimento[]>([])
  const refClienteAberto = useRef<HTMLDivElement>(null)

  const [produtoEmEdicao, setProdutoEmEdicao] = useState<string | null>(null)
  const [buscarProduto, setBuscarProduto] = useState('')
  const [produtosOpcoes, setProdutosOpcoes] = useState<ProdutoBuscaComUnidade[]>([])
  const [produtoAberto, setProdutoAberto] = useState(false)

  //forma pagamento padrao Pagamentos
  const [formaPgto, setFormaPgto] = useState<string>('Pix')

  const refProdutoAberto = useRef<HTMLDivElement>(null)

  const totalCustos = produtos.reduce(
    (acc, produto) => acc + produto.quantidade * produto.precoUnitario,
    0
  )
  const valorServicoNumerico = converterMoedaParaNumero(valorServico) || 0
  const lucro = valorServicoNumerico - totalCustos
  const erroVisivel = erro
  const temAlteracoes =
    Boolean(snapshotOriginal) &&
    criarSnapshot({
      cliente,
      clienteId,
      data,
      valorServico,
      status,
      descricao,
      produtos,
    }) !== snapshotOriginal

  function limparEstadosAuxiliares() {
    setErro('')
    setDialog(null)
    setClienteAberto(false)
    setClientesOpcoes([])
    setProdutoEmEdicao(null)
    setBuscarProduto('')
    setProdutosOpcoes([])
    setProdutoAberto(false)
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
    if (!isOpen) {
      return
    }

    if (!atendimentoId) {
      limparEstadosAuxiliares()
      setCliente('')
      setClienteId('')
      const agora = new Date()
      const ano = agora.getFullYear()
      const mes = String(agora.getMonth() + 1).padStart(2, '0')
      const dia = String(agora.getDate()).padStart(2, '0')
      const hora = String(agora.getHours()).padStart(2, '0')
      const min = String(agora.getMinutes()).padStart(2, '0')
      setData(`${ano}-${mes}-${dia}T${hora}:${min}`)
      setValorServico('')
      setStatus('Agendado')
      // forma de pagamento
      setFormaPgto('Pix')
      setDescricao('')
      setProdutos([])
      setCarregando(false)
      setSnapshotOriginal('')
      return
    }

    const idAtendimento = atendimentoId
    let cancelado = false

    async function carregarAtendimento() {
      try {
        setCarregando(true)
        limparEstadosAuxiliares()

        const response = await obterAtendimento(idAtendimento)
        if (cancelado) return

        const atendimento = response.atendimento
        const produtosFormatados = mapearProdutosDoAtendimento(atendimento)
        const clienteAtual = atendimento.cliente?.nome || ''
        const clienteIdAtual = String(atendimento.cliente?.id || '')
        const dataAtual = formatarDataParaDatetimeLocal(atendimento.data)
        const valorAtual = formatarValor(atendimento.total || 0)
        const statusAtual = atendimento.status
        const descricaoAtual = atendimento.descricao || ''

        setCliente(clienteAtual)
        setClienteId(clienteIdAtual)
        setData(dataAtual)
        setValorServico(valorAtual)
        setStatus(statusAtual)
        setDescricao(descricaoAtual)
        setProdutos(produtosFormatados)
        setSnapshotOriginal(
          criarSnapshot({
            cliente: clienteAtual,
            clienteId: clienteIdAtual,
            data: dataAtual,
            valorServico: valorAtual,
            status: statusAtual,
            descricao: descricaoAtual,
            produtos: produtosFormatados,
          })
        )
      } catch (error) {
        if (!cancelado) {
          console.error('Erro ao carregar atendimento:', error)
          setErro(error instanceof Error ? error.message : 'Erro ao carregar atendimento.')
          setSnapshotOriginal('')
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregarAtendimento()

    return () => {
      cancelado = true
    }
  }, [isOpen, atendimentoId])

  function handleTentarFechar() {
    if (salvando || excluindo || carregando) return

    if (temAlteracoes) {
      setDialog('unsavedChanges')
      return
    }

    onClose()
  }

  function handleDescartarAlteracoes() {
    setDialog(null)
    onClose()
  }

  const handleBuscaCliente = async (termo: string) => {
    setCliente(termo)
    setErro('')

    const responseClientes = await listarClientes().catch(() => null)
    const fonte = responseClientes?.clientes ?? []
    const termoLimpo = termo.trim().toLowerCase()

    if (!termoLimpo) {
      setClientesOpcoes(fonte.map((c) => ({ id: c.ID_cliente, nome: c.nome_cliente })))
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

  function selecionarCliente(opcao: ClienteBuscaAtendimento) {
    setCliente(opcao.nome)
    setClienteId(String(opcao.id))
    setClienteAberto(false)
  }

  const handleBuscaProduto = async (termo: string) => {
    setBuscarProduto(termo)

    const responseProdutos = await listarProdutos().catch(() => null)
    const fonte = responseProdutos?.produtos ?? []
    const termoLimpo = termo.trim().toLowerCase()

    if (!termoLimpo) {
      setProdutosOpcoes(
        fonte.map((p) => ({
          id: p.ID_produto,
          nome: p.nome_produto,
          valor: p.valor_produto,
          unidade: p.unidade_medida,
        }))
      )
      setProdutoAberto(true)
      return
    }

    const filtrados = fonte.filter((p) =>
      p.nome_produto.toLowerCase().includes(termoLimpo)
    )

    if (filtrados.length > 0) {
      setProdutosOpcoes(
        filtrados.map((p) => ({
          id: p.ID_produto,
          nome: p.nome_produto,
          valor: p.valor_produto,
          unidade: p.unidade_medida,
        }))
      )
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

  function selecionarProduto(opcao: ProdutoBuscaComUnidade) {
    if (produtoEmEdicao) {
      setProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.id === produtoEmEdicao
            ? {
              ...produto,
              ID_produto: String(opcao.id),
              nome: opcao.nome,
              precoUnitario: Number(opcao.valor) || 0,
              unidade: opcao.unidade || produto.unidade,
            }
            : produto
        )
      )
    }

    setBuscarProduto('')
    setProdutoAberto(false)
    setProdutoEmEdicao(null)
  }

  function adicionarProduto() {
    const novoId = `${Date.now()}-${produtos.length + 1}`
    setProdutos((produtosAtuais) => [
      ...produtosAtuais,
      {
        id: novoId,
        ID_produto: '',
        nome: '',
        quantidade: 1,
        precoUnitario: 0,
        unidade: '',
      },
    ])
    setProdutoEmEdicao(novoId)
    setBuscarProduto('')
  }

  function removerProduto(id: string) {
    setProdutos((produtosAtuais) => produtosAtuais.filter((produto) => produto.id !== id))
    if (produtoEmEdicao === id) {
      setProdutoEmEdicao(null)
      setBuscarProduto('')
      setProdutoAberto(false)
    }
  }

  function atualizarProduto<Campo extends keyof ProdutoAtendimentoForm>(
    id: string,
    campo: Campo,
    valor: ProdutoAtendimentoForm[Campo]
  ) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        produto.id === id ? { ...produto, [campo]: valor } : produto
      )
    )
  }

  function handleAlterarBuscaProduto(id: string, termo: string) {
    setProdutoEmEdicao(id)
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        produto.id === id
          ? {
            ...produto,
            ID_produto: '',
            nome: termo,
          }
          : produto
      )
    )
    handleBuscaProduto(termo)
  }

  async function handleSalvar() {
    const total = converterMoedaParaNumero(valorServico)
    const produtoSemSelecao = produtos.some(
      (produto) => produto.nome.trim() && !produto.ID_produto
    )
    const produtoComQuantidadeInvalida = produtos.some(
      (produto) => produto.ID_produto && (!produto.quantidade || produto.quantidade <= 0)
    )

    let resolvedClienteId = clienteId

    if (!resolvedClienteId && cliente.trim()) {
      const listaClientes = await listarClientes().catch(() => null)
      const encontrado = listaClientes?.clientes?.find(
        (c) => c.nome_cliente.trim().toLowerCase() === cliente.trim().toLowerCase()
      )
      if (encontrado) {
        resolvedClienteId = encontrado.ID_cliente
        setClienteId(resolvedClienteId)
      }
    }

    if (!resolvedClienteId) {
      setErro('Selecione um cliente da lista para salvar o atendimento.')
      return
    }

    if (!data || !descricao.trim() || Number.isNaN(total) || total < 0) {
      setErro('Preencha data, valor e descrição do atendimento.')
      return
    }

    if (produtoSemSelecao) {
      setErro('Selecione os produtos pela lista ou remova os itens sem produto.')
      return
    }

    if (produtoComQuantidadeInvalida) {
      setErro('Informe uma quantidade maior que zero para os produtos selecionados.')
      return
    }

    setSalvando(true)
    setErro('')

    try {
      const produtosSelecionados = produtos.filter((produto) => produto.ID_produto)

      if (atendimentoId) {
        await atualizarAtendimento(atendimentoId, {
          data_atendimento: converterDatetimeLocalParaApi(data),
          status_atendimento: status,
          total_atendimento: total,
          descri_atendimento: descricao.trim(),
          ID_cliente: resolvedClienteId,
          fk_cliente_atendimento: resolvedClienteId,
        })

        if (produtosSelecionados.length > 0) {
          await atualizarProdutosAtendimento(
            atendimentoId,
            produtosSelecionados.map((produto) => ({
              ID_produto: produto.ID_produto,
              quantidade_utilizada: produto.quantidade,
            }))
          )
        }
      } else {
        await cadastrarAtendimento({
          data_atendimento: converterDatetimeLocalParaApi(data),
          status_atendimento: status,
          total_atendimento: total,
          descri_atendimento: descricao.trim(),
          ID_cliente: resolvedClienteId,
          fk_cliente_atendimento: resolvedClienteId,
          forma_pgto: formaPgto,
          produtos: produtosSelecionados.map((produto) => ({
            ID_produto: produto.ID_produto,
            quantidade_utilizada: produto.quantidade,
          })),
        })
      }

      onAtualizado?.()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao salvar atendimento.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleSalvarDoDialog() {
    setDialog(null)
    await handleSalvar()
  }

  async function handleExcluir() {
    if (!atendimentoId) return

    setExcluindo(true)
    setErro('')

    try {
      await deletarAtendimento(atendimentoId)
      setDialog(null)
      onExcluido?.()
      onClose()
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao excluir atendimento.')
      setDialog(null)
    } finally {
      setExcluindo(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
        onClick={handleTentarFechar}
      >
        <div
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Icon name="assignment" className="text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Atendimento</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Edite os campos para atualizar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDialog('confirmDelete')}
                disabled={carregando || salvando || excluindo}
                title="Excluir atendimento"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Icon name="delete" />
              </button>
              <button
                type="button"
                onClick={handleTentarFechar}
                disabled={carregando || salvando || excluindo}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <Icon name="close" />
              </button>
            </div>
          </div>

          {erroVisivel && (
            <div className="mx-6 mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium">{erroVisivel}</p>
            </div>
          )}

          {carregando ? (
            <div className="px-6 py-14 text-center text-slate-500">
              Carregando atendimento...
            </div>
          ) : (
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
                        disabled={salvando || excluindo}
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
                            <p className="px-4 py-3 text-sm text-slate-500">
                              Nenhum cliente encontrado.
                            </p>
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
                      type="datetime-local"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      disabled={salvando || excluindo}
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
                        disabled={salvando || excluindo}
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
                      disabled={salvando || excluindo}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((opcao) => (
                        <option key={opcao} value={opcao}>
                          {opcao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1.5">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formaPgto}
                      onChange={(e) => setFormaPgto(e.target.value)}
                      disabled={salvando || excluindo}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors disabled:opacity-50"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Transferência">Transferência</option>
                      <option value="Boleto">Boleto</option>
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
                  disabled={salvando || excluindo}
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
                    disabled={salvando || excluindo}
                    className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline transition-colors disabled:opacity-50"
                  >
                    <Icon name="add_circle" className="text-base" />
                    Adicionar Produto
                  </button>
                </div>

                <div className="space-y-2" ref={refProdutoAberto}>
                  {produtos.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      Nenhum produto vinculado a este atendimento.
                    </div>
                  ) : (
                    produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="grid grid-cols-12 gap-2 items-end p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors group"
                      >
                        <div className="col-span-12 md:col-span-4 relative">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Produto
                          </label>
                          <input
                            type="text"
                            value={produtoEmEdicao === produto.id ? buscarProduto : produto.nome}
                            onChange={(e) => handleAlterarBuscaProduto(produto.id, e.target.value)}
                            onFocus={() => {
                              setProdutoEmEdicao(produto.id)
                              setBuscarProduto(produto.nome)
                              handleBuscaProduto(produto.nome)
                            }}
                            disabled={salvando || excluindo}
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
                                      R$ {formatarValor(opcao.valor || 0)}
                                    </p>
                                  </button>
                                ))
                              ) : (
                                <p className="px-3 py-2.5 text-sm text-slate-500">
                                  Nenhum produto encontrado.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Qtd
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={produto.quantidade}
                            onChange={(e) =>
                              atualizarProduto(
                                produto.id,
                                'quantidade',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={salvando || excluindo}
                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-2 py-2 text-sm font-medium text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          />
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            R$
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={produto.precoUnitario}
                            onChange={(e) =>
                              atualizarProduto(
                                produto.id,
                                'precoUnitario',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={salvando || excluindo}
                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-2 py-2 text-sm font-medium text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          />
                        </div>

                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Unidade
                          </label>
                          <input
                            type="text"
                            value={produto.unidade}
                            onChange={(e) =>
                              atualizarProduto(produto.id, 'unidade', e.target.value)
                            }
                            disabled={salvando || excluindo}
                            className="w-full bg-white border-2 border-slate-200 rounded-lg px-2 py-2 text-sm font-medium text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          />
                        </div>

                        <div className="col-span-10 md:col-span-1 text-right">
                          <p className="text-xs font-medium text-slate-600 mb-1">Total</p>
                          <p className="text-sm font-bold text-slate-900">
                            R$ {formatarValor(produto.quantidade * produto.precoUnitario)}
                          </p>
                        </div>

                        <div className="col-span-2 md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removerProduto(produto.id)}
                            disabled={salvando || excluindo}
                            className="p-2 text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            <Icon name="delete" className="text-sm" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
                      R$ {formatarValor(totalCustos)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight text-blue-600">
                        Lucro do Atendimento
                      </p>
                      <p className="text-xs text-slate-500">Valor serviço - Custos</p>
                    </div>
                    <span
                      className={`text-lg font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}
                    >
                      R$ {formatarValor(lucro)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {(!atendimentoId || temAlteracoes) && !carregando && (
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={handleTentarFechar}
                disabled={salvando || excluindo}
                className="px-6 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={salvando || excluindo}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {salvando ? (
                  'Salvando...'
                ) : (
                  <>
                    <Icon name="save" />
                    {atendimentoId ? 'Salvar alterações' : 'Cadastrar Atendimento'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {dialog === 'confirmDelete' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Excluir atendimento?</h4>
              <p className="text-sm text-slate-500">
                Esta ação não pode ser desfeita. O atendimento de{' '}
                <span className="font-semibold text-slate-700">{cliente || 'cliente'}</span>{' '}
                será removido permanentemente.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                disabled={excluindo}
                className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
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

      {dialog === 'unsavedChanges' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Salvar alterações?</h4>
              <p className="text-sm text-slate-500">
                Você fez alterações que ainda não foram salvas.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDescartarAlteracoes}
                disabled={salvando}
                className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Descartar
              </button>
              <button
                type="button"
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
