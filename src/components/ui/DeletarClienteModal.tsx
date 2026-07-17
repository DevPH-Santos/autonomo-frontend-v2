'use client'

import { Icon } from '@/components/ui/icon'
import { useState } from 'react'
import { deletarCliente } from '@/services/clienteService'

interface DeletarClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onClienteDeletado?: () => void
  clienteId: string
  nomeCliente: string
  telefoneCliente: string
  emailCliente: string
}

export function DeletarClienteModal({
  isOpen,
  onClose,
  onClienteDeletado,
  clienteId,
  nomeCliente,
  telefoneCliente,
  emailCliente,
}: DeletarClienteModalProps) {
  const [carregando, setCarregando] = useState(false)
  const [erroServidor, setErroServidor] = useState<string | null>(null)

  const handleDeletar = async () => {
    try {
      setCarregando(true)
      setErroServidor(null)

      await deletarCliente(clienteId)

      // Chama callback para recarregar lista
      if (onClienteDeletado) {
        onClienteDeletado()
      }

      onClose()
    } catch (erro: any) {
      console.error('Erro ao deletar cliente:', erro)
      setErroServidor(erro.message || 'Erro ao deletar cliente. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !carregando) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <Icon name="delete" className="text-red-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Deletar Cliente</h2>
          </div>
          <button
            onClick={onClose}
            disabled={carregando}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Mensagem de Erro */}
        {erroServidor && (
          <div className="mx-6 mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">{erroServidor}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Aviso */}
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Esta ação é irreversível. O cliente e todos os seus dados serão deletados permanentemente.
            </p>
          </div>

          {/* Informações do Cliente */}
          <section className="space-y-4">
            <p className="text-sm font-semibold text-slate-900">Dados do cliente:</p>

            <div className="space-y-3 p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Nome</p>
                <p className="text-sm text-slate-900 font-semibold">{nomeCliente}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Telefone</p>
                <p className="text-sm text-slate-900">{telefoneCliente}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Email</p>
                <p className="text-sm text-slate-900">{emailCliente}</p>
              </div>
            </div>
          </section>

          {/* Confirmação */}
          <section className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Você tem certeza?</p>
            <p className="text-xs text-slate-600">
              Confirme que deseja deletar este cliente clicando no botão abaixo.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={carregando}
            className="px-6 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeletar}
            disabled={carregando}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <span className="animate-spin">⏳</span>
                Deletando...
              </>
            ) : (
              <>
                <Icon name="delete" />
                Confirmar Deleção
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
