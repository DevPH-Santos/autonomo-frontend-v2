'use client'

import { Icon, type IconName } from '@/components/ui/icon'
import { useState } from 'react'

interface TipoExportacao {
  id: string
  label: string
  icon: IconName
  cor: string
  bgCor: string
}

interface ExportarModalProps {
  isOpen: boolean
  onClose: () => void
  onExportar: (tipo: string) => void
  titulo?: string
  descricao?: string
}

const TIPOS_EXPORTACAO: TipoExportacao[] = [
  {
    id: 'xlsx',
    label: 'Excel (.xlsx)',
    icon: 'table_chart',
    cor: 'text-green-700',
    bgCor: 'bg-green-100',
  },
  {
    id: 'xls',
    label: 'Excel Antigo (.xls)',
    icon: 'table_chart',
    cor: 'text-emerald-700',
    bgCor: 'bg-emerald-100',
  },
  {
    id: 'csv',
    label: 'CSV (.csv)',
    icon: 'description',
    cor: 'text-blue-700',
    bgCor: 'bg-blue-100',
  },
  {
    id: 'pdf',
    label: 'PDF (.pdf)',
    icon: 'picture_as_pdf',
    cor: 'text-red-700',
    bgCor: 'bg-red-100',
  },
  {
    id: 'png',
    label: 'Imagem PNG (.png)',
    icon: 'image',
    cor: 'text-purple-700',
    bgCor: 'bg-purple-100',
  },
]

export function ExportarModal({
  isOpen,
  onClose,
  onExportar,
  titulo = 'Escolha o formato de exportação',
  descricao = 'Selecione um dos formatos disponíveis para exportar seus dados',
}: ExportarModalProps) {
  const [exportando, setExportando] = useState(false)

  const handleExportar = async (tipo: string) => {
    setExportando(true)
    try {
      await onExportar(tipo)
      onClose()
    } finally {
      setExportando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-900">{titulo}</h2>
            <button
              onClick={onClose}
              disabled={exportando}
              className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>
          <p className="text-sm text-slate-600">{descricao}</p>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {TIPOS_EXPORTACAO.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => handleExportar(tipo.id)}
              disabled={exportando}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
            >
              {/* Ícone */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${tipo.bgCor} ${tipo.cor}`}>
                <Icon name={tipo.icon} className="text-2xl" />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tipo.label}
                </p>
              </div>

              {/* Seta */}
              <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                <Icon name="chevron_right" className="text-xl" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={exportando}
            className="flex-1 px-4 py-2 text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
