'use client'

import { Icon, type IconName } from '@/components/ui/icon'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AtendimentoModal } from '@/components/ui/AtendimentoModal'
import {
  atualizarAtendimento,
  deletarAtendimento,
  listarAtendimentos,
  type Atendimento,
  type StatusAtendimento,
} from '@/services/atendimentoService'
import { formatarValor } from '@/services/formatters'

interface AtendimentoExibicao {
  id: string
  dataOriginal: string
  dateLabel: string
  time: string
  client: string
  initials: string
  avatarVariant: 'primary' | 'secondary' | 'tertiary'
  phone: string
  value: string
  status: StatusAtendimento
  descricao: string
  quantidadeProdutos: number
}

interface FilterOption {
  value: string
  label: string
}

const STATUS_OPTIONS: StatusAtendimento[] = ['Agendado', 'Em Andamento', 'Pendente', 'Realizado']

function normalizarStatus(status: string): StatusAtendimento {
  return STATUS_OPTIONS.includes(status as StatusAtendimento)
    ? (status as StatusAtendimento)
    : 'Pendente'
}

function parseDataAtendimento(valor: string) {
  const texto = String(valor || '')
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/)

  if (match) {
    const [, ano, mes, dia, hora = '0', minuto = '0'] = match
    return new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto))
  }

  const data = new Date(texto)
  return Number.isNaN(data.getTime()) ? null : data
}

function mesmaData(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatarDataLabel(valor: string) {
  const data = parseDataAtendimento(valor)
  if (!data) return 'Sem data'

  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(hoje.getDate() - 1)

  if (mesmaData(data, hoje)) return 'Hoje'
  if (mesmaData(data, ontem)) return 'Ontem'

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).replace('.', '')
}

function formatarHora(valor: string) {
  const data = parseDataAtendimento(valor)
  if (!data) return '--:--'

  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function obterIniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CL'
}

function obterAvatarVariant(id: string): AtendimentoExibicao['avatarVariant'] {
  const variantes: AtendimentoExibicao['avatarVariant'][] = ['primary', 'secondary', 'tertiary']
  const numero = Number(id)
  return variantes[Number.isNaN(numero) ? 0 : numero % variantes.length]
}

function mapearAtendimento(item: Atendimento): AtendimentoExibicao {
  const id = String(item.ID_atendimento)
  const nomeCliente = item.nome_cliente || 'Cliente não informado'

  return {
    id,
    dataOriginal: item.data_atendimento,
    dateLabel: formatarDataLabel(item.data_atendimento),
    time: formatarHora(item.data_atendimento),
    client: nomeCliente,
    initials: obterIniciais(nomeCliente),
    avatarVariant: obterAvatarVariant(id),
    phone: item.telefone_cliente || 'Sem telefone',
    value: `R$ ${formatarValor(item.total_atendimento || 0)}`,
    status: normalizarStatus(item.status_atendimento),
    descricao: item.descri_atendimento || '',
    quantidadeProdutos: Number(item.quantidade_produtos || 0),
  }
}

function StatusBadge({ status }: { status: StatusAtendimento }) {
  const baseClass = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border'
  const estilos: Record<StatusAtendimento, string> = {
    Realizado: 'bg-emerald-50 text-emerald-700 border-emerald-300 [&>span]:bg-emerald-500',
    Pendente: 'bg-slate-100 text-slate-700 border-slate-200 [&>span]:bg-slate-400',
    Agendado: 'bg-sky-50 text-sky-700 border-sky-200 [&>span]:bg-sky-500',
    'Em Andamento': 'bg-amber-50 text-amber-700 border-amber-200 [&>span]:bg-amber-500',
  }

  return (
    <span className={`${baseClass} ${estilos[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full" />
      {status}
    </span>
  )
}

function ClientAvatar({
  initials,
  variant,
}: {
  initials: string
  variant: 'primary' | 'secondary' | 'tertiary'
}) {
  const baseClass = 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0'

  const variantClasses = {
    primary: 'bg-sky-100 text-sky-700',
    secondary: 'bg-cyan-100 text-cyan-700',
    tertiary: 'bg-purple-100 text-purple-700',
  }

  return <div className={`${baseClass} ${variantClasses[variant]}`}>{initials}</div>
}

function ActionButtons({
  status,
  onEditar,
  onMarcarRealizado
}: {
  status: StatusAtendimento
  onEditar: () => void
  onMarcarRealizado: () => void
}) {
  const isRealizado = status === 'Realizado'

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        title="Marcar como realizado"
        onClick={(e) => {
          e.stopPropagation()
          onMarcarRealizado()
        }}
        disabled={isRealizado}
        className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isRealizado
          ? 'text-slate-500 hover:bg-slate-100'
          : 'text-emerald-600 hover:bg-emerald-50'
          }`}
      >
        <Icon name="check_circle" className="text-lg" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEditar()
        }}
        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg font-semibold text-xs transition-colors"
      >
        Editar
      </button>
    </div>
  )
}

function FilterSelect({
  options,
  icon,
  value,
  onChange,
}: {
  options: FilterOption[]
  icon: IconName
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <Icon name={icon} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  )
}

