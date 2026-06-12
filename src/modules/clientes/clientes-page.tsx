'use client'

import React, { useState, useMemo } from 'react'
import { NovoClienteModal } from '@/components/ui/NovoClienteModal'

interface Cliente {
  id: string
  iniciais: string
  nome: string
  telefone: string
  local: string
  servico: string
  frequencia: string
  valor: string
  ativo: boolean
  cor: 'sky' | 'slate'
}

const clientesData: Cliente[] = [
  {
    id: '1',
    iniciais: 'CM',
    nome: 'Carlos Mendonça',
    telefone: '(11) 98877-2211',
    local: 'Alphaville 1',
    servico: 'FIXO',
    frequencia: 'Semanal (Seg)',
    valor: 'R$ 180,00',
    ativo: true,
    cor: 'sky',
  },
  {
    id: '2',
    iniciais: 'AS',
    nome: 'Ana Souza',
    telefone: '(11) 97711-4433',
    local: 'Moema',
    servico: 'EVENTUAL',
    frequencia: 'Mensal',
    valor: 'R$ 250,00',
    ativo: true,
    cor: 'sky',
  },
  {
    id: '3',
    iniciais: 'JR',
    nome: 'Jorge Renato',
    telefone: '(11) 91122-3344',
    local: 'Itaim Bibi',
    servico: 'FIXO',
    frequencia: 'Quinzenal',
    valor: 'R$ 210,00',
    ativo: false,
    cor: 'slate',
  },
  {
    id: '4',
    iniciais: 'BC',
    nome: 'Beatriz Costa',
    telefone: '(11) 94455-6677',
    local: 'Jardins',
    servico: 'FIXO',
    frequencia: 'Semanal (Qui)',
    valor: 'R$ 195,00',
    ativo: true,
    cor: 'sky',
  },
  {
    id: '5',
    iniciais: 'MB',
    nome: 'Mariana Barbosa',
    telefone: '(11) 99999-8888',
    local: 'Vila Madalena',
    servico: 'FIXO',
    frequencia: 'Semanal (Ter)',
    valor: 'R$ 175,00',
    ativo: true,
    cor: 'sky',
  },
]

export function ClientesPage({ busca = '' }: { busca?: string }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [bairroFiltro, setBairroFiltro] = useState('todos')
  const [contratFiltro, setContratFiltro] = useState('todos')
  const [paginaAtual, setPaginaAtual] = useState(1)

  const itensPorPagina = 5

  // Filtrar clientes com base em busca e filtros
  const clientesFiltrados = useMemo(() => {
    return clientesData.filter((cliente) => {
      const buscaLower = busca.toLowerCase()
      const correspondeBusca =
        cliente.nome.toLowerCase().includes(buscaLower) ||
        cliente.telefone.includes(buscaLower) ||
        cliente.local.toLowerCase().includes(buscaLower)

      const correspondeStatus =
        statusFiltro === 'todos' ||
        (statusFiltro === 'ativo' && cliente.ativo) ||
        (statusFiltro === 'inativo' && !cliente.ativo)

      const correspondeBairro =
        bairroFiltro === 'todos' || cliente.local === bairroFiltro

      const correspondeContrato =
        contratFiltro === 'todos' ||
        (contratFiltro === 'fixo' && cliente.servico === 'FIXO') ||
        (contratFiltro === 'eventual' && cliente.servico === 'EVENTUAL')

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeBairro &&
        correspondeContrato
      )
    })
  }, [busca, statusFiltro, bairroFiltro, contratFiltro])

  // Paginação
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina)
  const indiceInicial = (paginaAtual - 1) * itensPorPagina
  const clientesPaginados = clientesFiltrados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  )

  const bairros = [...new Set(clientesData.map((c) => c.local))].sort()

  const getAvatarColor = (cor: 'sky' | 'slate') => {
    return cor === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-700'
  }

  const resetPaginacao = () => {
    setPaginaAtual(1)
  }

  return (
    <>
      <NovoClienteModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />
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
          onClick={() => setModalAberto(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Cliente
        </button>
      </section>

      {/* ===== BARRA DE FILTROS ===== */}
      <section className="bg-slate-100 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-600">
            filter_list
          </span>
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
                  Localização
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
                    key={cliente.id}
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
                            {cliente.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {cliente.telefone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Localização */}
                    <td className="px-4 py-4 text-sm text-slate-700 hidden sm:table-cell">
                      {cliente.local}
                    </td>

                    {/* Serviço */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="inline-block text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                        {cliente.servico}
                      </span>
                    </td>

                    {/* Frequência (hidden em tablet) */}
                    <td className="px-4 py-4 text-sm text-slate-700 hidden lg:table-cell">
                      {cliente.frequencia}
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-4 text-sm font-bold text-sky-700">
                      {cliente.valor}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                          cliente.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cliente.ativo ? 'bg-green-500' : 'bg-slate-400'
                          }`}
                        />
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Visualizar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            visibility
                          </span>
                        </button>
                        <button
                          title="Editar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit
                          </span>
                        </button>
                        <button
                          title="Deletar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-slate-300">
                        search_off
                      </span>
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
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (pagina) => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaAtual(pagina)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
                      pagina === paginaAtual
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
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
