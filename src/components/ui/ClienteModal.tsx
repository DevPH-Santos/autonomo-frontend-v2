'use client'

import { Icon } from '@/components/ui/icon'
import { useState, useEffect } from 'react'
import { cadastrarCliente, atualizarCliente, Cliente } from '@/services/clienteService'
import { formatarInteiroComoMoeda } from '@/services/formatters'

interface ClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onClienteSalvo?: () => void
  clienteParaEditar?: Cliente | null
}

interface FormData {
  nome_cliente: string
  telefone_cliente: string
  email_cliente: string
  cep_cliente: string
  endereco_cliente: string
  casa_cliente: string
  bairro_cliente: string
  tipo_contratacao_cliente: 'Fixo' | 'Eventual'
  frequencia_cliente: 'Semanal' | 'Quinzenal' | 'Mensal'
  valor_visita_cliente: string
  status_cliente: 'Ativo' | 'Inativo'
  observacao_cliente: string
}

export function ClienteModal({ isOpen, onClose, onClienteSalvo, clienteParaEditar }: ClienteModalProps) {
  const [form, setForm] = useState<FormData>({
    nome_cliente: '',
    telefone_cliente: '',
    email_cliente: '',
    cep_cliente: '',
    endereco_cliente: '',
    casa_cliente: '',
    bairro_cliente: '',
    tipo_contratacao_cliente: 'Fixo',
    frequencia_cliente: 'Semanal',
    valor_visita_cliente: '',
    status_cliente: 'Ativo',
    observacao_cliente: '',
  })

  const [erros, setErros] = useState<Record<string, boolean>>({})
  const [carregando, setCarregando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erroCep, setErroCep] = useState<string | null>(null)
  const [erroServidor, setErroServidor] = useState<string | null>(null)

  const camposObrigatorios = ['nome_cliente', 'telefone_cliente', 'email_cliente', 'endereco_cliente', 'bairro_cliente', 'valor_visita_cliente']

  // Detecta se é modo edição
  const modoEdicao = !!clienteParaEditar

  // Preenche o formulário quando entra em modo edição
  useEffect(() => {
    if (clienteParaEditar) {

      setForm({
        nome_cliente: clienteParaEditar.nome_cliente || '',
        telefone_cliente: clienteParaEditar.telefone_cliente || '',
        email_cliente: clienteParaEditar.email_cliente || '',
        cep_cliente: '',
        endereco_cliente: clienteParaEditar.endereco_cliente || '',
        casa_cliente: '',
        bairro_cliente: clienteParaEditar.bairro_cliente || '',
        tipo_contratacao_cliente: (clienteParaEditar.tipo_contratacao_cliente as 'Fixo' | 'Eventual') || 'Fixo',
        frequencia_cliente: (clienteParaEditar.frequencia_cliente as 'Semanal' | 'Quinzenal' | 'Mensal') || 'Semanal',
        valor_visita_cliente: formatarValorBanco(clienteParaEditar.valor_visita_cliente) || '',
        status_cliente: (clienteParaEditar.status_cliente as 'Ativo' | 'Inativo') || 'Ativo',
        observacao_cliente: clienteParaEditar.observacao_cliente || '',
      })
    } else {
      // Reset do formulário para novo cliente
      setForm({
        nome_cliente: '',
        telefone_cliente: '',
        email_cliente: '',
        cep_cliente: '',
        endereco_cliente: '',
        casa_cliente: '',
        bairro_cliente: '',
        tipo_contratacao_cliente: 'Fixo',
        frequencia_cliente: 'Semanal',
        valor_visita_cliente: '',
        status_cliente: 'Ativo',
        observacao_cliente: '',
      })
    }
    setErros({})
    setErroCep(null)
    setErroServidor(null)
  }, [clienteParaEditar, isOpen])

  //função para formatar o valorVisita que vem do banco(com ponto)
  const formatarValorBanco = (valor: number | string): string => {

    if (!valor) return ''

    //converte para string, substitui ponto->virgula
    const valorString = valor.toString().replace('.', ',')

    const [inteirosStr, decimaisStr] = valorString.split(',')

    // Remove caracteres não numéricos dos inteiros
    const apenasInteiros = inteirosStr.replace(/\D/g, '')

    // Formata inteiros com separador de milhares
    const integrosFormatados = apenasInteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Se há decimais, limita a 2 casas
    if (decimaisStr !== undefined) {
      const apenasDecimais = decimaisStr.replace(/\D/g, '').slice(0, 2)
      return apenasInteiros.length === 0 ? '' : `${integrosFormatados},${apenasDecimais}`
    }

    // Se não há decimais, só retorna inteiros formatados
    return apenasInteiros.length === 0 ? '' : integrosFormatados

  }

  const formatarTelefone = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11)
    if (apenasNumeros.length === 0) return ''
    if (apenasNumeros.length <= 2) return `(${apenasNumeros}`
    if (apenasNumeros.length <= 7) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`
  }

  const formatarValor = (valor: string): string => {
    // Separa por vírgula se existir
    const [inteirosStr, decimaisStr] = valor.split(',')

    // Remove caracteres não numéricos dos inteiros
    const apenasInteiros = inteirosStr.replace(/\D/g, '')

    // Formata inteiros com separador de milhares
    const integrosFormatados = apenasInteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Se há decimais, limita a 2 casas
    if (decimaisStr !== undefined) {
      const apenasDecimais = decimaisStr.replace(/\D/g, '').slice(0, 2)
      return apenasInteiros.length === 0 ? '' : `${integrosFormatados},${apenasDecimais}`
    }

    // Se não há decimais, só retorna inteiros formatados
    return apenasInteiros.length === 0 ? '' : integrosFormatados
  }


  const formatarCep = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8)

    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    }

    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`
  }

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')

    // O CEP é opcional. A API só é consultada quando houver 8 dígitos.
    if (cepLimpo.length !== 8) {
      setErroCep(null)
      return
    }

    try {
      setBuscandoCep(true)
      setErroCep(null)

      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)

      if (!resposta.ok) {
        throw new Error('Não foi possível consultar o CEP.')
      }

      const dados = await resposta.json()

      if (dados.erro) {
        setErroCep('CEP não encontrado.')
        return
      }

      setForm((prev) => ({
        ...prev,
        endereco_cliente: dados.logradouro || prev.endereco_cliente,
        bairro_cliente: dados.bairro || prev.bairro_cliente,
      }))

      setErros((prev) => ({
        ...prev,
        endereco_cliente: false,
        bairro_cliente: false,
      }))
    } catch (erro) {
      console.error('Erro ao consultar CEP:', erro)
      setErroCep('Não foi possível consultar o CEP. Preencha o endereço manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepFormatado = formatarCep(e.target.value)

    setForm((prev) => ({
      ...prev,
      cep_cliente: cepFormatado,
    }))

    setErroCep(null)
    setErroServidor(null)

    if (cepFormatado.replace(/\D/g, '').length === 8) {
      buscarCep(cepFormatado)
    }
  }

  const handleCepBlur = () => {
    if (form.cep_cliente.replace(/\D/g, '').length === 8) {
      buscarCep(form.cep_cliente)
    }
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formatado = formatarTelefone(value)
    setForm((prev) => ({ ...prev, telefone_cliente: formatado }))
    setErros((prev) => ({ ...prev, telefone_cliente: false }))
    setErroServidor(null)
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorOriginal = e.target.value;

    // 1. Remove tudo o que não for dígito para obter o valor numérico limpo
    const apenasNumeros = valorOriginal.replace(/\D/g, '');

    // 2. Se o usuário digitar mais de 10 dígitos, impede a digitação
    if (apenasNumeros.length > 10) {
      return; // Interrompe a função aqui e não atualiza o estado
    }

    // Opcional: Se quiser validar pelo valor matemático real (max: 99999999.99)
    // const valorNumerico = parseFloat(apenasNumeros) / 100;
    // if (valorNumerico > 99999999.99) return;

    // 3. Se passou na validação, formata e atualiza o estado normalmente
    const formatado = formatarInteiroComoMoeda(valorOriginal);

    setForm((prev) => ({ ...prev, valor_visita_cliente: formatado }));
    setErros((prev) => ({ ...prev, valor_visita_cliente: false }));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErros((prev) => ({ ...prev, [name]: false }))
    setErroServidor(null)
  }

  const handleSave = async () => {
    const novosErros: Record<string, boolean> = {}

    // Valida campos obrigatórios
    camposObrigatorios.forEach((campo) => {
      const valor = form[campo as keyof FormData]
      if (!valor || valor.toString().trim() === '') {
        novosErros[campo] = true
      }
    })

    // N° Casa é obrigatório, mas não será salvo como campo separado.
    if (!form.casa_cliente.trim()) {
      novosErros.casa_cliente = true
    }

    // Valida se tem números
    if (form.valor_visita_cliente && !/\d/.test(form.valor_visita_cliente)) {
      novosErros.valor_visita_cliente = true
    }

    // Valida email
    if (form.email_cliente && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_cliente)) {
      novosErros.email_cliente = true
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    try {
      setCarregando(true)
      setErroServidor(null)

      const dados = {
        nome_cliente: form.nome_cliente.trim(),
        telefone_cliente: form.telefone_cliente,
        email_cliente: form.email_cliente.trim(),
        endereco_cliente: `${form.endereco_cliente.trim()}, ${form.casa_cliente.trim()}`,
        bairro_cliente: form.bairro_cliente.trim(),
        tipo_contratacao_cliente: form.tipo_contratacao_cliente,
        frequencia_cliente: form.frequencia_cliente,
        valor_visita_cliente: form.valor_visita_cliente.replace(/\D/g, '').replace(/(\d+)(\d{2})$/, '$1.$2'),
        status_cliente: form.status_cliente,
        observacao_cliente: form.observacao_cliente.trim(),
      }

      if (modoEdicao && clienteParaEditar) {
        // ✅ EDIÇÃO
        await atualizarCliente(clienteParaEditar.ID_cliente, dados)
      } else {
        // ✅ CRIAÇÃO
        await cadastrarCliente(dados)
      }

      // Limpa formulário e fecha modal
      setForm({
        nome_cliente: '',
        telefone_cliente: '',
        email_cliente: '',
        cep_cliente: '',
        endereco_cliente: '',
        casa_cliente: '',
        bairro_cliente: '',
        tipo_contratacao_cliente: 'Fixo',
        frequencia_cliente: 'Semanal',
        valor_visita_cliente: '',
        status_cliente: 'Ativo',
        observacao_cliente: '',
      })
      setErros({})

      // Chama callback se fornecido (para recarregar lista de clientes)
      if (onClienteSalvo) {
        onClienteSalvo()
      }

      onClose()
    } catch (erro: any) {
      console.error(`Erro ao ${modoEdicao ? 'atualizar' : 'cadastrar'} cliente:`, erro)
      setErroServidor(erro.message || `Erro ao ${modoEdicao ? 'atualizar' : 'cadastrar'} cliente. Tente novamente.`)
    } finally {
      setCarregando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm"
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${modoEdicao ? 'bg-blue-100' : 'bg-sky-100'}`}>
              <Icon name={modoEdicao ? 'edit' : 'person_add'} className={modoEdicao ? 'text-blue-700' : 'text-sky-700'} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {modoEdicao ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
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
                  name="nome_cliente"
                  placeholder="Digite o nome do cliente"
                  value={form.nome_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.nome_cliente
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.nome_cliente && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Telefone
                </label>

                <input
                  type="tel"
                  name="telefone_cliente"
                  placeholder="(00) 00000-0000"
                  value={form.telefone_cliente}
                  onChange={handleTelefoneChange}
                  disabled={carregando}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.telefone_cliente
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.telefone_cliente && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email_cliente"
                  placeholder="exemplo@email.com"
                  value={form.email_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.email_cliente
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.email_cliente && (
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
                  CEP
                </label>
                <input
                  type="text"
                  name="cep_cliente"
                  placeholder="12345-678"
                  value={form.cep_cliente}
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  disabled={carregando || buscandoCep}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white disabled:opacity-50"
                />
                {buscandoCep && (
                  <span className="text-xs text-blue-600 mt-1 block">Consultando CEP...</span>
                )}
                {erroCep && (
                  <span className="text-xs text-amber-600 mt-1 block">{erroCep}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Rua
                </label>
                <input
                  type="text"
                  name="endereco_cliente"
                  placeholder="Rua das Flores "
                  value={form.endereco_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.endereco_cliente
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.endereco_cliente && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  N° Casa
                </label>
                <input
                  type="text"
                  name="casa_cliente"
                  placeholder="39 B"
                  value={form.casa_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.casa_cliente
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.casa_cliente && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  name="bairro_cliente"
                  placeholder="Nome do bairro"
                  value={form.bairro_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.bairro_cliente
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-slate-100 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                />
                {erros.bairro_cliente && (
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
                  name="tipo_contratacao_cliente"
                  value={form.tipo_contratacao_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white disabled:opacity-50"
                >
                  <option value="Fixo">Fixo</option>
                  <option value="Eventual">Eventual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Frequência
                </label>
                <select
                  name="frequencia_cliente"
                  value={form.frequencia_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white disabled:opacity-50"
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
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
                    name="valor_visita_cliente"
                    placeholder="0,00"
                    value={form.valor_visita_cliente}
                    onChange={handleValorChange}
                    disabled={carregando}
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors disabled:opacity-50 ${erros.valor_visita_cliente
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-200 bg-slate-100 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white`}
                  />

                </div>
                {erros.valor_visita_cliente && (
                  <span className="text-xs text-red-600 mt-1 block">Campo obrigatório</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Status
                </label>
                <select
                  name="status_cliente"
                  value={form.status_cliente}
                  onChange={handleChange}
                  disabled={carregando}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white disabled:opacity-50"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
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
              name="observacao_cliente"
              placeholder="Algum detalhe específico sobre a piscina ou o acesso?"
              value={form.observacao_cliente}
              onChange={handleChange}
              disabled={carregando}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white resize-none disabled:opacity-50"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={carregando}
            className="px-6 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={carregando}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${modoEdicao
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {carregando ? (
              <>
                <span className="animate-spin">⏳</span>
                {modoEdicao ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Icon name={modoEdicao ? 'edit' : 'save'} />
                {modoEdicao ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
