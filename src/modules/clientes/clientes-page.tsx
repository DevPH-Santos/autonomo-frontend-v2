'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { ClienteModal } from '@/components/ui/ClienteModal'
import { listarClientes, deletarCliente, atualizarCliente, Cliente } from '@/services/clienteService'
import { DeletarClienteModal } from '@/components/ui/DeletarClienteModal'
import { formatarValor } from '@/services/formatters'

interface ClienteExibicao extends Cliente {
  iniciais: string
  cor: 'sky' | 'slate'
}

export function ClientesPage({ busca = '' }: { busca?: string }) {
  const [clientes, setClientes] = useState<ClienteExibicao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [modalClienteAberto, setModalClienteAberto] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<ClienteExibicao | null>(null)
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [bairroFiltro, setBairroFiltro] = useState('todos')
  const [contratFiltro, setContratFiltro] = useState('todos')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false)
  const [clienteSelecionadoDelete, setClienteSelecionadoDelete] = useState<ClienteExibicao | null>(null)

  const itensPorPagina = 5

  // Carrega clientes ao montar o componente
  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      setCarregando(true)
      setErro(null)
      const response = await listarClientes()

      // ✅ CORRIGIDO: Usar ID_cliente ao invés de id
      const clientesFormatados: ClienteExibicao[] = response.clientes.map((cliente: Cliente) => {
        const nome = cliente.nome_cliente || ''
        const iniciais = nome
          .split(' ')
          .map((palavra: string) => palavra[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return {
          ...cliente, // Spread para manter todos os campos
          iniciais,
          cor: cliente.status_cliente === 'Ativo' ? 'sky' : 'slate',
        }
      })

      setClientes(clientesFormatados)
    } catch (erro: any) {
      console.error('Nenhum cliente encontrado:', erro)
      setErro('Nenhum cliente encontrado. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  // Filtrar clientes com base em busca e filtros
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const buscaLower = busca.toLowerCase()
      const correspondeBusca =
        cliente.nome_cliente.toLowerCase().includes(buscaLower) ||
        cliente.telefone_cliente.includes(buscaLower) ||
        cliente.bairro_cliente.toLowerCase().includes(buscaLower)

      const correspondeStatus =
        statusFiltro === 'todos' ||
        (statusFiltro === 'ativo' && cliente.status_cliente === 'Ativo') ||
        (statusFiltro === 'inativo' && cliente.status_cliente === 'Inativo')

      const correspondeBairro =
        bairroFiltro === 'todos' || cliente.bairro_cliente === bairroFiltro

      const correspondeContrato =
        contratFiltro === 'todos' ||
        (contratFiltro === 'fixo' && cliente.tipo_contratacao_cliente === 'Fixo') ||
        (contratFiltro === 'eventual' && cliente.tipo_contratacao_cliente === 'Eventual')

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeBairro &&
        correspondeContrato
      )
    })
  }, [clientes, busca, statusFiltro, bairroFiltro, contratFiltro])

  // Paginação
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina)
  const indiceInicial = (paginaAtual - 1) * itensPorPagina
  const clientesPaginados = clientesFiltrados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  )

  const bairros = [...new Set(clientes.map((c) => c.bairro_cliente))].sort()

  const getAvatarColor = (cor: 'sky' | 'slate') => {
    return cor === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-700'
  }

  const resetPaginacao = () => {
    setPaginaAtual(1)
  }

  // ✅ NOVO: Funções para controlar o modal
  const handleNovoCliente = () => {
    setClienteEmEdicao(null)
    setModalClienteAberto(true)
  }

  const handleEditarCliente = (cliente: ClienteExibicao) => {
    setClienteEmEdicao(cliente)
    setModalClienteAberto(true)
  }

  const handleFecharModal = () => {
    setClienteEmEdicao(null)
    setModalClienteAberto(false)
  }

  const handleClienteSalvo = () => {
    carregarClientes()
    resetPaginacao()
    handleFecharModal()
  }

  const handleAbrirModalDelete = (cliente: ClienteExibicao) => {
    setClienteSelecionadoDelete(cliente)
    setModalDeleteAberto(true)
  }

  const handleFecharModalDelete = () => {
    setModalDeleteAberto(false)
    setClienteSelecionadoDelete(null)
  }

  const handleClienteDeletado = () => {
    carregarClientes()
    resetPaginacao()
    handleFecharModalDelete()
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Icon name="refresh" className="text-4xl text-blue-600" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ✅ Modal único para novo/edição */}
      <ClienteModal
        isOpen={modalClienteAberto}
        onClose={handleFecharModal}
        onClienteSalvo={handleClienteSalvo}
        clienteParaEditar={clienteEmEdicao}
      />

      {/* Modal de deleção */}
      {clienteSelecionadoDelete && (
        <DeletarClienteModal
          isOpen={modalDeleteAberto}
          onClose={handleFecharModalDelete}
          onClienteDeletado={handleClienteDeletado}
          clienteId={clienteSelecionadoDelete.ID_cliente}
          nomeCliente={clienteSelecionadoDelete.nome_cliente}
          telefoneCliente={clienteSelecionadoDelete.telefone_cliente}
          emailCliente={clienteSelecionadoDelete.email_cliente}
        />
      )}

      <div className="space-y-6">
        {/* ===== HEADER DA PÁGINA ===== */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Clientes
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Gerencie seus clientes cadastrados e contratos ativos.
            </p>
          </div>
          <button
            onClick={handleNovoCliente}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Icon name="add" />
            Novo Cliente
          </button>
        </section>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{erro}</p>
            <button
              onClick={() => setErro(null)}
              className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
            >
              Descartar
            </button>
          </div>
        )}

        {/* ===== BARRA DE FILTROS ===== */}
        <section className="bg-slate-100 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon name="filter_list" className="text-slate-600" />
            <span className="text-xs font-bold uppercase text-slate-600 tracking-wide">
              Filtros
            </span>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-300" />

          <select
            value={statusFiltro}
            onChange={(e) => {
              setStatusFiltro(e.target.value)
              resetPaginacao()
            }}
            className="w-full sm:w-auto bg-transparent border-none text-sm font-medium text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>

          <select
            value={bairroFiltro}
            onChange={(e) => {
              setBairroFiltro(e.target.value)
              resetPaginacao()
            }}
            className="w-full sm:w-auto bg-transparent border-none text-sm font-medium text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="todos">Todos os Bairros</option>
            {bairros.map((bairro) => (
              <option key={bairro} value={bairro}>
                {bairro}
              </option>
            ))}
          </select>

          <select
            value={contratFiltro}
            onChange={(e) => {
              setContratFiltro(e.target.value)
              resetPaginacao()
            }}
            className="w-full sm:w-auto bg-transparent border-none text-sm font-medium text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="todos">Tipo de Contrato</option>
            <option value="fixo">Fixo</option>
            <option value="eventual">Eventual</option>
          </select>

          <div className="ml-auto text-xs font-bold text-slate-500">
            {clientesFiltrados.length > 0
              ? `${clientesFiltrados.length} CLIENTE${clientesFiltrados.length !== 1 ? 'S' : ''}`
              : 'NENHUM CLIENTE'}
          </div>
        </section>

        {/* ===== TABELA DE CLIENTES ===== */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Nome do Cliente
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap hidden sm:table-cell">
                    Endereço
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap hidden sm:table-cell">
                    Bairro
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap hidden md:table-cell">
                    Serviço
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap hidden lg:table-cell">
                    Frequência
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Valor
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.length > 0 ? (
                  clientesPaginados.map((cliente) => (
                    <tr
                      key={cliente.ID_cliente}
                      className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      {/* Nome e Telefone */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(cliente.cor)}`}
                          >
                            {cliente.iniciais}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900">
                              {cliente.nome_cliente}
                            </p>
                            <p className="text-xs text-slate-500">
                              {cliente.telefone_cliente}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-4 text-sm text-slate-700 hidden sm:table-cell">
                        {cliente.endereco_cliente}
                      </td>

                      {/* Bairro */}
                      <td className="px-4 py-4 text-sm text-slate-700 hidden sm:table-cell">
                        {cliente.bairro_cliente}
                      </td>

                      {/* Serviço */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="inline-block text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                          {cliente.tipo_contratacao_cliente}
                        </span>
                      </td>

                      {/* Frequência */}
                      <td className="px-4 py-4 text-sm text-slate-700 hidden lg:table-cell">
                        {cliente.frequencia_cliente}
                      </td>

                      {/* Valor */}
                      <td className="px-4 py-4 text-sm font-bold text-sky-700">
                        R$ {formatarValor(cliente.valor_visita_cliente)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${cliente.status_cliente === 'Ativo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cliente.status_cliente === 'Ativo' ? 'bg-green-500' : 'bg-slate-400'
                              }`}
                          />
                          {cliente.status_cliente}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Visualizar"
                            onClick={() => {
                              console.log('Visualizar cliente:', cliente.ID_cliente)
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                          >
                            <Icon name="visibility" className="text-lg" />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => handleEditarCliente(cliente)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                          >
                            <Icon name="edit" className="text-lg" />
                          </button>
                          <button
                            title="Deletar"
                            onClick={() => handleAbrirModalDelete(cliente)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                          >
                            <Icon name="delete" className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Icon name="search_off" className="text-5xl text-slate-300" />
                        <p className="text-slate-500 font-medium">
                          Nenhum cliente encontrado
                        </p>
                        <p className="text-sm text-slate-400">
                          Tente ajustar seus filtros ou busca
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINAÇÃO ===== */}
          {clientesFiltrados.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
              <p className="text-xs font-medium text-slate-600">
                Mostrando{' '}
                <span className="font-semibold">
                  {Math.min(itensPorPagina, clientesPaginados.length)}
                </span>{' '}
                de{' '}
                <span className="font-semibold">{clientesFiltrados.length}</span>{' '}
                resultados
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                  disabled={paginaAtual === 1}
                  className="w-8 h-8 flex items-center justify-center rounded text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Página anterior"
                >
                  <Icon name="chevron_left" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (pagina) => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaAtual(pagina)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-colors ${pagina === paginaAtual
                        ? 'bg-blue-100 text-blue-700 pointer-events-none'
                        : 'text-slate-600 hover:bg-white'
                        }`}
                    >
                      {pagina}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="w-8 h-8 flex items-center justify-center rounded text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Próxima página"
                >
                  <Icon name="chevron_right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