export function AtendimentosPage() {
  const [activeView, setActiveView] = useState<'dia' | 'semana'>('dia')
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  )
  const [modalAberto, setModalAberto] = useState(false)
  const [atendimentoSelecionadoId, setAtendimentoSelecionadoId] = useState<string | null>(null)
  const [atendimentos, setAtendimentos] = useState<AtendimentoExibicao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [clienteFiltro, setClienteFiltro] = useState('todos')

  const carregarAtendimentos = useCallback(async (forcarAtualizacao = false) => {
    try {
      setCarregando(true)
      setErro(null)
      const response = await listarAtendimentos(forcarAtualizacao)
      setAtendimentos(response.atendimentos.map(mapearAtendimento))
    } catch (error) {
      console.error('Erro ao listar atendimentos:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao listar atendimentos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarAtendimentos()
  }, [carregarAtendimentos])

  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter((atendimento) => {
      const correspondeStatus = statusFiltro === 'todos' || atendimento.status === statusFiltro
      const correspondeCliente = clienteFiltro === 'todos' || atendimento.client === clienteFiltro
      return correspondeStatus && correspondeCliente
    })
  }, [atendimentos, statusFiltro, clienteFiltro])

  const clienteOptions = useMemo<FilterOption[]>(() => {
    const clientes = [...new Set(atendimentos.map((item) => item.client))].sort()
    return [
      { value: 'todos', label: 'Todos os Clientes' },
      ...clientes.map((cliente) => ({ value: cliente, label: cliente })),
    ]
  }, [atendimentos])

  const statusOptions: FilterOption[] = [
    { value: 'todos', label: 'Todos os Status' },
    ...STATUS_OPTIONS.map((status) => ({ value: status, label: status })),
  ]

  function handleAtendimentoSalvo() {
    carregarAtendimentos(true)
  }

  async function handleMarcarRealizado(atendimento: AtendimentoExibicao) {
    if (atendimento.status === 'Realizado') return

    try {
      setErro(null)
      await atualizarAtendimento(atendimento.id, { status_atendimento: 'Realizado' })
      await carregarAtendimentos(true)
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao atualizar atendimento.')
    }
  }

  async function handleExcluir(atendimento: AtendimentoExibicao) {
    const confirmar = window.confirm(`Excluir atendimento de ${atendimento.client}?`)
    if (!confirmar) return

    try {
      setErro(null)
      await deletarAtendimento(atendimento.id)
      await carregarAtendimentos(true)
    } catch (error) {
      console.error('Erro ao excluir atendimento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao excluir atendimento.')
    }
  }

  return (
    <>
      <AtendimentoModal
        isOpen={modalAberto || Boolean(atendimentoSelecionadoId)}
        atendimentoId={atendimentoSelecionadoId}
        onClose={() => {
          setModalAberto(false)
          setAtendimentoSelecionadoId(null)
        }}
        onAtualizado={handleAtendimentoSalvo}
        onExcluido={handleAtendimentoSalvo}
      />
      <div className="space-y-6">
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Atendimentos</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Gerencie seus atendimentos da semana para ter uma agenda mais organizada.
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Icon name="add" />
            Novo Atendimento
          </button>
        </section>

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

        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-100 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('dia')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeView === 'dia'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                Dia
              </button>
              <button
                onClick={() => setActiveView('semana')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeView === 'semana'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                Semana
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Dia anterior">
                <Icon name="chevron_left" />
              </button>
              <span className="font-semibold text-slate-900 whitespace-nowrap text-sm capitalize">{currentDate}</span>
              <button className="p-1.5 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Próximo dia">
                <Icon name="chevron_right" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              options={statusOptions}
              icon="filter_list"
              value={statusFiltro}
              onChange={setStatusFiltro}
            />
            <FilterSelect
              options={clienteOptions}
              icon="person"
              value={clienteFiltro}
              onChange={setClienteFiltro}
            />
          </div>
        </section>

        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Data / Hora
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap">
                    Cliente
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap hidden sm:table-cell">
                    Telefone
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap hidden md:table-cell">
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
                {carregando ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Carregando atendimentos...
                    </td>
                  </tr>
                ) : atendimentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Icon name="search_off" className="text-5xl text-slate-300" />
                        <p className="text-slate-500 font-medium">
                          Nenhum atendimento encontrado
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  atendimentosFiltrados.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                      onClick={() => setAtendimentoSelecionadoId(item.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">{item.dateLabel}</span>
                          <span className="text-xs text-slate-600 mt-0.5">{item.time}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <ClientAvatar initials={item.initials} variant={item.avatarVariant} />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 text-sm">{item.client}</span>
                            {item.quantidadeProdutos > 0 && (
                              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded w-fit mt-1">
                                {item.quantidadeProdutos} PRODUTO{item.quantidadeProdutos !== 1 ? 'S' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600 text-sm hidden sm:table-cell">
                        {item.phone}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900 text-sm hidden md:table-cell">
                        {item.value}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ActionButtons
                          status={item.status}
                          onEditar={() => setAtendimentoSelecionadoId(item.id)}
                          onMarcarRealizado={() => handleMarcarRealizado(item)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Exibindo <span className="font-bold text-slate-900">{atendimentosFiltrados.length}</span> atendimento{atendimentosFiltrados.length !== 1 ? 's' : ''}
            para o período selecionado.
          </p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              <Icon name="download" />
              Exportar Relatório
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              <Icon name="print" />
              Imprimir Agenda
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
