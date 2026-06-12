'use client'

import { useState } from 'react'

interface NovoClienteModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  nome: string
  telefone: string
  email: string
  endereco: string
  bairro: string
  tipoContratacao: 'fixo' | 'eventual'
  frequencia: 'semanal' | 'quinzenal' | 'mensal'
  valorVisita: string
  status: 'ativo' | 'inativo'
  observacoes: string
}

export function NovoClienteModal({ isOpen, onClose }: NovoClienteModalProps) {
  const [form, setForm] = useState<FormData>({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    tipoContratacao: 'fixo',
    frequencia: 'semanal',
    valorVisita: '',
    status: 'ativo',
    observacoes: '',
  })

  const [erros, setErros] = useState<Record<string, boolean>>({})

  const camposObrigatorios = ['nome', 'telefone', 'email', 'endereco', 'bairro', 'valorVisita']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErros((prev) => ({ ...prev, [name]: false }))
  }

  const handleValorVisitaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const valorValido = /^\d*(,\d{0,2})?$/.test(value)

    if (valorValido) {
      setForm((prev) => ({ ...prev, valorVisita: value }))
      setErros((prev) => ({ ...prev, valorVisita: false }))
    }
  }

  const handleSave = () => {
    const novosErros: Record<string, boolean> = {}

    camposObrigatorios.forEach((campo) => {
      if (!form[campo as keyof FormData] || form[campo as keyof FormData].toString().trim() === '') {
        novosErros[campo] = true
      }
    })

    if (form.valorVisita && !/^\d+(,\d{1,2})?$/.test(form.valorVisita)) {
      novosErros.valorVisita = true
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    console.log('Cliente salvo:', form)
    setErros({})
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100">
              <span className="material-symbols-outlined text-sky-700">person_add</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Novo Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações Pessoais */}
          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Informações Pessoais
            </p>
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  name="nome"
                  placeholder="Digite o nome do cliente"
                  value={form.nome}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    erros.nome
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.nome && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    erros.telefone
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.telefone && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="exemplo@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    erros.email
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.email && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
            </div>
          </section>

          {/* Localização */}
          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Localização
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  placeholder="Rua, número, apto"
                  value={form.endereco}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    erros.endereco
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.endereco && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  name="bairro"
                  placeholder="Nome do bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    erros.bairro
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.bairro && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
            </div>
          </section>

          {/* Configuração de Serviço */}
          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Configuração de Serviço
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Tipo de contratação
                </label>
                <select
                  name="tipoContratacao"
                  value={form.tipoContratacao}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                >
                  <option value="fixo">Fixo</option>
                  <option value="eventual">Eventual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Frequência
                </label>
                <select
                  name="frequencia"
                  value={form.frequencia}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Valor por visita
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                    R$
                  </span>
                  <input
                    type="text"
                    name="valorVisita"
                    placeholder="0,00"
                    value={form.valorVisita}
                    onChange={handleValorVisitaChange}
                    inputMode="decimal"
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors ${
                      erros.valorVisita
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                  />
                </div>
                {erros.valorVisita && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </section>

          {/* Observações */}
          <section className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Observações Adicionais
            </p>
            <textarea
              name="observacoes"
              placeholder="Algum detalhe específico sobre a piscina ou o acesso?"
              value={form.observacoes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white resize-none"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined">save</span>
            Salvar Cliente
          </button>
        </div>
      </div>
    </div>
  )
}
