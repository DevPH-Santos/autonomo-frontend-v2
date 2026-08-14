'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import {
  atualizarLembrete,
  cadastrarLembrete,
  deletarLembrete,
  type PrioridadeLembrete,
  type StatusLembrete,
  type TipoLembrete,
} from '@/services/lembreteService'

interface LembreteParaEdicao {
  id: string
  titulo: string
  descricao: string
  tipo: TipoLembrete
  status: StatusLembrete
  prioridade: PrioridadeLembrete
  dataBruta: string
}

interface LembreteModalProps {
  isOpen: boolean
  onClose: () => void
  lembrete?: LembreteParaEdicao | null
}

interface EstadoFormulario {
  titulo: string
  descricao: string
  tipo: TipoLembrete
  status: StatusLembrete
  prioridade: PrioridadeLembrete
  data: string
}

type DialogType = 'confirmDelete' | 'unsavedChanges' | null

const TIPOS: TipoLembrete[] = ['Pagamento', 'Atendimento', 'Manutenção', 'Pessoal']
const STATUS: StatusLembrete[] = ['Pendente', 'Concluído', 'Atrasado']
const PRIORIDADES: PrioridadeLembrete[] = ['Alta', 'Média', 'Baixa']

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
  titulo,
  descricao,
  tipo,
  status,
  prioridade,
  data,
}: EstadoFormulario) {
  return JSON.stringify({
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    tipo,
    status,
    prioridade,
    data,
  })
}

function dataHoraAtualLocal() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  const hora = String(agora.getHours()).padStart(2, '0')
  const minuto = String(agora.getMinutes()).padStart(2, '0')

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`
}

function criarEstadoInicial(lembrete?: LembreteParaEdicao | null): EstadoFormulario {
  if (!lembrete) {
    return {
      titulo: '',
      descricao: '',
      tipo: 'Pessoal',
      status: 'Pendente',
      prioridade: 'Média',
      data: dataHoraAtualLocal(),
    }
  }

  return {
    titulo: lembrete.titulo,
    descricao: lembrete.descricao,
    tipo: lembrete.tipo,
    status: lembrete.status,
    prioridade: lembrete.prioridade,
    data: formatarDataParaDatetimeLocal(lembrete.dataBruta),
  }
}

function LembreteModalContent({
  lembrete,
  onClose,
}: {
  lembrete?: LembreteParaEdicao | null
  onClose: () => void
}) {
  const isEditing = Boolean(lembrete)
  const estadoInicial = criarEstadoInicial(lembrete)

  const [titulo, setTitulo] = useState(estadoInicial.titulo)
  const [descricao, setDescricao] = useState(estadoInicial.descricao)
  const [tipo, setTipo] = useState<TipoLembrete>(estadoInicial.tipo)
  const [status, setStatus] = useState<StatusLembrete>(estadoInicial.status)
  const [prioridade, setPrioridade] = useState<PrioridadeLembrete>(estadoInicial.prioridade)
  const [data, setData] = useState(estadoInicial.data)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [dialog, setDialog] = useState<DialogType>(null)
  const [snapshotOriginal] = useState(criarSnapshot(estadoInicial))

  const snapshotAtual = criarSnapshot({
    titulo,
    descricao,
    tipo,
    status,
    prioridade,
    data,
  })
  const temAlteracoes = isEditing
    ? snapshotAtual !== snapshotOriginal
    : Boolean(titulo.trim() || descricao.trim())

  function handleTentarFechar() {
    if (salvando || excluindo) return

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

  async function handleSalvar() {
    if (!titulo.trim() || !data) {
      setErro('Informe pelo menos o título e a data do lembrete.')
      return
    }

    setSalvando(true)
    setErro('')

    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        tipo,
        status,
        prioridade,
        data: converterDatetimeLocalParaApi(data),
      }

      if (lembrete) {
        await atualizarLembrete(lembrete.id, payload)
      } else {
        await cadastrarLembrete(payload)
      }

      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar lembrete.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleSalvarDoDialog() {
    setDialog(null)
    await handleSalvar()
  }

  async function handleExcluir() {
    if (!lembrete) return

    setExcluindo(true)
    setErro('')

    try {
      await deletarLembrete(lembrete.id)
      setDialog(null)
      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir lembrete.')
      setDialog(null)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleTentarFechar}
      >
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Icon name="add_notes" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {isEditing ? 'Atualize as informações' : 'Registre um compromisso importante'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setDialog('confirmDelete')}
                  disabled={salvando || excluindo}
                  title="Excluir lembrete"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Icon name="delete" />
                </button>
              )}
              <button
                type="button"
                onClick={handleTentarFechar}
                disabled={salvando || excluindo}
                title="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <Icon name="close" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-5">
            {erro && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erro}
              </p>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={salvando || excluindo}
                placeholder="Ex: Cobrar pagamento do cliente"
                className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={salvando || excluindo}
                placeholder="Adicione detalhes, cliente ou contexto do lembrete"
                rows={3}
                className="w-full resize-none rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Data e hora</label>
                <input
                  type="datetime-local"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  disabled={salvando || excluindo}
                  className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoLembrete)}
                  disabled={salvando || excluindo}
                  className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  {TIPOS.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusLembrete)}
                  disabled={salvando || excluindo}
                  className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  {STATUS.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Prioridade</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as PrioridadeLembrete)}
                  disabled={salvando || excluindo}
                  className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  {PRIORIDADES.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleTentarFechar}
              disabled={salvando || excluindo}
              className="rounded-lg px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando || excluindo}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? (
                'Salvando...'
              ) : (
                <>
                  <Icon name="save" />
                  {isEditing ? 'Salvar alterações' : 'Cadastrar lembrete'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {dialog === 'confirmDelete' && lembrete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Excluir lembrete?</h4>
              <p className="text-sm text-slate-500">
                Esta ação não pode ser desfeita. O lembrete{' '}
                <span className="font-semibold text-slate-700">{lembrete.titulo}</span> será
                removido permanentemente.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                disabled={excluindo}
                className="rounded-lg px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                disabled={excluindo}
                className="rounded-lg bg-red-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-red-600/20 transition-colors hover:bg-red-700 disabled:opacity-50"
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
            className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
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
                className="rounded-lg px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleSalvarDoDialog}
                disabled={salvando}
                className="rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:opacity-50"
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

export function LembreteModal({ isOpen, onClose, lembrete }: LembreteModalProps) {
  if (!isOpen) return null

  return (
    <LembreteModalContent
      key={lembrete?.id ?? 'novo-lembrete'}
      lembrete={lembrete}
      onClose={onClose}
    />
  )
}
