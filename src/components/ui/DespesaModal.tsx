'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import {
  criarDespesa,
  atualizarDespesa,
  deletarDespesa,
} from '@/services/despesaService'
import { formatarInteiroComoMoeda, formatarValor } from '@/services/formatters'

// ==========================================
// TIPOS
// ==========================================

type Categoria = 'Produto' | 'Transporte' | 'Manutenção' | 'Outros'

interface DespesaParaEdicao {
  id: string
  descricao: string
  observacao: string | null
  categoria: Categoria
  valorNumerico: number
  dataBruta: string
}

interface DespesaModalProps {
  isOpen: boolean
  onClose: () => void
  despesa?: DespesaParaEdicao | null
}

type DialogType = 'confirmDelete' | 'unsavedChanges' | null

// ==========================================
// COMPONENTE
// ==========================================

export function DespesaModal({ isOpen, onClose, despesa }: DespesaModalProps) {
  const isEditing = Boolean(despesa)

  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<Categoria>('Produto')
  const [data, setData] = useState('')
  const [valor, setValor] = useState('')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')
  const [dialog, setDialog] = useState<DialogType>(null)

  useEffect(() => {
    if (isOpen) {
      if (despesa) {
        setDescricao(despesa.descricao)
        setCategoria(despesa.categoria)
        setData(despesa.dataBruta.split('T')[0])
        setValor(String(formatarValor(despesa.valorNumerico)))
        setObservacao(despesa.observacao ?? '')
      } else {
        setDescricao('')
        setCategoria('Produto')
        setData('')
        setValor('')
        setObservacao('')
      }
      setErro('')
    }
  }, [isOpen, despesa])

  const temAlteracoes = isEditing
    ? despesa &&
      (descricao !== despesa.descricao ||
        categoria !== despesa.categoria ||
        data !== despesa.dataBruta.split('T')[0] ||
        observacao !== (despesa.observacao ?? ''))
    : Boolean(descricao || valor || data)

  function handleTentarFechar() {
    if (temAlteracoes) {
      setDialog('unsavedChanges')
    } else {
      onClose()
    }
  }

  function handleDescartarAlteracoes() {
    setDialog(null)
    onClose()
  }

  async function handleSalvar() {
    if (!descricao.trim() || !valor.trim() || !data) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    setSalvando(true)
    setErro('')

    try {
      const valorNumerico = Number(
        valor.replace(/\D/g, '').replace(/(\d+)(\d{2})$/, '$1.$2'),
      )

      if (isEditing && despesa) {
        await atualizarDespesa(despesa.id, {
          descricao,
          categoria,
          data,
          valor: valorNumerico,
          observacao: observacao || null,
        })
      } else {
        await criarDespesa({
          descricao,
          categoria,
          data,
          valor: valorNumerico,
          observacao: observacao || null,
        })
      }

      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar despesa.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleSalvarDoDialog() {
    setDialog(null)
    await handleSalvar()
  }

  async function handleExcluir() {
    if (!despesa) return

    setExcluindo(true)
    setErro('')

    try {
      await deletarDespesa(despesa.id)
      setDialog(null)
      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir despesa.')
      setDialog(null)
    } finally {
      setExcluindo(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* ===== OVERLAY PRINCIPAL ===== */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleTentarFechar}
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-200 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Editar Despesa' : 'Nova Despesa'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {isEditing
                  ? 'Edite os campos para atualizar'
                  : 'Cadastre um novo gasto do seu negócio'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  onClick={() => setDialog('confirmDelete')}
                  title="Excluir despesa"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Icon name="delete" />
                </button>
              )}
              <button
                onClick={handleTentarFechar}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <Icon name="close" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {erro && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{erro}</p>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Descrição
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                placeholder="Ex: Cloro Estabilizado 10kg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as Categoria)}
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="Produto">Produto</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                  Data
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Valor (R$)
              </label>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(formatarInteiroComoMoeda(e.target.value))}
                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                placeholder="R$ 0,00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Observação{' '}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                placeholder="Ex: Nota Fiscal #8821, Posto Central..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
            <button
              onClick={handleTentarFechar}
              disabled={salvando}
              className="px-6 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {salvando
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Cadastrar despesa'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== DIALOG: CONFIRMAR EXCLUSÃO ===== */}
      {dialog === 'confirmDelete' && despesa && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Excluir despesa?</h4>
              <p className="text-sm text-slate-500">
                Esta ação não pode ser desfeita. A despesa{' '}
                <span className="font-semibold text-slate-700">{despesa.descricao}</span> será
                removida permanentemente.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDialog(null)}
                disabled={excluindo}
                className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
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

      {/* ===== DIALOG: ALTERAÇÕES NÃO SALVAS ===== */}
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
                onClick={handleDescartarAlteracoes}
                disabled={salvando}
                className="px-5 py-2.5 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Descartar
              </button>
              <button
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
