'use client'

import { Icon, type IconName } from '@/components/ui/icon'
import { useState } from 'react'
import { NovoAtendimentoModal } from "@/components/ui/NovoAtendimentoModal"

interface Atendimento {
  id: number
  dateLabel: string
  time: string
  client: string
  initials: string
  avatarVariant: 'primary' | 'secondary' | 'tertiary'
  recorrente: boolean
  neighborhood: string
  value: string
  status: 'realizado' | 'pendente'
}

const ATENDIMENTOS: Atendimento[] = [
  {
    id: 1,
    dateLabel: 'Hoje',
    time: '08:30 - 09:30',
    client: 'Ricardo Silva',
    initials: 'RS',
    avatarVariant: 'primary',
    recorrente: true,
    neighborhood: 'Jardins',
    value: 'R$ 180,00',
    status: 'realizado',
  },
  {
    id: 2,
    dateLabel: 'Hoje',
    time: '10:00 - 11:30',
    client: 'Beatriz Costa',
    initials: 'BC',
    avatarVariant: 'secondary',
    recorrente: false,
    neighborhood: 'Itaim Bibi',
    value: 'R$ 220,00',
    status: 'pendente',
  },
  {
    id: 3,
    dateLabel: 'Hoje',
    time: '14:00 - 15:00',
    client: 'Marcos Lopes',
    initials: 'ML',
    avatarVariant: 'tertiary',
    recorrente: true,
    neighborhood: 'Pinheiros',
    value: 'R$ 150,00',
    status: 'pendente',
  },
  {
    id: 4,
    dateLabel: 'Ontem',
    time: '16:30 - 18:00',
    client: 'Ana Souza',
    initials: 'AS',
    avatarVariant: 'primary',
    recorrente: false,
    neighborhood: 'Jardins',
    value: 'R$ 210,00',
    status: 'realizado',
  },
]

const NEIGHBORHOODS = ['Bairro', 'Jardins', 'Itaim Bibi', 'Pinheiros']
const STATUSES = ['Status', 'Pendente', 'Realizado']
const CLIENTS = ['Cliente', 'Ricardo Silva', 'Beatriz Costa', 'Marcos Lopes', 'Ana Souza']

function StatusBadge({ status }: { status: 'realizado' | 'pendente' }) {
  const label = status === 'realizado' ? 'Realizado' : 'Pendente'
  const baseClass = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border'

  if (status === 'realizado') {
    return (
      <span className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-300`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {label}
      </span>
    )
  }

  return (
    <span className={`${baseClass} bg-slate-100 text-slate-700 border-slate-200`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {label}
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

function ActionButtons({ status }: { status: 'realizado' | 'pendente' }) {
  const isRealizado = status === 'realizado'

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        title="Ver detalhes"
        className="p-2 rounded-lg text-blue-600 hover:bg-sky-100 transition-colors"
      >
        <Icon name="visibility" className="text-lg" />
      </button>
      <button
        title="Editar"
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
      >
        <Icon name="edit" className="text-lg" />
      </button>
      <button
        title="Marcar como realizado"
        className={`p-2 rounded-lg transition-colors ${
          isRealizado
            ? 'text-slate-600 hover:bg-slate-200'
            : 'text-emerald-600 hover:bg-emerald-50'
        }`}
      >
        <Icon name="check_circle" className="text-lg" />
      </button>
    </div>
  )
}

function FilterSelect({ options, icon }: { options: string[]; icon: IconName }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <Icon name={icon} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  )
}

export function AtendimentosPage() {
  const [activeView, setActiveView] = useState<'dia' | 'semana'>('dia')
  const [currentDate] = useState('30 de Maio, 2025')
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <>
      <NovoAtendimentoModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />
      <div className="space-y-6">
      {/* ===== HEADER DA PÁGINA ===== */}
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

      {/* ===== CONTROLES E FILTROS ===== */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-100 p-4 rounded-lg">
        {/* Grupo: Toggle + Navegador de Data */}
        <div className="flex items-center gap-4">
          {/* Toggle Dia/Semana */}
          <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('dia')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'dia'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setActiveView('semana')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'semana'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Navegador de Data */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Dia anterior">
              <Icon name="chevron_left" />
            </button>
            <span className="font-semibold text-slate-900 whitespace-nowrap text-sm">{currentDate}</span>
            <button className="p-1.5 rounded-lg hover:bg-slate-300 transition-colors" aria-label="Próximo dia">
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>

        {/* Grupo: Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect options={NEIGHBORHOODS} icon="expand_more" />
          <FilterSelect options={STATUSES} icon="filter_list" />
          <FilterSelect options={CLIENTS} icon="person" />
        </div>
      </section>

      {/* ===== TABELA DE ATENDIMENTOS ===== */}
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
                  Bairro
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
              {ATENDIMENTOS.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {/* Data/Hora */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-sm">{item.dateLabel}</span>
                      <span className="text-xs text-slate-600 mt-0.5">{item.time}</span>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ClientAvatar initials={item.initials} variant={item.avatarVariant} />
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-sm">{item.client}</span>
                        {item.recorrente && (
                          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded w-fit mt-1">
                            RECORRENTE
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Bairro */}
                  <td className="px-4 py-4 text-slate-600 text-sm hidden sm:table-cell">
                    {item.neighborhood}
                  </td>

                  {/* Valor */}
                  <td className="px-4 py-4 font-semibold text-slate-900 text-sm hidden md:table-cell">
                    {item.value}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 text-right">
                    <ActionButtons status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== RODAPÉ ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Exibindo <span className="font-bold text-slate-900">{ATENDIMENTOS.length}</span> atendimentos
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
