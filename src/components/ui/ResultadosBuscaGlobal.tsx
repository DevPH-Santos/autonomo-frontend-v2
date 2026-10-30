'use client'

import { type ReactNode } from 'react'
import { type Atendimento } from '@/services/atendimentoService'
import { type Cliente } from '@/services/clienteService'
import { type Pagamento } from '@/services/pagamentoService'
import { type ResultadosBuscaGlobal } from '@/services/buscaGlobalService'
import { Icon } from './icon'

interface ResultadosBuscaGlobalProps {
  termo: string
  resultados: ResultadosBuscaGlobal
  carregando: boolean
  erro: string | null
  onSelecionarCliente: (cliente: Cliente) => void
  onSelecionarAtendimento: (atendimento: Atendimento) => void
  onSelecionarPagamento: (pagamento: Pagamento) => void
}

function formatarData(data: string) {
  const valor = new Date(data)

  if (Number.isNaN(valor.getTime())) return 'Data não informada'

  return valor.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-100 py-2 last:border-b-0">
      <h3 className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </h3>
      {children}
    </section>
  )
}

export function ResultadosBuscaGlobal({
  termo,
  resultados,
  carregando,
  erro,
  onSelecionarCliente,
  onSelecionarAtendimento,
  onSelecionarPagamento,
}: Readonly<ResultadosBuscaGlobalProps>) {
  const temResultados =
    resultados.clientes.length > 0 ||
    resultados.atendimentos.length > 0 ||
    resultados.pagamentos.length > 0

  if (termo.trim().length < 2) {
    return (
      <p className="px-4 py-5 text-center text-sm text-slate-500">
        Digite ao menos 2 caracteres para buscar.
      </p>
    )
  }

  if (carregando) {
    return <p className="px-4 py-5 text-center text-sm text-slate-500">Buscando...</p>
  }

  if (erro) {
    return <p className="px-4 py-5 text-center text-sm text-red-600">{erro}</p>
  }

  if (!temResultados) {
    return (
      <p className="px-4 py-5 text-center text-sm text-slate-500">
        Nenhum resultado para “{termo}”.
      </p>
    )
  }

  return (
    <div className="max-h-[min(26rem,calc(100dvh-11rem))] overflow-y-auto">
      {resultados.clientes.length > 0 && (
        <Secao titulo="Clientes">
          {resultados.clientes.map((cliente) => (
            <button
              key={cliente.ID_cliente}
              type="button"
              onClick={() => onSelecionarCliente(cliente)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Icon name="contacts_product" className="text-lg" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {cliente.nome_cliente}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {cliente.telefone_cliente || cliente.email_cliente || 'Cliente'}
                </span>
              </span>
            </button>
          ))}
        </Secao>
      )}

      {resultados.atendimentos.length > 0 && (
        <Secao titulo="Atendimentos">
          {resultados.atendimentos.map((atendimento) => (
            <button
              key={atendimento.ID_atendimento}
              type="button"
              onClick={() => onSelecionarAtendimento(atendimento)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <Icon name="event_available" className="text-lg" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {atendimento.nome_cliente || 'Cliente não informado'}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {atendimento.descri_atendimento || 'Atendimento'} · {formatarData(atendimento.data_atendimento)}
                </span>
              </span>
            </button>
          ))}
        </Secao>
      )}

      {resultados.pagamentos.length > 0 && (
        <Secao titulo="Pagamentos">
          {resultados.pagamentos.map((pagamento) => (
            <button
              key={pagamento.id}
              type="button"
              onClick={() => onSelecionarPagamento(pagamento)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Icon name="payments" className="text-lg" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {pagamento.cliente || 'Cliente não informado'}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {pagamento.atendimento?.descricao || 'Pagamento'} · {formatarData(pagamento.data)}
                </span>
              </span>
            </button>
          ))}
        </Secao>
      )}
    </div>
  )
}
